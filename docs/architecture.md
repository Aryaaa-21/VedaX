# VedaX Architecture

VedaX is a small monorepo with a frozen React/Vite client and a server-authoritative Express/MongoDB API.

```text
Frozen React frontend
        |
Authenticated REST API
        |
Controllers (HTTP translation)
        |
Services (business rules)
        |
Math and learning engines
        |
MongoDB models, indexes, and authoritative state
```

## Request and learning flow

1. Authentication middleware verifies the JWT, token version, and database-backed user.
2. Validators reject malformed bodies, query strings, and identifiers before controllers run.
3. Controllers pass the authenticated user ID and validated values to services.
4. Practice sessions persist generated questions on the server. Clients submit only answers.
5. The math engine verifies the answer and records an attempt. Scores, XP, mastery, and streaks are derived from persisted events.
6. XP transactions use a user/idempotency key uniqueness constraint to prevent duplicate rewards.
7. Progress and recommendations are calculated from attempts and progress records, not client snapshots.

## Main data boundaries

- `User`: identity, server-owned aggregate XP/level/streak, and editable profile fields.
- `PracticeSession`: server-owned question set, lifecycle, counters, and completion reward marker.
- `Attempt`: one verified answer per session sequence and idempotency key.
- `UserProgress`: per-technique accuracy, response time, mastery, and review date.
- `XPTransaction`: append-only reward ledger with unique idempotency.
- `DailyChallenge`: date/versioned challenge metadata; its session uses the normal practice authority path.

## Concurrency and idempotency

Attempt uniqueness is enforced by MongoDB indexes. Session completion claims an active session with a conditional update before awarding XP. XP awards first create a unique ledger transaction, then update the user aggregate; repeated requests return the existing transaction. Production deployments should use MongoDB replica-set transactions if atomic ledger-plus-user updates are required across infrastructure failures.

## Mathematical verification

Math code is independent of Express. Generators create deterministic questions, solvers independently calculate answers, explanations describe the result, and `generateVerifiedQuestion` throws `CROSS_VALIDATION_FAILED` if generator and solver disagree.
