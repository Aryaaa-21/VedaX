# Adaptive Learning

Phase 3 adds deterministic learner intelligence behind the frozen frontend.

## Learner profile

`GET /api/learning/learner` returns a calculated learner profile containing:

- overall mastery;
- per-technique mastery and state;
- strengths;
- weaknesses;
- recent accuracy;
- learning consistency;
- recommended difficulty;
- prerequisite gaps.

The profile is derived from `Attempt` and `UserProgress` records. A cached `LearnerProfile` document is refreshed by the profile service; it is not client-editable.

## Mastery states

```text
NOT_STARTED  no attempts
LEARNING     low performance
DEVELOPING   emerging performance
PROFICIENT   sustained >=70 performance
MASTERED     sustained >=90 performance
NEEDS_REVIEW repeated recent failures or overdue weak review
```

Mastery uses accuracy, recent accuracy, response speed, recency, and consecutive errors. The same history always yields the same state.

## Adaptive difficulty

`GET /api/learning/difficulty/:techniqueId` returns a bounded difficulty from 1 to 3.

- At least 80% recent accuracy with reasonable response time gradually increases difficulty.
- Repeated failures lower difficulty by one step.
- Mixed performance preserves the current level.
- Difficulty never jumps by more than one step.

## Prerequisites and learning paths

Prerequisites are explicit in the math technique catalog. The learning path service does not recommend an advanced technique when a prerequisite is below the proficiency threshold.

`GET /api/learning/path` returns mastered techniques, prerequisite gaps, and next available techniques.

## Recommendations and mistakes

Recommendations use measurable signals:

- repeated incorrect attempts;
- low mastery;
- overdue review;
- prerequisite gaps;
- techniques not yet practiced.

Mistakes are grouped by technique, operation, and difficulty through `/api/progress/mistakes`.

## Frontend migration

No Phase 3 frontend migration is performed. Existing local gameplay remains unchanged. A later migration can consume these APIs one surface at a time, but it must disable local reward mutation for any server-authoritative session.
