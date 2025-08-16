# Unified Microfrontend Development Guide for AI MFE Portal

## Overview

This comprehensive guide provides complete instructions for creating compliant microfrontend (MFE) applications that integrate seamlessly with the AI MFE Portal. The architecture uses runtime ES module loading with standardized initialization patterns and clear communication mechanisms.

## Core Principles

- **Independent Initialization**: Each MFE is responsible for its own configuration and initialization
- **Runtime Isolation**: MFEs should function independently with minimal runtime dependencies
- **Clear Communication Patterns**: Use standardized methods for cross-MFE communication
- **Self-contained Builds**: Bundle shared code into consumers rather than relying on runtime resolution
- **Generic Framework**: Portal is application-agnostic and extensible

## Architecture Overview

### Key Components

1. **Shell Application** (`packages/shell/`) - The host container that orchestrates all MFEs and exposes minimal global resources
2. **Microfrontends (MFEs)** - Independent applications following a consistent initialization pattern
3. **Preferences Service** (`shell_service/`) - Central configuration source accessed directly by all MFEs
4. **Event Bus** - Global communication mechanism accessible by all applications
5. **Shared Package** (`packages/shared/`) - Common utilities, types, and services
6. **Layout Engine** - Configurable workspace layouts and frame management

### Shell Responsibilities

- Render the main UI frame and provide navigation controls
- Inject preferences service URL as a global: `window.__PORTAL_PREFS_SERVICE_URL__ = 'http://localhost:8011'`
- Mount MFEs and trigger their bootstrap process: `mfe.bootstrapConfig?.(appId)`
- Provide navigation callbacks as props to MFEs
- Initialize and expose the singleton event bus instance: `window.__PORTAL_EVENT_BUS__`
- Manage user preferences and workspace layouts

### Runtime Loading

MFEs are loaded dynamically at runtime using ES module imports:
```javascript
const module = await import(/* @vite-ignore */ appDef.url);
```

## Creating a Compliant MFE

### 1. Project Structure

```
packages/
└── your-mfe/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.tsx         # Entry point with mount/unmount exports
        ├── YourApp.tsx      # Main component
        ├── components/      # UI components
        ├── contexts/        # React contexts
        ├── hooks/          # Custom hooks
        └── utils/          # Utility functions
```

### 2. Required Implementation Pattern

Your MFE must implement this standardized bootstrap and mount pattern in `src/main.tsx`:

```typescript
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { apiService, configureApiService, checkApiServiceReady } from 'shared';
import YourApp from './YourApp';

// TypeScript interfaces
interface MountProps {
  domElement: HTMLElement;
  appId?: string;
  windowId?: number;
  customProps?: {
    onNavigateTo?: (id: string) => void;
    onNavigateBack?: () => void;
    [key: string]: any;
  };
}

// Export the bootstrap function for shell to call
export async function bootstrapConfig(mfeId: string) {
  console.log(`[${mfeId}] Bootstrap called`);
  
  // Get preferences service URL from window global
  const prefsServiceUrl = window.__PORTAL_PREFS_SERVICE_URL__;
  if (!prefsServiceUrl) {
    console.error(`[${mfeId}] Preferences service URL not found`);
    return { success: false, error: "Preferences service URL not found" };
  }
  
  try {
    const response = await fetch(`${prefsServiceUrl}/api/v1/shell/configuration`);
    const config = await response.json();
    
    // Configure this MFE's services with backend endpoint
    if (config.serviceEndpoints?.backendServiceUrl) {
      configureApiService(config.serviceEndpoints.backendServiceUrl);
    }
    
    console.log(`[${mfeId}] Successfully bootstrapped with config`);
    return { success: true, config };
  } catch (error) {
    console.error(`[${mfeId}] Bootstrap failed:`, error);
    return { success: false, error };
  }
}

// Alternative name for compatibility
export async function bootstrapMfe(mfeId: string) {
  return bootstrapConfig(mfeId);
}

// Standard mount function with required providers
export function mount(props: MountProps) {
  const { domElement, appId = 'unknown-mfe', customProps = {} } = props;
  
  // Bootstrap if not already done (can be called again by shell)
  bootstrapConfig(appId)
    .catch(err => console.error(`[${appId}] Bootstrap error during mount:`, err));
  
  const root = createRoot(domElement);
  
  // Render with all required providers
  root.render(
    <React.StrictMode>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={createTheme()}>
          <CssBaseline />
          <YourApp {...customProps} />
        </ThemeProvider>
      </StyledEngineProvider>
    </React.StrictMode>
  );
  
  // Return unmount function
  return {
    unmount: () => {
      console.log(`[${appId}] Unmounting`);
      root.unmount();
    }
  };
}

export default YourApp;
```

