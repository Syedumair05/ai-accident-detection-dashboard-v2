
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.detection.yolo_engine import AccidentAnalyzer

def test_temporal_consistency():
    analyzer = AccidentAnalyzer()
    analyzer.consistency_threshold = 5 # Ensure it's set to 5 for this test
    
    # Create a mock detection with high overlap
    # box1: [0,0, 100,100]
    # box2: [10,10, 110,110] -> Significant overlap
    obj1 = {"label": "car", "confidence": 0.9, "bbox": [0, 0, 100, 100], "center": [50, 50]}
    obj2 = {"label": "car", "confidence": 0.9, "bbox": [10, 10, 110, 110], "center": [60, 60]}
    
    detections_accident = [obj1, obj2]
    
    # Non-overlapping
    obj3 = {"label": "car", "confidence": 0.9, "bbox": [0, 0, 50, 50], "center": [25, 25]}
    obj4 = {"label": "car", "confidence": 0.9, "bbox": [200, 200, 250, 250], "center": [225, 225]}
    detections_clear = [obj3, obj4]

    print("\n--- Starting Temporal Consistency Test ---")

    # Frame 1-4: Should detect potential accident but NOT trigger alert
    for i in range(1, 5):
        is_accident, details, _ = analyzer.analyze(detections_accident)
        print(f"Frame {i}: Accident={is_accident}, Buffer={len(analyzer.accident_buffer)}")
        assert is_accident == False, f"Frame {i} triggered early!"
        assert len(analyzer.accident_buffer) == i, f"Frame {i} buffer mismatch!"

    # Frame 5: Should trigger alert
    is_accident, details, _ = analyzer.analyze(detections_accident)
    print(f"Frame 5: Accident={is_accident}, Buffer={len(analyzer.accident_buffer)}")
    assert is_accident == True, "Frame 5 did not trigger accident!"
    assert details['type'] == 'Collision'

    # Frame 6: Clear (accident gone)
    # The current logic clears buffer if NO accident found in frame
    is_accident, details, _ = analyzer.analyze(detections_clear)
    print(f"Frame 6 (Clear): Accident={is_accident}, Buffer={len(analyzer.accident_buffer)}")
    assert is_accident == False
    assert len(analyzer.accident_buffer) == 0

    print("--- Test Passed ---")

if __name__ == "__main__":
    try:
        test_temporal_consistency()
        print("✅ Unit Test SUCCESS")
    except AssertionError as e:
        print(f"❌ Unit Test FAILED: {e}")
    except Exception as e:
        print(f"❌ Unit Test ERROR: {e}")
