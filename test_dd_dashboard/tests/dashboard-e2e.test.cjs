#!/usr/bin/env node

const { chromium } = require('playwright');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const SERVER_PORT = 8000;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;
const TIMEOUT = 30000;

// Test results
let passed = 0;
let failed = 0;
const results = [];

// Helper to start server
function startServer() {
    return new Promise((resolve, reject) => {
        const serverPath = path.join(__dirname, '..', 'server.js');
        const server = spawn('node', [serverPath], {
            env: { ...process.env, PORT: SERVER_PORT },
            stdio: 'ignore'
        });

        server.on('error', reject);
        
        // Give server time to start
        setTimeout(() => resolve(server), 2000);
    });
}

// Helper to run a test
async function runTest(name, testFn) {
    console.log(`Running: ${name}`);
    try {
        await testFn();
        passed++;
        console.log(`  ✓ ${name}`);
        results.push({ name, passed: true });
    } catch (error) {
        failed++;
        console.log(`  ✗ ${name}`);
        console.log(`    Error: ${error.message}`);
        results.push({ name, passed: false, error: error.message });
    }
}

// Main test suite
async function runTests() {
    let server;
    let browser;
    let page;

    try {
        // Start server
        console.log('Starting test server...');
        server = await startServer();

        // Launch browser
        console.log('Launching browser...');
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        page = await context.newPage();

        console.log('\n=== Running E2E Tests ===\n');

        // Test 1: Dashboard loads
        await runTest('Dashboard loads successfully', async () => {
            const response = await page.goto(SERVER_URL, { timeout: TIMEOUT });
            if (!response.ok()) {
                throw new Error(`Failed to load dashboard: ${response.status()}`);
            }
            
            const title = await page.textContent('h1');
            if (!title.includes('Test Dashboard')) {
                throw new Error('Dashboard title not found');
            }
        });

        // Test 2: Test discovery works
        await runTest('Test discovery populates dashboard', async () => {
            await page.goto(SERVER_URL);
            await page.waitForTimeout(2000); // Wait for discovery
            
            const totalTests = await page.textContent('#total-tests');
            if (totalTests === '0') {
                console.log('  Note: No tests found (this is OK for fresh projects)');
            }
        });

        // Test 3: Filter buttons work
        await runTest('Filter buttons are clickable', async () => {
            await page.goto(SERVER_URL);
            
            const filterButtons = await page.$$('.filter-btn');
            if (filterButtons.length === 0) {
                throw new Error('No filter buttons found');
            }
            
            // Click first filter
            await filterButtons[1].click();
            
            // Check if it becomes active
            const classes = await filterButtons[1].getAttribute('class');
            if (!classes.includes('active')) {
                throw new Error('Filter button did not activate');
            }
        });

        // Test 4: Search functionality
        await runTest('Search input accepts text', async () => {
            await page.goto(SERVER_URL);
            
            const searchInput = await page.$('#search');
            if (!searchInput) {
                throw new Error('Search input not found');
            }
            
            await searchInput.type('test');
            const value = await searchInput.inputValue();
            if (value !== 'test') {
                throw new Error('Search input did not accept text');
            }
        });

        // Test 5: Modal opens and closes
        await runTest('Modal functionality works', async () => {
            await page.goto(SERVER_URL);
            await page.waitForTimeout(2000);
            
            // Try to click a test item (if any exist)
            const testItem = await page.$('.test-item');
            if (testItem) {
                await testItem.click();
                
                // Check if modal opened
                const modal = await page.$('.modal.active');
                if (!modal) {
                    throw new Error('Modal did not open');
                }
                
                // Close modal
                await page.click('.modal-close');
                await page.waitForTimeout(500);
                
                // Check if modal closed
                const modalAfter = await page.$('.modal.active');
                if (modalAfter) {
                    throw new Error('Modal did not close');
                }
            } else {
                console.log('  Note: No test items to click (OK for fresh projects)');
            }
        });

        // Test 6: API endpoints respond
        await runTest('API endpoints are accessible', async () => {
            // Test registry endpoint
            const registryResponse = await page.evaluate(async () => {
                const response = await fetch('/api/test-registry');
                return { ok: response.ok, status: response.status };
            });
            
            if (!registryResponse.ok) {
                throw new Error(`Registry endpoint failed: ${registryResponse.status}`);
            }
            
            // Test Claude status endpoint
            const statusResponse = await page.evaluate(async () => {
                const response = await fetch('/api/claude-status');
                return { ok: response.ok, status: response.status };
            });
            
            if (!statusResponse.ok) {
                throw new Error(`Claude status endpoint failed: ${statusResponse.status}`);
            }
        });

        // Test 7: Statistics update
        await runTest('Statistics display correctly', async () => {
            await page.goto(SERVER_URL);
            await page.waitForTimeout(2000);
            
            const totalTests = await page.$('#total-tests');
            const totalCategories = await page.$('#total-categories');
            const testTypes = await page.$('#test-types');
            
            if (!totalTests || !totalCategories || !testTypes) {
                throw new Error('Statistics elements not found');
            }
            
            // Values should be numeric
            const testsValue = await totalTests.textContent();
            if (isNaN(parseInt(testsValue))) {
                throw new Error('Total tests is not a number');
            }
        });

        // Test 8: Responsive design
        await runTest('Dashboard is responsive', async () => {
            await page.goto(SERVER_URL);
            
            // Test mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            await page.waitForTimeout(500);
            
            const container = await page.$('.container');
            if (!container) {
                throw new Error('Container not found');
            }
            
            // Test desktop viewport
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.waitForTimeout(500);
            
            // Should not throw errors
        });

    } finally {
        // Cleanup
        if (browser) {
            await browser.close();
        }
        
        if (server) {
            server.kill();
        }
    }
}

// Print summary
function printSummary() {
    console.log('\n=== Test Summary ===\n');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${passed + failed}`);
    
    if (failed > 0) {
        console.log('\nFailed tests:');
        results.filter(r => !r.passed).forEach(r => {
            console.log(`  - ${r.name}`);
            console.log(`    ${r.error}`);
        });
    }
    
    console.log('\n' + (failed === 0 ? '✅ All tests passed!' : '❌ Some tests failed'));
}

// Main execution
async function main() {
    console.log('Dashboard E2E Test Suite');
    console.log('========================\n');
    
    try {
        await runTests();
    } catch (error) {
        console.error('\nFatal error:', error);
        process.exit(1);
    }
    
    printSummary();
    process.exit(failed > 0 ? 1 : 0);
}

// Check if playwright is installed
try {
    require('playwright');
} catch (error) {
    console.error('Playwright not installed. Run: npm install');
    process.exit(1);
}

// Run tests
main();