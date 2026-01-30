import subprocess
import time
import os
import signal
import sys

def run_commands():
    # Define commands
    backend_cmd = [sys.executable, "-m", "backend.main"]
    frontend_cmd = ["npm", "run", "dev"]
    
    # Paths
    project_root = os.getcwd()
    frontend_dir = os.path.join(project_root, "frontend")

    print("🚀 Starting DoJ Virtual Assistant...")
    
    # Start Backend
    print("🔹 Launching Backend (FastAPI)...")
    backend_process = subprocess.Popen(
        backend_cmd, 
        cwd=project_root,
        shell=False # Better for signal handling
    )

    # Start Frontend
    print("🔹 Launching Frontend (Vite)...")
    frontend_process = subprocess.Popen(
        frontend_cmd, 
        cwd=frontend_dir,
        shell=True # Needed for npm on Windows
    )

    print("\n✅ Systems are booting up!")
    print("   Backend: http://localhost:8000")
    print("   Frontend: http://localhost:5173\n")
    print("Press Ctrl+C to stop servers.")

    try:
        while True:
            time.sleep(1)
            # Check if processes are still alive
            if backend_process.poll() is not None:
                print("❌ Backend stopped unexpectedly.")
                break
            # Note: frontend_process with shell=True is harder to poll accurately on Windows without extra logic,
            # but usually Ctrl+C propagates well enough for dev tools.
            
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
        backend_process.terminate()
        # Frontend (npm) might need shell specific kill or just reliance on parent signal
        # On Windows, shell=True spawns a distinct process tree.
        subprocess.call(["taskkill", "/F", "/T", "/PID", str(frontend_process.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        backend_process.wait()
        print("Servers stopped.")

if __name__ == "__main__":
    run_commands()
