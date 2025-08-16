# AI MFE Portal

A generic, extensible microfrontend portal framework with configurable layouts and user preferences.

## Overview

AI MFE Portal provides a complete framework for building microfrontend applications with:

- **Dynamic MFE Loading** - Runtime ES module imports without webpack federation
- **Layout Templates** - Pre-built responsive layouts for different use cases  
- **User Preferences** - Persistent workspace configuration and frame management
- **Cross-MFE Communication** - Event bus for decoupled messaging between microfrontends
- **API Service Integration** - Centralized backend communication layer
- **TypeScript Support** - Full type safety across all microfrontends

## Architecture

### Core Components

1. **Shell Application** (`packages/shell/`) - Host container that orchestrates all MFEs
2. **Shared Package** (`packages/shared/`) - Common utilities, types, and services
3. **Preferences Service** (`shell_service/`) - Backend for layout and user preference management
4. **Test Application** (`packages/test-app/`) - Example MFE implementation

### Key Features

- **Runtime MFE Loading**: Uses dynamic ES module imports for loading microfrontends at runtime
- **Layout Engine**: Configurable layouts (single-pane, two-column, three-column, etc.)
- **Frame Management**: User-defined workspace tabs with persistent configuration  
- **Event Bus**: Cross-MFE communication without tight coupling
- **Preferences Persistence**: SQLite backend for storing user workspace preferences

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.8+ (for preferences service)
- npm or pnpm

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/foolishimp/ai_mfe_portal.git
   cd ai_mfe_portal
   npm run install:all
   ```

2. **Start the preferences service:**
   ```bash
   npm run start:prefs
   # or manually:
   cd shell_service
   pip install -r requirements-lock.txt
   python main.py
   ```

3. **Start the portal:**
   ```bash
   npm run dev
   ```

4. **Access the portal:**
   - Portal: http://localhost:3000
   - Preferences API: http://localhost:8011
   - Test App: http://localhost:3002

## Development

### Project Structure

```
ai_mfe_portal/
├── packages/
│   ├── shell/              # Main portal container
│   ├── shared/             # Shared utilities and types
│   └── test-app/           # Example microfrontend
├── shell_service/          # Preferences backend service
│   ├── api/               # FastAPI routes
│   ├── database/          # SQLite database layer
│   ├── data/              # Default configurations and layouts
│   └── models/            # Pydantic models
└── environments.json       # MFE discovery configuration
```

### Creating a New MFE

1. **Create MFE package:**
   ```bash
   mkdir packages/my-mfe
   cd packages/my-mfe
   npm init -y
   ```

2. **Install dependencies:**
   ```bash
   npm install react react-dom @mui/material shared@workspace:*
   npm install -D @types/react @types/react-dom @vitejs/plugin-react typescript vite
   ```

3. **Create main entry point** (`src/main.tsx`):
   ```typescript
   import React from 'react';
   import { createRoot } from 'react-dom/client';
   import { bootstrapMfe } from 'shared';
   import MyApp from './MyApp';

   interface MountProps {
     domElement: HTMLElement;
     appId?: string;
     customProps?: Record<string, any>;
   }

   export async function bootstrapMfe(mfeId: string) {
     // Initialize your MFE
     return { success: true };
   }

   export function mount(props: MountProps) {
     const { domElement, appId = '', customProps = {} } = props;
     
     const root = createRoot(domElement);
     root.render(<MyApp {...customProps} />);
     
     return {
       unmount: () => root.unmount()
     };
   }
   ```

4. **Register in environments.json:**
   ```json
   {
     "development": {
       "my-mfe": { 
         "url": "http://localhost:3003/src/main.tsx" 
       }
     }
   }
   ```

5. **Add to shell_service/data/defaults.json:**
   ```json
   {
     "available_apps": [
       {
         "id": "my-mfe",
         "name": "My Microfrontend",
         "scope": "myMfe",
         "module": "./MyApp",
         "url": "http://localhost:3003/src/main.tsx"
       }
     ]
   }
   ```

### Layout System

The portal includes several pre-built layouts in `shell_service/data/layouts/`:

- **single-pane**: Single application view
- **two-column**: Side-by-side layout
- **three-column**: Three-column layout
- **header-two-column-grid**: Header with grid below
- **main-with-right-sidebar**: Main content with right sidebar

Create custom layouts by adding JSON files to the layouts directory.

### Event Bus Communication

Use the shared event bus for cross-MFE communication:

```typescript
import { eventBus, EventTypes } from 'shared';

// Subscribe to events
const unsubscribe = eventBus.subscribe(EventTypes.NAVIGATION_REQUEST, (data) => {
  console.log('Navigation requested:', data);
});

// Publish events
eventBus.publish(EventTypes.USER_ACTION, {
  source: 'my-mfe',
  payload: { action: 'click', target: 'button' }
});

// Clean up
unsubscribe();
```

## Configuration

### Environment Configuration

Configure MFE URLs and service endpoints in `environments.json`:

```json
{
  "development": {
    "my-mfe": { "url": "http://localhost:3003/src/main.tsx" },
    "main_backend": { "url": "http://localhost:8000" }
  },
  "production": {
    "my-mfe": { "url": "https://cdn.example.com/my-mfe/assets/main.js" },
    "main_backend": { "url": "https://api.example.com" }
  }
}
```

### Preferences Service Configuration

The preferences service uses SQLite by default and loads configuration from:
- `shell_service/data/defaults.json` - Default apps and endpoints
- `shell_service/data/layouts/` - Layout templates

## API Reference

### Preferences Service Endpoints

- `GET /api/v1/shell/configuration` - Get shell configuration for user
- `PUT /api/v1/shell/preferences` - Save user preferences
- `GET /api/v1/shell/layouts` - Get available layout templates
- `GET /api/v1/shell/layouts/{id}` - Get specific layout definition
- `GET /health` - Health check endpoint

### Shared Utilities

#### Event Bus
```typescript
import { eventBus, EventTypes } from 'shared';
```

#### API Service
```typescript
import { apiService, configureApiService } from 'shared';
```

#### Bootstrap Helper
```typescript
import { bootstrapMfe } from 'shared';
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your microfrontend or enhancement
4. Update documentation
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

For questions or issues:
- Create an issue on GitHub
- Check the [MFE Development Guide](MFE_DEVELOPMENT_GUIDE.md)
- Review existing examples in `packages/test-app/`