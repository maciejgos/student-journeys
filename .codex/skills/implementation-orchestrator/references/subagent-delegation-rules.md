# Subagent delegation rules

Use a subagent only when the main agent is not blocked on the answer immediately and the work can be scoped tightly.

Good delegation targets:

- inspect one code path or document set,
- implement a disjoint file set,
- identify missing tests for a bounded module,
- compare documentation consistency across files.

Bad delegation targets:

- own the whole feature,
- make the final architecture decision,
- write the final user-facing summary,
- update the living ExecPlan on behalf of the main agent.

Every delegated task should name:

- the exact question or output needed,
- the files or area owned by that subagent,
- any constraints about not reverting other edits.
