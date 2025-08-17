#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const app = express();
// Load project-specific configuration
let projectConfig = {};
try {
    const configPath = path.join(__dirname, 'project-config.json');
    const configData = require('fs').readFileSync(configPath, 'utf-8');
    projectConfig = JSON.parse(configData);
} catch (error) {
    // Use defaults if no config file
    projectConfig = {
        port: 8085,
        projectName: path.basename(process.cwd()),
        projectPath: process.cwd()
    };
}

const PORT = process.env.PORT || projectConfig.port || 8085;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Serve dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// API: Get test registry
app.get('/api/test-registry', async (req, res) => {
    try {
        const registryPath = path.join(process.cwd(), 'test-registry.json');
        
        // Check if registry exists, if not run discovery
        try {
            await fs.access(registryPath);
        } catch {
            console.log('Test registry not found, running discovery...');
            const discoveryScript = path.join(__dirname, 'scripts', 'discover-tests.js');
            await execAsync(`node "${discoveryScript}"`);
        }
        
        const registry = await fs.readFile(registryPath, 'utf-8');
        res.json(JSON.parse(registry));
    } catch (error) {
        console.error('Error loading test registry:', error);
        res.status(500).json({ error: error.message });
    }
});

// API: Get test content
app.get('/api/test-content', async (req, res) => {
    try {
        const testPath = req.query.path;
        if (!testPath) {
            return res.status(400).send('Path parameter required');
        }
        
        const fullPath = path.join(process.cwd(), testPath);
        const content = await fs.readFile(fullPath, 'utf-8');
        res.send(content);
    } catch (error) {
        console.error('Error reading test file:', error);
        res.status(500).send(error.message);
    }
});

// API: Run test
app.post('/api/run-test', async (req, res) => {
    try {
        const { path: testPath } = req.body;
        if (!testPath) {
            return res.status(400).json({ error: 'Path parameter required' });
        }
        
        // Determine the working directory and full path
        let fullPath, workingDir;
        
        if (path.isAbsolute(testPath)) {
            // If path is absolute, use it directly
            fullPath = testPath;
            workingDir = path.dirname(fullPath);
        } else {
            // For relative paths, check if they exist from current directory
            const relativePath = path.join(process.cwd(), testPath);
            
            try {
                await fs.access(relativePath);
                fullPath = relativePath;
                workingDir = process.cwd();
            } catch {
                // If not found in current directory, it might be from a configured project directory
                // Try to find the project directory that contains this test
                const projectDirs = process.env.PROJECT_DIRS ? process.env.PROJECT_DIRS.split(':') : [];
                let found = false;
                
                for (const projectDir of projectDirs) {
                    const candidatePath = path.join(projectDir, testPath);
                    try {
                        await fs.access(candidatePath);
                        fullPath = candidatePath;
                        workingDir = projectDir;
                        found = true;
                        break;
                    } catch {
                        continue;
                    }
                }
                
                if (!found) {
                    // Fall back to original behavior
                    fullPath = relativePath;
                    workingDir = process.cwd();
                }
            }
        }
        
        const ext = path.extname(fullPath);
        let command;
        
        // Determine how to run the test based on extension
        switch (ext) {
            case '.cjs':
                command = `node "${fullPath}"`;
                break;
            case '.js':
            case '.mjs':
                command = `node "${fullPath}"`;
                break;
            case '.py':
                command = `python "${fullPath}"`;
                break;
            case '.html':
                // For HTML tests, we can't run them directly
                return res.json({ 
                    output: `HTML test file. Open in browser: ${testPath}`,
                    type: 'html'
                });
            default:
                // Try to run with node by default
                command = `node "${fullPath}"`;
        }
        
        console.log(`Running test: ${command} in working directory: ${workingDir}`);
        
        const { stdout, stderr } = await execAsync(command, { 
            cwd: workingDir,
            timeout: 30000 // 30 second timeout
        });
        
        res.json({ 
            output: stdout || stderr,
            success: !stderr || stderr.length === 0,
            workingDir: workingDir,
            fullPath: fullPath
        });
    } catch (error) {
        console.error('Error running test:', error);
        res.status(500).json({ 
            error: error.message,
            output: error.stdout || error.stderr,
            workingDir: workingDir || 'unknown',
            fullPath: fullPath || testPath
        });
    }
});

