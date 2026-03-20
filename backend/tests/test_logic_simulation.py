import sys
import os
import time
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.detection.yolo_engine import AccidentAnalyzer

def test_safe_pass_simulation():
    """
    Scenario: Car A and Car B move parallel to each other.
    Frame 1-5: Approaching
    Frame 6-10: Overlap (IoU > 0.45) but Speed maintained.
    Expected: No Accident.
    """
    analyzer = AccidentAnalyzer()
    
    # Simulate 60 frames (1 second @ 60fps)
    for i in range(60):
        # Car A moves right constant speed (approx 1.6px/frame to match old speed)
        # Old: 10px/frame @ 10fps = 100px/s.
        # New: 1.66px/frame @ 60fps = 100px/s.
        car_a = {
            "label": "car", "confidence": 0.9,
            "center": [100 + (i*1.6), 100], 
            "bbox": [80 + (i*1.6), 80, 120 + (i*1.6), 120]
        }
        
        # Car B moves right constant speed (2px/frame)
        car_b = {
            "label": "car", "confidence": 0.9,
            "center": [80 + (i*2), 100], 
            "bbox": [60 + (i*2), 80, 100 + (i*2), 120]
        }
        
        time.sleep(0.016) # Simulate 60 FPS
        is_accident, details, _ = analyzer.analyze([car_a, car_b])
        
        # Should NEVER be an accident because speeds are constant
        assert is_accident == False, f"False positive at frame {i}"

def test_crash_simulation():
    """
    Scenario: Car A and Car B collide.
    Frame 1-5: Approaching fast.
    Frame 6: Overlap.
    Frame 7-10: Speed drops to 0.
    Expected: Accident Detected.
    """
    analyzer = AccidentAnalyzer()
    
    # 1. Approach Phase (Frames 0-59)
    for i in range(60):
        # Car A moving Right (3.3px/frame = 200px/s)
        car_a = {
            "label": "car", "confidence": 0.9,
            "center": [100 + (i*3.3), 100], 
            "bbox": [80 + (i*3.3), 80, 120 + (i*3.3), 120] # 40x40 box
        }
        # Car B moving Left (Head on)
        car_b = {
            "label": "car", "confidence": 0.9,
            "center": [500 - (i*3.3), 100], 
            "bbox": [480 - (i*3.3), 80, 520 - (i*3.3), 120]
        }
        time.sleep(0.016)
        analyzer.analyze([car_a, car_b])
        
    # 2. Crash Phase (Frames 10-15) - They overlap and STOP
    collision_detected = False
    
    # They crash at x=300.
    for i in range(60, 120):
        # Positions essentially frozen or moving very slightly (post crash drift)
        car_a = {
            "label": "car", "confidence": 0.9,
            "center": [300 + (i-60)*0.1, 100], # Moving 0.1px/frame (Stopped)
            "bbox": [280, 80, 320, 120]
        }
        car_b = {
            "label": "car", "confidence": 0.9,
            "center": [300 - (i-60)*0.1, 100], 
            "bbox": [280, 80, 320, 120] # Heavy overlap
        }
        
        time.sleep(0.016)
        is_accident, details, _ = analyzer.analyze([car_a, car_b])
        if is_accident:
            collision_detected = True
            break
            
    assert collision_detected == True, "Failed to detect crash with deceleration"

if __name__ == "__main__":
    # Manual run wrapper
    try:
        test_safe_pass_simulation()
        print("✅ Safe Pass Test Passed")
        test_crash_simulation()
        print("✅ Crash Simulation Passed")
    except AssertionError as e:
        print(f"❌ Test Failed: {e}")
