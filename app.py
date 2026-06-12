import subprocess
import os
import sys
import time

def run_command(command, cwd):
    print(f"🚀 Starting: {command} in {cwd}")
    return subprocess.Popen(command, shell=True, cwd=cwd)

if __name__ == "__main__":
    # Define paths
    base_dir = os.path.abspath(os.path.dirname(__file__))
    frontend_dir = os.path.join(base_dir, "client")
    backend_dir = os.path.join(base_dir, "server")
    ai_dir = os.path.join(base_dir, "ai")

    print("🌾 --- AgroSmart Unified Starter --- 🌾")
    
    # Start AI Flask Microservice
    ai_process = run_command("./venv/bin/python api/app.py", ai_dir)
    
    # Give AI a moment to start and compile/load the model
    time.sleep(2)
    
    # Start Backend
    backend_process = run_command("npm start", backend_dir)
    
    # Give backend a moment to start
    time.sleep(2)
    
    # Start Frontend
    frontend_process = run_command("npm run dev", frontend_dir)

    print("\n✅ All servers are attempting to start...")
    print("📺 AI Service: http://localhost:5001")
    print("📺 Backend API: http://localhost:5000")
    print("📺 Frontend Web: http://localhost:5173")
    print("\nPress Ctrl+C to stop all servers.")

    try:
        # Keep the main script alive while processes are running
        while True:
            time.sleep(1)
            if ai_process.poll() is not None:
                print("❌ AI process terminated.")
                break
            if backend_process.poll() is not None:
                print("❌ Backend process terminated.")
                break
            if frontend_process.poll() is not None:
                print("❌ Frontend process terminated.")
                break
    except KeyboardInterrupt:
        pass
    finally:
        print("\n🛑 Stopping servers...")
        for name, proc in [("AI", ai_process), ("Backend", backend_process), ("Frontend", frontend_process)]:
            if proc.poll() is None:
                print(f"Terminating {name} process...")
                try:
                    proc.terminate()
                    proc.wait(timeout=2)
                except Exception:
                    try:
                        proc.kill()
                    except Exception:
                        pass
        print("✅ Servers stopped.")
        sys.exit(0)
