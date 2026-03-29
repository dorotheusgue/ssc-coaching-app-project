# Project Brief: SSC Coaching App (TeamBuildr-Style)

## Purpose

A web-based strength & speed coaching platform inspired by TeamBuildr, tailored to sprint and S&C (SSC) clients. The app lets coaches design periodized sprint and lifting plans, deliver them to athletes, and track execution and progress via a web and mobile-friendly interface.

## Target Users

- **Coaches**: Create programs, assign athletes to plans, monitor compliance and progress, communicate with athletes.
- **Athletes**: Receive assigned training, log completed work, complete readiness check-ins, upload media, communicate with coach.

## Core Use Case

1. Coach creates periodized programs with phases (e.g., General Prep, Acceleration, MaxV, Taper)
2. Coach assigns programs to athletes via calendar with specific start dates
3. Athletes view daily sessions, log readiness/wellness, log sets/reps/weights and sprint times
4. Coach monitors adherence, completion rates, and athlete progress through dashboard
5. Coach and athlete communicate via in-app messaging

## Key Requirements

### Must Have
- Coach dashboard with KPI tiles (active athletes, completion rates, readiness)
- Athlete management (add/edit, group into squads)
- Exercise library (sprint, plyometric, strength, accessory exercises)
- Program builder with phases/blocks, weekly templates, daily sessions
- Calendar-based assignment of programs to athletes
- Athlete logging (sets/reps/weights, distances, times, RPE)
- Readiness/wellness check-in before sessions
- In-app messaging between coach and athlete
- Media upload for technique review

### Nice to Have
- Wearable integration
- Advanced analytics (velocity-load profiles, sprint Vmax trends)
- Multi-coach organizations
- Payment/billing

## Success Metrics

- Coach can create and assign a full program in under 15 minutes
- Athlete can log a complete session from their phone in under 5 minutes
- Dashboard loads KPI data in under 2 seconds

## Constraints

- Framework: Next.js 16 + React 19 + Tailwind CSS 4
- Database: SQLite with Drizzle ORM (via @kilocode/app-builder-db)
- Auth: NextAuth with credentials provider
- Package manager: Bun
- No external API dependencies for MVP
