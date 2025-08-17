#!/usr/bin/env python3
"""
Unified startup script for AI MFE Portal
Starts both the preferences service (shell_service) and frontend MFEs
"""

import argparse
import json
import os
import signal
import socket
import subprocess
import sys
import time
import re
from typing import Dict, List, Optional, Tuple

# --- Configuration ---
ROOT_DIR = os.getcwd()
ENV_FILE = os.path.join(ROOT_DIR, "environments.json")
MFE_ROOT = os.path.join(ROOT_DIR, "packages")

# Backend service: (dir_name, default_port, uvicorn_target, json_config_key)
BACKEND_SERVICES = [
    ("shell_service", 8011, "shell_service.main:app", "prefs_service"),
]

# Frontend services: (package_name, default_port)
FRONTEND_SERVICES = [
    ("shared", 0),     # Build only, no server
    ("shell", 3000),   # Main portal shell
    ("test-app", 3002), # Example MFE
]

# --- Colors ---
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m' 
RED = '\033[0;31m'
BLUE = '\033[0;34m'
NC = '\033[0m'

# --- Global State ---
running_processes: Dict[str, subprocess.Popen] = {}
environment_config: Dict = {}
is_shutting_down = False

def print_header(title: str):
    """Prints a formatted header."""
    print(f"\n{BLUE}========== {title} =========={NC}")

def is_port_in_use(port: int) -> bool:
    """Checks if a local port is already in use."""
    if port == 0:
        return False
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("127.0.0.1", port))
            return False
        except socket.error:
            return True

def check_port(port: int, service_name: str) -> bool:
    """Checks if a port is available and optionally kills processes using it."""
    if port == 0:
        return True
        
    print(f"Checking port {BLUE}{port}{NC} for service {BLUE}{service_name}{NC}...")
    if is_port_in_use(port):
        print(f"{YELLOW}⚠️ Port {port} is in use{NC}")
        try:
            if sys.stdin.isatty():
                choice = input(f"Kill process using port {port}? (y/n) ").strip().lower()
            else:
                choice = 'n'
                
            if choice == 'y':
                print(f"Attempting to kill process on port {port}...")
                try:
                    if sys.platform == "win32":
                        cmd = f'netstat -ano | findstr ":{port}" | findstr "LISTENING"'
                        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                        for line in result.stdout.splitlines():
                            parts = line.split()
                            if len(parts) >= 5:
                                pid = parts[-1]
                                subprocess.run(f"taskkill /PID {pid} /T /F", shell=True, check=False)
                    else:
                        subprocess.run(f"lsof -ti tcp:{port} | xargs kill -9", shell=True, check=False)
                    
                    time.sleep(2)
                    if not is_port_in_use(port):
                        print(f"{GREEN}✅ Port {port} is now free{NC}")
                        return True
                    else:
                        print(f"{RED}❌ Failed to free port {port}{NC}")
                        return False
                except Exception as e:
                    print(f"{RED}❌ Error killing process: {e}{NC}")
                    return False
            else:
                return False
        except EOFError:
            return False
    else:
        print(f"{GREEN}✅ Port {port} is free{NC}")
        return True

def load_environment_config(app_env: str) -> bool:
    """Loads configuration from environments.json."""
    global environment_config
    print_header("LOADING ENVIRONMENT CONFIGURATION")
    
    if not os.path.exists(ENV_FILE):
        print(f"{YELLOW}⚠️ {ENV_FILE} not found. Using defaults.{NC}")
        environment_config = {}
        return True
        
    try:
        with open(ENV_FILE, 'r') as f:
            all_envs = json.load(f)
            
        if app_env not in all_envs:
            print(f"{YELLOW}⚠️ Environment '{app_env}' not found. Using defaults.{NC}")
            environment_config = {}
            return True
            
        environment_config = all_envs[app_env]
        print(f"{GREEN}✅ Environment configuration loaded for: {app_env}{NC}")
        
        # Set environment variables for services
        prefs_url = environment_config.get('prefs_service', {}).get('url', 'http://localhost:8011')
        os.environ['VITE_PREFS_SERVICE_URL'] = prefs_url
        print(f"   - Preferences Service URL: {prefs_url}")
        
        return True
    except Exception as e:
        print(f"{RED}❌ Error loading environment config: {e}{NC}")
        return False

def get_port_from_config(service_key: str, default_port: int) -> int:
    """Gets port from environment config or returns default."""
    try:
        service_config = environment_config.get(service_key, {})
        url = service_config.get('url', '')
        if url:
            match = re.search(r':(\d+)', url)
            if match:
                return int(match.group(1))
        return default_port
    except Exception:
        return default_port

