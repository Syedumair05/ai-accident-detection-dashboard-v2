
import time
import queue
import traceback
from app.detection.yolo_engine import DetectionEngine

def run_detection_worker(camera_id: str, input_queue, output_queue, model_path="yolov8n.pt"):
    """
    Worker process to run YOLO detection independent of the main process.
    input_queue: (frame_id, frame_numpy_array)
    output_queue: (frame_id, detections_list, annotated_frame)
    """
    print(f"[Worker-{camera_id}] Process started. Initializing YOLO...")
    
    try:
        # Initialize Engine INSIDE the process to avoid pickle issues
        engine = DetectionEngine(model_path=model_path)
        print(f"[Worker-{camera_id}] Model loaded. Waiting for frames...")
        
        while True:
            try:
                # Get frame (blocking with timeout to allow checking for exit)
                frame_data = input_queue.get(timeout=1.0)
                
                # Check for exit signal
                if frame_data is None:
                    print(f"[Worker-{camera_id}] shutdown signal received.")
                    break
                
                frame_id, frame = frame_data
                
                # Run Detection
                annotated_frame, detections = engine.detect(frame)
                
                # Push results (only keep latest if queue is full? No, consumer handles that)
                # We send data back. 
                # Note: sending 'annotated_frame' back might be heavy (pickling 1MB image).
                # Since we are decoupling, maybe we don't even need to send the annotated frame back 
                # if the main process draws boxes on the raw frame! 
                # user wants "raw frame with boxes drawn on fly". 
                # sending annotated_frame is redundant network/memory load.
                # BUT 'service.py' currently uses 'annotated_frame' for 'last_annotated_frame'.
                # Let's send it for now to preserve existing logic, or just detections if we want pure speed.
                # Given bandwidth of multiprocessing queue (pipes) is high, it's okay for now.
                
                if output_queue.full():
                    try:
                        output_queue.get_nowait() # Discard old result to make space
                    except queue.Empty:
                        pass
                        
                output_queue.put((frame_id, detections, annotated_frame))
                
            except queue.Empty:
                continue
            except Exception as e:
                print(f"[Worker-{camera_id}] Error in loop: {e}")
                # Don't crash the worker, just retry
                time.sleep(0.1)
                
    except Exception as e:
        print(f"[Worker-{camera_id}] CRITICAL FAIL: {e}")
        traceback.print_exc()
