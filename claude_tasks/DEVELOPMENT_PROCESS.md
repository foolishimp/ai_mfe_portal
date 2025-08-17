# Development Process - TDD Step-by-Step Methodology

## 🎯 Process Overview (TDD)
```
1. CHECK → 2. PLAN → 3. RED → 4. GREEN → 5. REFACTOR → 6. DOCUMENT → 7. COMMIT
```

---

## 📋 Step 1: CHECK - Understand Current State
```bash
# What's the current branch and status?
git status

# What are the active tasks?
cat claude_tasks/active/ACTIVE_TASKS.md

# What's been done recently?
git log --oneline -10

# Are there any failing tests?
npm test

# Check for console errors
npm run dev  # Then check browser console
```

**Output**: Clear understanding of where we are

---

## 📝 Step 2: PLAN - Select and Start Task

### 2.1 Select Task
```bash
# Review active tasks
cat claude_tasks/active/ACTIVE_TASKS.md
```

### 2.2 Update Task Status
```markdown
# In ACTIVE_TASKS.md, change:
**Status:** Not Started → **Status:** In Progress
**Started:** 2025-01-11 10:00
```

### 2.3 Create Feature Flag (if adding new feature)
```json
// In /src/config/feature-flags.json
"task-N-feature-name": {
  "defaultValue": false,
  "description": "Task #N: Brief description"
}
```

### 2.4 Create Working Branch (optional but recommended)
```bash
git checkout -b task-N-feature-name
```

**Output**: Task selected, status updated, ready to code

---

## 🔴 Step 3: RED - Write Failing Tests First

### 3.1 Create Test File
```bash
# Create test file BEFORE implementation
touch src/modules/feature/__tests__/feature.test.ts
# or
touch src/modules/feature/feature.test.ts
```

### 3.2 Write Test Cases with Dashboard Metadata

**IMPORTANT**: All tests MUST be categorized and made available through the Test Dashboard via `npm run test:dashboard`

Categories:
- **interface**: API contracts and module interfaces
- **component**: UI component tests  
- **integration**: End-to-end workflows
- **performance**: Speed and efficiency tests
- **unit**: Individual function tests

```typescript
/**
 * @test-category component
 * @test-name Feature Component
 * @test-description Tests new feature component
 * REQUIRED: These metadata tags make test discoverable by dashboard
 */
describe('Feature Name', () => {
  it('should do expected behavior', () => {
    // Arrange
    const input = 'test data';
    
    // Act
    const result = featureFunction(input); // This doesn't exist yet!
    
    // Assert
    expect(result).toBe('expected output');
  });
  
  it('should handle edge case', () => {
    // Write test for edge cases
  });
  
  it('should handle errors gracefully', () => {
    // Write test for error conditions
  });
});
```

For HTML tests:
```html
<!-- REQUIRED: Dashboard metadata for test discovery -->
<meta name="test-category" content="component">
<meta name="test-name" content="My Feature">
<meta name="test-description" content="Tests feature UI">
```

### 3.3 Run Tests to Confirm They Fail
```bash
npm test feature.test.ts
# Should see RED - tests failing because code doesn't exist

# Also verify test appears in dashboard
npm run test:dashboard
# Should see your new test in the appropriate category
```

### 3.4 Use TodoWrite for Test Checklist
```
- [ ] Unit tests for happy path
- [ ] Edge case tests
- [ ] Error handling tests
- [ ] Integration tests (if needed)
- [ ] E2E tests (if UI changes)
- [ ] Tests appear in dashboard with correct category
```

**Output**: Failing tests that define the expected behavior

---

## 🟢 Step 4: GREEN - Write Minimal Code to Pass Tests

### 4.1 Implement Just Enough Code
```typescript
// Write ONLY what's needed to make tests pass
export function featureFunction(input: string): string {
  // Simplest implementation that passes the tests
  return 'expected output';
}
```

### 4.2 Use Feature Flag for New Features
```typescript
if (featureFlags.isEnabled('task-N-feature-name')) {
  // New implementation (just enough to pass tests)
} else {
  // Existing implementation (if replacing)
}
```

### 4.3 Run Tests to Confirm They Pass
```bash
npm test feature.test.ts
# Should see GREEN - all tests passing
```

### 4.4 Check Coverage
```bash
npm test -- --coverage feature.test.ts
# Aim for > 80% coverage
```

**Output**: Minimal working code that passes all tests

---

## ♻️ Step 5: REFACTOR - Improve Code Quality