def start_backend_service(service_name: str, port: int, uvicorn_target: str) -> bool:
    """Starts a backend service using uvicorn."""
    service_dir = os.path.join(ROOT_DIR, service_name)
    if not os.path.isdir(service_dir):
        print(f"{RED}❌ Service directory not found: {service_dir}{NC}")
        return False
        
    log_file = os.path.join(ROOT_DIR, f"{service_name}.log")
    
    env = os.environ.copy()
    env['PYTHONPATH'] = f"{ROOT_DIR}{os.pathsep}{env.get('PYTHONPATH', '')}"
    env['PORT'] = str(port)
    
    cmd = [
        sys.executable, "-m", "uvicorn",
        uvicorn_target,
        "--host", "0.0.0.0", 
        "--port", str(port),
        "--reload"
    ]
    
    try:
        print(f"{YELLOW}🚀 Starting {service_name} on port {port}...{NC}")
        with open(log_file, 'w') as f:
            process = subprocess.Popen(
                cmd,
                stdout=f,
                stderr=subprocess.STDOUT,
                cwd=ROOT_DIR,
                env=env,
                preexec_fn=os.setsid if sys.platform != "win32" else None
            )
        
        running_processes[service_name] = process
        time.sleep(3)
        
        if process.poll() is not None:
            print(f"{RED}❌ Failed to start {service_name}. Check {log_file}{NC}")
            return False
        else:
            print(f"{GREEN}✅ {service_name} started (PID {process.pid}){NC}")
            return True
    except Exception as e:
        print(f"{RED}❌ Error starting {service_name}: {e}{NC}")
        return False

