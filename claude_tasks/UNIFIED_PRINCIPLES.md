# Unified Development Principles - No Conflicts

## 🎯 Core Hierarchy of Principles

When in doubt, follow this priority order (references CLAUDE.md principles):

1. **Test First** (Principle #1) - TDD before implementation, no exceptions
2. **Fail Fast** (Principle #2) - Root cause over workarounds  
3. **Reuse Before Build** (Principle #4) - Check existing code first
4. **Open Source First** (Principle #5) - Claude suggests, human decides
5. **Quality Excellence** (Principle #7) - Perfectionist standard
6. **No Tech Debt** (Principle #6) - Clean slate, no legacy baggage
7. **Modular Design** (Principle #3) - Decoupled, maintainable code

---

## ✅ Resolved Principle Clarifications

### 1. Quality vs Pace
**Principle:** We are perfectionist developers who work at a sustainable pace
- ✅ High quality code with >80% test coverage
- ✅ Take breaks every 45-60 minutes
- ✅ No rushing - better to do it right
- ✅ Celebrate progress to maintain morale

### 2. Decision Making
**Principle:** Claude suggests, human decides
- ✅ Claude SUGGESTS open source alternatives
- ✅ Claude PROPOSES architectural approaches
- ✅ Human MAKES final decisions
- ✅ Human APPROVES before major changes

### 3. Documentation Timing
**Principle:** Document continuously, formalize at completion
- ✅ During: Document decisions in comments/chat
- ✅ During: Update TodoWrite for progress tracking
- ✅ After: Create formal finished task file
- ✅ After: Update ACTIVE_TASKS.md

### 4. Testing Philosophy
**Principle:** Fail fast to find problems, then fix properly
- ✅ RED: Write tests that fail (expose problems)
- ✅ GREEN: Minimal code to pass (quick validation)
- ✅ REFACTOR: Improve to production quality
- ✅ No workarounds - fix root causes

### 5. Code Changes
**Principle:** Small, safe, reversible changes
- ✅ Feature flags for new features
- ✅ Keep old code until new is proven
- ✅ Small incremental commits
- ✅ One task = one commit

### 6. Communication
**Principle:** Over-communicate rather than assume
- ✅ Claude explains BEFORE implementing
- ✅ Human provides feedback DURING work
- ✅ Both check in every 10-15 minutes
- ✅ Ask when uncertain

### 7. Storage & Architecture
**Principle:** Server-first, no fallbacks that hide problems
- ✅ Server storage is default
- ✅ No localStorage unless designed upfront
- ✅ Show errors clearly, don't degrade silently
- ✅ Thin client architecture

### 8. Refactoring
**Principle:** Refactor with purpose, not perfectionism
- ✅ Only refactor with clear goal
- ✅ Keep working code working
- ✅ Test before and after
- ✅ Document why refactoring was needed

---

## 🚫 Anti-Principles (What We DON'T Do)

1. **NO Quick Fixes** - Even if faster
2. **NO Assumptions** - Ask if unsure
3. **NO Big Bang Changes** - Incremental only
4. **NO Silent Failures** - Fail loudly
5. **NO Tech Debt** - Fix it right first time
6. **NO Backwards Compatibility** - This is new development
7. **NO Implementation Before Tests** - TDD always

---

## 🎓 When Principles Seem to Conflict

Use this decision tree:

```
Is it a safety issue?
├── YES → Safety first (don't break working code)
└── NO → Continue
    │
    Is it a quality issue?
    ├── YES → Quality over speed
    └── NO → Continue
        │
        Is it an architectural decision?
        ├── YES → Human decides
        └── NO → Continue
            │
            Is it about approach?
            ├── YES → Follow TDD process
            └── NO → Ask for clarification
```

---

## 📋 Quick Reference Card

### Every Task
1. Write tests first (RED)
2. Minimal implementation (GREEN)  
3. Refactor for quality (REFACTOR)
4. Document everything
5. Commit with details

### Every Session
1. Review methodologies
2. Check active tasks
3. Align on goals
4. Work in small increments
5. Commit completed work

### Every Decision
1. Is it tested?
2. Is it documented?
3. Is it approved?
4. Is it reversible?
5. Is it the right fix?

---

## 🤝 The Agreement

**Claude and Human agree:**
- Quality is non-negotiable
- Tests come first
- Communication is continuous
- Documentation is mandatory
- We're building something great together

No conflicts, only clarity!