# Task Management Quick Reference

## 🚀 Session Start Checklist
```bash
# 1. Check current state
git status
cat claude_tasks/active/ACTIVE_TASKS.md
npm test

# 2. Review core docs
cat claude_tasks/PRINCIPLES_QUICK_CARD.md
cat claude_tasks/DEVELOPMENT_PROCESS.md
```

## 🔴 Start a New Task (TDD Process)
1. **CHECK**: Current state and active tasks
2. **PLAN**: Update ACTIVE_TASKS.md to "In Progress"
3. **RED**: Write failing tests FIRST
   ```bash
   # Create test file before implementation
   touch src/modules/feature/__tests__/feature.test.ts
   ```
4. **GREEN**: Write minimal code to pass tests
5. **REFACTOR**: Improve code quality
6. **For new features**: Create feature flag
   ```json
   "task-N-feature-name": {
     "defaultValue": false,
     "description": "Task #N: Brief description"
   }
   ```

## ✅ Complete a Task
1. **DOCUMENT**: Create finished file with test metrics
   ```bash
   cp claude_tasks/TASK_TEMPLATE.md \
      claude_tasks/finished/$(date +%Y%m%d_%H%M)_task_name.md
   ```
2. Include in finished file:
   - Test coverage (should be >80%)
   - Tests written (unit/integration/e2e)
   - TDD process notes (RED→GREEN→REFACTOR)
3. Remove from ACTIVE_TASKS.md
4. **COMMIT**: With TDD message format
   ```bash
   git add -A
   git commit -m "Task #N: [Title]
   
   [Problem section]
   [Solution section]
   
   Tests: X unit, X integration, X E2E | Coverage: XX%
   TDD: RED → GREEN → REFACTOR
   
   🤖 Generated with [Claude Code](https://claude.ai/code)
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

## Add a New Task
1. Edit `claude_tasks/active/ACTIVE_TASKS.md`
2. Use next sequential number
3. Include all required fields:
   - Priority (High/Medium/Low)
   - Status (Not Started)
   - Estimated Time (hours)
   - Dependencies
   - Description
   - Acceptance Criteria

## File Naming Examples
- Active: Listed in ACTIVE_TASKS.md with ID number
- Finished: `20250125_1420_fix_widget_rendering.md`

## Priority Guidelines
- **High**: Blocking other work or broken functionality
- **Medium**: Important features or improvements  
- **Low**: Optimizations or nice-to-haves

## 📊 Test Dashboard Integration
All tests must be categorized and runnable through:
```bash
open http://localhost:3000/test-dashboard.html
```

Test categories:
- **Interface**: API contracts and module interfaces
- **Component**: UI component tests
- **Integration**: End-to-end workflows
- **Performance**: Speed and efficiency
- **Unit**: Individual function tests

## 🎯 Core Principles (Numbered)
1. **Test Driven Development** - No code without tests
2. **Fail Fast & Root Cause** - No workarounds, fix causes
3. **Modular & Maintainable** - Single responsibility
4. **Reuse Before Build** - Check existing code first
5. **Open Source First** - Suggest alternatives
6. **No Legacy Baggage** - Clean slate, no tech debt
7. **Perfectionist Excellence** - Best of breed only

## Common Commands
```bash
# TDD Testing
npm test                        # Run all tests
npm test -- --watch            # Watch mode for TDD
npm test -- --coverage         # Check coverage (>80%)

# Task Management
cat claude_tasks/active/ACTIVE_TASKS.md
ls claude_tasks/finished/

# Test Dashboard
open http://localhost:3000/test-dashboard.html

# Feature Flags (browser console)
featureFlags.isEnabled('task-N-name')
featureFlags.override('task-N-name', true)
```

# Task Management Standard

## Overview
This document defines the standard for managing Claude tasks to ensure consistency and traceability.

## Directory Structure
```
claude_tasks/
├── QUICK_REFERENCE.md  (this file)
├── active/
│   └── ACTIVE_TASKS.md         (consolidated active tasks)
└── finished/
    └── YYYYMMDD_HHMM_task_name.md files
```

## Task Lifecycle

### 1. Task Creation
New tasks are added to `/active/ACTIVE_TASKS.md` with:
- Sequential ID number
- Priority (High/Medium/Low)
- Status (Not Started/In Progress/Blocked)
- Estimated time in hours
- Dependencies on other tasks
- Clear description and acceptance criteria

### 2. Task Execution
When starting a task:
1. Update status to "In Progress" in ACTIVE_TASKS.md
2. Note the start time
3. **For new features/changes**:
   - Add feature flag: `task-N-description` (defaultValue: false)
   - Wrap new code with: `if (featureFlags.isEnabled('task-N-description'))`
   - Update TypeScript types in `/src/config/feature-flags.ts`
4. Reference the task ID in any interim commits

### 3. Task Completion
When finishing a task:
1. Create a finished task file:
   - Filename: `YYYYMMDD_HHMM_task_description.md`
   - Time should be completion time
   - Use underscores for spaces
2. Remove the task from ACTIVE_TASKS.md
3. **Feature Flag Decision**:
   - If feature is complete and tested: Set `defaultValue: true`
   - If needs more work: Keep `defaultValue: false` and document in finished task
   - If replacing old code: Plan migration in next task
4. **MANDATORY**: Commit all changes immediately:
   ```bash
   git add -A
   git commit -m "Task #N: [Title from finished task]
   
   [Problem section content]
   
   [Solution section content]"
   ```
4. Archive any related working documents

## Finished Task File Format (TDD Version)

```markdown
# Task: [Clear Task Title]

