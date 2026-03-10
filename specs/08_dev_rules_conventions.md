# Community Governance Platform — Development Rules & Conventions

# 1. Purpose

This document defines **coding standards, architectural conventions, and development rules** for the Community Governance Platform.

The purpose is to ensure:

- consistent code produced by AI coding agents
- predictable project structure
- maintainable architecture
- minimal technical debt

All contributors and AI agents must follow these conventions.

---

# 2. Core Technology Stack

The project uses the following stack.

Frontend:

```
SvelteKit
TailwindCSS
TypeScript
```

Backend:

```
SvelteKit server routes
Node.js runtime
```

Database:

```
SQLite
Drizzle ORM
```

Authentication:

```
better-auth framework
Wallet login (SIWE style, via better-auth plugin)
Email/password (enabled as baseline)
Session cookies (httpOnly, secure)
```

Hosting:

```
Linux VPS
Plesk
Node server
```

---

# 3. Project Folder Structure

The project must follow this structure.

```
/src

  /routes

  /lib
    /components
    /server
      /db
      /auth
      /events
      /plugins
      /services

  /styles

/drizzle

/static
```

Descriptions:

```
routes      → SvelteKit pages and API endpoints
components  → reusable UI components
server      → backend logic
db          → database schema and queries
auth        → authentication logic
events      → event bus implementation
plugins     → plugin system
services    → core domain logic
```

---

# 4. File Naming Conventions

Use **consistent lowercase file names**.

Examples:

```
proposal-service.ts
vote-service.ts
community-service.ts
```

Component naming:

```
ProposalCard.svelte
VoteOption.svelte
CommunitySidebar.svelte
```

---

# 5. Code Style Rules

General principles:

```
short functions
clear naming
minimal nesting
```

Avoid:

```
large monolithic files
complex abstractions
premature optimization
```

Maximum file size recommendation:

```
300–400 lines
```

---

# 6. Service Layer

All core business logic must live in **services**.

Example services:

```
proposal-service.ts
vote-service.ts
community-service.ts
membership-service.ts
```

Services handle:

```
database access
validation
business logic
```

API routes should remain thin.

---

# 7. API Design Rules

The platform uses **REST APIs**.

Endpoint examples:

```
GET    /api/communities
GET    /api/communities/{id}
POST   /api/proposals
POST   /api/votes
```

General rules:

```
use nouns
avoid verbs
return JSON
```

---

# 8. API Response Format

Successful response:

```
{
  success: true,
  data: {...}
}
```

Error response:

```
{
  success: false,
  error: "message"
}
```

---

# 9. Database Conventions

Database access must use **Drizzle ORM**.

Tables use **snake_case**.

Examples:

```
users
communities
proposals
votes
community_members
```

Column example:

```
created_at
wallet_address
proposal_id
```

---

# 10. Database Migrations

All schema changes must use **Drizzle migrations**.

Migration files stored in:

```
/drizzle
```

Rules:

```
never edit previous migrations
always create new migration
```

---

# 11. Error Handling

Server functions must use structured error handling.

Example pattern:

```
try {

} catch (error) {

  return {
    success: false,
    error: "internal_error"
  }

}
```

Errors should be logged.

---

# 12. Logging

Logging should include:

```
authentication events
proposal creation
vote casting
execution hooks
webhook failures
```

Logs should include timestamps.

---

# 13. Event Emission Rules

Core actions must emit events.

Example:

```
createProposal()
→ emit("proposal.created")
```

Events must be emitted **after successful database writes**.

---

# 14. Plugin Rules

Plugins must:

```
subscribe to events
remain isolated
not modify core governance logic
```

Plugin files stored in:

```
/src/lib/server/plugins
```

---

# 15. Svelte Component Rules

Components must remain **small and reusable**.

Example components:

```
Button
Modal
ProposalCard
VoteOption
```

Rules:

```
no business logic in UI components
props must be typed
```

---

# 16. State Management

Use SvelteKit built-in reactivity.

Avoid large global stores unless necessary.

Preferred patterns:

```
page data
component props
local state
```

---

# 17. Security Rules

Security must be enforced server-side.

Important checks:

```
community membership
proposal permissions
voting eligibility
```

Never trust client-side validation.

---

# 18. Performance Rules

For MVP scale (<10k users), optimize for simplicity.

Avoid premature scaling solutions such as:

```
message queues
microservices
complex caching
```

SQLite is sufficient for the MVP.

---

# 19. Testing Guidelines

Recommended test types:

```
service unit tests
API route tests
critical voting logic tests
```

Testing framework can be added later.

Priority test targets:

```
vote counting
proposal closing
execution hooks
```

---

# 20. Future Scaling Considerations

The architecture should allow migration to:

```
PostgreSQL
separate API server
worker processes
```

The codebase must remain modular enough to support this.

---

End of document.
