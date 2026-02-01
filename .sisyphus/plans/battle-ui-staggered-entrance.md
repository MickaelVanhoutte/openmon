# Battle UI Staggered Entrance Animation

## TL;DR

> **Quick Summary**: Implement coordinated staggered entrance animations for battle UI elements. When a battle starts, HP bars and action buttons should appear in sequence (opponent HP -> ally HP -> action buttons) rather than all at once.
>
> **Deliverables**:
>
> - Modified FloatingPokemonInfo.svelte with GSAP entrance animation + delay prop
> - Modified SplitActionButtons.svelte with delay prop for initial entrance
> - Coordination logic in Battle.svelte for sequenced timing
>
> **Estimated Effort**: Medium
> **Parallel Execution**: NO - sequential (each task builds on previous)
> **Critical Path**: Task 1 -> Task 2 -> Task 3 -> Task 4

---

## Context

### Original Request

When the battle starts, ALL UI elements (action buttons, HP bars, etc.) should appear one by one with a staggered animation sequence, not all at once.

### Interview Summary

**Key Discussions**:

- Current components animate independently based on `spriteReady` state
- FloatingPokemonInfo uses Svelte `fade` transition (line 174)
- SplitActionButtons has GSAP `animateEntrance()` function (lines 170-189)
- No centralized coordination exists

**Research Findings**:

- GSAP is already imported and used in battle animations
- Both HP bars and action buttons wait for `spriteReady` before appearing
- Animation timing should be fast (~900ms total) to keep gameplay snappy

### Metis Review (Self-Conducted)

**Identified Gaps** (addressed):

- Edge case: Button reappearance should NOT stagger (addressed in Task 2 with `isInitialEntrance` flag)
- Edge case: Mid-battle pokemon switch should NOT re-trigger sequence (addressed by flag reset in Task 3)
- Edge case: Window resize during animation (animation completes normally, no re-trigger)

---

## Work Objectives

### Core Objective

Implement coordinated staggered entrance animations for battle UI elements, creating a polished sequential reveal when battles begin.

### Concrete Deliverables

- `src/lib/battle/FloatingPokemonInfo.svelte` - GSAP animation with `entranceDelay` prop
- `src/lib/battle/action-bar/SplitActionButtons.svelte` - `entranceDelay` + `isInitialEntrance` props
- `src/lib/battle/Battle.svelte` - Coordination logic with timing calculations

### Definition of Done

- [ ] Battle starts -> wait ~300ms -> opponent HP bar(s) animate in
- [ ] After opponent HP -> wait ~300ms -> ally HP bar(s) animate in
- [ ] After ally HP -> wait ~300ms -> action buttons animate in with stagger
- [ ] Double battles: Both opponent HP bars appear together, both ally HP bars together
- [ ] When returning from move selector, buttons appear quickly without full stagger
- [ ] `npm run check` passes with no new errors
- [ ] `npm run dev` shows working animation sequence

### Must Have

- Staggered sequence on initial battle load
- Support for both single and double battles
- Quick reappearance (no stagger) when buttons return from being hidden
- GSAP-based animations for consistency

### Must NOT Have (Guardrails)

- DO NOT modify pokemon sprite entry animations
- DO NOT add audio/sound synchronization
- DO NOT change SplitMoveSelector or TargetSelector timing
- DO NOT add complex event bus or pub/sub system
- DO NOT make animations longer than 2 seconds total
- DO NOT add new dependencies

---

## Verification Strategy (MANDATORY)

### Test Decision

- **Infrastructure exists**: YES (Vitest)
- **User wants tests**: Manual verification (UI animation testing)
- **Framework**: Vitest (but manual QA for visual animations)

### Manual Verification Procedure

**For each task, verify by:**

1. **Start dev server**: `npm run dev`
2. **Navigate to battle**: Start new game or load save, trigger wild battle
3. **Observe sequence**: UI elements should appear in order with visible delays
4. **Verify double battle**: Trigger trainer battle with 2v2 if possible

**Evidence to Capture:**