### 3. Package Configuration

#### package.json
```json
{
  "name": "@portal/your-mfe",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 3006",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@mui/material": "^5.14.0",
    "shared": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

#### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'esm',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'shared': path.resolve(__dirname, '../shared/src')
    }
  },
  server: {
    cors: true,
    fs: {
      allow: ['..']
    }
  }
});
```

## Communication Patterns

### 1. Direct Props
For parent-child communication (Shell to MFE):
```typescript
interface YourAppProps {
  onNavigateTo?: (id: string) => void;
  onNavigateBack?: () => void;
  // Add your custom props
  [key: string]: any;
}

function YourApp({ onNavigateTo, onNavigateBack, ...customProps }: YourAppProps) {
  const handleItemClick = (id: string) => {
    if (onNavigateTo) {
      onNavigateTo(id);
    } else {
      // Fallback to event bus
      eventBus.publish(EventTypes.NAVIGATION_REQUEST, {
        source: 'your-mfe',
        payload: { action: 'navigateTo', target: id }
      });
    }
  };
  
  return (
    <div>
      <Button onClick={onNavigateBack}>Back</Button>
      <Button onClick={() => handleItemClick('item-1')}>Go to Item 1</Button>
    </div>
  );
}
```

### 2. Event Bus
For cross-MFE communication using standard event types:
```typescript
import { eventBus, EventTypes } from 'shared';

// Subscribe to events
const unsubscribe = eventBus.subscribe(EventTypes.SHELL_CONFIG_READY, (data) => {
  console.log('Shell configuration is ready:', data);
  // React to shell readiness
});

// Publish events
eventBus.publish(EventTypes.NAVIGATION_REQUEST, {
  source: 'your-mfe',
  payload: { action: 'navigateTo', target: 'some-id' }
});

eventBus.publish(EventTypes.USER_ACTION, {
  source: 'your-mfe',
  payload: { action: 'click', target: 'button', data: { id: 'btn-1' } }
});

// Clean up subscriptions on unmount
useEffect(() => {
  return unsubscribe;
}, []);
```

### 3. URL Parameters and Deep Linking
For initial state configuration:
```typescript
function YourApp() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialId = urlParams.get('id');
    const mode = urlParams.get('mode');
    
    if (initialId) {
      // Set initial state from URL
      setSelectedItem(initialId);
    }
  }, []);
}
```

### 4. Preferences Service API
For configuration and preference management - always use the centralized preferences service.

## API Service Integration

Always check API service readiness before operations:

```typescript
import { apiService, checkApiServiceReady } from 'shared';

function YourComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // IMPORTANT: Always check if API is ready
      if (!checkApiServiceReady()) {
        console.error('[YourMFE] API service not ready');
        setError('Backend service not available');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Example: get configurations if your app needs them
        const configs = await apiService.getConfigs('your-config-type');
        setData(configs);
      } catch (error) {
        console.error('[YourMFE] Failed to load data:', error);
        setError(error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }
  
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return <YourContent data={data} />;
}
```

## Layout Integration

Your MFE will be rendered within configurable layouts. Handle different layout constraints:

```typescript
function YourApp({ windowId, ...props }) {
  // Adapt your UI based on the layout window
  const isSmallWindow = windowId && windowId > 2; // Sidebar or secondary windows
  
  return (
    <Box sx={{ 
      padding: isSmallWindow ? 1 : 2,
      minHeight: '100%',
      overflow: 'auto'
    }}>
      <YourContent compact={isSmallWindow} />
    </Box>
  );
}
```

## Environment Configuration

### 1. Register Your MFE

Add your MFE to `environments.json`:

```json
{
  "development": {
    "your-mfe": { 
      "url": "http://localhost:3006/src/main.tsx" 
    }
  },
  "production": {
    "your-mfe": { 
      "url": "https://cdn.example.com/your-mfe/latest/assets/your-mfe.js" 
    }
  }
}
```

