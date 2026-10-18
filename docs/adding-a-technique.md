# Adding a Vedic Technique

1. Choose a stable kebab-case ID and never rename it after release.
2. Add catalog metadata and prerequisites in `backend/services/math/techniques/catalog.js`.
3. Add deterministic generation in `backend/services/math/generators/index.js`.
4. Add an independent solver in `backend/services/math/solvers/index.js`.
5. Add structured steps and a final answer in `backend/services/math/explanations/index.js`.
6. Add verification/normalization cases when the technique needs special answer forms.
7. Test normal, boundary, invalid, and all difficulty inputs in `backend/tests/math.test.js`.
8. Cross-validate generated answers against the solver and conventional mathematics.
9. Update `docs/mathematical-engine.md` and the catalog API expectation.

Do not use `eval`, `Function`, dynamic code execution, or a client-provided answer key. The engine must throw `CROSS_VALIDATION_FAILED` rather than silently returning inconsistent mathematics.
