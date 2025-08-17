# Add Todo Item

Add the following item to the todo list:

**Todo Item**: {todo_text}

## Instructions:

1. **Read current todo list** from `claude_tasks/todo/TODO_LIST.md`

2. **Add new todo item** in the "Todo Items" section using this format:
   ```markdown
   ### {current_timestamp} - 📝 New
   **Todo**: {todo_description}
   **Added**: {current_date_time}
   
   ---
   ```

3. **Update timestamp** in the "Last Updated" field at the top

4. **Keep organized** - add new items at the top of the Todo Items section

5. **Brief confirmation** - Simply confirm "Added to todo list" without repeating the item

This provides quick capture of ideas and tasks during development. Items can later be promoted to formal tasks in `claude_tasks/active/ACTIVE_TASKS.md` when ready for TDD development work.

**Usage Examples:**
- `/todo "add error handling to login"`
- `/todo "investigate performance issue"`
- `/todo "refactor user service"`