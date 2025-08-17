# Test Dashboard Module

A generic, project-agnostic test dashboard for any project. Features automatic test discovery, visual management, and test execution with quality-of-life improvements.

## Features

- 🔍 **Automatic Test Discovery**: Finds all test files across one or multiple projects
- ✅ **Test Selection**: Checkbox-based selection with "Select All" per category
- 📊 **Visual Dashboard**: Beautiful UI with filtering, search, and categorization
- 🏃 **Test Execution**: Run selected tests or individual tests
- 🔄 **Real-time Updates**: Refresh registry and re-discover tests on demand
- 📁 **Multi-Project Support**: Scan multiple project directories simultaneously
- 🎯 **Multi-language Support**: Works with JavaScript, TypeScript, Python, and more
- 📝 **Output Panel**: Real-time test execution output with color-coded results
- ✨ **Claude Integration**: Checks if Claude Task Management is initialized

## Installation

### As Part of Claude Init

If you installed via `claude_init`, the test dashboard is already included:

```bash
# From your project root directory:
PROJECT_DIRS="." node test-dashboard-module/server.js
```

### Standalone Installation

```bash
# Clone or copy this module to your project
cp -r test-dashboard-module /path/to/your/project/

# Install dependencies
cd /path/to/your/project/test-dashboard-module
npm install

# Start the dashboard (from project root)
cd /path/to/your/project
PROJECT_DIRS="." node test-dashboard-module/server.js
```

## Usage

### Starting the Dashboard

```bash
# Default port 8085 (from project root)
PROJECT_DIRS="." node test-dashboard-module/server.js

# Custom port
PORT=3000 PROJECT_DIRS="." node test-dashboard-module/server.js

# With specific project directories
PROJECT_DIRS="/project1:/project2" node test-dashboard-module/server.js
```

**Important**: Always start the dashboard from your project root directory to ensure proper Claude integration detection.

### Discovering Tests

The dashboard automatically discovers tests on first run. 

#### From Current Directory (Default)
```bash
npm run discover
```

#### From Specific Project
```bash
node scripts/discover-tests.js /path/to/project
```

#### From Multiple Projects
```bash
node scripts/discover-tests.js /project1 /project2 /project3
```

#### With Custom Output Directory
```bash
node scripts/discover-tests.js -o ./dashboard /path/to/project
```

### Dashboard Features

1. **Test Selection**
   - Click checkboxes to select individual tests
   - Use "Select All" checkbox in category header
   - Use top "Select All" / "Deselect All" buttons

2. **Running Tests**
   - Click "Run Selected Tests" to execute checked tests
   - Click on test name to view content and run individually
   - View output in real-time output panel

3. **Refreshing**
   - "Refresh Registry" - Reload the test list from registry
   - "Re-discover Tests" - Scan projects for new/removed tests

### Running Tests

#### Self Tests
```bash
# Check Claude init status
npm run check

# Run browser-based self tests
npm run test:self
# Then open http://localhost:8000/tests/dashboard-self-test.html

# Run Playwright E2E tests
npm run test:e2e
```

## Test Patterns

The dashboard recognizes tests matching these patterns:

- `*.test.*` - Unit tests
- `*.spec.*` - Specification tests
- `test-*` - Test files with prefix
- `test_*` - Python-style test files
- Files in `test/`, `tests/`, `__tests__/` directories

## Supported File Types

- `.js`, `.mjs`, `.cjs` - JavaScript/Node.js
- `.ts`, `.tsx` - TypeScript
- `.py` - Python
- `.html` - Browser-based tests
- More can be added in `scripts/discover-tests.js`

## Configuration

### Port Configuration

```bash
PORT=3000 PROJECT_DIRS="." node test-dashboard-module/server.js  # Use custom port (default: 8085)
```

### Project Directories

When the dashboard module is located outside your project (e.g., as a sibling directory), you can specify which projects to scan:

```bash
# Environment variable (colon-separated)
PROJECT_DIRS="/path/to/project1:/path/to/project2" npm start

# Or use discovery script directly
node scripts/discover-tests.js ../my-project ../another-project
```

### Discovery Configuration

Edit `scripts/discover-tests.js` to customize:
- Test patterns
- Ignored directories
- File extensions
- Output format

## API Endpoints

The dashboard server provides these endpoints:

- `GET /api/test-registry` - Get all discovered tests
- `GET /api/test-content?path=...` - Get test file content
- `POST /api/run-test` - Execute a test
- `POST /api/refresh` - Refresh test discovery
- `GET /api/claude-status` - Check Claude init status

## Project Structure

```
test-dashboard-module/
├── dashboard.html           # Main dashboard UI
├── server.js               # Express server
├── package.json            # Dependencies
├── scripts/
│   └── discover-tests.js   # Test discovery script
└── tests/
    ├── dashboard-self-test.html  # Browser self-tests
    ├── dashboard-e2e.test.cjs    # Playwright E2E tests
    └── claude-init-check.js      # Claude setup verification
```

## Integration with Projects

### For JavaScript/TypeScript Projects

```json
// Add to your package.json
{
  "scripts": {
    "dashboard": "cd test-dashboard-module && npm start",
    "test:discover": "cd test-dashboard-module && npm run discover"
  }
}
```

### For Python Projects

```python
# Add to your Makefile or scripts
dashboard:
    cd test-dashboard-module && npm start

discover:
    cd test-dashboard-module && npm run discover
```

### For Multiple Projects

If the dashboard is installed as a sibling to multiple projects:

```bash
# Directory structure:
# /workspace/
#   ├── test-dashboard-module/
#   ├── project-a/
#   ├── project-b/
#   └── project-c/

# From test-dashboard-module directory:
node scripts/discover-tests.js ../project-a ../project-b ../project-c

# Start dashboard
npm start
```

## Troubleshooting

### Tests Not Found

1. Check test file naming matches patterns
2. Verify project directories are correct
3. Run `npm run discover` to refresh
4. Check `test-registry.json` was created
5. Verify paths in the registry

### Dashboard Can't Find Project Tests

If the dashboard is outside your project:
```bash
# Explicitly specify project directory
node scripts/discover-tests.js /absolute/path/to/project

# Or use relative path
node scripts/discover-tests.js ../my-project
```

### Server Won't Start

1. Check port is available (default 8000)
2. Ensure Node.js is installed
3. Run `npm install` to get dependencies
4. Check for error messages in console

### Can't Run Tests

1. Ensure test runners are installed (pytest, jest, etc.)
2. Check file permissions
3. Verify test commands in `server.js`
4. Tests are run from the dashboard's working directory

## Contributing

To extend the dashboard:

1. **Add Test Types**: Edit `discover-tests.js` patterns
2. **Custom Runners**: Modify `server.js` run-test endpoint
3. **UI Features**: Enhance `dashboard.html`
4. **New Endpoints**: Add to `server.js`

## License

MIT - Part of the Claude Task Management System