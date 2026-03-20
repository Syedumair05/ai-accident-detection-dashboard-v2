
import asyncio
import threading
import multiprocessing
import time
import queue # Standard queue for exceptions, passing 'queue' string to mp
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models import Incident, Camera
from app.detection.video_buffer import VideoBuffer
from app.detection.yolo_engine import DetectionEngine, AccidentAnalyzer
from app.detection.worker import run_detection_worker
from app.websocket.manager import manager
from app.schemas import IncidentCreate

class DetectionService:
    def __init__(self):
        self.active_cameras = {} # {camera_id: VideoBuffer}
        self.processes = {} # {camera_id: (Process, InputQueue, OutputQueue)}
        # self.engine = DetectionEngine() # No longer needed in main process!
        self.is_running = False

    def start_camera(self, camera_id, source):
        if camera_id in self.active_cameras:
            return
        
        buffer = VideoBuffer(source, camera_id)
        buffer.start()
        self.active_cameras[camera_id] = buffer
        
        # Multiprocessing Setup
        # Queue size 1 to ensure we only process latest frames (drop older ones if busy)
        # Actually size 2 gives a tiny buffer against jitter
        input_queue = multiprocessing.Queue(maxsize=1)
        output_queue = multiprocessing.Queue(maxsize=1)
        
        p = multiprocessing.Process(
            target=run_detection_worker, 
            args=(camera_id, input_queue, output_queue)
        )
        p.daemon = True
        p.start()
        
        self.processes[camera_id] = (p, input_queue, output_queue)
        print(f"Started detection process {p.pid} for camera {camera_id}")
        
        # Start Feeder/Consumer Thread (Lightweight I/O in main process)
        threading.Thread(target=self._manage_process_io, args=(camera_id, buffer, input_queue, output_queue), daemon=True).start()

    def _manage_process_io(self, camera_id, buffer, input_queue, output_queue):
        print(f"Started IO loop for camera {camera_id}")
        analyzer = AccidentAnalyzer()
        last_incident_time = 0
        COOLDOWN = 30 # Seconds
        
        while buffer.is_running:
            # 1. FEEDER: Put latest frame (if allowed)
            # Use get_latest_frame_data to preserve timestamp!
            frame_data = buffer.get_latest_frame_data()
            if frame_data is not None:
                ts, frame = frame_data
                try:
                    # Pass timestamp for latency calc if needed, and the frame
                    # We send (timestamp, frame) - reusing timestamp as ID
                    input_queue.put_nowait((ts, frame))
                except queue.Full:
                    pass # Drop frame if worker is busy (this keeps us real-time)

            # 2. CONSUMER: Check for results
            try:
                # Poll output
                result = output_queue.get_nowait()
                timestamp, raw_detections, _ = result 
                
                # Run Analysis (Fast enough for main process)
                # Note: 'analyze' now returns (is_accident, details, enriched_objects)
                is_accident, details, enriched_objects = analyzer.analyze(raw_detections)
                
                # Update Buffer with ENRICHED objects (containing speed) and add to history
                # PASS OFFSET TIMESTAMP!
                buffer.add_detections(enriched_objects, timestamp=timestamp)
                
                # Accident Handling
                if is_accident and (time.time() - last_incident_time > COOLDOWN):
                    print(f"ACCIDENT DETECTED on {camera_id}: {details}")
                    last_incident_time = time.time()
                    
                    import uuid
                    incident_id = f"inc_{int(time.time())}_{uuid.uuid4().hex[:6]}"
                    buffer.save_clip(incident_id)
                    self._save_incident(incident_id, camera_id, details)
                    
                    try:
                        payload = {
                            "type": "new_accident",
                            "incident_id": incident_id,
                            "camera_id": camera_id,
                            "timestamp": str(time.time()),
                            "details": details
                        }
                        print(f"WS BROADCAST: {payload}")
                    except Exception as e:
                        print(f"Error broadcasting: {e}")
                        
            except queue.Empty:
                time.sleep(0.01) # Yield slightly
                
            except Exception as e:
                print(f"Error in IO loop for {camera_id}: {e}")
                time.sleep(0.1)

    def _save_incident(self, incident_id, camera_id, details):
        db = SessionLocal()
        try:
            incident = Incident(
                id=incident_id,
                camera_id=camera_id,
                severity="critical" if details['type'] == 'Collision' else "high",
                confidence=details['confidence'],
                address="Unknown Location", # Should fetch from Camera DB
                latitude=0.0,
                longitude=0.0,
                detected_objects=details['objects'],
                weather="Clear",
                traffic_density="High",
                status="new",
                video_clip_id=f"{incident_id}.webm"
            )
            db.add(incident)
            db.commit()
            print(f"Incident {incident_id} saved to DB")
        except Exception as e:
            print(f"Error saving incident: {e}")
        finally:
            db.close()

service = DetectionService()
