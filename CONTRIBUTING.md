# Contributing to VedaX

## Setup

Use Node.js `22.23.3` from `.nvmrc`, then run `npm ci`, `npm --prefix frontend ci`, and `npm --prefix backend ci`. Copy the environment examples and configure a local MongoDB URI and development JWT secret.

## Repository structure

- `frontend/`: approved React/Vite UI. Avoid visual or architectural changes.
- `backend/`: Express API, Mongoose models, validators, services, and tests.
- `docs/`: architecture, math, learning, API, security, and release documentation.

## Checks

Run `make test`, `make frontend-typecheck`, `make frontend-lint`, and `make frontend-build` before opening a PR. Backend tests are offline; live MongoDB and deployment checks should be stated separately.

## Pull requests

Use a focused conventional commit (`feat:`, `fix:`, `test:`, `docs:`, `ci:`, or `chore:`). Explain the user-visible result, tests run, security impact, and breaking changes. Never commit `.env`, credentials, generated dependencies, or build output.

## Frontend freeze

The current frontend is approved. Change it only for required backend integration, a real functional/security bug, or production compatibility. Every frontend change must list the file, reason, and why the UI/UX remains unchanged.

## Mathematical changes

New techniques must follow [the technique guide](docs/adding-a-technique.md). A technique is incomplete until its generator, solver, explanation, verification path, deterministic tests, and conventional cross-validation are present.
