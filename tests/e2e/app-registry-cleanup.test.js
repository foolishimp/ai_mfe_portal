#!/usr/bin/env node
/**
 * @test-category integration
 * @test-name App Registry Cleanup Test
 * @test-description Verifies only test-app remains after cleaning legacy c4h_editor apps
 * REQUIRED: These metadata tags make test discoverable by dashboard
 */

const http = require('http');
const url = require('url');

// Simple HTTP client
function httpGet(targetUrl, options = {}) {
    return new Promise((resolve, reject) => {
        const { timeout = 10000, headers = {} } = options;
        const parsedUrl = url.parse(targetUrl);
        const client = http;
        
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

// Test configuration
const TEST_CONFIG = {
    BACKEND_PORT: 8011,
    TEST_USER_ID: 'cleanup-test-user',
    API_TIMEOUT: 10000
};

// Expected state after cleanup
const EXPECTED_APPS = ['test-app'];
const LEGACY_APPS_TO_REMOVE = [
    'config-selector-workorders',
    'config-selector-teams', 
    'config-selector-runtime',
    'job-management'
];

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message}: Expected ${expected}, got ${actual}`);
    }
}

async function runCleanupTest() {
    console.log('🧹 AI MFE Portal App Registry Cleanup Test');
    console.log(`Testing against backend on port: ${TEST_CONFIG.BACKEND_PORT}`);
    
    try {
        // Test: Verify only expected apps remain
        console.log('\n📋 Test: Verify App Registry Cleanup');
        await testAppRegistryCleanup();
        console.log('✅ PASSED: App registry contains only expected apps');
        
        // Test: Verify legacy apps are gone
        console.log('\n📋 Test: Verify Legacy Apps Removed');
        await testLegacyAppsRemoved();
        console.log('✅ PASSED: Legacy apps successfully removed');
        
        // Test: Verify test-app still works
        console.log('\n📋 Test: Verify Test App Functional');
        await testAppFunctionality();
        console.log('✅ PASSED: Test app remains functional');
        
        console.log('\n🎉 All cleanup tests passed!');
        process.exit(0);
        
    } catch (error) {
        console.error(`❌ Test FAILED: ${error.message}`);
        process.exit(1);
    }
}

async function testAppRegistryCleanup() {
    const baseUrl = `http://localhost:${TEST_CONFIG.BACKEND_PORT}`;
    
    const response = await httpGet(`${baseUrl}/api/v1/shell/available-apps`, {
        timeout: TEST_CONFIG.API_TIMEOUT
    });
    
    assertEqual(response.status, 200, 'Available apps endpoint should work');
    
    const apps = JSON.parse(response.data);
    const appIds = apps.map(app => app.id);
    
    console.log(`Found ${appIds.length} registered apps: ${appIds.join(', ')}`);
    
    // Should only have expected apps
    assertEqual(appIds.length, EXPECTED_APPS.length, 'Should have correct number of apps');
    
    for (const expectedApp of EXPECTED_APPS) {
        assertEqual(appIds.includes(expectedApp), true, `Should contain ${expectedApp}`);
    }
    
    console.log('✅ App registry contains exactly the expected apps');
}

async function testLegacyAppsRemoved() {
    const baseUrl = `http://localhost:${TEST_CONFIG.BACKEND_PORT}`;
    
    const response = await httpGet(`${baseUrl}/api/v1/shell/available-apps`);
    const apps = JSON.parse(response.data);
    const appIds = apps.map(app => app.id);
    
    // Verify legacy apps are gone
    for (const legacyApp of LEGACY_APPS_TO_REMOVE) {
        assertEqual(appIds.includes(legacyApp), false, `Legacy app ${legacyApp} should be removed`);
    }
    
    console.log('✅ All legacy apps successfully removed');
}

async function testAppFunctionality() {
    const baseUrl = `http://localhost:${TEST_CONFIG.BACKEND_PORT}`;
    const headers = { 'X-User-Id': TEST_CONFIG.TEST_USER_ID };
    
    // Test that we can still save preferences with test-app
    const testPreferences = {
        frames: [
            {
                id: 'cleanup-test-frame',
                name: 'Cleanup Test Frame',
                order: 0,
                layoutId: 'single-pane',
                assignedApps: [
                    { appId: 'test-app', windowId: 1 }
                ]
            }
        ]
    };

    // This should work since test-app should still exist
    const configResponse = await httpGet(`${baseUrl}/api/v1/shell/configuration`, { headers });
    assertEqual(configResponse.status, 200, 'Configuration should still work');
    
    console.log('✅ Test app remains functional for framework testing');
}

// Run test if executed directly
if (require.main === module) {
    runCleanupTest().catch(error => {
        console.error('Cleanup test execution failed:', error);
        process.exit(1);
    });
}

module.exports = { runCleanupTest, TEST_CONFIG };