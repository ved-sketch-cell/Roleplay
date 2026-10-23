# What to build next

Version 0.2 implements accounts, preference discovery, consent-based chat, presence, recovery, reports/moderation, notification delivery, and backup tooling. The next work should make a small private pilot reliable, then connect the remaining product screens to real data.

| Order | Next task | What completion looks like |
| --- | --- | --- |
| 1 | Email verification and session/device controls | Verified mailbox before new connection requests, expiring verification links, a device/session list, revoke-other-sessions, and account abuse protections |
| 1 | Private staging and end-to-end QA | A protected backend-capable host with managed PostgreSQL/Redis, real SMTP configured, mobile/desktop browser tests, concurrent message/refresh tests, rate-limit tests with trusted client IPs, and no public release |
| 1 | Operations and recovery monitoring | Redacted structured logs, error/latency metrics, worker backlog/dead-job alerts, encrypted off-site backup copies, freshness alerts, restore drills, and a deletion ledger replayed before reopening a restored instance |
| 2 | Connect the original mobile app | Replace simulated accounts/chat with the same API/session/consent flows, keep a clear separate preview mode, validate small screens, and sync notification/presence preferences |
| 2 | Small invite-only usability pilot | Observe onboarding, discovery consent, match explanations, accept/decline flows, reports, recovery, and account deletion with a small group. Measure successful conversations, dismiss/block/report rates, failures, and accessibility |
| 2 | Real communities and content | PostgreSQL memberships/roles, community posts/replies/reactions, visibility permissions, cursor pagination, search, and report coverage for content |
| 3 | Media and push notifications | Private object storage with signed URLs/upload limits/scanning, safe avatar processing, verified device push tokens, provider delivery retries, and notification opt-out controls |
| 3 | Recommendation evaluation | A topic taxonomy/synonyms, exposure tracking, diversity controls, cold-start handling, versioned offline evaluation, and opt-in semantic interest embeddings only if they improve observed outcomes |
| 4 | Live voice/video | Dedicated media infrastructure with authenticated room access, consent, blocking, and moderation operations |

I would start with **email verification plus a private staging test**, then connect the original mobile app to this backend. That makes the existing discovery/chat experience usable across devices before adding more product modules.

Keep a modular FastAPI service, PostgreSQL, Redis, and a worker initially. Split services when performance or team ownership creates a concrete reason. Save durable messages/events in PostgreSQL; use Redis for transient presence/fan-out and never as the only message history.

Matching still uses declared preferences with transparent scoring. It does not infer personality, mood, trustworthiness, mental health, or sensitive preferences. If the earlier heat/mood UI is connected later, begin with participant-selected, optional, hideable status rather than presenting an inferred label as a fact about another person. Keep discovery, blocking, and visibility rules as hard constraints even if ranking becomes more advanced.

References: [FastAPI WebSockets](https://fastapi.tiangolo.com/advanced/websockets/), [Redis delivery semantics](https://redis.io/docs/latest/develop/use-cases/pub-sub/), [pgvector project](https://github.com/pgvector/pgvector).
