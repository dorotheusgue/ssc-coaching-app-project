# Active Context: SSC Coaching App

## Current State

**App Status**: ✅ Exercise Library & Program Builder implemented

Dark theme with neutral-900 base, neutral-800 cards, emerald-500 accent.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript, Tailwind CSS 4, Drizzle ORM (SQLite)
- [x] Auth system (NextAuth credentials, coach/athlete roles)
- [x] Database schema (users, exercises, programs, phases, sessions, blocks, logging, messaging)
- [x] Exercise Library page (`src/app/coach/exercises/page.tsx`) - Server Component with DB fetch
- [x] Exercise Library Client (`src/app/coach/exercises/ExerciseLibraryClient.tsx`) - CRUD, filters, search, modal form
- [x] Programs list page (`src/app/coach/programs/page.tsx`) - Server Component with phase counts
- [x] Program Builder page (`src/app/coach/programs/[id]/page.tsx`) - Server Component fetching full program tree
- [x] Program Builder Client (`src/app/coach/programs/[id]/ProgramBuilderClient.tsx`) - Interactive builder with phases, weekly day columns, blocks, exercise picker
- [x] Program server actions (`src/app/coach/programs/actions.ts`) - CRUD for programs, phases, templates, blocks, block exercises

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/db/schema.ts` | Full DB schema (Drizzle) | ✅ Ready |
| `src/lib/auth.ts` | NextAuth config | ✅ Ready |
| `src/components/ui/Button.tsx` | Button component | ✅ Ready |
| `src/app/coach/exercises/page.tsx` | Exercise library (SSR) | ✅ Ready |
| `src/app/coach/exercises/ExerciseLibraryClient.tsx` | Exercise library (client) | ✅ Ready |
| `src/app/coach/programs/page.tsx` | Programs list (SSR) | ✅ Ready |
| `src/app/coach/programs/actions.ts` | Program server actions | ✅ Ready |
| `src/app/coach/programs/[id]/page.tsx` | Program builder (SSR) | ✅ Ready |
| `src/app/coach/programs/[id]/ProgramBuilderClient.tsx` | Program builder (client) | ✅ Ready |

## Pending

- [ ] API routes for exercise CRUD (`/api/exercises`)
- [ ] Athlete-facing pages (view assigned programs, log workouts)
- [ ] Dashboard charts and analytics

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-03-29 | Exercise library and program builder pages created |
