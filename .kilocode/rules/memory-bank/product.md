# Product Context: SSC Coaching App

## Why This App Exists

Coaches currently use spreadsheets and generic fitness apps that don't support sprint-specific training needs. This app provides a purpose-built platform for sprint and strength & conditioning coaches, inspired by TeamBuildr's workflow but focused on speed development.

## Problems It Solves

1. **Program Design**: Structured periodization with phases, weekly templates, and daily sessions
2. **Delivery**: Calendar-based assignment so athletes always know what to do
3. **Tracking**: Athletes log sets, reps, weights, and sprint times from their phone
4. **Communication**: In-app messaging eliminates scattered email/text threads
5. **Progress Monitoring**: Dashboard with KPIs, completion rates, and progress graphs

## Key User Experience Goals

- **Coach**: Can create a full 4-week program with 3 phases in under 15 minutes
- **Athlete**: Can log a complete session from their phone in under 5 minutes
- **Both**: Clean, dark-themed interface that works on desktop and mobile

## User Flows

### Coach Flow
1. Login → Dashboard (KPI tiles, quick actions)
2. Create program → Add phases → Add sessions with exercises
3. Assign program to athlete(s) via calendar
4. Monitor completion and progress
5. Message athletes, review uploaded videos

### Athlete Flow
1. Login → Today view
2. Complete readiness check-in (sleep, fatigue, soreness, stress, mood)
3. View today's session with exercise details
4. Log each set/rep/weight or sprint time
5. Mark session complete
6. View calendar, upload training videos, message coach

## What's Built (MVP)

- [x] Authentication (login, register, role-based)
- [x] Coach dashboard with KPI tiles
- [x] Athlete management (list, detail, invite)
- [x] Exercise library (30 default exercises)
- [x] Program builder (phases, sessions, blocks)
- [x] Calendar with program assignment
- [x] Athlete Today view with logging
- [x] Readiness/wellness check-in
- [x] In-app messaging (coach ↔ athlete)
- [x] Media upload and gallery

## Future Features

- Wearable integration (HRV, GPS)
- Advanced analytics (acute:chronic workload, velocity-load profiles)
- Multi-coach organizations
- Payment/billing
