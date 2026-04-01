# MVP architecture on Cloudflare free tier

## Status

Accepted

## Context

The repository defines a planning-first Student Journey Tracking Application, but the architecture documentation is empty. The MVP needs a concrete technical direction that can be implemented quickly, kept inexpensive, and aligned to the initial product scope.

The application must support:

- operational student record management
- workflow-driven status tracking
- tasks, cases, interactions, and audit history
- basic document uploads
- role-based access control

The requested implementation constraints are:

- Cloudflare services on the free tier
- TypeScript for application code
- Tailwind CSS for the user interface

The main architectural risk at this stage is choosing a design that is too distributed or too infrastructure-heavy for an MVP.

## Decision

Adopt a small edge-hosted architecture built around Cloudflare Pages, Cloudflare Workers, Cloudflare D1, and Cloudflare R2.

The MVP stack is:

- React with TypeScript for the frontend
- Tailwind CSS for UI styling
- Cloudflare Pages for frontend hosting
- A single Cloudflare Worker API written in TypeScript
- Hono as the Worker HTTP framework
- Cloudflare D1 as the primary relational datastore
- Cloudflare R2 for document attachments

The architectural boundaries are:

- Pages serves the single-page application.
- The Worker exposes the application API, enforces authentication, authorization, validation, and audit logging.
- D1 stores relational operational data and configuration reference data.
- R2 stores document binaries with metadata references kept in D1.

The MVP intentionally does not introduce:

- multiple backend services
- a separate analytics warehouse
- a queue or event bus by default
- a custom microservice split

These concerns can be added later if workload, reporting, or background processing needs justify them.

## Consequences

### Positive

- The MVP stays simple to reason about and deploy.
- Operational costs stay low by using Cloudflare-managed services.
- The architecture matches the product's relational workflow needs.
- TypeScript can be shared across frontend and backend models and validation code.
- Tailwind CSS supports fast UI delivery without a heavy component framework decision.

### Negative

- D1-based reporting may need optimization as data volume grows.
- A single Worker can become a scaling or ownership boundary later if the system expands.
- Worker-managed authentication is acceptable for MVP but may need to evolve if institutional SSO becomes mandatory.
- Background processing is intentionally limited until Cloudflare Queues or another async pattern is introduced.

### Follow-up implications

- The implementation plan should assume one frontend app and one API service.
- Schema design in D1 should reflect the feature specifications and audit requirements.
- Future ADRs should cover authentication strategy, schema evolution, and background processing when those areas become implementation priorities.
