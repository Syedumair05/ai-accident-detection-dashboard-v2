import torch

# Monkeypatch torch.load to set weights_only=False by default for this session
# This is a workaround for PyTorch 2.6+ breaking changes with Ultralytics
_original_load = torch.load

def safe_load(*args, **kwargs):
    if 'weights_only' not in kwargs:
        kwargs['weights_only'] = False
    return _original_load(*args, **kwargs)

torch.load = safe_load

from ultralytics import YOLO
import cv2
import numpy as np

import threading

class DetectionEngine:
    def __init__(self, model_path="yolov8n.pt"):
        self.model = YOLO(model_path)
        self.conf_threshold = 0.35 # Lowered for better recall on small objects
        self.lock = threading.Lock()

    def detect(self, frame):
        """
        Runs inference on a single frame.
        Returns: 
           - annotated_frame (numpy array)
           - detections (list of dicts)
        """
        with self.lock:
            results = self.model(frame, verbose=False)[0]
        
        detections = []
        for box in results.boxes:
            conf = float(box.conf[0])
            if conf < self.conf_threshold:
                continue
                
            cls = int(box.cls[0])
            label = self.model.names[cls]
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            
            detections.append({
                "label": label,
                "confidence": conf,
                "bbox": [x1, y1, x2, y2],
                "center": [(x1+x2)/2, (y1+y2)/2],
                "is_accident": False # Default
            })

        # Draw bounding boxes
        annotated_frame = frame.copy()
        # annotated_frame = self.draw_detections(annotated_frame, detections) 
        # We return raw frame + detections, let caller decide drawing
        
        return annotated_frame, detections

    def draw_detections(self, frame, detections):
        """
        Draws bounding boxes and labels on a frame manually.
        Accidents are drawn in RED.
        Normal objects are drawn in Clean Modern Colors.
        """
        # Modern Color Palette (BGR)
        colors = {
            'person': (0, 165, 255),    # Orange
            'car': (0, 255, 0),         # Green
            'truck': (255, 0, 0),       # Blue
            'bus': (255, 0, 0),         # Blue
            'motorcycle': (255, 255, 0),# Cyan
            'accident': (0, 0, 255)     # Red
        }
        
        default_color = (0, 255, 0)
        
        for det in detections:
            x1, y1, x2, y2 = det['bbox']
            conf = det['confidence']
            label_text = f"{det['label']} {conf:.2f}"
            is_accident = det.get('is_accident', False)
            
            # Determine Color
            if is_accident:
                color = colors['accident']
                thickness = 3
                label_text = f"ACCIDENT {conf:.2f}"
            else:
                color = colors.get(det['label'], default_color)
                thickness = 2
            
            # Draw Box
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, thickness)
            
            # Draw Label with Background
            (w, h), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
            
            # Background Rectangle for Text
            cv2.rectangle(frame, (x1, y1 - 25), (x1 + w, y1), color, -1)
            
            # Text
            cv2.putText(frame, label_text, (x1, y1 - 5), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
            
        return frame


import math
import time
from collections import deque

class SimpleTracker:
    def __init__(self):
        self.center_points = {} # id -> (cx, cy)
        self.id_count = 0
        
    def update(self, detections):
        # detections: list of dicts with 'center', 'bbox', 'label', 'confidence'
        objects_bbs_ids = []
        
        # Get center points from current frame
        current_center_points = []
        for det in detections:
            cx, cy = det['center']
            current_center_points.append((cx, cy, det))

        # If no objects in previous frame, just assign new IDs
        if len(self.center_points) == 0:
            for cx, cy, det in current_center_points:
                self.center_points[self.id_count] = (cx, cy)
                det['id'] = self.id_count
                objects_bbs_ids.append(det)
                self.id_count += 1
            return objects_bbs_ids

        # Match new objects to old objects using Euclidean distance
        new_center_points = {}
        for cx, cy, det in current_center_points:
            same_object_detected = False
            # Find closest existing object
            min_dist = float('inf')
            match_id = -1
            
            for object_id, center in self.center_points.items():
                dist = math.hypot(cx - center[0], cy - center[1])
                
                if dist < 150: # Threshold in pixels (Increased for resilience against lag/jumps)
                    if dist < min_dist:
                        min_dist = dist
                        match_id = object_id
                        same_object_detected = True

            if same_object_detected:
                self.center_points[match_id] = (cx, cy)
                det['id'] = match_id
                objects_bbs_ids.append(det)
                new_center_points[match_id] = (cx, cy)
            else:
                # New object
                self.center_points[self.id_count] = (cx, cy)
                det['id'] = self.id_count
                objects_bbs_ids.append(det)
                new_center_points[self.id_count] = (cx, cy)
                self.id_count += 1

        # Clean up unused IDs
        self.center_points = new_center_points.copy()
        return objects_bbs_ids

class AccidentAnalyzer:
    def __init__(self):
        self.tracker = SimpleTracker()
        
        # Potential Accident Buffer
        # Key: tuple(sorted(id1, id2)) -> {start_time: float, start_positions: {id1: (x,y), id2: (x,y)}}
        self.potential_accidents = {} 
        
        self.accident_buffer = deque(maxlen=5) 
        self.consistency_threshold = 2
        self.iou_threshold = 0.1 # Any significant overlap
        
        # Calibration
        self.OBSERVATION_DURATION_MIN = 2.0 # Seconds
        self.OBSERVATION_DURATION_MAX = 5.0 # Seconds
        self.DISPLACEMENT_THRESHOLD = 10.0 # Pixels (movement allowance)
        
    def analyze(self, detections):
        """
        New Logic:
        1. Detect overlaps between objects.
        2. Track overlapping pairs for 2-5 seconds.
        3. If either object moves < 10px in that time, MARK ACCIDENT.
        """
        current_time = time.time()
        
        # 1. Update Tracker
        tracked_objects = self.tracker.update(detections)
        tracked_map = {obj['id']: obj for obj in tracked_objects}
        
        # 2. Find Overlapping Pairs
        relevant_objects = [d for d in tracked_objects if d['label'] in ['car', 'truck', 'bus', 'motorcycle', 'person']]
        current_overlaps = set()

        frame_has_accident = False
        current_details = {}
        
        for i in range(len(relevant_objects)):
            for j in range(i + 1, len(relevant_objects)):
                obj1 = relevant_objects[i]
                obj2 = relevant_objects[j]
                
                # Check Overlap
                iou, _, _ = self.calculate_overlaps(obj1['bbox'], obj2['bbox'])
                
                if iou > self.iou_threshold:
                    pair_key = tuple(sorted((obj1['id'], obj2['id'])))
                    current_overlaps.add(pair_key)
                    
                    # New overlap? Start timer
                    if pair_key not in self.potential_accidents:
                        self.potential_accidents[pair_key] = {
                            "start_time": current_time,
                            "start_positions": {
                                obj1['id']: obj1['center'],
                                obj2['id']: obj2['center']
                            }
                        }
                    else:
                        # Existing overlap? Check duration and displacement
                        record = self.potential_accidents[pair_key]
                        duration = current_time - record["start_time"]
                        
                        if duration >= self.OBSERVATION_DURATION_MIN:
                            # Check displacement for BOTH objects from start position
                            start_pos1 = record["start_positions"][obj1['id']]
                            start_pos2 = record["start_positions"][obj2['id']]
                            
                            curr_pos1 = obj1['center']
                            curr_pos2 = obj2['center']
                            
                            # Displacement = Euclidean distance for each
                            disp1 = math.hypot(curr_pos1[0] - start_pos1[0], curr_pos1[1] - start_pos1[1])
                            disp2 = math.hypot(curr_pos2[0] - start_pos2[0], curr_pos2[1] - start_pos2[1])
                            
                            # Condition: If EITHER object has moved less than threshold
                            # AND they are still overlapping after 2s
                            if disp1 < self.DISPLACEMENT_THRESHOLD or disp2 < self.DISPLACEMENT_THRESHOLD:
                                # ACCIDENT CONFIRMED!
                                frame_has_accident = True
                                
                                # Mark objects visually
                                obj1['is_accident'] = True
                                obj2['is_accident'] = True
                                tracked_map[obj1['id']]['is_accident'] = True
                                tracked_map[obj2['id']]['is_accident'] = True
                                
                                current_details = {
                                    "objects": [obj1['label'], obj2['label']],
                                    "confidence": (obj1['confidence'] + obj2['confidence']) / 2,
                                    "type": "Collision",
                                    "severity": "High",
                                    "duration": round(duration, 1)
                                }
                                
                                # If over max duration, maybe reset? Or keep alerting?
                                # Let's keep alerting as long as they are stuck together.

        # Cleanup: Remove pairs that are no longer overlapping
        # List to avoid runtime modification error
        for key in list(self.potential_accidents.keys()):
            if key not in current_overlaps:
                del self.potential_accidents[key]

        # Buffer logic for alerts
        if frame_has_accident:
            self.accident_buffer.append(current_details)
        else:
            self.accident_buffer.clear()
            
        # Trigger Alert if consistent
        if len(self.accident_buffer) >= self.consistency_threshold:
            # Propagate is_accident flag to return list
            return True, self.accident_buffer[-1], tracked_objects
                
        return False, {}, tracked_objects

    def calculate_overlaps(self, boxA, boxB):
        # determine the (x, y)-coordinates of the intersection rectangle
        xA = max(boxA[0], boxB[0])
        yA = max(boxA[1], boxB[1])
        xB = min(boxA[2], boxB[2])
        yB = min(boxA[3], boxB[3])

        # compute the area of intersection rectangle
        interArea = max(0, xB - xA + 1) * max(0, yB - yA + 1)

        # compute the area of both the prediction and ground-truth rectangles
        boxAArea = (boxA[2] - boxA[0] + 1) * (boxA[3] - boxA[1] + 1)
        boxBArea = (boxB[2] - boxB[0] + 1) * (boxB[3] - boxB[1] + 1)

        if boxAArea == 0 or boxBArea == 0:
            return 0, 0, 0

        # IoU
        iou = interArea / float(boxAArea + boxBArea - interArea)
        
        # IoS (Intersection over Self)
        ios1 = interArea / float(boxAArea)
        ios2 = interArea / float(boxBArea)

        return iou, ios1, ios2

