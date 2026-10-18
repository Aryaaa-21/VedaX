# Phase 3 Security Model

- Learning and progress endpoints require JWT authentication.
- User ownership is checked from the token, not a client-provided user ID.
- Answers are checked against server-owned session questions.
- Correctness, XP, mastery, streak, and score are not accepted from clients.
- Attempts and XP rewards use unique/idempotent keys.
- Active sessions use a partial unique index per user and mode.
- Attempt updates use sequence checks, duplicate recovery, and server-derived minimum elapsed time.
- Technique progress uses optimistic versioning to avoid silent concurrent overwrites.
- Session counts, response times, difficulty, and reward amounts are bounded.
- The math engine never evaluates arbitrary code or expressions.
- The existing `/api/user/sync` compatibility endpoint remains profile-only for server-controlled learning fields.

Before enabling server scoring across the UI, migrate each local gameplay surface so it no longer awards local XP or streaks for the same session.
