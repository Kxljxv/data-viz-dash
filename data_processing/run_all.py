import subprocess
import sys
import time
import os

def run_all():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    scripts = [
        "monitor_overview.py",
        "fetch_initial_details.py",
        "monitor_updates.py"
    ]
    
    # Also include the fast_checker from its subdirectory
    fast_checker_path = os.path.join(base_dir, "ammendment_urls", "fast_checker.py")
    
    processes = []
    
    print("Starting all monitoring services in parallel...")
    
    try:
        # Start the main monitoring scripts
        for script in scripts:
            script_path = os.path.join(base_dir, script)
            print(f"Launching {script}...")
            p = subprocess.Popen([sys.executable, script_path], cwd=base_dir)
            processes.append(p)
        
        # Start the fast_checker
        print(f"Launching fast_checker.py...")
        p_fc = subprocess.Popen([sys.executable, fast_checker_path], cwd=os.path.dirname(fast_checker_path))
        processes.append(p_fc)
        
        print("\nAll services are running. Press Ctrl+C to stop all.\n")
        
        while True:
            # Check if any process has died
            for i, p in enumerate(processes):
                if p.poll() is not None:
                    script_name = scripts[i] if i < len(scripts) else "fast_checker.py"
                    print(f"Warning: {script_name} has stopped (Exit code: {p.returncode}). Restarting in 10s...")
                    time.sleep(10)
                    
                    if i < len(scripts):
                        new_p = subprocess.Popen([sys.executable, os.path.join(base_dir, scripts[i])], cwd=base_dir)
                    else:
                        new_p = subprocess.Popen([sys.executable, fast_checker_path], cwd=os.path.dirname(fast_checker_path))
                    
                    processes[i] = new_p
            
            time.sleep(5)
            
    except KeyboardInterrupt:
        print("\nStopping all services...")
        for p in processes:
            p.terminate()
        
        # Wait for them to finish
        for p in processes:
            p.wait()
        print("All services stopped.")

if __name__ == "__main__":
    run_all()
