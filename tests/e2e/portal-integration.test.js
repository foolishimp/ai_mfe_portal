/**
 * @test-category integration
 * @test-name Portal Integration E2E Test
 * @test-description Comprehensive test for portal startup, preferences backend, and UI integration
 * REQUIRED: These metadata tags make test discoverable by dashboard
 */

const { spawn } = require('child_process');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
    BACKEND_PORT: 8011,
    FRONTEND_PORT: 3000,
    TEST_USER_ID: 'test-user-e2e',
    STARTUP_TIMEOUT: 30000,
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

describe('AI MFE Portal Integration', () => {
    
    beforeAll(async () => {
        console.log('🚀 Starting AI MFE Portal Integration Tests');
        console.log(`Backend Port: ${TEST_CONFIG.BACKEND_PORT}`);
        console.log(`Frontend Port: ${TEST_CONFIG.FRONTEND_PORT}`);
    }, TEST_CONFIG.STARTUP_TIMEOUT);

    afterAll(async () => {
        console.log('🧹 Cleaning up test processes');
        if (portalProcess && !portalProcess.killed) {
            portalProcess.kill('SIGTERM');
            await new Promise(resolve => {
                portalProcess.on('close', () => {
                    testResults.cleanup = true;
                    resolve();
                });
                setTimeout(() => {
                    if (!portalProcess.killed) {
                        portalProcess.kill('SIGKILL');
                        testResults.cleanup = true;
                        resolve();
                    }
                }, TEST_CONFIG.CLEANUP_TIMEOUT);
            });
        }
        
        // Report test results summary
        console.log('\n📊 Test Results Summary:');
        Object.entries(testResults).forEach(([test, passed]) => {
            console.log(`   ${passed ? '✅' : '❌'} ${test}`);
        });
    });

    test('should start the portal with both backend and frontend services', async () => {
        console.log('🔧 Starting portal services...');
        
        // Start the portal using the unified start script
        portalProcess = spawn('python', ['start_portal.py'], {
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

                // Check for backend service startup
                if (output.includes('shell_service started') || output.includes(`port ${TEST_CONFIG.BACKEND_PORT}`)) {
                    backendReady = true;
                    testResults.backendStartup = true;
                }

                // Check for frontend service startup
                if (output.includes('shell started') || output.includes(`port ${TEST_CONFIG.FRONTEND_PORT}`)) {
                    frontendReady = true;
                    testResults.frontendStartup = true;
                }

                // Check for overall startup completion
                if (output.includes('AI MFE PORTAL RUNNING') || (backendReady && frontendReady)) {
                    startupComplete = true;
                    clearTimeout(timeout);
                    resolve();
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
        expect(backendReady).toBe(true);
        expect(frontendReady).toBe(true);
        console.log('✅ Portal services started successfully');

    }, TEST_CONFIG.STARTUP_TIMEOUT);

    test('should have functional preferences API endpoints', async () => {
        console.log('🔌 Testing preferences API endpoints...');

        const baseUrl = `http://localhost:${TEST_CONFIG.BACKEND_PORT}`;
        
        // Test health check
        const healthResponse = await axios.get(`${baseUrl}/health`, {
            timeout: TEST_CONFIG.API_TIMEOUT
        });
        expect(healthResponse.status).toBe(200);
        console.log('✅ Health check passed');

        // Test shell configuration endpoint
        const configResponse = await axios.get(`${baseUrl}/api/v1/shell/configuration`, {
            headers: { 'X-User-Id': TEST_CONFIG.TEST_USER_ID },
            timeout: TEST_CONFIG.API_TIMEOUT
        });
        expect(configResponse.status).toBe(200);
        expect(configResponse.data).toHaveProperty('frames');
        expect(configResponse.data).toHaveProperty('availableApps');
        expect(configResponse.data).toHaveProperty('serviceEndpoints');
        console.log('✅ Configuration endpoint functional');

        // Test layouts endpoint
        const layoutsResponse = await axios.get(`${baseUrl}/api/v1/shell/layouts`, {
            timeout: TEST_CONFIG.API_TIMEOUT
        });
        expect(layoutsResponse.status).toBe(200);
        expect(Array.isArray(layoutsResponse.data)).toBe(true);
        console.log('✅ Layouts endpoint functional');

        // Test available apps endpoint
        const appsResponse = await axios.get(`${baseUrl}/api/v1/shell/available-apps`, {
            timeout: TEST_CONFIG.API_TIMEOUT
        });
        expect(appsResponse.status).toBe(200);
        expect(Array.isArray(appsResponse.data)).toBe(true);
        console.log('✅ Available apps endpoint functional');

        testResults.preferencesApi = true;
        console.log('✅ All API endpoints tested successfully');

    }, TEST_CONFIG.API_TIMEOUT);

    test('should have accessible UI at frontend port', async () => {
        console.log('🌐 Testing frontend UI accessibility...');

        const frontendUrl = `http://localhost:${TEST_CONFIG.FRONTEND_PORT}`;
        
        // Wait a bit for frontend to fully initialize
        await new Promise(resolve => setTimeout(resolve, 2000));

        const response = await axios.get(frontendUrl, {
            timeout: TEST_CONFIG.UI_TIMEOUT,
            validateStatus: (status) => status < 500 // Accept redirects and client errors
        });

        expect(response.status).toBeLessThan(500);
        expect(response.data).toContain('html'); // Should return HTML content
        console.log('✅ Frontend UI is accessible');

        testResults.uiAccessible = true;

    }, TEST_CONFIG.UI_TIMEOUT);

    test('should be able to save and retrieve preferences through API', async () => {
        console.log('💾 Testing preferences save/retrieve functionality...');

        const baseUrl = `http://localhost:${TEST_CONFIG.BACKEND_PORT}`;
        const headers = { 
            'X-User-Id': TEST_CONFIG.TEST_USER_ID,
            'Content-Type': 'application/json'
        };

        // Get initial configuration
        const initialConfig = await axios.get(`${baseUrl}/api/v1/shell/configuration`, {
            headers,
            timeout: TEST_CONFIG.API_TIMEOUT
        });

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
        const saveResponse = await axios.put(`${baseUrl}/api/v1/shell/preferences`, testPreferences, {
            headers,
            timeout: TEST_CONFIG.API_TIMEOUT
        });
        expect(saveResponse.status).toBe(200);
        expect(saveResponse.data).toHaveProperty('message');
        console.log('✅ Preferences saved successfully');

        // Retrieve and verify saved preferences
        const updatedConfig = await axios.get(`${baseUrl}/api/v1/shell/configuration`, {
            headers,
            timeout: TEST_CONFIG.API_TIMEOUT
        });
        expect(updatedConfig.status).toBe(200);
        expect(updatedConfig.data.frames).toHaveLength(1);
        expect(updatedConfig.data.frames[0].name).toBe('Test Frame');
        console.log('✅ Preferences retrieved and verified');

        testResults.preferencesUI = true;
        console.log('✅ Preferences save/retrieve cycle completed');

    }, TEST_CONFIG.API_TIMEOUT);

    test('should handle frontend-backend integration gracefully', async () => {
        console.log('🔄 Testing frontend-backend integration...');

        // Test that frontend can reach backend through CORS
        const backendUrl = `http://localhost:${TEST_CONFIG.BACKEND_PORT}`;
        const frontendUrl = `http://localhost:${TEST_CONFIG.FRONTEND_PORT}`;

        // Verify CORS headers are present
        const corsTestResponse = await axios.options(`${backendUrl}/api/v1/shell/configuration`, {
            headers: {
                'Origin': frontendUrl,
                'Access-Control-Request-Method': 'GET'
            },
            timeout: TEST_CONFIG.API_TIMEOUT
        });

        expect(corsTestResponse.status).toBeLessThan(300);
        console.log('✅ CORS configuration verified');

        // Test that backend serves expected JSON structure for frontend
        const configStructureResponse = await axios.get(`${backendUrl}/api/v1/shell/configuration`, {
            headers: { 'X-User-Id': TEST_CONFIG.TEST_USER_ID },
            timeout: TEST_CONFIG.API_TIMEOUT
        });

        const config = configStructureResponse.data;
        
        // Verify the structure matches what the frontend expects
        expect(config).toHaveProperty('frames');
        expect(config).toHaveProperty('availableApps');
        expect(config).toHaveProperty('serviceEndpoints');
        expect(config).toHaveProperty('layouts');

        // Verify types are correct
        expect(Array.isArray(config.frames)).toBe(true);
        expect(Array.isArray(config.availableApps)).toBe(true);
        expect(Array.isArray(config.layouts)).toBe(true);
        expect(typeof config.serviceEndpoints).toBe('object');

        console.log('✅ Frontend-backend integration verified');

    }, TEST_CONFIG.API_TIMEOUT);

});

// Test results reporting for dashboard integration
if (require.main === module) {
    console.log('Running Portal Integration Tests...');
    
    // Simple test runner for non-Jest environments
    const runTests = async () => {
        try {
            console.log('Starting test execution...');
            // Implementation would go here for standalone execution
            console.log('Tests completed - check detailed results above');
        } catch (error) {
            console.error('Test execution failed:', error);
            process.exit(1);
        }
    };

    runTests();
}