// API: Discover tests with custom directories
app.post('/api/discover-tests', async (req, res) => {
    try {
        const { directories = [] } = req.body;
        const discoveryScript = path.join(__dirname, 'scripts', 'discover-tests.js');
        
        // Build command with directories
        let command = `node "${discoveryScript}"`;
        if (directories.length > 0) {
            // Validate and sanitize directories
            const safeDirs = directories
                .filter(dir => typeof dir === 'string' && dir.trim())
                .map(dir => dir.trim().replace(/"/g, '\\"')); // Escape quotes
            
            if (safeDirs.length > 0) {
                command += ' ' + safeDirs.map(d => `"${d}"`).join(' ');
            }
        }
        
        console.log('Running discovery command:', command);
        const { stdout, stderr } = await execAsync(command, { 
            cwd: process.cwd(),
            timeout: 60000 // 60 second timeout for discovery
        });
        
        res.json({ 
            success: true,
            message: 'Test discovery completed',
            output: stdout,
            error: stderr
        });
    } catch (error) {
        console.error('Error during test discovery:', error);
        res.status(500).json({ 
            success: false,
            error: error.message,
            output: error.stdout || error.stderr || ''
        });
    }
});

// API: Refresh test discovery (legacy endpoint)
app.post('/api/refresh', async (req, res) => {
    try {
        const discoveryScript = path.join(__dirname, 'scripts', 'discover-tests.js');
        
        // Get project directories from environment or request
        const projectDirs = process.env.PROJECT_DIRS ? 
            process.env.PROJECT_DIRS.split(':') : 
            req.body.projectDirs || [];
        
        // Build command
        let command = `node "${discoveryScript}"`;
        if (projectDirs.length > 0) {
            command += ' ' + projectDirs.map(d => `"${d}"`).join(' ');
        }
        
        const { stdout } = await execAsync(command, {
            cwd: process.cwd()
        });
        
        res.json({ success: true, message: stdout });
    } catch (error) {
        console.error('Error refreshing tests:', error);
        res.status(500).json({ error: error.message });
    }
});

// API: Get project configuration
app.get('/api/project-config', (req, res) => {
    res.json({
        projectName: projectConfig.projectName,
        projectPath: projectConfig.projectPath,
        port: PORT
    });
});

// API: Check Claude init status
app.get('/api/claude-status', async (req, res) => {
    try {
        const claudeMdPath = path.join(process.cwd(), 'CLAUDE.md');
        const claudeTasksPath = path.join(process.cwd(), 'claude_tasks');
        
        const hasClaude = await fs.access(claudeMdPath).then(() => true).catch(() => false);
        const hasTasks = await fs.access(claudeTasksPath).then(() => true).catch(() => false);
        
        res.json({
            initialized: hasClaude && hasTasks,
            hasCLAUDE_md: hasClaude,
            has_claude_tasks: hasTasks
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    const projectDisplayPath = projectConfig.projectPath.length > 30 
        ? '...' + projectConfig.projectPath.slice(-27) 
        : projectConfig.projectPath;
    
    console.log(`
╔════════════════════════════════════════╗
║         Test Dashboard Server          ║
║    Project Test Suite Management       ║
╠════════════════════════════════════════╣
║  Project: ${projectConfig.projectName.padEnd(26)} ║
║  Path: ${projectDisplayPath.padEnd(29)} ║
║  Server: http://localhost:${PORT.toString().padEnd(13)} ║
║                                        ║
║  API Endpoints:                        ║
║  GET  /api/project-config              ║
║  GET  /api/test-registry               ║
║  GET  /api/test-content                ║
║  POST /api/run-test                    ║
║  POST /api/refresh                     ║
║  GET  /api/claude-status               ║
╚════════════════════════════════════════╝
    `);
});