### 5.1 Refactor While Tests Stay Green
```typescript
// Now improve the code:
// - Extract methods
// - Remove duplication
// - Improve naming
// - Add types
// - Optimize performance
```

### 5.2 Run Tests After Each Change
```bash
npm test feature.test.ts
# Must stay GREEN after each refactor
```

### 5.3 Add More Tests If Needed
```typescript
// Discovered edge case during refactoring?
it('should handle newly discovered edge case', () => {
  // Add test for new scenario
});
```

### 5.4 Integration & E2E Tests
```bash
# If UI changed, add E2E test
touch tests/e2e/feature.test.ts

# Write E2E test
test('user can use new feature', async ({ page }) => {
  await page.goto('/feature-page');
  await page.click('#feature-button');
  await expect(page.locator('#result')).toBeVisible();
});
```

### 5.5 Manual Verification
```bash
# Start dev server
npm run dev

# Manually test the feature
# Check browser console for errors
```

**Output**: Clean, maintainable code with comprehensive test coverage

---

## 📄 Step 6: DOCUMENT - Record What Was Done

### 6.1 Create Finished Task File
```bash
# Use template
cp claude_tasks/TASK_TEMPLATE.md \
   claude_tasks/finished/$(date +%Y%m%d_%H%M)_task_name.md
```

### 6.2 Fill Out Template (TDD Version)
```markdown
# Task: [Clear Title]

**Status:** Completed
**Date:** 2025-01-11
**Time:** 10:45

## Problem
[1-2 sentences: What was broken/missing?]

## Solution
[2-3 sentences: What did you do?]

## Test Coverage
- **Unit Tests:** X tests in /path/to/test.ts
- **Integration Tests:** X tests (if applicable)
- **E2E Tests:** X tests (if applicable)
- **Coverage:** XX% (should be > 80%)

## Feature Flag
- **Flag Name:** `task-N-feature-name` or Not Applicable
- **Status:** Enabled/Disabled/Not Applicable

## Files Modified
- `/path/to/test.ts` - Tests written first
- `/path/to/implementation.ts` - Implementation
- `/path/to/file2.ts` - Related changes

## Result
[1-2 sentences: What now works?]

## TDD Process Notes
- RED: [What tests were written first]
- GREEN: [How minimal implementation passed]
- REFACTOR: [What improvements were made]

## Lessons Learned (optional)
[Any insights for future work]
```

### 6.3 Update Active Tasks
```bash
# Remove completed task from ACTIVE_TASKS.md
vim claude_tasks/active/ACTIVE_TASKS.md
```

**Output**: Complete documentation of work done with test details

---

## ✅ Step 7: COMMIT - Save to Git

### 7.1 Stage Changes
```bash
git add -A
```

