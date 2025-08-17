# Add Todo Item

Please add the following item to the todo list:

**Todo Item**: {PLACEHOLDER_TEXT}

**Instructions:**
1. Read the current todo list from `claude_tasks/todo/TODO_LIST.md`
2. Add the new todo item with:
   - Current timestamp
   - The todo description provided
   - Status: "📝 New"
3. Update the "Last Updated" timestamp in the file
4. Keep the list organized and readable

**Format for new todo items:**
```markdown
### [TIMESTAMP] - 📝 New
**Todo**: [DESCRIPTION]
**Added**: [DATE TIME]

---
```

This command provides a quick way to capture todo items during development without the overhead of creating formal tasks. These can later be promoted to formal tasks in ACTIVE_TASKS.md when ready for development work.

**Example usage**: `/todo "add error handling to login form"`