**Status:** Completed
**Date:** YYYY-MM-DD
**Time:** HH:MM

## Problem
[What issue was being addressed]

## Solution
[How the problem was solved]

## Test Coverage
- **Unit Tests:** X tests in /path/to/test.ts
- **Integration Tests:** X tests (if applicable)
- **E2E Tests:** X tests (if applicable)
- **Coverage:** XX% (should be > 80%)

## Feature Flag
- **Flag Name:** `task-N-feature-name` or Not Applicable
- **Status:** Enabled/Disabled/Not Applicable

## Files Modified
- `/path/to/test.ts` - Tests written first (RED)
- `/path/to/implementation.ts` - Implementation (GREEN)
- `/path/to/refactored.ts` - Refactored code (REFACTOR)

## Result
[What now works]

## TDD Process Notes
- RED: [What tests were written first]
- GREEN: [How minimal implementation passed]
- REFACTOR: [What improvements were made]

## Lessons Learned (optional)
[Any insights for future work]
```

## Task Priorities

- **High**: Blocking other work or critical functionality
- **Medium**: Important but not blocking
- **Low**: Nice to have or optimization

## Time Tracking

- Record actual time vs estimated when completing tasks
- Use this data to improve future estimates
- Include investigation/debugging time in totals

## Common Task Types

### Bug Fixes
- Include steps to reproduce
- Document root cause
- Note prevention measures

### Feature Implementation
- Reference design documents
- List all new files created
- Include test coverage

### Refactoring
- Explain why refactoring was needed
- Document before/after structure
- Note any breaking changes

### Investigation/Debugging
- Document investigation process
- List tools/techniques used
- Include findings even if no code changed

## Best Practices

1. **One Task, One Purpose** - Don't combine unrelated work
2. **Clear Acceptance Criteria** - Define "done" before starting
3. **Document Blockers** - Note what's preventing progress
4. **Time Box Investigations** - Set limits on debugging time
5. **Regular Updates** - Keep ACTIVE_TASKS.md current
6. **Commit After Every Task** - Always commit with full task details immediately after completion
7. **Feature Flag All Changes** - New features and modifications go behind flags
8. **Safe Rollback** - Keep old code until new code is proven in production

## Task ID Naming

- Active tasks: Sequential numbers (1, 2, 3...)
- Finished tasks: YYYYMMDD_HHMM_description
- Commit messages: Must use finished task content (see Task Completion section)

## Review Schedule

- Daily: Update task statuses
- Weekly: Review task priorities
- Monthly: Analyze completion metrics

## Feature Flag Workflow

### Naming Convention
- **Format**: `task-{number}-{brief-description}`
- **Examples**: 
  - `task-15-arena-multiplayer`
  - `task-16-combat-refactor`
  - `task-17-skill-balancing`

### Implementation Pattern
```typescript
// When starting a new feature (Task #15)
if (featureFlags.isEnabled('task-15-arena-multiplayer')) {
  // New implementation
  return new MultiplayerArena();
} else {
  // Existing implementation
  return new SinglePlayerArena();
}
```

### Migration Strategy
1. **Phase 1**: Deploy with flag disabled (safe to main branch)
2. **Phase 2**: Enable for development/testing
3. **Phase 3**: Gradual rollout (update defaultValue)
4. **Phase 4**: Remove flag and old code (separate task)

### Quick Commands
```bash
# Check current feature flags
cat src/config/feature-flags.json | grep task-

# Test with feature enabled (in browser console)
featureFlags.override('task-15-arena-multiplayer', true);

# Reset to default
featureFlags.resetOverrides();
```

This standard ensures consistent task tracking and makes it easy to understand what work was done, when, and why.

## 🔄 Quick TDD Workflow

```bash
# 1. RED: Write failing test
npm test -- --watch feature.test.ts

# 2. GREEN: Write minimal code
# (Edit implementation until test passes)

# 3. REFACTOR: Improve code
# (Keep tests green while refactoring)

# 4. Check coverage
npm test -- --coverage

# 5. Run through dashboard
open http://localhost:3000/test-dashboard.html
```

## 📝 Pair Programming Reminders
- **Driver (Human)**: Sets direction, makes decisions
- **Navigator (Claude)**: Suggests approaches, writes code
- **Check-in**: Every 10-15 minutes
- **Communicate**: Over-communicate, don't assume
- **TodoWrite**: Track progress continuously

## 🚨 When Context is Lost
```bash
# Quick recovery
git status
git diff
cat claude_tasks/active/ACTIVE_TASKS.md
head -20 claude_tasks/DEVELOPMENT_PROCESS.md
```

## 📚 Essential Documents
1. **PRINCIPLES_QUICK_CARD.md** - The 7 core principles
2. **DEVELOPMENT_PROCESS.md** - TDD methodology (7 steps)
3. **PAIR_PROGRAMMING_WITH_CLAUDE.md** - Collaboration patterns
4. **UNIFIED_PRINCIPLES.md** - Conflict resolution
5. **SESSION_STARTER.md** - Session checklist
6. **TEST_ORGANIZATION.md** - Dashboard categories