### 7.2 Commit with TDD Message
```bash
git commit -m "Task #N: [Title from finished task]

[Problem section from finished task]

[Solution section from finished task]

Tests: X unit, X integration, X E2E | Coverage: XX%
TDD: RED → GREEN → REFACTOR

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 7.3 Push (if on branch)
```bash
git push origin task-N-feature-name
```

**Output**: Work saved with test metrics in git history

---

## 🔄 TDD Quick Checklist

Before starting a task:
- [ ] Checked git status
- [ ] Reviewed active tasks
- [ ] Updated task status to "In Progress"
- [ ] Created feature flag (if needed)

RED Phase:
- [ ] Written test file FIRST
- [ ] Tests define expected behavior
- [ ] Tests are failing (RED)
- [ ] Covered edge cases and errors

GREEN Phase:
- [ ] Written minimal code to pass
- [ ] All tests passing (GREEN)
- [ ] Code behind feature flag (if new)
- [ ] Coverage > 80%

REFACTOR Phase:
- [ ] Improved code quality
- [ ] Tests still passing
- [ ] Added integration/E2E tests
- [ ] Manual testing completed

Before committing:
- [ ] All tests pass
- [ ] No console errors
- [ ] Created finished task file with test metrics
- [ ] Removed from active tasks
- [ ] Used TDD commit message

---

## 🚀 Common TDD Scenarios

### Bug Fix (TDD Approach)
1. CHECK: Reproduce the bug
2. PLAN: Update task status
3. RED: Write test that exposes the bug
4. GREEN: Fix bug to make test pass
5. REFACTOR: Clean up the fix
6. DOCUMENT: Create finished file
7. COMMIT: "Task #N: Fix [bug] | Tests: X unit"

### New Feature (TDD + Feature Flag)
1. CHECK: Review requirements
2. PLAN: Create feature flag (disabled)
3. RED: Write tests for new feature
4. GREEN: Implement behind flag to pass tests
5. REFACTOR: Improve implementation
6. DOCUMENT: Note test coverage and flag
7. COMMIT: "Task #N: Add [feature] | Coverage: XX%"

### Refactoring (TDD Safety Net)
1. CHECK: Understand current implementation
2. PLAN: Create feature flag for new version
3. RED: Write tests for current behavior
4. GREEN: Ensure tests pass with current code
5. REFACTOR: Implement new version behind flag
6. DOCUMENT: Note both paths tested
7. COMMIT: "Task #N: Refactor [what] | Tests ensure compatibility"

---

## 📊 Time Tracking

Track time for better estimates:
```markdown
**Started:** 10:00
**Completed:** 11:30
**Actual Time:** 1.5 hours (vs 2 hour estimate)
```

---

## 🔍 When Things Go Wrong

### Tests Won't Run
1. Check test file location
2. Verify import paths
3. Check test runner config
4. Try: `npm test -- --no-cache`

### Can't Get Test to Fail (RED)
1. Test might be testing wrong thing
2. Implementation might already exist
3. Check test assertions are correct
4. Add console.log to verify test runs

### Can't Get Test to Pass (GREEN)
1. Implementation doesn't match test expectations
2. Test expectations might be wrong
3. Add console.logs to debug
4. Simplify test to isolate issue

### Tests Pass But Feature Doesn't Work
1. Missing integration/E2E tests
2. Test doesn't reflect real usage
3. Feature flag not enabled
4. Manual testing found edge case - add test!

### Merge Conflicts in Tests
1. Always pull latest main first
2. Run both versions of tests
3. Merge tests carefully
4. Ensure all tests still pass

---

## 📚 Key TDD Commands Reference

```bash
# Task Management
cat claude_tasks/active/ACTIVE_TASKS.md
ls claude_tasks/finished/

# TDD Testing Commands
npm test                        # Run all tests
npm test feature.test.ts        # Run specific test file
npm test -- --watch            # Watch mode for TDD cycle
npm test -- --coverage         # Check test coverage
npm test -- --no-cache         # Clear test cache
npm test -- --verbose          # Detailed test output

# Dashboard Testing (REQUIRED)
npm run test:dashboard  # Visual test runner (external tool)
# ALL tests must be runnable through dashboard
# Tests without dashboard metadata will not be discoverable
npm run test:interfaces         # Run interface tests
npm run test:e2e               # Run integration tests  
npm run test:components        # Run component tests

# Development
npm run dev        # Start dev server
npm run build      # Build for production

# Git
git status        # Check current state
git add -A        # Stage all changes
git commit -m ""  # Commit with message
git log --oneline # View recent commits

# Feature Flags (in browser console)
featureFlags.isEnabled('task-N-name')
featureFlags.override('task-N-name', true)
featureFlags.resetOverrides()
```

---

## 🎯 TDD Benefits

This TDD process ensures:
✅ **Bugs caught early** - Tests fail before code exists
✅ **Better design** - Writing tests first improves API design
✅ **Confidence in changes** - Tests protect against regressions
✅ **Living documentation** - Tests show how code should work
✅ **Higher quality** - Forces thinking about edge cases upfront
✅ **Faster debugging** - Tests pinpoint exactly what's broken
✅ **Safe refactoring** - Tests ensure behavior doesn't change

## 📈 TDD Metrics to Track

For each task, record:
- **Tests Written**: Unit / Integration / E2E
- **Coverage**: Should be > 80%
- **RED Duration**: Time to write failing tests
- **GREEN Duration**: Time to make tests pass
- **REFACTOR Duration**: Time to clean up code
- **Bugs Found**: By tests vs manual testing

## 🏆 TDD Best Practices

1. **Write the test name first** - Describe what it should do
2. **One assertion per test** - Makes failures clear
3. **Test behavior, not implementation** - Tests shouldn't break if internals change
4. **Use descriptive test names** - Should read like documentation
5. **Keep tests simple** - Complex tests are hard to maintain
6. **Test edge cases** - Empty, null, undefined, max values
7. **Mock external dependencies** - Tests should be fast and isolated
8. **Run tests frequently** - After every small change
9. **Never skip the RED phase** - Ensures test actually tests something
10. **Refactor both code AND tests** - Keep tests clean too