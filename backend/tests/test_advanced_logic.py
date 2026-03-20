
import sys
import os
import time
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.detection.yolo_engine import AccidentAnalyzer

def test_tracking_and_velocity():
    analyzer = AccidentAnalyzer()
    analyzer.consistency_threshold = 3 # Lower for testing
    
    print("\n--- Starting Advanced Logic Test ---")
    
    # Scene 1: High Speed Crash Simulation
    print("\nScene 1: High Speed Crash")
    # Car A moving right, Car B moving left
    for i in range(10):
        # Create dummy detections
        # Car A moves 20px per frame (approx 200px/s at 10fps)
        ax = 100 + i * 20 
        bx = 500 - i * 20
        
        # Overlap happens around i=10 (ax=300, bx=300)
        
        detA = {"label": "car", "confidence": 0.9, "bbox": [ax, 100, ax+50, 150], "center": [ax+25, 125]}
        detB = {"label": "car", "confidence": 0.9, "bbox": [bx, 100, bx+50, 150], "center": [bx+25, 125]}
        
        detections = [detA, detB]
        
        # Simulate time passing (0.1s per frame)
        time.sleep(0.1) 
        
        is_accident, details, _ = analyzer.analyze(detections)
        
        # Check Tracker
        assert detA['id'] == 0, f"ID Tracking failed for A at frame {i}"
        assert detB['id'] == 1, f"ID Tracking failed for B at frame {i}"
        
        print(f"Frame {i}: SpeedA={detA.get('speed', 0):.1f}, SpeedB={detB.get('speed', 0):.1f}, Accident={is_accident}")
        
        if i >= 10: # They intersect
             if is_accident:
                 print("✅ Accident Detected correctly with high speed!")
                 break
    
    # Scene 2: Parked Cars (Stationary Overlap)
    print("\nScene 2: Parked Cars (Stationary Overlap)")
    analyzer = AccidentAnalyzer() # Reset
    
    for i in range(5):
        # Two cars parked close to each other (overlapping bboxes)
        # But NOT moving
        detA = {"label": "car", "confidence": 0.9, "bbox": [100, 100, 150, 150], "center": [125, 125]}
        detB = {"label": "car", "confidence": 0.9, "bbox": [120, 120, 170, 170], "center": [145, 145]}
        
        detections = [detA, detB]
        time.sleep(0.1)
        
        is_accident, details, _ = analyzer.analyze(detections)
        
        print(f"Frame {i}: SpeedA={detA.get('speed', 0):.1f}, Accident={is_accident}")
        
        assert is_accident == False, "❌ False Positive on parked cars!"

    print("\n✅ Advanced Logic Test SUCCESS")

if __name__ == "__main__":
    try:
        test_tracking_and_velocity()
    except AssertionError as e:
        print(f"\n❌ Test FAILED: {e}")
    except Exception as e:
        print(f"\n❌ Test ERROR: {e}")
