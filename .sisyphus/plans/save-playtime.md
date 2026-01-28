# Save Game Clock / Play Time Feature

## TL;DR

> **Quick Summary**: Persist total play time (elapsed game clock) across save/load cycles by adding a `playTime` field to SaveContext and tracking accumulated time in GameContext.
>
> **Deliverables**:
>
> - `playTime: number` field in SaveContext (milliseconds)
> - Play time tracking in GameContext
> - Automatic restore of play time when loading a game
> - Time display in World.svelte continues from saved value
>
> **Estimated Effort**: Quick
> **Parallel Execution**: NO - sequential changes
> **Critical Path**: SaveContext schema -> GameContext tracking -> TimeOfDayService restore

---

## Context

### Original Request

"The game clock value should be saved along with the save data and restore when loading a game"

### Research Findings

- **TimeOfDayService** (`src/js/time/time-of-day.ts`): Tracks day/night cycle using `Date.now() - this.startTime`. Currently volatile - resets on each GameContext init.
- **SaveContext** (`src/js/context/savesHolder.ts`): Serializes game state to localStorage. Has `created` and `updated` timestamps but no `playTime`.
- **GameContext** (`src/js/context/gameContext.ts`): Creates new `TimeOfDayService()` on line 112 without passing prior state.
- **World.svelte** (`src/lib/world/World.svelte:335-338`): Displays `formatGameTime($progress)` from TimeOfDayService.

### Current Flow

1. `SaveContext.toGameContext()` creates new GameContext
2. GameContext constructor creates fresh `TimeOfDayService()`
3. TimeOfDayService sets `startTime = Date.now()` - losing all prior progress

### Solution Flow

1. Add `playTime` to SaveContext schema
2. Track accumulated playTime in GameContext
3. Pass saved playTime to TimeOfDayService on restore
4. TimeOfDayService adjusts `startTime` to continue from saved progress

---

## Work Objectives

### Core Objective

Persist and restore the game clock (play time) across save/load operations.

### Concrete Deliverables

- Modified `SaveContext` class with `playTime: number` field
- Modified `SaveContext` constructor to accept `playTime` parameter
- Modified `GameContext.toSaveContext()` to include current play time
- Modified `TimeOfDayService` constructor to accept initial elapsed time
- GameContext passes saved playTime to TimeOfDayService on load

### Definition of Done

- [ ] Save game -> reload page -> load game -> clock continues from saved time
- [ ] New game starts with playTime = 0
- [ ] Time display in World.svelte shows correct accumulated time

### Must Have

- Play time persisted in milliseconds
- Backward compatibility (old saves without playTime default to 0)

### Must NOT Have (Guardrails)

- DO NOT modify the day/night cycle logic (only the elapsed time tracking)
- DO NOT change the UI display format (already handled by `formatGameTime`)
- DO NOT break existing saves (must handle missing `playTime` gracefully)

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: YES (Vitest)
- **User wants tests**: Manual verification sufficient for this feature
- **QA approach**: Manual verification via browser

---

## TODOs

- [x] 1. Add `playTime` field to SaveContext class

  **What to do**:
  - Add `playTime: number = 0;` property to SaveContext class (after `updated`)
  - Add `playTime: number = 0` parameter to constructor (at end, with default)
  - Set `this.playTime = playTime;` in constructor body

  **Must NOT do**:
  - Change the order of existing constructor parameters (would break calls)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file, simple schema addition
  - **Skills**: []
    - No special skills needed for simple TypeScript edit

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential - must complete before task 2
  - **Blocks**: Tasks 2, 3
  - **Blocked By**: None

  **References**:
  - `src/js/context/savesHolder.ts:14-54` - SaveContext class definition
  - `src/js/context/savesHolder.ts:30-41` - Constructor parameters

  **Acceptance Criteria**:
  - [ ] `playTime: number = 0;` property added after line 18
  - [ ] Constructor has `playTime: number = 0` as last parameter
  - [ ] `this.playTime = playTime;` assignment in constructor
  - [ ] `npm run check` passes (no type errors)

  **Commit**: YES
  - Message: `feat(save): add playTime field to SaveContext`
  - Files: `src/js/context/savesHolder.ts`
  - Pre-commit: `npm run check`

---

