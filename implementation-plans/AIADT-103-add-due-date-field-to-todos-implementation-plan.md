## Implementation Prompt: AIADT-103 — Add Due Date field to todos

### Objective and Non-goals

- **Objective**: Add optional due date support to the Todo app so users can set, edit, view, and optionally remove a due date for any todo.
- **Non-goals**:
  - Sorting by due date
  - Reminder notifications or calendar integrations
  - Backend/API persistence (sessionStorage persistence only if already present; current codebase has none)

### Architecture / Design Overview

- **Types**: Extend `src/types/Todo.ts` with `dueDate?: string` where the value is an ISO 8601 string. `createdAt` remains `Date` in memory since there is no persistence layer at present.
- **State Management**: Update `src/contexts/TodoContext.tsx` to support `dueDate` in `addTodo` and `editTodo`. Keep `addTodo` signature backward-compatible by adding an optional third param, e.g. `(title: string, description: string, dueDate?: string)`.
- **UI**:
  - `src/components/TodoModal/TodoModal.tsx`: Add a date picker field for create/edit. Manage local state as `Date | null` and convert to ISO string on submit.
  - `src/components/TodoList/TodoItem.tsx`: Display formatted due date below description when present. Optionally show a subtle overdue indicator for dates before today.
- **App Root**:
  - Wrap the app with `LocalizationProvider` using `AdapterDateFns` to enable MUI DatePicker.
- **Dependencies**:
  - Add `@mui/x-date-pickers` and `date-fns`. MUI Core is already present.

### Detailed Steps (file-by-file)

1. Dependencies

- Run:
  - `npm i @mui/x-date-pickers date-fns`

2. Root Provider

- File: `src/App.tsx`
  - Import `LocalizationProvider` and `AdapterDateFns`:
    - `import { LocalizationProvider } from '@mui/x-date-pickers';`
    - `import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';`
  - Wrap the app content so that all children (including `TodoModal`) are inside `LocalizationProvider`:
    - `<LocalizationProvider dateAdapter={AdapterDateFns}> ... </LocalizationProvider>`

3. Type updates

- File: `src/types/Todo.ts`
  - Add optional `dueDate?: string` field to the `Todo` interface.

4. Context updates

- File: `src/contexts/TodoContext.tsx`
  - Update `addTodo` signature to `(title: string, description: string, dueDate?: string)` and set `dueDate` on the new todo when provided.
  - Ensure `editTodo` supports updating `dueDate` via `Partial<Todo>` (already supported by type but confirm usage in code paths).

5. Modal (Create/Edit)

- File: `src/components/TodoModal/TodoModal.tsx`
  - Local state: add `const [dueDate, setDueDate] = useState<Date | null>(null);`
  - On open/reset: when editing, initialize `dueDate` from `initialValues?.dueDate` if provided: `setDueDate(initialValues?.dueDate ? new Date(initialValues.dueDate) : null)`.
  - Render a `DatePicker` (from `@mui/x-date-pickers`) labeled “Due date (optional)” with value `dueDate` and `onChange` that sets the local state.
  - Validation rules:
    - Title is required (existing behavior retained).
    - If `dueDate` is present, ensure it is a valid `Date` (i.e., `!isNaN(dueDate.getTime())`).
    - If invalid, show inline error and block submit.
  - Submit behavior:
    - Create: `addTodo(title.trim(), description.trim(), dueDate ? dueDate.toISOString() : undefined)`
    - Edit: `editTodo(initialValues.id, { title: ..., description: ..., completed, dueDate: dueDate ? dueDate.toISOString() : undefined })`
  - Allow clearing the date (set to `null`) to remove an existing due date in edit mode.

6. Todo item display

- File: `src/components/TodoList/TodoItem.tsx`
  - Import `format` from `date-fns`.
  - If `todo.dueDate` is present, display an additional secondary line such as:
    - `Due: {format(new Date(todo.dueDate), 'PP')}`
  - Overdue indicator (optional): if the date is strictly before today and the todo is not completed, append a subtle “(Overdue)” badge or style.

7. Tests

- `src/__tests__/TodoModal.test.tsx`
  - Update mocks/initial values to include `dueDate` where applicable.
  - Add tests asserting the date field renders and that submitting in create mode calls `addTodo` with a third param when a date is selected, or without it when cleared.
  - For edit mode, verify the picker initializes with the existing due date, can be changed, and can be cleared, and that `editTodo` is called with `dueDate` accordingly.
  - Add a test for invalid date handling (block submit and show error). For practicality, you may simulate user input in the text field rendered by the DatePicker or mock DatePicker to control values.

- `src/__tests__/TodoItem.test.tsx`
  - Add a case where a todo includes a `dueDate` and assert the formatted date string `PP` appears.
  - Add a case for an overdue todo (dueDate < today, completed = false) and assert the overdue indicator is rendered.

8. Persistence

- Current codebase does not implement sessionStorage persistence. No storage updates are required. If a persistence layer is added later, ensure `dueDate` is included in serialization/deserialization and treat malformed values as `undefined`.

### Data / Schema Changes and Migrations

- Data model change: `dueDate?: string` added to `Todo` interface.
- No database migrations; state is in-memory.

### API Contracts and External Integrations

- None. No backend involved. UI dependency on `@mui/x-date-pickers` and `date-fns` only.

### Feature Flags / Config Changes

- None.

### Tests (unit/integration/e2e) and Test Data

- Unit tests updated as described above. No integration/e2e scope at present.
- Use existing test patterns with Testing Library and Vitest.

### Telemetry / Monitoring

- None required. Ensure no console errors during interactions.

### Risks, Edge Cases, Rollback

- **Risks**: Type changes can break consumers; keep `addTodo` backward-compatible. MUI DatePicker can be tricky to test—consider mocking if flaky.
- **Edge Cases**: Invalid or unparsable due dates should be treated as `undefined`. Time zones resolved by client-local formatting via `date-fns`.
- **Rollback**: Revert the code edits and dependency additions. The `Todo` interface change is backward-compatible due to optional field.

### Acceptance Criteria Mapping

- Pick a due date on create: Modal includes a date picker; submit passes ISO string.
- Existing todos unaffected: Optional field; default remains undefined.
- Edit shows current due date and allows change/removal: Modal initializes from existing value; clear allowed.
- Due date shows in list: `TodoItem` displays formatted date when present.
- Validation prevents clearly invalid dates: Modal blocks submit and shows error.
- Persistence: Not applicable in current codebase; if added later, include `dueDate` and maintain backward compatibility for legacy data.
- Tests pass and coverage unchanged or improved: Update/add tests accordingly.

### Execution Checklist

1. Install dependencies: `npm i @mui/x-date-pickers date-fns`
2. Wrap app with `LocalizationProvider` (AdapterDateFns) in `src/App.tsx`
3. Add `dueDate?: string` to `src/types/Todo.ts`
4. Update `addTodo` and `editTodo` in `src/contexts/TodoContext.tsx`
5. Implement DatePicker and validation in `src/components/TodoModal/TodoModal.tsx`
6. Show formatted due date (and optional overdue badge) in `src/components/TodoList/TodoItem.tsx`
7. Update and add unit tests under `src/__tests__`
8. Run tests: `npm test`
