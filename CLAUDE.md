# Track My Habit — MVP

You are a senior full-stack engineer. Build an MVP web app called "Track My Habit".

## Tech Stack (must use)

- Next.js 14+ App Router (TypeScript)
- shadcn/ui components + Tailwind
- PostgreSQL
- Prisma ORM
- Clerk authentication

## Core UX

Layout has 3 zones:

### 1) Left Sidebar: Topics Tree

- Topics can have nested subtopics. Each node has a checkbox to select/unselect.
- Selecting a **TOPIC** selects all its subtopics.
- Selecting a **SUBTOPIC** selects only that subtopic.
- The "selected subtopics" state is UI-only (keep it in localStorage and also reflect in URL query param if easy).

### 2) Center: Habit Weekly Grid

For each selected SUBTOPIC render a section/card:

- Title of subtopic
- Weekly grid: columns Mon–Sun, rows = habits under that subtopic.
- Each cell represents that habit's status for that day.
- User can click a cell to toggle Done/Empty.
- Some days are disabled per habit schedule (e.g., weekend off). Disabled cells are not clickable and have a muted style.

### 3) Right Side

Empty for MVP.

## Functional Requirements (MVP)

- Users must be authenticated (Clerk) to create topics/subtopics/habits and to toggle cells.
- Data must be user-scoped using Clerk `userId`.
- **CRUD:**
  - Create Topic (top level)
  - Create Subtopic (child of a topic)
  - Create Habit inside a subtopic with `title` and `activeDays` (days of week the habit is active; inactive days become disabled cells)
- **Weekly view:**
  - Default to current week (Monday start).
  - Provide prev/next week navigation.
  - Fetch habits + logs for that week and render grid.
  - Clicking cell toggles log:
    - If empty → create log with status `DONE`
    - If already `DONE` → delete the log (so "Empty" is absence of a record)
- Empty cells are **not** stored in DB.
- Use server actions OR route handlers. Prefer server actions for mutations.
- Use Zod for validation on server side.

## Database Design (Prisma) — Implement Exactly

### Topic

| Field     | Type     | Notes                                  |
|-----------|----------|----------------------------------------|
| id        | String   | cuid                                   |
| userId    | String   | Clerk userId                           |
| title     | String   |                                        |
| parentId  | String?  | nullable — creates tree (topic/subtopic are the same model) |
| order     | Int      |                                        |
| createdAt | DateTime |                                        |
| updatedAt | DateTime |                                        |

### Habit

| Field      | Type      | Notes                                        |
|------------|-----------|----------------------------------------------|
| id         | String    | cuid                                         |
| userId     | String    | Clerk userId                                 |
| topicId    | String    | points to a subtopic                         |
| title      | String    |                                               |
| activeDays | String[]  | e.g. `["MON","TUE","WED","THU","FRI"]`       |
| order      | Int       |                                               |
| createdAt  | DateTime  |                                               |
| updatedAt  | DateTime  |                                               |

### HabitLog

| Field   | Type     | Notes                          |
|---------|----------|--------------------------------|
| id      | String   | cuid                           |
| habitId | String   |                                |
| date    | DateTime | DATE only                      |
| status  | Enum     | `DONE` (keep only DONE for MVP)|

- Unique index on `(habitId, date)`

## API / Data Fetching

- Efficiently fetch for week range:
  - Get all selected subtopics' habits
  - Get all logs for these `habitId`s where `date` between `startOfWeek` and `endOfWeek`
  - Build a map on the server (or client) to render quickly.
- Ensure authorization checks: `userId` must match on all reads/writes.

## UI Components (shadcn)

- Use: `Button`, `Card`, `Checkbox`, `Input`, `Dialog`, `Separator`, `ScrollArea` (if needed)
- Left tree can be simple nested list with indentation and expand/collapse.
- Add `+ Topic`, `+ Subtopic`, `+ Habit` actions:
  - Can use Dialog modal forms.

## Implementation Details

- Use `date-fns` (or similar) to compute week boundaries and format dates.
- Always treat week start as **Monday**.
- Keep all code in a clean structure:

```
/app/(dashboard)/page.tsx        — main page
/app/actions/*.ts                — server actions
/lib/db.ts                       — Prisma client
/lib/auth.ts                     — Clerk helpers
/components/TopicTree.tsx
/components/HabitWeekGrid.tsx
/components/CreateTopicDialog.tsx
/components/CreateHabitDialog.tsx
/components/WeekNavigator.tsx
```

- Add minimal styling so it looks professional.

## Deliverables

1. A working Next.js app scaffold with Clerk configured (assume env vars exist).
2. Prisma schema + migration instructions.
3. All pages/components/actions necessary to run MVP.
4. Include a short README section: setup steps (`pnpm install`, `prisma migrate`, Clerk envs, `run dev`).

## Constraints

- `.idea/` must always be in `.gitignore`. Never commit IDE config files.
- No Redux. Use React state + server actions.
- Keep it simple and production-like.
- Write real code, not pseudocode.
- Ensure it compiles.

## Output Order

Start by outputting:
1. File tree
2. Then full contents of each file.
