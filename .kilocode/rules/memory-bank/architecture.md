# System Patterns: SSC Coaching App

## Architecture Overview

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   ├── login/page.tsx            # Login
│   ├── register/page.tsx         # Register
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth API
│   │   ├── messages/[id]/        # Messages API
│   │   └── upload/               # File upload API
│   ├── coach/                    # Coach portal
│   │   ├── layout.tsx            # Sidebar + auth guard
│   │   ├── dashboard/            # KPI dashboard
│   │   ├── athletes/             # Athlete management
│   │   ├── exercises/            # Exercise library
│   │   ├── programs/             # Program builder
│   │   ├── calendar/             # Assignment calendar
│   │   ├── messages/             # Messaging
│   │   └── media/                # Media gallery
│   └── athlete/                  # Athlete portal
│       ├── layout.tsx            # Bottom nav + auth guard
│       ├── today/                # Today view + logging
│       ├── calendar/             # Session calendar
│       ├── messages/             # Messaging
│       └── media/                # Upload + gallery
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── Tabs.tsx
│   │   └── Textarea.tsx
│   └── layout/
│       ├── Sidebar.tsx           # Coach navigation
│       ├── AthleteNav.tsx        # Athlete bottom nav
│       └── Header.tsx            # Top header bar
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── session.ts                # Auth helpers
│   ├── utils.ts                  # Utility functions
│   └── actions/                  # Server actions
│       ├── auth.ts               # Login/register/invite
│       └── sessions.ts           # Session queries
├── db/
│   ├── schema.ts                 # Drizzle schema (19 tables)
│   ├── index.ts                  # Database client
│   ├── migrate.ts                # Migration runner
│   └── seed.ts                   # Seed data
```

## Key Design Patterns

### 1. Server Components by Default
All page components are Server Components that fetch data directly from the database. Client components are marked with `"use client"` for interactivity (forms, state, modals).

### 2. Server Actions for Mutations
Form submissions use Next.js Server Actions (`"use server"`) for data mutations. No separate API routes needed for most CRUD operations.

### 3. Dual-Portal Architecture
Coach portal (`/coach/*`) and Athlete portal (`/athlete/*`) share components but have distinct layouts:
- Coach: Sidebar navigation (desktop), hamburger menu (mobile)
- Athlete: Bottom navigation bar, mobile-first design

### 4. Dark Theme
Consistent dark theme using Tailwind:
- Background: `bg-neutral-900`
- Cards: `bg-neutral-800`, `border-neutral-700`
- Text: `text-white`, `text-neutral-300`, `text-neutral-400`
- Accent: `bg-emerald-500`, `text-emerald-400`

### 5. Data Flow
- Pages fetch data via Drizzle ORM in Server Components
- Client components receive data as props
- Server actions handle mutations with `revalidatePath` for cache invalidation

## Database Schema (19 tables)

| Table | Purpose |
|-------|---------|
| users | Base user accounts (coach, athlete, admin) |
| coach_profiles | Coach-specific settings |
| athlete_profiles | Athlete-specific data, linked to coach |
| groups | Named athlete groups |
| group_members | Group membership |
| exercises | Exercise library with categories and tracking types |
| programs | Training programs |
| phases | Program phases/blocks |
| session_templates | Daily session templates within phases |
| session_blocks | Block structure (warmup, sprint, strength, etc.) |
| block_exercises | Exercises within blocks with parameters |
| program_assignments | Program-to-athlete assignments |
| assigned_sessions | Dated session instances |
| set_entries | Logged strength work (sets/reps/weight) |
| sprint_entries | Logged sprint data (distance/time) |
| readiness_entries | Daily wellness check-ins |
| conversations | Coach-athlete message threads |
| messages | Individual messages |
| media | Uploaded files (video/images) |
