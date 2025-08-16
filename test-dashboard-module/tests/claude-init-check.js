#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    gray: '\x1b[90m'
};

// Check items
const checks = [
    {
        name: 'CLAUDE.md exists',
        path: 'CLAUDE.md',
        type: 'file',
        required: true,
        description: 'Main Claude configuration file'
    },
    {
        name: 'claude_tasks directory exists',
        path: 'claude_tasks',
        type: 'directory',
        required: true,
        description: 'Task management directory'
    },
    {
        name: 'Active tasks file exists',
        path: 'claude_tasks/active/ACTIVE_TASKS.md',
        type: 'file',
        required: true,
        description: 'Current task tracking'
    },
    {
        name: 'Quick reference exists',
        path: 'claude_tasks/QUICK_REFERENCE.md',
        type: 'file',
        required: true,
        description: 'Quick commands and workflow'
    },
    {
        name: 'Development process exists',
        path: 'claude_tasks/DEVELOPMENT_PROCESS.md',
        type: 'file',
        required: false,
        description: 'TDD methodology guide'
    },
    {
        name: 'Principles card exists',
        path: 'claude_tasks/PRINCIPLES_QUICK_CARD.md',
        type: 'file',
        required: false,
        description: 'Core development principles'
    },
    {
        name: 'Finished tasks directory exists',
        path: 'claude_tasks/finished',
        type: 'directory',
        required: false,
        description: 'Completed tasks archive'
    }
];

// Helper to check if path exists
async function checkPath(checkPath, type) {
    try {
        const stats = await fs.stat(checkPath);
        if (type === 'file') {
            return stats.isFile();
        } else if (type === 'directory') {
            return stats.isDirectory();
        }
        return true;
    } catch {
        return false;
    }
}

// Main check function
async function runChecks() {
    console.log(`\n${colors.blue}═══════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}║  Claude Task Management Setup Checker  ║${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════════${colors.reset}\n`);
    
    const projectRoot = process.cwd();
    console.log(`${colors.gray}Checking in: ${projectRoot}${colors.reset}\n`);
    
    let requiredPassed = 0;
    let requiredFailed = 0;
    let optionalPassed = 0;
    let optionalFailed = 0;
    
    for (const check of checks) {
        const fullPath = path.join(projectRoot, check.path);
        const exists = await checkPath(fullPath, check.type);
        
        const icon = exists ? '✓' : '✗';
        const color = exists ? colors.green : (check.required ? colors.red : colors.yellow);
        const status = exists ? 'Found' : (check.required ? 'MISSING' : 'Not found');
        
        console.log(`${color}${icon} ${check.name}${colors.reset}`);
        console.log(`  ${colors.gray}${check.description}${colors.reset}`);
        console.log(`  ${colors.gray}Path: ${check.path}${colors.reset}`);
        console.log(`  Status: ${color}${status}${colors.reset}\n`);
        
        if (check.required) {
            if (exists) requiredPassed++;
            else requiredFailed++;
        } else {
            if (exists) optionalPassed++;
            else optionalFailed++;
        }
    }
    
    // Summary
    console.log(`${colors.blue}───────────────────────────────────────────${colors.reset}`);
    console.log(`${colors.blue}Summary:${colors.reset}\n`);
    
    console.log(`Required items: ${colors.green}${requiredPassed} passed${colors.reset}, ${colors.red}${requiredFailed} failed${colors.reset}`);
    console.log(`Optional items: ${colors.green}${optionalPassed} found${colors.reset}, ${colors.yellow}${optionalFailed} not found${colors.reset}`);
    
    const isInitialized = requiredFailed === 0;
    
    if (isInitialized) {
        console.log(`\n${colors.green}✅ Claude Task Management is properly initialized!${colors.reset}`);
        console.log(`${colors.gray}You can start using Claude Code with task management.${colors.reset}`);
    } else {
        console.log(`\n${colors.red}❌ Claude Task Management is NOT fully initialized${colors.reset}`);
        console.log(`\n${colors.yellow}To initialize, run:${colors.reset}`);
        console.log(`${colors.gray}  curl -sSL https://raw.githubusercontent.com/foolishimp/claude_init/main/setup_claude_tasks.py | python3${colors.reset}`);
        console.log(`\n${colors.gray}Or if you have the setup script:${colors.reset}`);
        console.log(`${colors.gray}  python setup_claude_tasks.py${colors.reset}`);
    }
    
    console.log(`\n${colors.blue}═══════════════════════════════════════════${colors.reset}\n`);
    
    return isInitialized;
}

// Check for CLAUDE.md content
async function checkClaudeContent() {
    const claudePath = path.join(process.cwd(), 'CLAUDE.md');
    
    try {
        const content = await fs.readFile(claudePath, 'utf-8');
        
        console.log(`${colors.blue}CLAUDE.md Content Check:${colors.reset}\n`);
        
        const checks = [
            { pattern: /claude_tasks/, name: 'References claude_tasks' },
            { pattern: /TDD|Test.?Driven/, name: 'Mentions TDD methodology' },
            { pattern: /QUICK_REFERENCE/, name: 'Links to quick reference' },
            { pattern: /ACTIVE_TASKS/, name: 'References active tasks' }
        ];
        
        for (const check of checks) {
            const found = check.pattern.test(content);
            const icon = found ? '✓' : '✗';
            const color = found ? colors.green : colors.yellow;
            console.log(`  ${color}${icon} ${check.name}${colors.reset}`);
        }
        
        console.log('');
    } catch (error) {
        console.log(`${colors.yellow}Could not check CLAUDE.md content${colors.reset}\n`);
    }
}

// Main execution
async function main() {
    try {
        const isInitialized = await runChecks();
        
        if (isInitialized) {
            await checkClaudeContent();
        }
        
        process.exit(isInitialized ? 0 : 1);
    } catch (error) {
        console.error(`${colors.red}Error running checks: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { runChecks };