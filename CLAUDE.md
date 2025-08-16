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

[TODO: Add project-specific description]

## Project Structure

```
[TODO: Document project structure]
├── src/
├── tests/
├── docs/
└── ...
```

## Common Development Commands

### Setup and Installation
```bash
# [TODO: Add project-specific setup commands]
```

### Testing
```bash
# Run all tests
npm test  # or pytest, cargo test, etc.

# Run with coverage
npm test -- --coverage

# Watch mode for TDD
npm test -- --watch
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

[TODO: Add any project-specific conventions, patterns, or requirements]

### API Conventions
[TODO: Document API patterns if applicable]

### Database Schema
[TODO: Document data models if applicable]

### Security Considerations
[TODO: Document security requirements if applicable]

## Important Notes

- Always follow TDD: RED → GREEN → REFACTOR
- Commit after completing each task
- Keep tests fast and focused
- Document decisions in code comments only when necessary
- Use descriptive variable and function names

---

*This project uses the Claude Task Management System. For detailed methodology, see the `claude_tasks/` directory.*