# VedaX Security Model

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
- API responses do not expose password hashes, JWT secrets, stored expected answers, or internal question solution data before verification.
- The global API limiter and stricter authentication limiter are disabled only in `NODE_ENV=test` so offline tests remain deterministic.

Before enabling server scoring across the UI, migrate each local gameplay surface so it no longer awards local XP or streaks for the same session.
