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
const fs = require('fs');
const path = require('path');

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

function httpPost(targetUrl, postData, options = {}) {
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
    BACKEND_PORT: 8011,  // prefs_service port from environments.json (updated)
    FRONTEND_PORT: 3100, // shell port from environments.json  
    TEST_USER_ID: 'test-user-e2e',
    STARTUP_TIMEOUT: 45000,
    API_TIMEOUT: 10000,
    UI_TIMEOUT: 15000,
    CLEANUP_TIMEOUT: 10000
};

// Test state
let portalProcess = null;
let testResults = {
    backendStartup: false,
    frontendStartup: false,
    preferencesApi: false,
    uiAccessible: false,
    preferencesUI: false,
    cleanup: false
};

// Simple assertion helper
function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message}: Expected ${expected}, got ${actual}`);
    }
}

function assertContains(actual, expected, message) {
    if (!actual.includes(expected)) {
        throw new Error(`${message}: Expected to contain '${expected}', got '${actual}'`);
    }
}

function assertProperty(obj, prop, message) {
    if (!obj.hasOwnProperty(prop)) {
        throw new Error(`${message}: Expected object to have property '${prop}'`);
    }
}

// Sleep utility
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
    console.log('🚀 Starting AI MFE Portal Integration Tests');
    console.log(`Backend Port: ${TEST_CONFIG.BACKEND_PORT}`);
    console.log(`Frontend Port: ${TEST_CONFIG.FRONTEND_PORT}`);
    
    let testsPassed = 0;
    let testsFailed = 0;
    
    try {
        // Test 1: Start the portal
        console.log('\n📋 Test 1: Portal Startup');
        await testPortalStartup();
        console.log('✅ Test 1 PASSED: Portal started successfully');
        testsPassed++;
        
        // Test 2: API endpoints
        console.log('\n📋 Test 2: Preferences API');
        await testPreferencesAPI();
        console.log('✅ Test 2 PASSED: API endpoints functional');
        testsPassed++;
        
        // Test 3: UI accessibility
        console.log('\n📋 Test 3: UI Accessibility');
        await testUIAccessibility();
        console.log('✅ Test 3 PASSED: UI accessible');
        testsPassed++;
        
        // Test 4: Preferences functionality
        console.log('\n📋 Test 4: Preferences Functionality');
        await testPreferencesFunctionality();
        console.log('✅ Test 4 PASSED: Preferences save/retrieve works');
        testsPassed++;
        
        // Test 5: Integration
        console.log('\n📋 Test 5: Frontend-Backend Integration');
        await testIntegration();
        console.log('✅ Test 5 PASSED: Integration verified');
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
    console.log('\n📊 Test Results Summary:');
    console.log(`   Tests Passed: ${testsPassed}`);
    console.log(`   Tests Failed: ${testsFailed}`);
    console.log(`   Total Tests: ${testsPassed + testsFailed}`);
    
    Object.entries(testResults).forEach(([test, passed]) => {
        console.log(`   ${passed ? '✅' : '❌'} ${test}`);
    });
    
    if (testsFailed > 0) {
        process.exit(1);
    } else {
        console.log('\n🎉 All tests passed!');
        process.exit(0);
    }
}

async function testPortalStartup() {
    console.log('🔧 Starting portal services...');
    
    // Start the portal using the unified start script with specific services
    portalProcess = spawn('python', ['start_portal.py', '--services', 'shell'], {
        cwd: process.cwd(),
        env: { ...process.env, APP_ENV: 'development' },
        stdio: ['pipe', 'pipe', 'pipe']
    });

    let backendReady = false;
    let frontendReady = false;
    let startupComplete = false;

    // Monitor startup logs
    const startupPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error(`Portal startup timed out after ${TEST_CONFIG.STARTUP_TIMEOUT}ms`));
        }, TEST_CONFIG.STARTUP_TIMEOUT);

        portalProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log('PORTAL:', output.trim());
            
            // Strip ANSI color codes for text matching
            const cleanOutput = output.replace(/\x1b\[[0-9;]*m/g, '');

            // Check for backend service startup
            if (cleanOutput.includes('shell_service started') || cleanOutput.includes(`port ${TEST_CONFIG.BACKEND_PORT}`)) {
                backendReady = true;
                testResults.backendStartup = true;
            }

            // Check for frontend service startup
            if (cleanOutput.includes('shell started') || cleanOutput.includes(`port ${TEST_CONFIG.FRONTEND_PORT}`)) {
                frontendReady = true;
                testResults.frontendStartup = true;
            }

            // Check for overall startup completion - more tolerant of test-app failure
            if (cleanOutput.includes('AI MFE PORTAL RUNNING')) {
                startupComplete = true;
                clearTimeout(timeout);
                // Give a bit more time for full startup
                setTimeout(resolve, 3000);
            } else if (backendReady && frontendReady && !startupComplete) {
                // Fallback: if both services are ready but no "RUNNING" message
                startupComplete = true;
                clearTimeout(timeout);
                setTimeout(resolve, 3000);
            }
        });

        portalProcess.stderr.on('data', (data) => {
            console.error('PORTAL ERROR:', data.toString().trim());
        });

        portalProcess.on('close', (code) => {
            clearTimeout(timeout);
            if (code !== 0 && !startupComplete) {
                reject(new Error(`Portal process exited with code ${code}`));
            }
        });
    });

    await startupPromise;

    // Verify both services started
    assertEqual(backendReady, true, 'Backend should be ready');
    assertEqual(frontendReady, true, 'Frontend should be ready');
}

async function testPreferencesAPI() {
    console.log('🔌 Testing preferences API endpoints...');

    const baseUrl = `http://localhost:${TEST_CONFIG.BACKEND_PORT}`;
    
    // Test health check
    const healthResponse = await httpGet(`${baseUrl}/health`);
    assertEqual(healthResponse.status, 200, 'Health check should return 200');
    console.log('✅ Health check passed');

    // Test shell configuration endpoint
    const configResponse = await httpGet(`${baseUrl}/api/v1/shell/configuration`, {
        headers: { 'X-User-Id': TEST_CONFIG.TEST_USER_ID }
    });
    assertEqual(configResponse.status, 200, 'Configuration endpoint should return 200');
    
    const configData = JSON.parse(configResponse.data);
    assertProperty(configData, 'frames', 'Config should have frames property');
    assertProperty(configData, 'availableApps', 'Config should have availableApps property');
    assertProperty(configData, 'serviceEndpoints', 'Config should have serviceEndpoints property');
    console.log('✅ Configuration endpoint functional');

    // Test layouts endpoint
    const layoutsResponse = await httpGet(`${baseUrl}/api/v1/shell/layouts`);
    assertEqual(layoutsResponse.status, 200, 'Layouts endpoint should return 200');
    
    const layoutsData = JSON.parse(layoutsResponse.data);
    assertEqual(Array.isArray(layoutsData), true, 'Layouts should be an array');
    console.log('✅ Layouts endpoint functional');

    // Test available apps endpoint
    const appsResponse = await httpGet(`${baseUrl}/api/v1/shell/available-apps`);
    assertEqual(appsResponse.status, 200, 'Available apps endpoint should return 200');
    
    const appsData = JSON.parse(appsResponse.data);
    assertEqual(Array.isArray(appsData), true, 'Available apps should be an array');
    console.log('✅ Available apps endpoint functional');

    testResults.preferencesApi = true;
}