- Terminal output from `npm run check` (no new TypeScript errors)
- Observed sequence timing in browser

---

## Execution Strategy

### Sequential Execution Required

```
Task 1: FloatingPokemonInfo (no dependencies)
    ↓
Task 2: SplitActionButtons (depends: pattern from Task 1)
    ↓
Task 3: Battle.svelte coordination (depends: Tasks 1, 2)
    ↓
Task 4: Testing and refinement (depends: Task 3)
```

### Dependency Matrix

| Task | Depends On  | Blocks | Can Parallelize With |
| ---- | ----------- | ------ | -------------------- |
| 1    | None        | 2, 3   | None                 |
| 2    | 1 (pattern) | 3      | None                 |
| 3    | 1, 2        | 4      | None                 |
| 4    | 3           | None   | None                 |

---

## TODOs

- [ ] 1. Add GSAP entrance animation to FloatingPokemonInfo

  **What to do**:
  - Import `gsap` from 'gsap' at top of script
  - Add `entranceDelay` prop (default: 0) to Props interface
  - Replace Svelte `transition:fade` with GSAP animation
  - Create `animateEntrance()` function that:
    - Sets initial state: opacity 0, y: -20, scale: 0.9
    - Animates to: opacity 1, y: 0, scale: 1
    - Uses `delay: entranceDelay` parameter
    - Duration: 0.3s, ease: 'power2.out'
  - Call `animateEntrance()` when `spriteReady` becomes true
  - Store element reference with `bind:this`

  **Must NOT do**:
  - Don't change the existing positioning logic
  - Don't modify the HP bar update animation
  - Don't add complex timeline management

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Svelte component modification with animation focus
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Animation implementation in Svelte component

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential - Task 1
  - **Blocks**: Tasks 2, 3, 4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/lib/battle/action-bar/SplitActionButtons.svelte:170-189` - GSAP `animateEntrance()` pattern to follow
  - `src/lib/battle/action-bar/SplitMoveSelector.svelte:120-148` - Alternative GSAP entrance pattern

  **File to Modify**:
  - `src/lib/battle/FloatingPokemonInfo.svelte` - Main component (388 lines)
    - Line 2: Add gsap import alongside fade import
    - Line 18: Add `entranceDelay?: number;` to Props interface
    - Line 168: Remove `transition:fade` from div
    - Lines 74-81: Modify `waitForSpritePosition()` to call new animation

  **Acceptance Criteria**:

  **Automated Verification**:

  ```bash
  # Agent runs:
  npm run check 2>&1 | grep -E "(error|Error)" | head -20
  # Assert: No new errors in FloatingPokemonInfo.svelte
  ```

  **Manual Verification** (using dev-browser skill):

  ```
  1. Run: npm run dev
  2. Navigate to: http://localhost:5173
  3. Start battle (load save or new game)
  4. Observe: HP bar should animate in with fade+scale effect
  5. If entranceDelay=0, animation starts immediately when sprite ready
  ```

  **Commit**: YES
  - Message: `feat(battle): add GSAP entrance animation to FloatingPokemonInfo`
  - Files: `src/lib/battle/FloatingPokemonInfo.svelte`
  - Pre-commit: `npm run check`

---

- [ ] 2. Add entrance delay support to SplitActionButtons

  **What to do**:
  - Add `entranceDelay` prop (default: 0) to Props interface
  - Add `isInitialEntrance` prop (default: true) to Props interface
  - Modify `animateEntrance()` to respect `entranceDelay`:
    - If `isInitialEntrance`: use full stagger animation with delay
    - If NOT `isInitialEntrance`: use quick fade-in (0.15s, no stagger)
  - Use `gsap.delayedCall()` or modify animation `delay` parameter

  **Must NOT do**:
  - Don't change button positioning logic
  - Don't modify keyboard navigation
  - Don't change the stagger timing between individual buttons (keep 0.1s)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Animation modification in Svelte component
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: GSAP animation modification

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential - Task 2
  - **Blocks**: Tasks 3, 4
  - **Blocked By**: Task 1 (pattern reference)

  **References**:

  **Pattern References**:
  - `src/lib/battle/action-bar/SplitActionButtons.svelte:170-189` - Current `animateEntrance()` to modify

  **File to Modify**:
  - `src/lib/battle/action-bar/SplitActionButtons.svelte` (323 lines)
    - Lines 6-16: Add new props to Props interface
    - Lines 18-28: Destructure new props with defaults
    - Lines 170-189: Modify `animateEntrance()` to use delay
    - Lines 221-228: Modify the `$effect` that triggers animation to check `isInitialEntrance`

  **Acceptance Criteria**:

  **Automated Verification**:

  ```bash
  # Agent runs:
  npm run check 2>&1 | grep -E "(error|Error)" | head -20
  # Assert: No new errors in SplitActionButtons.svelte
  ```

  **Manual Verification**:

  ```
  1. With entranceDelay=500, buttons should wait 500ms before animating
  2. With isInitialEntrance=false, buttons should fade in quickly without stagger
  ```

  **Commit**: YES
  - Message: `feat(battle): add entrance delay props to SplitActionButtons`
  - Files: `src/lib/battle/action-bar/SplitActionButtons.svelte`
  - Pre-commit: `npm run check`

---

- [ ] 3. Add coordination logic to Battle.svelte

  **What to do**:
  - Add `isInitialBattleEntrance` state variable (initially true)
  - Add `uiEntranceDelays` derived state that calculates timing:
    ```typescript
    const uiEntranceDelays = $derived({
    	opponentHp: 300, // First: opponent HP bars
    	allyHp: 600, // Second: ally HP bars
    	actionButtons: 900 // Third: action buttons
    });
    ```
  - Pass `entranceDelay={uiEntranceDelays.opponentHp}` to opponent FloatingPokemonInfo
  - Pass `entranceDelay={uiEntranceDelays.allyHp}` to ally FloatingPokemonInfo
  - Pass `entranceDelay={uiEntranceDelays.actionButtons}` to ActionBar (which passes to SplitActionButtons)
  - Pass `isInitialEntrance={isInitialBattleEntrance}` to ActionBar
  - Reset `isInitialBattleEntrance = false` after initial animation sequence (use setTimeout ~1500ms)
  - On pokemon switch event, do NOT reset to true (keep false)

  **Must NOT do**:
  - Don't modify sprite loading or entry animation logic
  - Don't change battle context subscriptions
  - Don't add complex event handling

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Component coordination and prop passing
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Svelte state management and component coordination

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential - Task 3
  - **Blocks**: Task 4
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `src/lib/battle/Battle.svelte:382-416` - FloatingPokemonInfo usage to modify
  - `src/lib/battle/Battle.svelte:418-423` - ActionBar usage to modify

  **Files to Modify**:
  - `src/lib/battle/Battle.svelte` (596 lines)
    - Add state after line 53: `let isInitialBattleEntrance = $state(true);`
    - Add derived after line 53: `const uiEntranceDelays = $derived(...)`
    - Lines 382-416: Add entranceDelay props to FloatingPokemonInfo components
    - Lines 418-423: Add entranceDelay and isInitialEntrance props to ActionBar
  - `src/lib/battle/ActionBar.svelte` (1415 lines)
    - Add props to interface and pass through to SplitActionButtons (line 630-646)

  **Acceptance Criteria**:

  **Automated Verification**:

  ```bash
  # Agent runs:
  npm run check 2>&1 | grep -E "(error|Error)" | head -20
  # Assert: No new errors related to Battle.svelte or ActionBar.svelte

  npm run dev &
  sleep 5
  curl -s http://localhost:5173 | grep -q "html" && echo "Dev server running"
  # Assert: Output contains "Dev server running"
  ```

  **Manual Verification** (using dev-browser skill):

  ```
  1. Navigate to: http://localhost:5173
  2. Start new game or load save
  3. Trigger wild pokemon battle
  4. Observe sequence:
     - ~300ms: Opponent HP bar appears
     - ~600ms: Ally HP bar appears
     - ~900ms: Action buttons appear with stagger
  5. Click FIGHT then BACK
  6. Observe: Action buttons reappear quickly (no stagger delay)
  ```

  **Evidence to Capture**:
  - Screenshot after each animation phase
  - Terminal output from npm run check

  **Commit**: YES
  - Message: `feat(battle): add staggered entrance coordination for battle UI`
  - Files: `src/lib/battle/Battle.svelte`, `src/lib/battle/ActionBar.svelte`
  - Pre-commit: `npm run check`

---

- [ ] 4. Test and refine animation timing

  **What to do**:
  - Start dev server and test single battle entrance sequence
  - Test double battle entrance sequence (if accessible)
  - Verify button reappearance is quick (no stagger)
  - Adjust timing constants if needed:
    - If too slow: reduce delays (200ms gaps instead of 300ms)
    - If too fast: increase delays
  - Verify no TypeScript errors with `npm run check`
  - Test pokemon switch doesn't re-trigger full sequence

  **Must NOT do**:
  - Don't change animation easing or visual style
  - Don't add logging or debug statements in final version

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Visual testing and timing refinement
  - **Skills**: [`dev-browser`, `frontend-ui-ux`]
    - `dev-browser`: Browser automation for testing
    - `frontend-ui-ux`: Visual assessment and refinement

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential - Task 4 (final)
  - **Blocks**: None
  - **Blocked By**: Task 3

  **References**:

  **Files Modified in Previous Tasks**:
  - `src/lib/battle/FloatingPokemonInfo.svelte`
  - `src/lib/battle/action-bar/SplitActionButtons.svelte`
  - `src/lib/battle/Battle.svelte`
  - `src/lib/battle/ActionBar.svelte`

  **Acceptance Criteria**:

  **Automated Verification**:

  ```bash
  # Agent runs:
  npm run check
  # Assert: Exit code 0, no errors

  npm run lint
  # Assert: No new lint errors in modified files
  ```

  **Visual Verification** (using playwright skill):

  ```
  1. Navigate to game
  2. Start battle
  3. Record/observe:
     - Total time from battle start to buttons visible: ~1.2-1.5 seconds
     - Clear visual separation between each UI phase
     - Smooth animations, no jank
  4. Test reappearance:
     - Click FIGHT
     - Click BACK
     - Buttons should appear in <0.3 seconds
  ```

  **Commit**: YES (if changes made)
  - Message: `chore(battle): refine UI entrance animation timing`
  - Files: Modified files if timing adjusted
  - Pre-commit: `npm run check && npm run lint`

---

## Commit Strategy

| After Task | Message                                                            | Files                           | Verification                  |
| ---------- | ------------------------------------------------------------------ | ------------------------------- | ----------------------------- |
| 1          | `feat(battle): add GSAP entrance animation to FloatingPokemonInfo` | FloatingPokemonInfo.svelte      | npm run check                 |
| 2          | `feat(battle): add entrance delay props to SplitActionButtons`     | SplitActionButtons.svelte       | npm run check                 |
| 3          | `feat(battle): add staggered entrance coordination for battle UI`  | Battle.svelte, ActionBar.svelte | npm run check                 |
| 4          | `chore(battle): refine UI entrance animation timing`               | Any adjusted files              | npm run check && npm run lint |

---

## Success Criteria

### Verification Commands

```bash
npm run check   # Expected: 0 errors in modified files
npm run lint    # Expected: 0 new lint errors
npm run dev     # Expected: Server starts, battle UI animates correctly
```

### Final Checklist

- [ ] Battle UI elements appear in staggered sequence on battle start
- [ ] Opponent HP bar(s) appear first
- [ ] Ally HP bar(s) appear second
- [ ] Action buttons appear last with internal stagger
- [ ] Double battle groups HP bars by side
- [ ] Button reappearance (from move selector) is quick, not staggered
- [ ] Pokemon switch does NOT re-trigger full animation sequence
- [ ] All TypeScript checks pass
- [ ] No new lint errors
