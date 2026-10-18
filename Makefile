.PHONY: install test frontend-typecheck frontend-build frontend-lint build

install:
	npm ci
	npm --prefix frontend ci
	npm --prefix backend ci

test:
	npm --prefix backend test

frontend-typecheck:
	npm --prefix frontend run typecheck

frontend-build:
	npm --prefix frontend run build

frontend-lint:
	npm --prefix frontend run lint

build: frontend-build
