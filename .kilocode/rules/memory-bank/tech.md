# Technical Context: SSC Coaching App

## Technology Stack

| Technology   | Version  | Purpose                         |
| ------------ | -------- | ------------------------------- |
| Next.js      | 16.x     | React framework with App Router |
| React        | 19.x     | UI library                      |
| TypeScript   | 5.9.x    | Type-safe JavaScript            |
| Tailwind CSS | 4.x      | Utility-first CSS               |
| Drizzle ORM  | 0.45.x   | Database ORM (SQLite)           |
| NextAuth     | 5.0 beta | Authentication                  |
| Bun          | Latest   | Package manager & runtime       |
| Zod          | 4.x      | Validation                      |
| Recharts     | 3.x      | Charts/graphs                   |
| date-fns     | 4.x      | Date utilities                  |
| lucide-react | 1.7.x    | Icons                           |

## Development Environment

### Commands

```bash
bun install        # Install dependencies
bun dev            # Start dev server (http://localhost:3000)
bun build          # Production build
bun start          # Start production server
bun lint           # Run ESLint
bun typecheck      # Run TypeScript type checking
bun db:generate    # Generate database migrations
bun db:migrate     # Run migrations
bun seed           # Seed database with demo data
```

### Demo Accounts

| Role   | Email               | Password    |
| ------ | ------------------- | ----------- |
| Coach  | coach@example.com   | coach123    |
| Athlete| marcus@example.com  | athlete123  |
| Athlete| sarah@example.com   | athlete123  |
| Athlete| james@example.com   | athlete123  |

## Database

Uses SQLite via `@kilocode/app-builder-db` with Drizzle ORM. Migrations run automatically in the sandbox after push. Schema is in `src/db/schema.ts` with 19 tables covering all entities.

## Security

- Passwords hashed with bcrypt (cost factor 10)
- JWT-based session tokens via NextAuth
- Role-based access control (coach vs athlete)
- Server-side auth checks on all protected pages
- File uploads saved with unique names to prevent collisions
