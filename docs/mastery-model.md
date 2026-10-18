# Mastery Model

The Phase 3 mastery score is deterministic:

```text
accuracy          70%
recent accuracy   20%
speed score       10%
```

Speed score is bounded from average response time. It contributes to mastery but cannot override poor correctness.

Review intervals are explainable:

```text
mastery >= 90: 30 days
mastery >= 70: 14 days
mastery >= 40: 3 days
otherwise:    1 day
```

Repeated recent failures override the normal state to `NEEDS_REVIEW`.
