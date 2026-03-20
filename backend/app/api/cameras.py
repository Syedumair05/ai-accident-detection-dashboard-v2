
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import time
import cv2
import io
from app.db.session import get_db
from app.db.models import Camera
from app.schemas import CameraCreate, Camera as CameraSchema
from app.detection.service import service as detection_service
from app.detection.yolo_engine import DetectionEngine, AccidentAnalyzer

router = APIRouter()

@router.post("/", response_model=CameraSchema)
def create_camera(camera: CameraCreate, db: Session = Depends(get_db)):
    db_camera = Camera(
        location=camera.location,
        rtsp_url=camera.rtsp_url,
        status=camera.status
    )
    db.add(db_camera)
    db.commit()
    db.refresh(db_camera)
    
    # Start detection for this new camera immediately
    try:
        source = int(camera.rtsp_url) if camera.rtsp_url.isdigit() else camera.rtsp_url
        detection_service.start_camera(db_camera.id, source)
    except Exception as e:
        print(f"Error starting new camera: {e}")
        
    return db_camera

@router.get("/", response_model=List[CameraSchema])
def read_cameras(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    cameras = db.query(Camera).offset(skip).limit(limit).all()
    return cameras

@router.get("/{camera_id}", response_model=CameraSchema)
def read_camera(camera_id: str, db: Session = Depends(get_db)):
    db_camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if db_camera is None:
        raise HTTPException(status_code=404, detail="Camera not found")
    return db_camera

@router.delete("/{camera_id}")
def delete_camera(camera_id: str, db: Session = Depends(get_db)):
    db_camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if db_camera is None:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    db.delete(db_camera)
    db.commit()
    return {"ok": True}

# --- Streaming Endpoint ---
# --- Streaming Endpoint ---
def generate_frames(camera_id: str):
    print(f"[STREAM] Starting stream for {camera_id}")
    buffer = detection_service.active_cameras.get(camera_id)
    if not buffer:
        print(f"[STREAM] No buffer found for {camera_id}. Active: {list(detection_service.active_cameras.keys())}")
        return

    # Base sleep for ~25-30 FPS streaming
    base_sleep = 0.030

    # We need an analyzer instance for drawing speed (stateless method)
    analyzer = AccidentAnalyzer()
    engine = DetectionEngine()

    frame_count = 0
    frame_count = 0
    while True:
        try:
            # SYNCED PLAYBACK: Get frame that matches detection timestamp
            frame, detections = buffer.get_synced_frame()

            if frame is None:
                # print(f"[STREAM] No frame for {camera_id}")
                time.sleep(0.01) 
                continue
            
            # Draw on a COPY of the frame to avoid modifying the buffer's reference
            # or just draw on it if we don't care about concurrency artifacts (copy is safer)
            frame_to_send = frame.copy()
            
            # 1. Draw Boxes (Handles Red Accident Boxes now)
            frame_to_send = engine.draw_detections(frame_to_send, detections)
            
            # Encode frame to JPEG
            ret, buffer_img = cv2.imencode('.jpg', frame_to_send)
            if not ret:
                print(f"[STREAM] Encode failed for {camera_id}")
                continue
                
            frame_bytes = buffer_img.tobytes()
            
            if frame_count % 100 == 0:
                print(f"[STREAM] Yielding frame {frame_count} for {camera_id}")
            frame_count += 1
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            # Adjust sleep based on buffer playback speed
            try:
                current_speed = getattr(buffer, 'playback_speed', 1.0)
                time.sleep(base_sleep / max(0.1, current_speed))
            except:
                time.sleep(base_sleep)
        except Exception as e:
            print(f"[STREAM] Error in loop for {camera_id}: {e}")
            time.sleep(1.0)

@router.get("/{camera_id}/stream")
def video_feed(camera_id: str, speed: float = 1.0, db: Session = Depends(get_db)):
    # Check if camera exists
    db_camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not db_camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    # Update buffer speed if it exists
    buffer = detection_service.active_cameras.get(camera_id)
    if buffer:
        buffer.set_speed(speed)
        
    return StreamingResponse(generate_frames(camera_id), media_type="multipart/x-mixed-replace; boundary=frame")

@router.get("/{camera_id}/snapshot")
def get_snapshot(camera_id: str):
    buffer = detection_service.active_cameras.get(camera_id)
    if not buffer:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    frame = buffer.get_latest_frame()
    if frame is None:
        # Return object placeholder if no frame
        return StreamingResponse(open("data/placeholder.jpg", "rb"), media_type="image/jpeg") if False else HTTPException(status_code=503, detail="No frame available")
        
    # Prefer annotated
    if buffer.last_annotated_frame is not None:
        frame = buffer.last_annotated_frame
        
    ret, buffer_img = cv2.imencode('.jpg', frame)
    return StreamingResponse(io.BytesIO(buffer_img.tobytes()), media_type="image/jpeg")
