
import subprocess
import sys
import time
import os

def start():
    backend_dir = os.path.join(os.getcwd(), "backend")
    print(f"Starting backend from {backend_dir}")
    
    # Use Popen to start without blocking, redirecting output to a file for debugging
    with open("backend_log.txt", "w") as log:
        proc = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
            cwd=backend_dir,
            stdout=log,
            stderr=log
        )
        print(f"Backend started with PID {proc.pid}")
        
    # Wait for startup
    time.sleep(5)
    
if __name__ == "__main__":
    start()
