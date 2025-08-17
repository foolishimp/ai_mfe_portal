#!/usr/bin/env python3
"""
Test Dashboard Module Installer

This script installs the test dashboard module into any project,
providing a web-based interface for test management and monitoring.

Usage:
    python setup_test_dashboard.py [options]
    
Options:
    --target PATH       Target directory for installation (default: current directory)
    --force            Overwrite existing files
    --port PORT        Default port for the dashboard (default: 8085)
    --no-git           Don't add .gitignore entries
"""

import os
import sys
import shutil
import argparse
import tempfile
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, List
import json

class TestDashboardSetup:
    """Setup test dashboard module in a project."""
    
    def __init__(self, target: str = ".", force: bool = False, 
                 port: int = 8085, no_git: bool = False):
        self.target = Path(target).resolve()
        self.force = force
        self.port = port
        self.no_git = no_git
        self.dashboard_dir = self.target / "test-dashboard-module"
        
        # Source is the directory where this script is located
        self.source_dir = Path(__file__).parent
        
    def run(self):
        """Execute the setup process."""
        print("📊 Test Dashboard Module Setup")
        print(f"📁 Target directory: {self.target}")
        print(f"📁 Source directory: {self.source_dir}")
        
        # Check what already exists
        dashboard_exists = self.dashboard_dir.exists()
        
        print(f"\n📋 Current state:")
        print(f"   test-dashboard-module/: {'✅ exists' if dashboard_exists else '❌ missing'}")
        
        # Install dashboard if missing or force flag is set
        if not dashboard_exists or self.force:
            if dashboard_exists and self.force:
                print(f"\n🔄 Reinstalling test-dashboard-module (--force flag)")
            else:
                print(f"\n📊 Installing test-dashboard-module...")
            
            self._install_dashboard()
        else:
            print(f"\n⏭️  Skipping test-dashboard-module (already exists)")
        
        # Add .gitignore entries
        if not self.no_git:
            self._update_gitignore()
        
        print("\n✅ Setup complete!")
        self._print_next_steps()
    
    def _install_dashboard(self):
        """Install the test dashboard module."""
        
        # Remove existing if force flag is set
        if self.dashboard_dir.exists() and self.force:
            print(f"🗑️  Removing existing dashboard...")
            shutil.rmtree(self.dashboard_dir)
        
        # Copy dashboard from source
        self._copy_dashboard()
        
        # Update configuration for target
        self._update_dashboard_config()
        
        # Install Node.js dependencies
        self._install_node_dependencies()
    
    def _copy_dashboard(self):
        """Copy dashboard files from source directory."""
        
        # Files and directories to copy (exclude this installer script)
        items_to_copy = []
        for item in self.source_dir.iterdir():
            if item.name != "setup_test_dashboard.py":
                items_to_copy.append(item)
        
        # Create target directory
        self.dashboard_dir.mkdir(parents=True, exist_ok=True)
        
        # Copy each item
        for item in items_to_copy:
            target_path = self.dashboard_dir / item.name
            
            if item.is_file():
                shutil.copy2(item, target_path)
                print(f"📄 Copied: {item.name}")
            elif item.is_dir() and item.name not in ["node_modules", "__pycache__"]:
                if target_path.exists():
                    shutil.rmtree(target_path)
                shutil.copytree(item, target_path)
                print(f"📁 Copied: {item.name}/")
        
        print(f"📊 Test dashboard copied to: {self.dashboard_dir.relative_to(self.target)}")
    
    def _update_dashboard_config(self):
        """Update dashboard configuration for target project."""
        package_json_path = self.dashboard_dir / "package.json"
        
        if package_json_path.exists():
            try:
                with open(package_json_path, 'r') as f:
                    package_data = json.load(f)
                
                # Update name to reflect target project
                package_data["name"] = f"{self.target.name}-test-dashboard"
                
                # Update description
                package_data["description"] = f"Test dashboard for {self.target.name} project"
                
                with open(package_json_path, 'w') as f:
                    json.dump(package_data, f, indent=2)
                
                print(f"📝 Updated package.json for project: {self.target.name}")
            
            except (json.JSONDecodeError, KeyError) as e:
                print(f"⚠️  Could not update package.json: {e}")
        
        # Update server configuration if needed
        server_js_path = self.dashboard_dir / "server.js"
        if server_js_path.exists() and self.port != 8085:
            try:
                content = server_js_path.read_text()
                # Update default port
                content = content.replace("PORT || 8085", f"PORT || {self.port}")
                server_js_path.write_text(content)
                print(f"📝 Updated default port to: {self.port}")
            except Exception as e:
                print(f"⚠️  Could not update server port: {e}")
    
    def _install_node_dependencies(self):
        """Install Node.js dependencies for the test dashboard."""
        package_json = self.dashboard_dir / "package.json"
        if not package_json.exists():
            print("⚠️  No package.json found, skipping npm install")
            return
        
        try:
            print("📦 Installing Node.js dependencies...")
            result = subprocess.run(
                ["npm", "install"],
                cwd=self.dashboard_dir,
                capture_output=True,
                text=True,
                timeout=120  # 2 minute timeout
            )
            
            if result.returncode == 0:
                print("✅ Node.js dependencies installed successfully")
            else:
                print(f"⚠️  npm install completed with warnings")
                if result.stderr:
                    print(f"   stderr: {result.stderr[:200]}...")
                    
        except subprocess.TimeoutExpired:
            print("⚠️  npm install timed out, but dashboard was created")
        except FileNotFoundError:
            print("⚠️  npm not found - install Node.js to use test dashboard")
            print("   Visit https://nodejs.org to download Node.js")
        except Exception as e:
            print(f"⚠️  Error installing dependencies: {e}")
            print("   You can run 'npm install' manually in the test-dashboard-module directory")

    def _update_gitignore(self):
        """Add appropriate .gitignore entries."""
        gitignore_path = self.target / ".gitignore"
        
        entries_to_add = [
            "\n# Test Dashboard Module",
            "test-dashboard-module/node_modules/",
            "test-dashboard-module/package-lock.json",
            "test-dashboard-module/test-registry.json",
            "test-dashboard-module/*.log",
        ]
        
        if gitignore_path.exists():
            content = gitignore_path.read_text()
            
            # Check if already has test dashboard entries
            if "test-dashboard-module" in content:
                print("✓ .gitignore already configured for test dashboard")
                return
            
            # Append entries
            if not content.endswith("\n"):
                content += "\n"
            
            content += "\n".join(entries_to_add) + "\n"
            gitignore_path.write_text(content)
            print("📝 Updated .gitignore")
        else:
            # Create new .gitignore
            content = "\n".join(entries_to_add) + "\n"
            gitignore_path.write_text(content)
            print("📝 Created .gitignore")
    
    def _print_next_steps(self):
        """Print next steps for the user."""
        dashboard_exists = self.dashboard_dir.exists()
        
        print("\n📚 Next Steps:")
        
        if dashboard_exists:
            print("1. Start the test dashboard:")
            print(f"   cd {self.dashboard_dir.relative_to(self.target)}")
            print("   npm start")
            print()
            print(f"2. Open http://localhost:{self.port} in your browser")
            print()
            print("3. Configure project directories in the dashboard")
            print("   - Add your project root directory")
            print("   - Configure test file patterns")
            print("   - Set up test commands")
            print()
            print("4. Use the dashboard to:")
            print("   - Discover and run tests")
            print("   - Monitor test results")
            print("   - Track test coverage")
            print("   - Generate test reports")
            print()
            print("📝 Optional: Commit the changes:")
            print("   git add test-dashboard-module/")
            print("   git commit -m 'Add test dashboard module'")
        
        print(f"\n🎯 Start dashboard with: cd {self.dashboard_dir.relative_to(self.target)} && npm start")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Setup Test Dashboard Module in your project",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Install in current directory
  python setup_test_dashboard.py
  
  # Install in specific directory
  python setup_test_dashboard.py --target ./myproject
  
  # Force overwrite existing installation
  python setup_test_dashboard.py --force
  
  # Use custom port
  python setup_test_dashboard.py --port 3000
        """
    )
    
    parser.add_argument(
        "--target",
        help="Target directory for installation (default: current directory)",
        default="."
    )
    
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing files"
    )
    
    parser.add_argument(
        "--port",
        type=int,
        help="Default port for the dashboard (default: 8085)",
        default=8085
    )
    
    parser.add_argument(
        "--no-git",
        action="store_true",
        help="Don't add .gitignore entries"
    )
    
    args = parser.parse_args()
    
    # Run setup
    setup = TestDashboardSetup(
        target=args.target,
        force=args.force,
        port=args.port,
        no_git=args.no_git
    )
    
    try:
        setup.run()
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()