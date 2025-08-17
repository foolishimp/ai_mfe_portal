# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Claude Development Process

This project follows the Claude Task Management System for AI-assisted development. The methodology emphasizes:
- Test-Driven Development (TDD)
- Structured task tracking
- Clear development principles
- Pair programming patterns with AI

### Key Documents
- `claude_tasks/QUICK_REFERENCE.md` - Quick commands and TDD workflow
- `claude_tasks/DEVELOPMENT_PROCESS.md` - Complete TDD methodology (7 steps)
- `claude_tasks/PRINCIPLES_QUICK_CARD.md` - The 7 core development principles
- `claude_tasks/PAIR_PROGRAMMING_WITH_CLAUDE.md` - Collaboration patterns
- `claude_tasks/active/ACTIVE_TASKS.md` - Current task tracking

## Core Development Principles

1. **Test Driven Development** - Write tests first, no code without tests
2. **Fail Fast & Root Cause** - Fix problems at their source, no workarounds
3. **Modular & Maintainable** - Single responsibility, decoupled components
4. **Reuse Before Build** - Check existing code and libraries first
5. **Open Source First** - Suggest alternatives before building new
6. **No Legacy Baggage** - Start clean, avoid technical debt
7. **Perfectionist Excellence** - Build best-of-breed solutions only

## Repository Overview

**AI MFE Portal** is a generic, extensible microfrontend portal framework designed for building enterprise-grade applications with dynamic module loading, user-customizable workspaces, and comprehensive backend integration.

### What This Project Is

This is a **complete microfrontend orchestration platform** that enables:

- **Dynamic MFE Loading**: Runtime ES module imports without webpack federation complexity
- **User-Customizable Workspaces**: Multi-tab interfaces with configurable layouts (single-pane, two-column, three-column, etc.)
- **Layout Engine**: JSON-based layout templates with CSS-driven responsive designs
- **Preferences Management**: SQLite backend for persistent user workspace configurations
- **Cross-MFE Communication**: Event bus system for decoupled messaging between microfrontends
- **Environment Configuration**: Multi-environment deployment support (dev/staging/prod)
- **Generic Framework**: No domain-specific logic - can be adapted for any use case

### Core Architecture

```
AI MFE Portal (Monorepo)
├── packages/
│   ├── shell/           # Main portal container (React + Material-UI)
│   ├── shared/          # Common utilities, types, and event bus
│   └── test-app/        # Example microfrontend for framework validation
├── shell_service/       # FastAPI backend for preferences and configuration
│   ├── api/            # REST endpoints for configuration management
│   ├── database/       # SQLite CRUD operations and schema
│   ├── data/           # Layout templates and default configurations
│   └── models/         # Pydantic models for type safety
├── docs/               # Comprehensive documentation with UML diagrams
├── tests/              # E2E integration tests with dashboard integration
└── environments.json   # Multi-environment URL configuration
```

### Key Features

1. **Microfrontend Orchestration**
   - Dynamic ES module loading at runtime
   - No webpack module federation complexity
   - Environment-configurable MFE URLs
   - Graceful error handling and fallbacks

2. **User Workspace Management**
   - Multi-tab interface (called "Frames")
   - Drag-and-drop layout configuration
   - Persistent user preferences via backend API
   - Layout templates (single-pane, two-column, three-column, etc.)

3. **Backend Services**
   - FastAPI preferences service with SQLite database
   - RESTful APIs for configuration management
   - Multi-tenant support via user scoping
   - Health monitoring and diagnostics

4. **Development Tools**
   - Comprehensive E2E test suite
   - External test dashboard for TDD workflow
   - Hot reload development environment
   - Unified startup script for all services

### Technology Stack

- **Frontend**: React 18, TypeScript, Material-UI, Vite
- **Backend**: Python FastAPI, SQLite/PostgreSQL, Uvicorn
- **Build Tools**: Vite, TypeScript, ESBuild
- **Testing**: Jest, Node.js native tests, E2E validation
- **Development**: TDD methodology with comprehensive task tracking

## Project Structure