def build_shared_package() -> bool:
    """Builds the shared package."""
    print_header("BUILDING SHARED PACKAGE")
    shared_dir = os.path.join(MFE_ROOT, "shared")
    if not os.path.isdir(shared_dir):
        print(f"{YELLOW}⚠️ Shared package not found. Skipping.{NC}")
        return True
        
    cmd = ["npm", "run", "build"]
    try:
        print(f"Building shared package in {shared_dir}...")
        result = subprocess.run(cmd, cwd=shared_dir, check=True, capture_output=True, text=True, timeout=120)
        print(f"{GREEN}✅ Shared package built successfully{NC}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"{RED}❌ Failed to build shared package:{NC}")
        print(e.stderr)
        return False
    except Exception as e:
        print(f"{RED}❌ Error building shared package: {e}{NC}")
        return False

def start_frontend_service(service_name: str, port: int) -> bool:
    """Starts a frontend service using vite."""
    if port == 0:
        return True  # No server needed
        
    service_dir = os.path.join(MFE_ROOT, service_name)
    if not os.path.isdir(service_dir):
        print(f"{RED}❌ Service directory not found: {service_dir}{NC}")
        return False
        
    log_file = os.path.join(ROOT_DIR, f"{service_name}_vite.log")
    
    cmd = [
        "npx", "vite",
        "--port", str(port),
        "--strictPort"
    ]
    
    try:
        print(f"{YELLOW}🚀 Starting {service_name} on port {port}...{NC}")
        with open(log_file, 'w') as f:
            process = subprocess.Popen(
                cmd,
                stdout=f,
                stderr=subprocess.STDOUT,
                cwd=service_dir,
                env=os.environ.copy(),
                preexec_fn=os.setsid if sys.platform != "win32" else None
            )
            
        running_processes[service_name] = process
        time.sleep(4)
        
        if process.poll() is not None:
            print(f"{RED}❌ Failed to start {service_name}. Check {log_file}{NC}")
            return False
        else:
            print(f"{GREEN}✅ {service_name} started (PID {process.pid}){NC}")
            return True
    except Exception as e:
        print(f"{RED}❌ Error starting {service_name}: {e}{NC}")
        return False

def cleanup(signum=None, frame=None):
    """Gracefully terminates all running processes."""
    global is_shutting_down
    if is_shutting_down:
        return
    is_shutting_down = True
    
    print_header("SHUTTING DOWN AI MFE PORTAL")
    processes_to_stop = list(running_processes.items())
    running_processes.clear()
    
    for name, process in processes_to_stop:
        if process.poll() is None:
            print(f"Stopping {name} (PID {process.pid})...")
            try:
                if sys.platform != "win32":
                    os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                else:
                    process.terminate()
                    
                process.wait(timeout=5)
                print(f"{GREEN}✅ {name} stopped gracefully{NC}")
            except subprocess.TimeoutExpired:
                print(f"{YELLOW}⚠️ Force killing {name}...{NC}")
                try:
                    if sys.platform != "win32":
                        os.killpg(os.getpgid(process.pid), signal.SIGKILL)
                    else:
                        subprocess.run(f"taskkill /PID {process.pid} /T /F", shell=True, check=False)
                    process.wait(timeout=2)
                    print(f"{GREEN}✅ {name} force killed{NC}")
                except Exception as e:
                    print(f"{RED}❌ Error force killing {name}: {e}{NC}")
            except Exception as e:
                print(f"{RED}❌ Error stopping {name}: {e}{NC}")
    
    print(f"{GREEN}✅ AI MFE Portal shutdown complete{NC}")
    sys.exit(0)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Start AI MFE Portal (backend + frontend)")
    parser.add_argument(
        "--env",
        default=os.environ.get("APP_ENV", "development"),
        help="Environment to load from environments.json"
    )
    parser.add_argument(
        "--backend-only",
        action="store_true",
        help="Start only the preferences service backend"
    )
    parser.add_argument(
        "--frontend-only", 
        action="store_true",
        help="Start only the frontend MFEs"
    )
    parser.add_argument(
        "--services",
        nargs='+',
        help="Specific services to start (e.g., shell test-app)",
        default=None
    )
    
    args = parser.parse_args()
    
    # Register signal handlers
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)
    
    print_header("STARTING AI MFE PORTAL")
    print(f"Environment: {BLUE}{args.env}{NC}")
    
    # Load environment configuration
    if not load_environment_config(args.env):
        sys.exit(1)
        
    # Determine what to start
    start_backend = not args.frontend_only
    start_frontend = not args.backend_only
    
    all_services_ok = True
    final_ports = {}
    
    # --- BACKEND SERVICES ---
    if start_backend:
        print_header("BACKEND SERVICES")
        
        for service_name, default_port, uvicorn_target, json_key in BACKEND_SERVICES:
            port = get_port_from_config(json_key, default_port)
            final_ports[service_name] = port
            
            if not check_port(port, service_name):
                all_services_ok = False
                break
                
            if not start_backend_service(service_name, port, uvicorn_target):
                all_services_ok = False
                break
    
    # --- FRONTEND SERVICES ---
    if start_frontend and all_services_ok:
        print_header("FRONTEND SERVICES")
        
        # Build shared package first
        if not build_shared_package():
            print(f"{RED}❌ Failed to build shared package. Cannot start frontend.{NC}")
            all_services_ok = False
        else:
            # Determine which frontend services to start
            if args.services:
                target_services = [(name, port) for name, port in FRONTEND_SERVICES if name in args.services]
            else:
                target_services = FRONTEND_SERVICES
                
            # Check ports for frontend services
            for service_name, default_port in target_services:
                if default_port > 0:  # Skip services that don't need ports
                    port = get_port_from_config(service_name, default_port)
                    final_ports[service_name] = port
                    
                    if not check_port(port, service_name):
                        all_services_ok = False
                        break
            
            # Start frontend services
            if all_services_ok:
                for service_name, default_port in target_services:
                    port = final_ports.get(service_name, default_port)
                    if not start_frontend_service(service_name, port):
                        all_services_ok = False
                        break
    
    if not all_services_ok:
        print(f"{RED}❌ Startup failed. Cleaning up...{NC}")
        cleanup()
        sys.exit(1)
    
    # Display running services
    print_header("AI MFE PORTAL RUNNING")
    print(f"{GREEN}All services started successfully:{NC}")
    
    if start_backend:
        for service_name, _, _, _ in BACKEND_SERVICES:
            if service_name in running_processes:
                port = final_ports[service_name]
                log_file = f"{service_name}.log"
                print(f"  🔧 {BLUE}{service_name}{NC}: http://localhost:{port} (Backend API)")
                print(f"     Logs: {log_file}")
    
    if start_frontend:
        for service_name, _ in FRONTEND_SERVICES:
            if service_name in running_processes:
                port = final_ports[service_name]
                log_file = f"{service_name}_vite.log"
                print(f"  🌐 {BLUE}{service_name}{NC}: http://localhost:{port}")
                print(f"     Logs: {log_file}")
    
    print(f"\n{BLUE}🚀 AI MFE Portal URLs:{NC}")
    if 'shell' in final_ports:
        print(f"   Portal: {YELLOW}http://localhost:{final_ports['shell']}{NC}")
    if 'shell_service' in final_ports:
        print(f"   API Health: {YELLOW}http://localhost:{final_ports['shell_service']}/health{NC}")
    
    print(f"\n{YELLOW}Press Ctrl+C to stop all services{NC}")
    
    # Monitor processes
    try:
        while True:
            for name, process in list(running_processes.items()):
                if process.poll() is not None:
                    print(f"\n{RED}❌ Service '{name}' terminated unexpectedly (exit code: {process.returncode}){NC}")
                    del running_processes[name]
                    
            if not running_processes:
                print(f"{YELLOW}All services stopped. Exiting.{NC}")
                break
                
            time.sleep(2)
    except KeyboardInterrupt:
        print("\nCtrl+C detected.")
        cleanup()
    finally:
        if not is_shutting_down:
            cleanup()