# VedaX Mathematical Engine

Phase 2 adds a backend-owned mathematical engine without changing the approved frontend.

## Architecture

```text
backend/services/math/
  techniques/catalog.js   Stable technique IDs and supported operations
  generators/              Deterministic constrained question generation
  solvers/                 Conventional arithmetic cross-checks
  explanations/            Structured, technique-specific steps
  verification.js          Safe answer normalization and comparison
  index.js                 Public engine API
```

The engine has no Express or MongoDB dependency. It can be used from API routes, practice services, tests, and a future frontend migration.

## Stable catalog

The catalog preserves all 16 IDs already used by the frontend, including:

```text
ekadhikena-purvena
nikhilam-subtraction
sankalana-vyavakalanabhyam
yavadunam
ekanyunena-purvena
vyastisamastih
vertically-crosswise
anurupyena
puranapuranabhyam
sesanyankena-caramena
sopantyadvayamantyam
paravartya-yojayet
sunyam-samyasamuccaye
chalana-kalanabhyam
gunitasamuccayah
gunakasamuccayah
```

The order is stable because the current challenge flow uses technique order as a progression signal.

## Question generation

```js
const question = generateVerifiedQuestion({
  techniqueId: "nikhilam-subtraction",
  seed: "student-session:0",
  difficulty: 2
});
```

Questions contain:

- opaque deterministic ID
- technique ID and operation
- difficulty
- operands and structured metadata
- human-readable prompt
- internal expected answer
- solution data
- structured explanation

The same seed and inputs always generate the same question. The API never sends `expectedAnswer` before an attempt is submitted.

## Verification and safety

The verifier:

- trims whitespace;
- accepts comma-formatted numeric answers;
- accepts equivalent finite numeric representations;
- supports bounded decimal tolerance;
- rejects arbitrary expressions and JavaScript;
- never calls `eval`, `Function`, or a dynamic expression evaluator.

Every generated question is cross-validated by a conventional solver before it is returned by `generateVerifiedQuestion`. A mismatch throws `CROSS_VALIDATION_FAILED` and no answer is returned.

## Supported technique rules

- **Ekadhikena Purvena**: square numbers ending in five.
- **Nikhilam**: multiplication near a power-of-ten base.
- **Sankalana–Vyavakalanabhyam**: generated symmetric linear systems.
- **Yavadunam**: square numbers near a base.
- **Ekanyunena Purvena**: multiplication by 9, 99, and 999.
- **Vyastisamastih**: factor generated quadratics.
- **Urdhva-Tiryagbhyam**: conventional crosswise multiplication verification.
- **Anurupyena**: multiplication around sub-base 50.
- **Puranapuranabhyam**: complete-square equations with the requested positive root.
- **Sesanyankena Caramena**: first non-zero decimal digit of selected unit-fraction denominators.
- **Sopantyadvayamantyam**: generated symmetric rational equations.
- **Paravartya Yojayet**: quotient/remainder identity checks.
- **Sunyam Samyasamuccaye**: generated linear equations.
- **Chalana-Kalanabhyam**: derivative of a quadratic evaluated at a numeric point.
- **Gunitasamuccayah**: coefficient-sum product checks.
- **Gunakasamuccayah**: divisor/quotient coefficient-sum checks.

## Learning infrastructure

The additive backend APIs are:

```text
GET  /api/techniques
GET  /api/techniques/:techniqueId

POST /api/practice/sessions
POST /api/practice/sessions/:sessionId/attempts
POST /api/practice/sessions/:sessionId/complete
GET  /api/practice/sessions/:sessionId
GET  /api/practice/history

GET  /api/progress
GET  /api/progress/summary
GET  /api/progress/techniques
GET  /api/progress/recommendations
GET  /api/progress/xp-history
GET  /api/progress/mistakes

GET  /api/challenges/daily
POST /api/challenges/daily/start
POST /api/challenges/daily/:sessionId/complete
GET  /api/challenges/history
```

Practice attempts are checked against the server-owned question in the session. XP is written through an idempotent XP transaction. Mastery is calculated from attempts, accuracy, recent accuracy, and response time. Streaks require a qualifying completed session and are awarded at most once per UTC day.

Mistake analysis groups incorrect attempts by technique, operation, and difficulty, and also reports average response time and the most recent failure. Recommendations use repeated incorrect attempts as a higher-priority signal.

## Adding a technique

1. Add the stable metadata entry to `backend/services/math/techniques/catalog.js`.
2. Add a constrained generator case.
3. Add a conventional solver case.
4. Add a structured explanation case.
5. Ensure `generateVerifiedQuestion` cross-validates it.
6. Add normal, edge, invalid, and randomized tests to `backend/tests/math.test.js`.
7. Run `npm test` from `backend/`.

Do not add a technique with a generic multiplication fallback. If the mathematics cannot be represented safely yet, fail explicitly with `UNSUPPORTED_OPERATION` and add the implementation before registering it.

## Frontend migration

The frozen frontend continues to use its existing local Zustand gameplay. Phase 2 APIs run additively so the current UI does not change. A later migration can replace one surface at a time, but it must disable local XP awards whenever server scoring is enabled to prevent double rewards.
