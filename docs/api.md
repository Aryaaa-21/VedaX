# VedaX API Reference

All JSON errors use `{ success: false, message, error: { code, message, fields } }`. Protected routes use the authenticated Bearer JWT and derive the user ID from it.

## Authentication

| Method | Route | Auth | Request | Success |
|---|---|---|---|---|
| POST | `/api/auth/signup` | Public | `{ name, email, password }` | `201` with `{ token, user }` |
| POST | `/api/auth/login` | Public | `{ email, password }` | `200` with `{ token, user }` |
| GET | `/api/auth/me` | JWT | none | Safe user profile |
| GET | `/api/auth/verify` | JWT | none | Safe user profile |
| POST | `/api/auth/logout` | JWT | none | Token revocation confirmation |

Signup requires a 1–80 character name, valid email, and 8–128 character password. Login/signup are rate limited.

## Practice and progress

| Method | Route | Auth | Request |
|---|---|---|---|
| POST | `/api/practice/sessions` | JWT | mode, optional technique IDs, 1–50 questions, difficulty 1–3 |
| POST | `/api/practice/sessions/:id/attempts` | JWT | sequence, answer, response time, hint flag, idempotency key |
| POST | `/api/practice/sessions/:id/complete` | JWT | idempotency key |
| GET | `/api/practice/sessions/:id` | JWT | none |
| GET | `/api/practice/history?limit=N` | JWT | optional bounded limit |
| GET | `/api/progress` | JWT | none |
| GET | `/api/progress/summary` | JWT | none |
| GET | `/api/progress/techniques?techniqueId=...&limit=N` | JWT | optional filters |
| GET | `/api/progress/recommendations` | JWT | none |
| GET | `/api/progress/xp-history?limit=N` | JWT | optional bounded limit |
| GET | `/api/progress/mistakes?limit=N` | JWT | optional bounded limit |

The attempt response reports correctness and, for an incorrect answer, a structured explanation. It never returns the expected answer as a field.

## Challenges and techniques

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/challenges/daily` | Optional JWT | Read date/version metadata and own completion |
| POST | `/api/challenges/daily/start` | JWT | Start the server-generated daily session |
| POST | `/api/challenges/daily/:sessionId/complete` | JWT | Complete through the server-owned session |
| GET | `/api/challenges/history?limit=N` | JWT | Read own completed challenge sessions |
| GET | `/api/techniques` | Public | Stable catalog metadata |
| GET | `/api/techniques/:techniqueId` | Public | One catalog entry |
| GET | `/api/learning/learner` | JWT | Deterministic learner profile |
| GET | `/api/learning/path` | JWT | Prerequisite-aware next techniques |
| GET | `/api/learning/difficulty/:techniqueId` | JWT | Server-derived bounded difficulty |

## User, leaderboard, and health

`GET/PUT /api/user/profile` reads or updates only editable profile fields. `POST /api/user/sync` is a compatibility endpoint and ignores learning outcomes. `GET /api/leaderboard` reads persisted server rankings. `/health` is liveness; `/ready` requires MongoDB.
