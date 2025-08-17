/**
 * Jest setup file for AI MFE Portal tests
 * Configures global test environment and utilities
 */

// Extend Jest matchers if needed
// require('@testing-library/jest-dom/extend-expect');

// Global test configuration
global.console = {
    ...console,
    // Suppress specific console methods during tests if needed
    debug: jest.fn(),
    // Keep important logging
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info
};

// Global test timeout
jest.setTimeout(60000); // 60 seconds for E2E tests

// Mock process.env defaults for tests
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.APP_ENV = process.env.APP_ENV || 'development';

// Global test utilities
global.testUtils = {
    // Sleep utility for async tests
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    
    // Wait for condition utility
    waitFor: async (condition, options = {}) => {
        const { timeout = 10000, interval = 100 } = options;
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            if (await condition()) {
                return true;
            }
            await global.testUtils.sleep(interval);
        }
        
        throw new Error(`Condition not met within ${timeout}ms`);
    },
    
    // Common test ports
    ports: {
        backend: 8011,
        frontend: 3000,
        testApp: 3002
    }
};

// Setup and teardown helpers
beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
});

console.log('🧪 Jest setup completed for AI MFE Portal tests');