#!/usr/bin/env node
/**
 * @test-category integration
 * @test-name Portal Integration E2E Test
 * @test-description Comprehensive test for portal startup, preferences backend, and UI integration
 * REQUIRED: These metadata tags make test discoverable by dashboard
 */

const { spawn } = require('child_process');
const http = require('http');
const https = require('https');
const url = require('url');

// Simple HTTP client for testing
function httpGet(targetUrl, options = {}) {
    return new Promise((resolve, reject) => {
        const { timeout = 10000, headers = {} } = options;
        const parsedUrl = url.parse(targetUrl);
        const client = parsedUrl.protocol === 'https:' ? https : http;
        
        const request = client.get({
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.path,
            headers: headers,
            timeout: timeout
        }, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                resolve({
                    status: response.statusCode,
                    headers: response.headers,
                    data: data
                });
            });
        });
        
        request.on('error', reject);
        request.on('timeout', () => {
            request.destroy();
            reject(new Error(`Request timeout after ${timeout}ms`));
        });
    });
}

function httpPut(targetUrl, postData, options = {}) {
    return new Promise((resolve, reject) => {
        const { timeout = 10000, headers = {} } = options;
        const parsedUrl = url.parse(targetUrl);
        const client = parsedUrl.protocol === 'https:' ? https : http;
        
        const postDataString = JSON.stringify(postData);
        
        const requestOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.path,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postDataString),
                ...headers
            },
            timeout: timeout
        };
        
        const request = client.request(requestOptions, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                resolve({
                    status: response.statusCode,
                    headers: response.headers,
                    data: data
                });
            });
        });
        
        request.on('error', reject);
        request.on('timeout', () => {
            request.destroy();
            reject(new Error(`Request timeout after ${timeout}ms`));
        });
        
        request.write(postDataString);
        request.end();
    });
}

// Test configuration
const TEST_CONFIG = {
    BACKEND_PORT: 8011,
    FRONTEND_PORT: 3100,
    TEST_USER_ID: 'test-user-integration',
    STARTUP_TIMEOUT: 45000,
    API_TIMEOUT: 10000,
    UI_TIMEOUT: 15000,
    CLEANUP_TIMEOUT: 10000
};

// Test state
let portalProcess = null;
let testResults = {
    portalStartup: false,
    backendStartup: false,
    frontendStartup: false,
    preferencesApi: false,
    uiAccessible: false,
    preferencesFlow: false,
    integration: false,
    cleanup: false
};

// Simple assertion helper
function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message}: Expected ${expected}, got ${actual}`);
    }
}

function assertProperty(obj, prop, message) {
    if (!obj.hasOwnProperty(prop)) {
        throw new Error(`${message}: Expected object to have property '${prop}'`);
    }
}

async function runIntegrationTests() {
    console.log('🚀 AI MFE Portal Full Integration Tests');
    console.log(`Backend Port: ${TEST_CONFIG.BACKEND_PORT}`);
    console.log(`Frontend Port: ${TEST_CONFIG.FRONTEND_PORT}`);
    
    let testsPassed = 0;
    let testsFailed = 0;
    
    try {
        // Test 1: Start fresh portal instance
        console.log('\n📋 Test 1: Portal Fresh Startup');
        await testPortalStartup();
        console.log('✅ Test 1 PASSED: Portal started from scratch');
        testsPassed++;
        
        // Test 2: Complete API validation
        console.log('\n📋 Test 2: Complete API Validation');
        await testCompleteAPI();
        console.log('✅ Test 2 PASSED: All API endpoints validated');
        testsPassed++;
        
        // Test 3: UI and preferences integration
        console.log('\n📋 Test 3: UI Integration Test');
        await testUIIntegration();
        console.log('✅ Test 3 PASSED: UI integration verified');
        testsPassed++;
        
        // Test 4: End-to-end preferences flow
        console.log('\n📋 Test 4: End-to-End Preferences Flow');
        await testEndToEndFlow();
        console.log('✅ Test 4 PASSED: Complete preferences workflow');
        testsPassed++;
        
    } catch (error) {
        console.error(`❌ Test FAILED: ${error.message}`);
        testsFailed++;
    } finally {
        // Cleanup
        console.log('\n📋 Cleanup: Stopping services');
        await cleanup();
        testResults.cleanup = true;
        console.log('✅ Cleanup completed');
    }
    
    // Report results
    console.log('\n📊 Integration Test Results:');
    console.log(`   Tests Passed: ${testsPassed}`);
    console.log(`   Tests Failed: ${testsFailed}`);
    console.log(`   Total Tests: ${testsPassed + testsFailed}`);
    
    Object.entries(testResults).forEach(([test, passed]) => {
        console.log(`   ${passed ? '✅' : '❌'} ${test}`);
    });
    
    if (testsFailed > 0) {
        console.log('\n❌ Integration tests failed');
        process.exit(1);
    } else {
        console.log('\n🎉 All integration tests passed!');
        process.exit(0);
    }
}

async function testPortalStartup() {
    console.log('🔧 Starting fresh portal instance...');
    
    // Start a clean portal instance
    portalProcess = spawn('python', ['start_portal.py', '--services', 'shell'], {
        cwd: process.cwd(),
        env: { ...process.env, APP_ENV: 'development' },
        stdio: ['pipe', 'pipe', 'pipe']
    });

    let backendReady = false;
    let frontendReady = false;
    let startupComplete = false;

    const startupPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error(`Portal startup timed out after ${TEST_CONFIG.STARTUP_TIMEOUT}ms`));
        }, TEST_CONFIG.STARTUP_TIMEOUT);

        portalProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log('STARTUP:', output.trim());
            
            const cleanOutput = output.replace(/\x1b\[[0-9;]*m/g, '');

            if (cleanOutput.includes('shell_service started') || cleanOutput.includes(`port ${TEST_CONFIG.BACKEND_PORT}`)) {
                backendReady = true;
                testResults.backendStartup = true;
            }

            if (cleanOutput.includes('shell started') || cleanOutput.includes(`port ${TEST_CONFIG.FRONTEND_PORT}`)) {
                frontendReady = true;
                testResults.frontendStartup = true;
            }

            if (cleanOutput.includes('AI MFE PORTAL RUNNING')) {
                startupComplete = true;
                clearTimeout(timeout);
                setTimeout(resolve, 3000);
            } else if (backendReady && frontendReady && !startupComplete) {
                startupComplete = true;
                clearTimeout(timeout);
                setTimeout(resolve, 3000);
            }
        });

        portalProcess.stderr.on('data', (data) => {
            console.error('STARTUP ERROR:', data.toString().trim());
        });

        portalProcess.on('close', (code) => {
            clearTimeout(timeout);
            if (code !== 0 && !startupComplete) {
                reject(new Error(`Portal process exited with code ${code}`));
            }
        });
    });

    await startupPromise;
    assertEqual(backendReady, true, 'Backend should start successfully');
    assertEqual(frontendReady, true, 'Frontend should start successfully');
    testResults.portalStartup = true;
}

async function testCompleteAPI() {
    console.log('🔌 Testing complete API functionality...');

    const baseUrl = `http://localhost:${TEST_CONFIG.BACKEND_PORT}`;
    const headers = { 'X-User-Id': TEST_CONFIG.TEST_USER_ID };
    
    // Test all endpoints
    const healthResponse = await httpGet(`${baseUrl}/health`);
    assertEqual(healthResponse.status, 200, 'Health endpoint should work');

    const configResponse = await httpGet(`${baseUrl}/api/v1/shell/configuration`, { headers });
    assertEqual(configResponse.status, 200, 'Configuration endpoint should work');
    
    const configData = JSON.parse(configResponse.data);
    assertProperty(configData, 'frames', 'Config should have frames');
    assertProperty(configData, 'availableApps', 'Config should have availableApps');
    assertProperty(configData, 'serviceEndpoints', 'Config should have serviceEndpoints');

    const layoutsResponse = await httpGet(`${baseUrl}/api/v1/shell/layouts`);
    assertEqual(layoutsResponse.status, 200, 'Layouts endpoint should work');

    const appsResponse = await httpGet(`${baseUrl}/api/v1/shell/available-apps`);
    assertEqual(appsResponse.status, 200, 'Available apps endpoint should work');

    testResults.preferencesApi = true;
}