### 2. Preferences Service Registration

Add your MFE to `shell_service/data/defaults.json`:

```json
{
  "available_apps": [
    {
      "id": "your-mfe",
      "name": "Your Microfrontend",
      "scope": "yourMfe",
      "module": "./YourApp",
      "url": "http://localhost:3006/src/main.tsx"
    }
  ]
}
```

## Common Failures and Solutions

### API Service Configuration Issues

**Problem**: MFEs attempt API operations before being properly configured with endpoints
- **Symptoms**: API calls fail with "API service not ready" errors
- **Solution**: Always check `checkApiServiceReady()` before operations, show loading states appropriately

### Multiple Service Instances

**Problem**: Each MFE using its own instance of shared services loses configuration state
- **Symptoms**: One MFE configures a service but another finds it unconfigured
- **Solution**: Use self-initialization pattern with global window variables

### React Context Boundary Issues

**Problem**: MUI components fail because they can't access ThemeProvider context
- **Symptoms**: "Invalid hook call" errors when crossing MFE boundaries
- **Solution**: Always include required providers when mounting MFEs

### Race Conditions During Initialization

**Problem**: Operations attempted during partial initialization state
- **Symptoms**: Inconsistent behavior, timing-dependent failures
- **Solution**: Implement proper loading states and initialization completion checks

### Layout Adaptation Issues

**Problem**: MFE doesn't adapt to different layout constraints
- **Symptoms**: UI overflow, poor responsive behavior in different layouts
- **Solution**: Use layout-aware styling and responsive design patterns

## Best Practices

### State Management

- Use React Context for local state within your MFE
- Use the event bus for cross-MFE communication
- Keep state isolated to prevent conflicts
- Handle cases where configuration isn't immediately available
- Manage internal state independently of other MFEs

### Styling

- Use Material-UI components for consistency with the portal
- Apply `StyledEngineProvider` with `injectFirst` prop
- Avoid global CSS that might affect other MFEs
- Include `CssBaseline` for consistent baseline styles
- Design responsively for different layout windows

### Error Handling

- Implement error boundaries within your MFE
- Handle bootstrap failures gracefully
- Provide meaningful error messages to users
- Always check service readiness before operations
- Fail gracefully when backend services are unavailable

### Performance

- Lazy load heavy dependencies
- Implement code splitting where appropriate
- Clean up resources in unmount function
- Use memoization for expensive computations
- Optimize for different layout sizes

### Testing

- Test mount/unmount lifecycle
- Test event bus interactions
- Test API integration with mocked services
- Test bootstrap configuration flow
- Test responsive behavior in different layouts

## Common Implementation Patterns

### Loading States with Error Handling

```typescript
function YourApp() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const checkConfiguration = () => {
      if (checkApiServiceReady()) {
        setIsConfigured(true);
        loadData();
      } else {
        // Retry configuration check
        setTimeout(checkConfiguration, 1000);
      }
    };

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await apiService.getData();
        setData(result);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    checkConfiguration();
  }, []);

  if (!isConfigured) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress size={20} />
        <Typography ml={1}>Initializing...</Typography>
      </Box>
    );
  }

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  
  return <YourContent data={data} />;
}
```

### Context Provider Pattern with Configuration

```typescript
export const YourContext = React.createContext<YourContextType | null>(null);

export function YourProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<YourState>({});
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Wait for configuration to be ready
    const checkConfig = () => {
      if (checkApiServiceReady()) {
        setIsConfigured(true);
      }
    };
    
    checkConfig();
    const interval = setInterval(checkConfig, 1000);
    return () => clearInterval(interval);
  }, []);

  const value = useMemo(() => ({
    state,
    isConfigured,
    actions: {
      updateState: (newState: Partial<YourState>) => {
        setState(prev => ({ ...prev, ...newState }));
      }
    }
  }), [state, isConfigured]);

  return (
    <YourContext.Provider value={value}>
      {children}
    </YourContext.Provider>
  );
}
```

### Event Bus Integration Pattern

