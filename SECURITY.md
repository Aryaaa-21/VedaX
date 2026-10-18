# Security Policy

## Supported versions

Only the current `main` branch and the latest tagged release receive security fixes.

## Reporting a vulnerability

Do not open a public issue for a vulnerability. Use the repository's private security advisory feature or contact the project maintainers privately with reproduction steps, affected routes/versions, impact, and a suggested mitigation. Do not include real credentials or personal data.

## Security architecture

VedaX uses bcrypt password hashing, HS256 JWT verification with token-version revocation, exact CORS allowlisting, Helmet, bounded JSON bodies, Zod validation, rate limiting, safe error payloads, and ownership queries scoped to the authenticated user.

Learning outcomes are server-authoritative. The server generates and stores questions, verifies submitted answers, records attempts, calculates score/XP/mastery/streak, and uses unique idempotency constraints for rewards. Answer keys are not included in public question or attempt response fields.

Please report suspected authentication bypasses, cross-user access, answer-key disclosure, reward duplication, unsafe mathematical evaluation, secret exposure, or dependency vulnerabilities privately.
