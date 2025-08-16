# Session Starter Checklist

## 🚀 Start of Every Session

Run these commands and review these items EVERY time you start working:

### 1. Check Current State
```bash
# Where are we?
git status
git log --oneline -5

# What's active?
cat claude_tasks/active/ACTIVE_TASKS.md

# Any failing tests?
npm test
```

### 2. Review Core Documents
- [ ] Read `/claude_tasks/PRINCIPLES_QUICK_CARD.md` - The 7 Sacred Principles
- [ ] Read `/claude_tasks/DEVELOPMENT_PROCESS.md` - TDD methodology
- [ ] Read `/claude_tasks/PAIR_PROGRAMMING_WITH_CLAUDE.md` - Collaboration approach  
- [ ] Read `/claude_tasks/QUICK_REFERENCE.md` - Task management

### 3. Align on Goals
```markdown
Human: "Today we're working on [WHAT]"
Claude: "I understand. Let me check the current state and active tasks..."
```

### 4. Choose Working Mode
- [ ] **Pair Programming Mode**: Human drives strategy, Claude navigates
- [ ] **TDD Mode**: RED → GREEN → REFACTOR cycle
- [ ] **Bug Fix Mode**: Reproduce → Test → Fix → Verify
- [ ] **Exploration Mode**: Research and investigation

### 5. Set Up for Success
```bash
# Start dev server if needed
npm run dev

# Start test watcher for TDD
npm test -- --watch

# Open browser to relevant page
open http://localhost:3000/[relevant-page]
```

---

## 📝 Quick Session Template

Copy and paste this at the start of each session:

```markdown
## Session: [DATE] [TIME]

### Goals
1. [ ] Primary goal
2. [ ] Secondary goal
3. [ ] Stretch goal

### Current Task
- Task #N from ACTIVE_TASKS.md
- Status: In Progress
- Feature Flag: task-N-feature-name (if applicable)

### Approach
- [ ] TDD: Write tests first
- [ ] Feature flag created
- [ ] TodoWrite tracking active

### Check-in Schedule
- [ ] 15 min - Initial approach review
- [ ] 30 min - Progress check
- [ ] 45 min - Testing checkpoint
- [ ] 60 min - Documentation & commit

### End of Session
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Committed with proper message
- [ ] ACTIVE_TASKS.md updated
```

---

## 🔄 Context Recovery

If context is lost mid-session, quickly recover with:

```bash
# What were we doing?
git status
git diff

# What's the plan?
cat claude_tasks/active/ACTIVE_TASKS.md

# What's the methodology?
head -20 claude_tasks/DEVELOPMENT_PROCESS.md

# Recent work?
ls -lt claude_tasks/finished/ | head -5
```

---

## 🎯 Key Principles to Remember

1. **TDD First**: RED → GREEN → REFACTOR
2. **Pair Programming**: Communicate, check-in, collaborate
3. **Small Commits**: One task = one commit
4. **Feature Flags**: New features behind flags
5. **Documentation**: Every task gets documented
6. **Test Coverage**: Maintain >80%

---

## 🚨 If You Get Lost

Just ask:
- "What's our current task?"
- "Show me the active tasks"
- "What's the TDD process again?"
- "Should we check in?"

The human will help reorient the session!