```typescript
function YourApp() {
  useEffect(() => {
    // Subscribe to relevant events
    const unsubscribers = [
      eventBus.subscribe(EventTypes.SHELL_CONFIG_READY, () => {
        console.log('[YourMFE] Shell configuration ready');
        // Refresh or initialize components
      }),
      
      eventBus.subscribe(EventTypes.USER_ACTION, (data) => {
        if (data.source !== 'your-mfe') {
          console.log('[YourMFE] External user action:', data);
          // React to actions from other MFEs
        }
      }),
      
      eventBus.subscribe(EventTypes.NAVIGATION_REQUEST, (data) => {
        console.log('[YourMFE] Navigation request:', data);
        // Handle navigation requests
      })
    ];

    // Cleanup all subscriptions
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, []);
  
  const handleUserAction = (action: string, data: any) => {
    // Publish user actions for other MFEs
    eventBus.publish(EventTypes.USER_ACTION, {
      source: 'your-mfe',
      payload: { action, data }
    });
  };

  return <YourContent onAction={handleUserAction} />;
}
```

## Debugging

### Console Logging

Use consistent prefixes for console logs:

```typescript
const MFE_NAME = '[YourMFE]';

console.log(`${MFE_NAME} Action performed:`, data);
console.error(`${MFE_NAME} Error occurred:`, error);
console.warn(`${MFE_NAME} API not ready, retrying...`);
console.debug(`${MFE_NAME} Configuration loaded:`, config);
```

### Development Tools

- Use React DevTools to inspect component hierarchy
- Use Network tab to monitor API calls
- Check browser console for event bus messages
- Monitor window globals: `window.__PORTAL_PREFS_SERVICE_URL__`, `window.__PORTAL_EVENT_BUS__`
- Use the test dashboard to monitor test execution

### Debug Checklist

- [ ] Is the preferences service URL available in window global?
- [ ] Is the bootstrap function being called and succeeding?
- [ ] Is the API service configured before use?
- [ ] Are all React providers included in mount?
- [ ] Are event subscriptions cleaned up on unmount?
- [ ] Is the MFE registered in environments.json?
- [ ] Is the MFE registered in shell_service/data/defaults.json?

## Deployment

### Build Process

1. Build your MFE: `npm run build`
2. Deploy built files to CDN or static hosting
3. Update `environments.json` with production URL
4. Test integration with shell in staging environment

### Version Management

- Use semantic versioning for your MFE
- Coordinate updates with shell application
- Maintain backward compatibility when possible
- Document breaking changes in release notes

## Troubleshooting

### Common Issues and Solutions

1. **MFE not loading**
   - Check environment configuration URL is correct
   - Verify CORS settings allow cross-origin loading
   - Check browser console for module loading errors
   - Ensure MFE is registered in both environments.json and defaults.json

2. **Context errors**
   - Ensure all required providers are included in mount function
   - Check that `StyledEngineProvider` has `injectFirst` prop
   - Verify Material-UI theme is properly configured

3. **API calls failing**
   - Verify API service is configured by checking `checkApiServiceReady()`
   - Check preferences service URL is available: `window.__PORTAL_PREFS_SERVICE_URL__`
   - Verify endpoint configuration in bootstrap response

4. **Events not received**
   - Check event subscription is created before events are published
   - Verify event cleanup in unmount function
   - Check event bus is available: `window.__PORTAL_EVENT_BUS__`

5. **Bootstrap failures**
   - Check preferences service is running and accessible
   - Verify configuration endpoint returns expected structure
   - Check network tab for failed requests

6. **Layout issues**
   - Ensure your MFE adapts to different window sizes
   - Check if layout constraints are being respected
   - Verify responsive design works in different layouts

## Example MFEs

See the existing MFE for reference implementation:
- `/packages/test-app` - Simple example microfrontend demonstrating all patterns

## Testing Your MFE

### Unit Testing
```bash
# Test your MFE components
npm test

# Test with coverage
npm run test:coverage
```

### Integration Testing
```bash
# Start the portal
npm run dev

# Start your MFE
cd packages/your-mfe
npm run dev

# Test integration in browser
```

### Using the Test Dashboard
```bash
# Start test dashboard from project root
PROJECT_DIRS="." node test-dashboard-module/server.js

# Open http://localhost:8085
# Configure test patterns for your MFE
# Monitor test execution in real-time
```

## Support

For questions or issues:
- Check the main project documentation in README.md
- Review existing examples in `/packages/test-app/`
- Create an issue on the GitHub repository
- Check the AI development tools in `claude_tasks/`