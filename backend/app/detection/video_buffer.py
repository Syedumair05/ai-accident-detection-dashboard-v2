
import cv2
import threading
import time
import os
from collections import deque
from datetime import datetime
import numpy as np

class VideoBuffer:
    def __init__(self, source, camera_id, buffer_duration=10):
        """
        source: RTSP URL or file path or integer for webcam
        camera_id: ID of the camera
        buffer_duration: Seconds of video to keep in memory (pre-event)
        """
        self.source = source
        self.camera_id = camera_id
        self.buffer_duration = buffer_duration
        self.frame_buffer = deque() # Stores (timestamp, frame)
        self.detection_buffer = deque() # Stores (timestamp, detections)
        self.fps = 30 # Default, will update from stream
        self.playback_speed = 1.0
        self.last_annotated_frame = None
        self.is_running = False
        self.lock = threading.Lock()
        self.latest_detections = []
        
        # Ensure clips directory exists
        self.clips_dir = os.path.join("backend", "data", "clips")
        os.makedirs(self.clips_dir, exist_ok=True)

    def start(self):
        if self.is_running:
            return
        self.is_running = True
        self.thread = threading.Thread(target=self._capture_loop, daemon=True)
        self.thread.start()

    def stop(self):
        self.is_running = False
        if hasattr(self, 'thread'):
            self.thread.join()

    def set_speed(self, speed):
        self.playback_speed = max(0.1, min(speed, 5.0)) # Clamp between 0.1x and 5x

    def add_detections(self, detections, timestamp=None):
        """Called by service to store detection history"""
        with self.lock:
            ts = timestamp if timestamp else time.time()
            self.detection_buffer.append((ts, detections))
            # Keep sync with frame buffer duration (roughly)
            while len(self.detection_buffer) > self.fps * self.buffer_duration:
                self.detection_buffer.popleft()
            self.latest_detections = detections
            self.latest_detection_timestamp = ts

    def _capture_loop(self):
        cap = cv2.VideoCapture(self.source)
        if not cap.isOpened():
            print(f"Error opening video source: {self.source}")
            self.is_running = False
            return

        self.fps = cap.get(cv2.CAP_PROP_FPS)
        # Handle invalid FPS
        if self.fps <= 0 or np.isnan(self.fps) or self.fps > 120:
             self.fps = 30 # Fallback/Cap
        print(f"Video Source {self.source} FPS: {self.fps}")

        max_frames = int(self.fps * self.buffer_duration)

        while self.is_running:
            ret, frame = cap.read()
            if not ret:
                # If file source, loop it for demo purposes
                if isinstance(self.source, str) and os.path.exists(self.source):
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue
                else:
                    print(f"Stream {self.source} ended")
                    break

            timestamp = time.time()
            with self.lock:
                self.frame_buffer.append((timestamp, frame))
                if len(self.frame_buffer) > max_frames:
                    self.frame_buffer.popleft()

            # Simulate real-time if reading from file
            if self.playback_speed > 0:
                time.sleep(1 / (self.fps * self.playback_speed)) 

        cap.release()

    def get_latest_frame_data(self):
        """Returns (timestamp, frame) or None"""
        with self.lock:
            if self.frame_buffer:
                return self.frame_buffer[-1]
            return None

    def get_latest_frame(self):
        """Legacy access"""
        data = self.get_latest_frame_data()
        return data[1] if data else None

    def get_synced_frame(self):
        """Returns (frame, detections) that are time-synchronized"""
        with self.lock:
            if not hasattr(self, 'latest_detection_timestamp') or not self.latest_detections:
                 # No detections yet, return latest frame
                 if self.frame_buffer:
                     return self.frame_buffer[-1][1], []
                 return None, []
            
            target_ts = self.latest_detection_timestamp
            
            # Find closest frame
            best_frame = None
            min_diff = 10.0 # Allow up to 10 seconds delay (full buffer search)
            
            # Search from end (most recent)
            for ts, frame in reversed(self.frame_buffer):
                diff = abs(ts - target_ts)
                if diff < min_diff:
                    min_diff = diff
                    best_frame = frame
                
                # If we go too far back past the target
                if (target_ts - ts) > min_diff: 
                    break
            
            # If no close match found, fallback to latest (or return None if we want strict sync)
            if best_frame is None and self.frame_buffer:
                 # If we missed the frame (e.g. it fell out of buffer), use oldest available?
                 # Or use latest? Using latest causes sync issues.
                 # Let's use the closest we have.
                 pass
            
            # If we still haven't found a frame, return None or last available
            if best_frame is None:
                if self.frame_buffer:
                     best_frame = self.frame_buffer[-1][1]
                else:
                     return None, []

            return best_frame, self.latest_detections

    def save_clip(self, incident_id, post_event_duration=20):
        threading.Thread(target=self._save_clip_worker, args=(incident_id, post_event_duration)).start()

    def _save_clip_worker(self, incident_id, post_event_duration):
        # 1. Snapshot pre-event buffer
        with self.lock:
            pre_event_data = list(self.frame_buffer)
        
        # 2. Record post-event frames (Polling)
        post_event_data = []
        frames_to_capture = int(self.fps * post_event_duration)
        
        last_ts = None
        start_time = time.time()
        
        while len(post_event_data) < frames_to_capture:
            with self.lock:
                if self.frame_buffer:
                    current_ts, current_frame = self.frame_buffer[-1]
                    if last_ts is None or current_ts > last_ts:
                        post_event_data.append((current_ts, current_frame))
                        last_ts = current_ts
            
            if time.time() - start_time > post_event_duration + 5: # Timeout
                break
            
            time.sleep(1/self.fps)

        # 3. Combine and Burn-In Detections
        all_data = pre_event_data + post_event_data
        if not all_data:
            print("No frames to save")
            return

        filename = f"{incident_id}.webm"
        filepath = os.path.join(self.clips_dir, filename)
        
        height, width, layers = all_data[0][1].shape
        size = (width, height)
        
        # Use VP80 for WebM (Browser friendly)
        out = cv2.VideoWriter(filepath, cv2.VideoWriter_fourcc(*'vp80'), self.fps, size)
        
        # Helper to find nearest detection
        def get_best_detections(frame_ts):
            best_dets = []
            min_diff = 0.5 # Max 500ms drift
            with self.lock:
                for det_ts, dets in self.detection_buffer:
                    diff = abs(frame_ts - det_ts)
                    if diff < min_diff:
                        min_diff = diff
                        best_dets = dets
            return best_dets

        # Temporary engine for drawing (stateless)
        from app.detection.yolo_engine import DetectionEngine, AccidentAnalyzer
        engine = DetectionEngine()
        analyzer = AccidentAnalyzer()

        for ts, frame in all_data:
            # Find closest detection
            detections = get_best_detections(ts)
            
            # Draw on Copy
            burned_frame = frame.copy()
            if detections:
                burned_frame = engine.draw_detections(burned_frame, detections)
            
            out.write(burned_frame)
            
        out.release()
        print(f"Clip saved with annotations: {filepath}")
        return filepath