async function testUIIntegration() {
    console.log('🌐 Testing UI integration...');

    const frontendUrl = `http://localhost:${TEST_CONFIG.FRONTEND_PORT}`;
    const response = await httpGet(frontendUrl, { timeout: TEST_CONFIG.UI_TIMEOUT });
    
    assertEqual(response.status < 500, true, 'Frontend should not return server error');
    
    const htmlContent = response.data.toLowerCase();
    const hasHtml = htmlContent.includes('html') || htmlContent.includes('<!doctype');
    assertEqual(hasHtml, true, 'Response should contain HTML content');
    
    // Check for proper branding
    const hasPortalTitle = response.data.includes('AI MFE Portal');
    assertEqual(hasPortalTitle, true, 'Should have AI MFE Portal branding');

    testResults.uiAccessible = true;
}

async function testEndToEndFlow() {
    console.log('🔄 Testing complete end-to-end workflow...');

    const baseUrl = `http://localhost:${TEST_CONFIG.BACKEND_PORT}`;
    const headers = { 
        'X-User-Id': TEST_CONFIG.TEST_USER_ID,
        'Content-Type': 'application/json'
    };

    // Complete workflow test
    const testPreferences = {
        frames: [
            {
                id: 'integration-test-frame',
                name: 'Integration Test Workspace',
                order: 0,
                layoutId: 'two-column',
                assignedApps: [
                    { appId: 'test-app', windowId: 1 },
                    { appId: 'job-management', windowId: 2 }
                ]
            }
        ]
    };

    // Save complex preferences
    const saveResponse = await httpPut(`${baseUrl}/api/v1/shell/preferences`, testPreferences, { headers });
    assertEqual(saveResponse.status, 200, 'Complex preferences should save');

    // Verify retrieval
    const retrieveResponse = await httpGet(`${baseUrl}/api/v1/shell/configuration`, { headers });
    const config = JSON.parse(retrieveResponse.data);
    
    const testFrame = config.frames.find(f => f.id === 'integration-test-frame');
    assertEqual(testFrame !== undefined, true, 'Test frame should exist');
    assertEqual(testFrame.assignedApps.length, 2, 'Should have 2 assigned apps');

    testResults.preferencesFlow = true;
    testResults.integration = true;
}

async function cleanup() {
    if (portalProcess && !portalProcess.killed) {
        portalProcess.kill('SIGTERM');
        await new Promise(resolve => {
            portalProcess.on('close', () => {
                resolve();
            });
            setTimeout(() => {
                if (!portalProcess.killed) {
                    portalProcess.kill('SIGKILL');
                    resolve();
                }
            }, TEST_CONFIG.CLEANUP_TIMEOUT);
        });
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runIntegrationTests().catch(error => {
        console.error('Integration test execution failed:', error);
        process.exit(1);
    });
}

module.exports = {
    runIntegrationTests,
    testResults,
    TEST_CONFIG
};