```
ai_mfe_portal/
├── packages/                    # Frontend microfrontend packages
│   ├── shell/                  # Main portal container
│   │   ├── src/
│   │   │   ├── components/     # React components (Layout, Navigation, Preferences)
│   │   │   ├── contexts/       # React contexts for configuration
│   │   │   ├── hooks/          # Custom hooks for MFE orchestration
│   │   │   └── utils/          # Event bus bridge and utilities
│   │   ├── index.html          # Portal entry point
│   │   └── vite.config.ts      # Build configuration
│   ├── shared/                 # Shared utilities and types
│   │   └── src/
│   │       ├── components/     # Reusable UI components
│   │       ├── services/       # API service layer
│   │       ├── types/          # TypeScript type definitions
│   │       └── utils/          # Event bus and helper utilities
│   └── test-app/               # Example microfrontend
│       └── src/
│           ├── TestApp.tsx     # Test component with event bus integration
│           └── main.tsx        # MFE entry point and bootstrap
├── shell_service/              # Backend preferences service
│   ├── api/routes/            # FastAPI route definitions
│   ├── database/              # SQLite CRUD operations
│   ├── data/                  # Configuration files
│   │   ├── defaults.json      # Default apps and settings
│   │   └── layouts/           # Layout template JSON files
│   ├── models/                # Pydantic data models
│   └── main.py                # FastAPI application entry point
├── docs/                      # Documentation
│   ├── BACKEND_SERVICE_GUIDE.md    # Complete backend documentation with UML
│   └── UNIFIED_MFE_DEVELOPMENT_GUIDE.md    # Development guide
├── tests/                     # Test suite
│   ├── e2e/                   # End-to-end integration tests
│   └── setup/                 # Test configuration
├── claude_tasks/              # Development task management
│   ├── active/                # Current tasks
│   └── finished/              # Completed task documentation
├── environments.json          # Multi-environment configuration
├── start_portal.py           # Unified service startup script
└── package.json              # Monorepo configuration with workspaces
```

## Common Development Commands

### Setup and Installation
```bash
# Install all dependencies and build shared package
npm run install:all

# Start complete portal (backend + frontend)
npm run dev
# or
python start_portal.py

# Start individual services
npm run start:backend          # Preferences service only
npm run start:frontend         # Frontend services only
npm run start:shell           # Shell only (requires backend running)

# Start specific services
python start_portal.py --services shell test-app
```

### Testing
```bash
# Run E2E integration tests
npm test                              # Jest test runner
npm run test:e2e                      # E2E tests specifically
node tests/e2e/portal-services-validation.test.js  # Direct validation

# Test dashboard (external tool)
npm run test:dashboard               # Visual test runner on dynamic port

# Test individual services
curl http://localhost:8011/health   # Backend health check
curl http://localhost:3100          # Shell frontend check
curl http://localhost:3002          # Test app check
```

### Development Workflow
```bash
# 1. Start all services
python start_portal.py --services shell test-app

# 2. Access applications
open http://localhost:3100          # Main portal
open http://localhost:8011/health   # Backend API health
open http://localhost:8132          # Test dashboard (port varies)

# 3. Development commands
npm run build:all                   # Build all packages
npm run clean                       # Clean build artifacts
```

### Development Workflow
1. Check active tasks: `cat claude_tasks/active/ACTIVE_TASKS.md`
2. Write failing test (RED)
3. Write minimal code to pass (GREEN)
4. Refactor while keeping tests green (REFACTOR)
5. Document completed task in `claude_tasks/finished/`
6. Commit with descriptive message

## Working with this Codebase

### When Starting a Session
1. Review `claude_tasks/SESSION_STARTER.md`
2. Check current state with `git status`
3. Review active tasks
4. Run tests to ensure clean state

### Task Management
- New tasks go in `claude_tasks/active/ACTIVE_TASKS.md`
- Completed tasks move to `claude_tasks/finished/YYYYMMDD_HHMM_task_name.md`
- Follow the task template in `claude_tasks/TASK_TEMPLATE.md`

### Testing Strategy
- Unit tests for individual functions
- Integration tests for module interactions
- E2E tests for critical user paths
- Maintain >80% code coverage

## Project-Specific Guidelines

### MFE Development Patterns

