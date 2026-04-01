---
name: architecture-reviewer
description: Review architecture documentation against repository requirements and feature specifications. Use when the user wants to assess whether docs/architecture.md, ADRs, or related design notes are aligned with product scope, constraints, security, audit, scalability, and operational workflows before implementation.
---

# Architecture review

Use this skill when reviewing architecture documentation for the Student Journey Tracking Application.

## Goal

Assess whether the architecture is aligned with repository requirements, technically coherent for the stated scope, and explicit about important tradeoffs and limitations.

Prioritize:

- requirement coverage gaps,
- contradictions between requirements and architecture,
- missing cross-cutting concerns,
- risky assumptions hidden as settled decisions,
- weak operational or data design choices,
- missing evolution guidance where MVP constraints are intentional.

## Inputs to inspect

Start with the architecture document or ADR named in the request.

Read only the context needed to validate the architecture:

- `docs/requirements.md` for product scope and constraints,
- `docs/architecture.md` for the main design,
- `docs/adr/` entries when they explain or refine decisions,
- `docs/features/` only when confirming feature-specific architecture impact such as RBAC, documents, audit, notifications, reporting, search, performance, reliability, scalability, or security.

## Review workflow

1. Identify the architecture artifact under review and the intended scope, such as MVP or target-state.
2. Cross-check the documented design against the core requirements and stated architecture principles.
3. Evaluate whether the architecture covers:
   - major user workflows,
   - required data domains,
   - role and permission enforcement,
   - audit and compliance controls,
   - document handling,
   - reporting and search needs,
   - operational qualities such as performance, reliability, scalability, and security.
4. Distinguish intentional MVP deferrals from accidental omissions.
5. Check whether major choices are internally coherent:
   - hosting and runtime fit,
   - data store fit,
   - request flow and trust boundaries,
   - module boundaries,
   - environment and deployment assumptions.
6. Review risks in the architecture:
   - unclear ownership of sensitive data,
   - weak authentication or authorization assumptions,
   - unsupported reporting or query expectations,
   - missing background processing needs,
   - vague resilience, retention, or observability plans.
7. Produce findings ordered by severity, then note open questions and concise recommendations.

## Analytical checklist

Use this checklist selectively.

- Scope fit: does the design support the required student journey workflows and roles?
- Data fit: does the data model cover students, stages, tasks, cases, interactions, documents, alerts, risk flags, audit, and reference data?
- Access control: are role enforcement and sensitive document controls explicit enough?
- Audit and compliance: are audit trails, PII protection, and retention responsibilities accounted for?
- Search and reporting: does the chosen storage and query model plausibly support queue views, dashboards, and filters?
- Reliability and performance: are failure handling, concurrency, and scale assumptions reasonable for the stated MVP?
- Security boundaries: are authentication, session handling, and file access checks defined at the right level?
- Operability: is deployment shape clear, and are environment boundaries and future evolution paths sensible?
- Consistency: do architecture terms align with repository language such as student record, journey stage, case, risk flag, and campus worker?

## Output format

Default to a review-style response.

Present:

1. Findings first, ordered by severity, with file references.
2. Open questions or assumptions that need confirmation.
3. A short alignment summary that states whether the architecture is broadly aligned, partially aligned, or materially misaligned.

If no meaningful issues are found, say that explicitly and mention residual risks or unvalidated areas.

## Editing guidance

If the user asks for fixes, update the architecture documentation directly after the review.

Keep the repository's documentation style:

- short sections,
- flat bullet lists,
- direct language,
- names aligned to `docs/requirements.md`.
