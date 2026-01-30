# Learnings - move-animations

## Session: ses_3f44e74f8ffe432VmQtfu6nD7Y (2026-01-29)

### Codebase Conventions

- Animation files are in `src/js/battle/animations/moves/` with categories: physical.ts, special.ts, status.ts, other.ts
- AnimationTestPage component uses Svelte 5 runes syntax
- GSAP is used for all animations with timeline patterns

### Technical Discoveries

- GSAP mock in tests must handle `onComplete` callbacks - simply returning a mock timeline is insufficient
- The `gsap.to()` mock needs to extract and invoke `onComplete` from options:
  ```javascript
  gsap.to: vi.fn().mockImplementation((target, options) => {
    if (options?.onComplete) setTimeout(() => options.onComplete(), 0);
    return mockTimeline;
  })
  ```
- projectileAnimation uses DOM element creation + gsap.to with onComplete for cleanup
- Legacy battle-animations.ts was successfully deleted after migration

## Session: Atlas Orchestrator (2026-01-29) - Final Completion

### Tasks Completed

1. Fixed failing "should handle special moves" test - GSAP mock wasn't invoking onComplete callbacks
2. Marked all 9 task checkboxes as complete in plan
3. Marked Definition of Done checkboxes (5 items)
4. Marked Final Checklist (9 items)

### Verification

- All 26 test files pass (439 tests)
- 2 pre-existing errors in experience.ts (URL fetch issue) - unrelated to animation work
