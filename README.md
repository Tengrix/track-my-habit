# Track My Habit

A habit tracking web app with weekly grid views, topic/subtopic organization, and per-day scheduling.

## Tech Stack

- **Next.js 14+** (App Router, TypeScript)
- **shadcn/ui** + Tailwind CSS
- **PostgreSQL** + Prisma ORM
- **Clerk** authentication

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env .env
```

Required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE` — from [Clerk dashboard](https://dashboard.clerk.com)
- `CLERK_SECRET` — from Clerk dashboard
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`

### 3. Database setup

```bash
pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Run migrations (creates tables)
```

### 4. Run development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/page.tsx    # Main dashboard page
│   ├── actions/
│   │   ├── topics.ts           # Topic CRUD server actions
│   │   └── habits.ts           # Habit CRUD + log toggle server actions
│   ├── sign-in/                # Clerk sign-in page
│   ├── sign-up/                # Clerk sign-up page
│   ├── layout.tsx              # Root layout with ClerkProvider
│   └── globals.css             # Tailwind + shadcn theme
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── TopicTree.tsx           # Left sidebar topic tree
│   ├── HabitWeekGrid.tsx       # Weekly habit grid
│   ├── WeekNavigator.tsx       # Week prev/next/today controls
│   ├── CreateTopicDialog.tsx   # Dialog for creating topics/subtopics
│   ├── CreateHabitDialog.tsx   # Dialog for creating habits
│   └── DashboardClient.tsx     # Client orchestration component
├── lib/
│   ├── db.ts                   # Prisma client singleton
│   ├── auth.ts                 # Clerk auth helper
│   ├── utils.ts                # cn() utility
│   └── week.ts                 # Date/week utilities
└── middleware.ts               # Clerk auth middleware
```