async function testUIAccessibility() {
    console.log('🌐 Testing frontend UI accessibility...');

    const frontendUrl = `http://localhost:${TEST_CONFIG.FRONTEND_PORT}`;
    
    // Wait a bit for frontend to fully initialize
    await sleep(3000);

    const response = await httpGet(frontendUrl);
    
    // Should return HTML content (200 or redirect)
    assertEqual(response.status < 500, true, 'Frontend should not return server error');
    assertContains(response.data.toLowerCase(), 'html', 'Response should contain HTML');
    console.log('✅ Frontend UI is accessible');

    testResults.uiAccessible = true;
}

async function testPreferencesFunctionality() {
    console.log('💾 Testing preferences save/retrieve functionality...');

    const baseUrl = `http://localhost:${TEST_CONFIG.BACKEND_PORT}`;
    const headers = { 
        'X-User-Id': TEST_CONFIG.TEST_USER_ID,
        'Content-Type': 'application/json'
    };

    // Create test preferences data
    const testPreferences = {
        frames: [
            {
                id: 'test-frame-1',
                name: 'Test Frame',
                order: 0,
                layoutId: 'single-pane',
                assignedApps: [
                    {
                        appId: 'test-app',
                        windowId: 1
                    }
                ]
            }
        ]
    };

    // Save preferences
    const saveResponse = await httpPost(`${baseUrl}/api/v1/shell/preferences`, testPreferences, {
        headers
    });
    assertEqual(saveResponse.status, 200, 'Save preferences should return 200');
    
    const saveData = JSON.parse(saveResponse.data);
    assertProperty(saveData, 'message', 'Save response should have message property');
    console.log('✅ Preferences saved successfully');

    // Retrieve and verify saved preferences
    const updatedConfig = await httpGet(`${baseUrl}/api/v1/shell/configuration`, {
        headers
    });
    assertEqual(updatedConfig.status, 200, 'Updated config should return 200');
    
    const updatedConfigData = JSON.parse(updatedConfig.data);
    assertEqual(updatedConfigData.frames.length, 1, 'Should have 1 frame');
    assertEqual(updatedConfigData.frames[0].name, 'Test Frame', 'Frame name should match');
    console.log('✅ Preferences retrieved and verified');

    testResults.preferencesUI = true;
}

async function testIntegration() {
    console.log('🔄 Testing frontend-backend integration...');

    const backendUrl = `http://localhost:${TEST_CONFIG.BACKEND_PORT}`;
    
    // Test that backend serves expected JSON structure for frontend
    const configStructureResponse = await httpGet(`${backendUrl}/api/v1/shell/configuration`, {
        headers: { 'X-User-Id': TEST_CONFIG.TEST_USER_ID }
    });

    const config = JSON.parse(configStructureResponse.data);
    
    // Verify the structure matches what the frontend expects
    assertProperty(config, 'frames', 'Config should have frames');
    assertProperty(config, 'availableApps', 'Config should have availableApps');
    assertProperty(config, 'serviceEndpoints', 'Config should have serviceEndpoints');
    assertProperty(config, 'layouts', 'Config should have layouts');

    // Verify types are correct
    assertEqual(Array.isArray(config.frames), true, 'Frames should be array');
    assertEqual(Array.isArray(config.availableApps), true, 'AvailableApps should be array');
    assertEqual(Array.isArray(config.layouts), true, 'Layouts should be array');
    assertEqual(typeof config.serviceEndpoints, 'object', 'ServiceEndpoints should be object');

    console.log('✅ Frontend-backend integration verified');
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
    runTests().catch(error => {
        console.error('Test execution failed:', error);
        process.exit(1);
    });
}

module.exports = {
    runTests,
    testResults,
    TEST_CONFIG
};