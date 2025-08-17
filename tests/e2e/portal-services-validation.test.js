#!/usr/bin/env node
/**
 * @test-category integration
 * @test-name Portal Services Validation Test
 * @test-description Tests that portal services are running and preferences UI is accessible
 * REQUIRED: These metadata tags make test discoverable by dashboard
 */

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
    TEST_USER_ID: 'test-user-validation',
    API_TIMEOUT: 10000,
    UI_TIMEOUT: 15000
};

// Test state
let testResults = {
    backendHealth: false,
    preferencesApi: false,
    configurationApi: false,
    layoutsApi: false,
    availableAppsApi: false,
    uiAccessible: false,
    preferencesFlow: false
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

async function runValidationTests() {
    console.log('🔍 AI MFE Portal Services Validation Tests');
    console.log(`Backend Port: ${TEST_CONFIG.BACKEND_PORT}`);
    console.log(`Frontend Port: ${TEST_CONFIG.FRONTEND_PORT}`);
    
    let testsPassed = 0;
    let testsFailed = 0;
    
    try {
        // Test 1: Backend Health
        console.log('\n📋 Test 1: Backend Health Check');
        await testBackendHealth();
        console.log('✅ Test 1 PASSED: Backend is healthy');
        testsPassed++;
        
        // Test 2: Preferences API Endpoints
        console.log('\n📋 Test 2: Preferences API Endpoints');
        await testPreferencesEndpoints();
        console.log('✅ Test 2 PASSED: All API endpoints functional');
        testsPassed++;
        
        // Test 3: UI Accessibility
        console.log('\n📋 Test 3: Frontend UI Accessibility');
        await testUIAccessibility();
        console.log('✅ Test 3 PASSED: UI is accessible');
        testsPassed++;
        
        // Test 4: Preferences Flow
        console.log('\n📋 Test 4: Complete Preferences Flow');
        await testPreferencesFlow();
        console.log('✅ Test 4 PASSED: Preferences save/retrieve cycle works');
        testsPassed++;
        
    } catch (error) {
        console.error(`❌ Test FAILED: ${error.message}`);
        testsFailed++;
    }
    
    // Report results
    console.log('\n📊 Validation Test Results:');
    console.log(`   Tests Passed: ${testsPassed}`);
    console.log(`   Tests Failed: ${testsFailed}`);
    console.log(`   Total Tests: ${testsPassed + testsFailed}`);
    
    Object.entries(testResults).forEach(([test, passed]) => {
        console.log(`   ${passed ? '✅' : '❌'} ${test}`);
    });
    
    if (testsFailed > 0) {
        console.log('\n❌ Some tests failed - portal may have issues');
        process.exit(1);
    } else {
        console.log('\n🎉 All validation tests passed! Portal is working correctly.');
        process.exit(0);
    }
}

async function testBackendHealth() {
    console.log('🔧 Testing backend health endpoint...');
    
    const baseUrl = `http://localhost:${TEST_CONFIG.BACKEND_PORT}`;
    
    try {
        const healthResponse = await httpGet(`${baseUrl}/health`);
        assertEqual(healthResponse.status, 200, 'Health check should return 200');
        console.log('✅ Health endpoint accessible');
        testResults.backendHealth = true;
    } catch (error) {
        throw new Error(`Backend health check failed: ${error.message}`);
    }
}

async function testPreferencesEndpoints() {
    console.log('🔌 Testing all preferences API endpoints...');

    const baseUrl = `http://localhost:${TEST_CONFIG.BACKEND_PORT}`;
    const headers = { 'X-User-Id': TEST_CONFIG.TEST_USER_ID };
    
    // Test shell configuration endpoint
    const configResponse = await httpGet(`${baseUrl}/api/v1/shell/configuration`, { headers });
    assertEqual(configResponse.status, 200, 'Configuration endpoint should return 200');
    
    const configData = JSON.parse(configResponse.data);
    assertProperty(configData, 'frames', 'Config should have frames property');
    assertProperty(configData, 'availableApps', 'Config should have availableApps property');
    assertProperty(configData, 'serviceEndpoints', 'Config should have serviceEndpoints property');
    // Note: layouts property may not be included in config response - that's OK if layouts endpoint works
    console.log('✅ Configuration endpoint functional');
    testResults.configurationApi = true;

    // Test layouts endpoint
    const layoutsResponse = await httpGet(`${baseUrl}/api/v1/shell/layouts`);
    assertEqual(layoutsResponse.status, 200, 'Layouts endpoint should return 200');
    
    const layoutsData = JSON.parse(layoutsResponse.data);
    assertEqual(Array.isArray(layoutsData), true, 'Layouts should be an array');
    console.log('✅ Layouts endpoint functional');
    testResults.layoutsApi = true;

    // Test available apps endpoint
    const appsResponse = await httpGet(`${baseUrl}/api/v1/shell/available-apps`);
    assertEqual(appsResponse.status, 200, 'Available apps endpoint should return 200');
    
    const appsData = JSON.parse(appsResponse.data);
    assertEqual(Array.isArray(appsData), true, 'Available apps should be an array');
    console.log('✅ Available apps endpoint functional');
    testResults.availableAppsApi = true;

    testResults.preferencesApi = true;
}

async function testUIAccessibility() {
    console.log('🌐 Testing frontend UI accessibility...');

    const frontendUrl = `http://localhost:${TEST_CONFIG.FRONTEND_PORT}`;
    
    try {
        const response = await httpGet(frontendUrl, { timeout: TEST_CONFIG.UI_TIMEOUT });
        
        // Should return HTML content (200 or redirect)
        assertEqual(response.status < 500, true, 'Frontend should not return server error');
        
        const htmlContent = response.data.toLowerCase();
        const hasHtml = htmlContent.includes('html') || htmlContent.includes('<!doctype');
        assertEqual(hasHtml, true, 'Response should contain HTML content');
        
        console.log('✅ Frontend UI is accessible and serving content');
        testResults.uiAccessible = true;
    } catch (error) {
        throw new Error(`Frontend UI accessibility test failed: ${error.message}`);
    }
}

async function testPreferencesFlow() {
    console.log('💾 Testing complete preferences save/retrieve flow...');

    const baseUrl = `http://localhost:${TEST_CONFIG.BACKEND_PORT}`;
    const headers = { 
        'X-User-Id': TEST_CONFIG.TEST_USER_ID,
        'Content-Type': 'application/json'
    };

    // Get initial configuration for reference
    const initialConfig = await httpGet(`${baseUrl}/api/v1/shell/configuration`, { headers });
    assertEqual(initialConfig.status, 200, 'Initial config fetch should succeed');

    // Create test preferences data
    const testPreferences = {
        frames: [
            {
                id: 'validation-test-frame-1',
                name: 'Validation Test Frame',
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
    const saveResponse = await httpPut(`${baseUrl}/api/v1/shell/preferences`, testPreferences, { headers });
    assertEqual(saveResponse.status, 200, 'Save preferences should return 200');
    
    const saveData = JSON.parse(saveResponse.data);
    assertProperty(saveData, 'message', 'Save response should have message property');
    console.log('✅ Preferences saved successfully');

    // Retrieve and verify saved preferences
    const updatedConfig = await httpGet(`${baseUrl}/api/v1/shell/configuration`, { headers });
    assertEqual(updatedConfig.status, 200, 'Updated config should return 200');
    
    const updatedConfigData = JSON.parse(updatedConfig.data);
    assertEqual(updatedConfigData.frames.length >= 1, true, 'Should have at least 1 frame');
    
    // Find our test frame
    const testFrame = updatedConfigData.frames.find(frame => frame.id === 'validation-test-frame-1');
    assertEqual(testFrame !== undefined, true, 'Test frame should exist');
    assertEqual(testFrame.name, 'Validation Test Frame', 'Frame name should match');
    
    console.log('✅ Preferences retrieved and verified');
    console.log('✅ Complete preferences flow working correctly');

    testResults.preferencesFlow = true;
}

// Run tests if this file is executed directly
if (require.main === module) {
    runValidationTests().catch(error => {
        console.error('Validation test execution failed:', error);
        process.exit(1);
    });
}

module.exports = {
    runValidationTests,
    testResults,
    TEST_CONFIG
};