**Creating New Microfrontends:**
1. Create package in `/packages/new-mfe/`
2. Implement `bootstrapMfe()` and `mount()` functions in main.tsx
3. Register in `shell_service/data/defaults.json`
4. Add URL to `environments.json` for each environment
5. Restart services to load new MFE

**Event Bus Communication:**
```typescript
import { eventBus, EventTypes } from 'shared';

// Subscribe to events
eventBus.subscribe('custom:event', (data) => console.log(data));

// Publish events
eventBus.publish('user:action', { source: 'my-mfe', payload: data });
```

**Layout Integration:**
- MFEs are assigned to layout windows via `AppAssignment` objects
- Layouts are JSON-based templates in `shell_service/data/layouts/`
- Users can customize workspace arrangements via preferences UI

### API Conventions

**Backend Service (Port 8011):**
- RESTful FastAPI with Pydantic models
- Multi-tenant via `X-User-Id` header
- Standardized error responses
- Health monitoring at `/health`

**Key Endpoints:**
- `GET /api/v1/shell/configuration` - Complete user workspace configuration
- `PUT /api/v1/shell/preferences` - Save user workspace preferences
- `GET /api/v1/shell/layouts` - Available layout templates
- `GET /api/v1/shell/available-apps` - Registered microfrontend applications

### Database Schema

**Core Tables:**
- `available_apps` - Registered microfrontend definitions
- `frames` - User workspace tabs with layout assignments
- `service_endpoints` - Configurable backend service URLs

**Data Model:**
- **AppDefinition**: MFE registration (id, name, scope, module, url)
- **Frame**: User workspace tab (id, name, layoutId, assignedApps)
- **AppAssignment**: App-to-layout-window mapping (appId, windowId)
- **LayoutDefinition**: UI arrangement template (windows, styles)

### Security Considerations

**Authentication:**
- User context via `X-User-Id` header (implement upstream auth)
- All user data scoped by user_id for multi-tenancy
- Parameterized SQL queries prevent injection

**MFE Security:**
- Dynamic imports from configured URLs only
- CORS configuration for cross-origin MFE loading
- Environment-based URL validation

**Deployment:**
- Environment-specific configurations
- Secure backend service deployment
- HTTPS enforcement for production

## Current Status

**Services Running:**
- **Backend API**: http://localhost:8011 (preferences service)
- **Shell Portal**: http://localhost:3100 (main application)  
- **Test App**: http://localhost:3002 (example microfrontend)
- **Test Dashboard**: Dynamic port (use `npm run test:dashboard`)

**Key Documentation:**
- `docs/BACKEND_SERVICE_GUIDE.md` - Complete backend API and domain model with UML diagrams
- `docs/UNIFIED_MFE_DEVELOPMENT_GUIDE.md` - MFE development patterns and best practices
- `claude_tasks/QUICK_REFERENCE.md` - TDD workflow and commands
- `claude_tasks/PRINCIPLES_QUICK_CARD.md` - 7 core development principles

**Recent Major Changes:**
- Cleaned out legacy c4h_editor applications (only test-app remains)
- Updated branding from "C4H Editor" to "AI MFE Portal"
- Implemented modern dark theme with gradients and glass-morphism
- Created comprehensive E2E test suite for validation
- Documented complete backend domain model with UML diagrams

## Quick Start for New Developers

1. **Understand the Architecture**: Read this file and `docs/BACKEND_SERVICE_GUIDE.md`
2. **Start All Services**: `python start_portal.py --services shell test-app`
3. **Access Portal**: http://localhost:3100
4. **Test Integration**: Use test dashboard via `npm run test:dashboard`
5. **Review Tests**: Check `tests/e2e/` for integration examples

## Important Notes

- **Generic Framework**: This is not domain-specific - adapt for any use case
- **TDD Methodology**: Always follow RED → GREEN → REFACTOR cycle
- **External Tools**: `test_dd_dashboard/` is external (like node_modules)
- **Environment Driven**: URLs configurable per deployment environment
- **Multi-Tenant Ready**: User-scoped preferences and configurations

---

*This project uses the Claude Task Management System. For detailed methodology, see the `claude_tasks/` directory.*