# Community Governance Platform — Build Instructions for AI Coding Agents

## 1. Purpose

This document defines the **recommended implementation order and development workflow** for building the Community Governance Platform.

AI coding agents should follow these instructions to avoid:

- building components in the wrong order
- introducing architectural inconsistencies
- creating circular dependencies

The system must be implemented **incrementally**, ensuring that each layer works before the next layer is added.

---

# 2. High-Level Implementation Order

The platform must be built in the following order:

```
1. Project initialization
2. Database schema
3. Core backend services
4. Event system
5. Authentication
6. API endpoints
7. Basic frontend
8. Voting interface
9. Plugins and hooks
10. Final UI improvements
```

Each phase must compile and run successfully before moving to the next.

---

# 3. Step 1 — Project Initialization

Create the base project.

Requirements:

```
SvelteKit
TypeScript
TailwindCSS
```

Initial setup tasks:

```
initialize git repository
install dependencies
configure Tailwind
configure TypeScript
```

Project structure must match the specification in:

```
08_dev_rules_conventions.md
```

---

# 4. Step 2 — Database Setup

Install database dependencies.

Required libraries:

```
drizzle-orm
better-sqlite3
```

Create database connection module.

Location:

```
/src/lib/server/db
```

Then implement the database schema.

Tables required for MVP:

```
users
communities
community_members
proposals
proposal_choices
votes
sessions
webhooks
```

Run initial migration.

---

# 5. Step 3 — Core Service Layer

Create service modules inside:

```
/src/lib/server/services
```

Required services:

```
community-service
membership-service
proposal-service
vote-service
```

Responsibilities:

```
business logic
validation
database operations
```

Services must not depend on UI code.

---

# 6. Step 4 — Event System

Implement the event bus.

Location:

```
/src/lib/server/events
```

Core functions:

```
emit(event, payload)
subscribe(event, handler)
```

Then integrate event emission into services.

Examples:

```
proposal-service → emit("proposal.created")
vote-service → emit("vote.cast")
```

---

# 7. Step 5 — Authentication System

Implement wallet-based authentication.

Location:

```
/src/lib/server/auth
```

Components required:

```
nonce generator
signature verification
session management
```

Create session middleware to attach user to requests.

---

# 8. Step 6 — REST API Endpoints

Create API routes in:

```
/src/routes/api
```

Required endpoints:

```
POST /api/auth/login
GET  /api/communities
POST /api/communities
POST /api/proposals
GET  /api/proposals/{id}
POST /api/votes
```

Routes must call service layer functions.

Routes must remain thin.

---

# 9. Step 7 — Basic Frontend

Implement minimal UI pages.

Location:

```
/src/routes
```

Required pages:

```
/
/community/[id]
/proposal/[id]
/create-proposal
```

Initial UI can be minimal.

Focus on functionality first.

---

# 10. Step 8 — Voting Interface

Implement voting UI components.

Components required:

```
ProposalCard
VoteOption
ResultsBar
```

Voting flow:

```
user selects option
submit vote
API call
results update
```

Ensure users cannot vote twice.

---

# 11. Step 9 — Plugin System

Implement plugin loader.

Location:

```
/src/lib/server/plugins
```

Plugin features:

```
event subscriptions
custom logic execution
```

Example plugin:

```
voting analytics plugin
```

---

# 12. Step 10 — Execution Hooks

Implement proposal execution hooks.

Trigger point:

```
proposal closes
```

Supported MVP handler:

```
webhook
```

Flow:

```
proposal closes
results calculated
webhook executed
```

---

# 13. Step 11 — Webhooks

Add webhook delivery system.

Features required:

```
HTTP POST
retry logic
failure logging
```

Trigger webhooks on events such as:

```
proposal.closed
vote.cast
```

---

# 14. Step 12 — UI Improvements

After backend is stable, improve UI.

Tasks:

```
refine layout
improve proposal cards
add loading states
improve mobile responsiveness
```

Avoid major design complexity.

---

# 15. Testing Workflow

Each phase should include tests.

Critical logic tests:

```
vote counting
proposal closing
execution hooks
```

Testing can initially focus on service layer functions.

---

# 16. Manual Test Checklist

Before release, verify the following flows.

```
wallet login works
community creation works
proposal creation works
voting works
proposal closing works
webhooks trigger
```

All flows must work without errors.

---

# 17. MVP Completion Criteria

The MVP is complete when the following are functional:

```
wallet login
community membership
proposal creation
voting
results display
webhooks
```

Plugins and advanced governance features are optional for MVP.

---

# 18. Post-MVP Improvements

After the MVP, the following features can be implemented.

```
additional voting strategies
subgroups
invite-only communities
reputation systems
Offcoin integration
analytics dashboard
```

These should be implemented as extensions using the plugin architecture.

---

End of document.