- [x] 2. Update TimeOfDayService to accept initial elapsed time

  **What to do**:
  - Add `initialElapsedMs?: number` parameter to constructor
  - If provided, adjust `this.startTime` to account for prior elapsed time:
    ```typescript
    this.startTime = Date.now() - (config.initialElapsedMs || 0);
    ```
  - Add getter method `getElapsedMs(): number` that returns `Date.now() - this.startTime`

  **Must NOT do**:
  - Change the day/night cycle calculation logic
  - Modify the progress/gameHour/timeOfDay derived stores

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small additions to existing class
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:
  - `src/js/time/time-of-day.ts:41-43` - Constructor and startTime init
  - `src/js/time/time-of-day.ts:10-18` - DayCycleConfig interface

  **Acceptance Criteria**:
  - [ ] `DayCycleConfig` interface has optional `initialElapsedMs?: number`
  - [ ] Constructor uses `initialElapsedMs` to offset startTime
  - [ ] New `getElapsedMs()` method returns current elapsed time
  - [ ] `npm run check` passes

  **Commit**: YES
  - Message: `feat(time): support initial elapsed time in TimeOfDayService`
  - Files: `src/js/time/time-of-day.ts`
  - Pre-commit: `npm run check`

---

- [x] 3. Wire up GameContext to save/restore playTime

  **What to do**:
  - In GameContext constructor (line ~112), pass saved playTime to TimeOfDayService:
    ```typescript
    this.timeOfDay = new TimeOfDayService({ initialElapsedMs: save.playTime || 0 });
    ```
  - In `toSaveContext()` method (line ~754), add playTime to the SaveContext constructor call:
    ```typescript
    return new SaveContext(
      this.id,
      Date.now(),
      new MapSave(...),
      this.player,
      this.boxes,
      this.settings,
      this.isNewGame,
      this.viewedGuides,
      this.POKEDEX.exportForSave(),
      this.questStates,
      this.flags,
      this.timeOfDay.getElapsedMs()  // Add this as last argument
    );
    ```

  **Must NOT do**:
  - Change parameter order of existing SaveContext constructor call
  - Modify any other GameContext functionality

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Two small edits in one file
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final task)
  - **Blocks**: None
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `src/js/context/gameContext.ts:112` - TimeOfDayService instantiation
  - `src/js/context/gameContext.ts:754-770` - toSaveContext method
  - `src/js/context/savesHolder.ts:30-41` - SaveContext constructor signature

  **Acceptance Criteria**:
  - [ ] TimeOfDayService created with `{ initialElapsedMs: save.playTime || 0 }`
  - [ ] toSaveContext passes `this.timeOfDay.getElapsedMs()` as last arg
  - [ ] `npm run check` passes

  **Commit**: YES
  - Message: `feat(save): persist and restore game clock across saves`
  - Files: `src/js/context/gameContext.ts`
  - Pre-commit: `npm run check`

---

- [ ] 4. Manual Verification

  **What to do**:
  - Start dev server: `npm run dev`
  - Load or create a game
  - Wait for clock to show some time (e.g., 00:05)
  - Save the game (via menu)
  - Refresh browser (F5)
  - Load the saved game
  - Verify clock continues from saved time (not reset to 00:00)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple verification task
  - **Skills**: [`playwright`]
    - `playwright`: Browser automation for verification

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Final verification
  - **Blocks**: None
  - **Blocked By**: Tasks 1, 2, 3

  **Acceptance Criteria**:
  - [ ] Using playwright browser automation:
    - Navigate to: `http://localhost:5173/`
    - Start/load a game, observe clock value
    - Save game via menu
    - Refresh page
    - Load saved game
    - Verify: Clock shows previously saved time (not 00:00)
    - Screenshot: Save evidence to `.sisyphus/evidence/4-clock-restored.png`

  **Commit**: NO

---

## Commit Strategy

| After Task | Message                                                        | Files          | Verification  |
| ---------- | -------------------------------------------------------------- | -------------- | ------------- |
| 1          | `feat(save): add playTime field to SaveContext`                | savesHolder.ts | npm run check |
| 2          | `feat(time): support initial elapsed time in TimeOfDayService` | time-of-day.ts | npm run check |
| 3          | `feat(save): persist and restore game clock across saves`      | gameContext.ts | npm run check |

---

## Success Criteria

### Verification Commands

```bash
npm run check  # Expected: No errors
npm run dev    # Start server for manual testing
```

### Final Checklist

- [ ] playTime field added to SaveContext
- [ ] TimeOfDayService accepts initial elapsed time
- [ ] GameContext wires save/restore correctly
- [ ] Old saves without playTime work (default to 0)
- [ ] Clock continues from saved value after load
