# VedaX

VedaX is an educational web application for learning and practicing Vedic Mathematics.

## Core features

- **16-Sutra curriculum**: A modular practice library covering the full set of sutras.
- **Timed speed arena**: A 60-second challenge for rapid mental calculation.
- **Live leaderboard**: Rankings are read from MongoDB and calculated by the backend.
- **Guest progress**: Guest progress stays on the device until the user signs in.
- **Audio and haptic feedback**: Optional feedback during practice.

## Architecture

```text
frontend/                 React + TypeScript + Vite + Zustand
backend/
  config/                 environment and MongoDB configuration
  controllers/            HTTP request handlers
  middleware/             authentication, validation, security, errors
  models/                 Mongoose schemas and indexes
  routes/                 REST endpoint definitions
  utils/                  tokens, serialization, errors, logging
  validators/             shared Zod request schemas
  services/math/          deterministic generators, solvers, explanations, verification
  docs/                   mathematical engine and contributor guidance
  tests/                  offline API contract and security tests
```

The frontend remains the approved visual baseline. Phase 2 adds the mathematical and learning infrastructure behind it; the existing local gameplay remains compatible until a later migration.

## Requirements

- Node.js `22.23.3` (the version is pinned in `.nvmrc`)
- npm
- MongoDB for local backend runtime; the test suite does not require a running MongoDB instance

## Setup

Install the locked dependencies from the repository root:

```bash
npm ci
npm --prefix frontend ci
npm --prefix backend ci
```

Create local environment files from the committed examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Set `MONGODB_URI` and a long random `JWT_SECRET` in `backend/.env`. Real `.env` files are ignored by Git.

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret; at least 32 characters in production |
| `JWT_EXPIRES_IN` | No | JWT lifetime, default `30d` |
| `NODE_ENV` | No | `development`, `test`, or `production` |
| `PORT` | No | API port, default `5000` |
| `CLIENT_URL` | No | One exact frontend origin |
| `CORS_ORIGINS` | No | Comma-separated exact additional origins |
| `ALLOW_PREVIEW_ORIGINS` | No | Opt-in preview origins in non-production only |
| `BODY_LIMIT` | No | JSON body limit, default `64kb` |

### Frontend (`frontend/.env.local`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | No | Backend API base URL, default `http://localhost:5000/api` |

## Run locally

Start the backend and frontend in separate terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

Or start both with:

```bash
npm run dev
```

The frontend is available at [http://localhost:5173](http://localhost:5173), and the API is available at [http://localhost:5000](http://localhost:5000).

## Checks and tests

The single offline test command is:

```bash
make test
```

It runs the backend API/security suite with Node's built-in test runner. The suite covers signup, duplicate signup, login failures, JWT failures, protected profiles, server-controlled profile fields, leaderboard ranking, malformed requests, safe errors, and logout token revocation.

Run the other project checks with:

```bash
make frontend-typecheck
make frontend-build
make frontend-lint
```

The backend dependency audit is:

```bash
npm --prefix backend audit --omit=dev
```

## API overview

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Liveness; reports whether MongoDB is connected without failing liveness |
| `GET` | `/ready` | Public | Readiness; returns `503` when MongoDB is unavailable |
| `POST` | `/api/auth/signup` | Public | Validate and create an account |
| `POST` | `/api/auth/login` | Public | Validate credentials and return a JWT |
| `GET` | `/api/auth/me` | JWT | Return the authenticated user's safe profile |
| `GET` | `/api/auth/verify` | JWT | Verify the current JWT |
| `POST` | `/api/auth/logout` | JWT | Revoke the current token version |
| `GET` | `/api/user/profile` | JWT | Read the authenticated user's profile |
| `PUT` | `/api/user/profile` | JWT | Update name and avatar/profile image only |
| `POST` | `/api/user/sync` | JWT | Compatibility sync; editable profile fields are accepted, learning outcomes are ignored |
| `GET` | `/api/leaderboard` | Public | Read database-backed rankings; guest score query parameters are not trusted |
| `GET` | `/api/techniques` | Public | Return the stable Vedic technique catalog |
| `POST` | `/api/practice/sessions` | JWT | Start a server-owned question session |
| `POST` | `/api/practice/sessions/:id/attempts` | JWT | Verify an answer against the server-owned question |
| `POST` | `/api/practice/sessions/:id/complete` | JWT | Complete a session and award idempotent server XP |
| `GET` | `/api/progress` | JWT | Return summary, technique mastery, and recommendations |
| `GET` | `/api/challenges/daily` | Public/JWT | Read the UTC server-generated daily challenge |
| `GET` | `/api/learning/learner` | JWT | Return the deterministic learner profile |
| `GET` | `/api/learning/path` | JWT | Return prerequisite-aware next techniques |
| `GET` | `/api/learning/difficulty/:techniqueId` | JWT | Return bounded adaptive difficulty |

Errors use a stable shape while preserving the frontend-compatible top-level `message`:

```json
{
  "success": false,
  "message": "Invalid request",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "fields": { "email": "Enter a valid email address" }
  }
}
```

### Server-controlled progress

XP, level, streak, accuracy, speed, completion counts, challenge scores, badges, and learning histories are server-controlled model fields. The existing `/api/user/sync` route remains so the frozen frontend does not break, but it does not copy those fields from client payloads. A future scoring API should award progress from verified practice/challenge events rather than accepting a client snapshot.

The Phase 2 engine and extension workflow are documented in [docs/mathematical-engine.md](docs/mathematical-engine.md).

## Deployment

### Frontend

Deploy `frontend/` to Netlify or Vercel and set `VITE_API_URL` to the deployed backend API URL, for example `https://vedax-backend.up.railway.app/api`.

### Backend

Railway and Render configurations are included. Set `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, and the exact frontend `CLIENT_URL`. Deployment health checks use `/ready` so a live process with a disconnected database is not marked ready.

### Docker

Build and run the backend image (the image also builds the frozen frontend artifact):

```bash
docker build -t vedax .
docker run --rm -p 5000:5000 --env-file backend/.env vedax
```

## Security notes

- Passwords are hashed with bcrypt and excluded from normal Mongoose queries.
- JWT verification is restricted to HS256, uses token versions for logout revocation, and rejects missing/expired/malformed tokens.
- Helmet, exact CORS allowlisting, JSON body limits, global/API rate limits, auth rate limits, and consistent safe errors are enabled.
- Leaderboards are sorted from persisted backend fields with deterministic tie-breakers; client-provided guest scores are not ranked.
- The previous client-side champion/demo email override has been removed. Privilege decisions belong to the backend role field and authorization middleware.
