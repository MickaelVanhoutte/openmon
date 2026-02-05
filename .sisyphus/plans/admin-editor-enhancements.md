# Admin Editor Enhancements

## TL;DR

> **Quick Summary**: Enhance the PokedexManager full-screen editor to allow editing pokemon types, abilities, and move learning details, plus add stats visualization with totals and bar graphs.
>
> **Deliverables**:
>
> - Editable types with dropdown selectors (max 2 types)
> - Editable abilities section with add/remove
> - Stats total display + visual bar graphs
> - Editable move level and learning method
>
> **Estimated Effort**: Quick
> **Parallel Execution**: NO - single task
> **Critical Path**: Task 1 only

---

## Context

### Original Request

User wants to enhance the PokedexManager's full-screen editor to:

1. Edit pokemon types (currently just displayed)
2. Edit pokemon abilities (currently not shown/editable)
3. See stats total and visual bar graphs
4. Edit move level and method of learning

### Current State

- `src/lib/admin/tabs/PokedexManager.svelte` has full-screen editor
- Types are displayed as badges but NOT editable (lines 155-162)
- Abilities are not shown at all
- Stats are editable but no total or visual graph
- Moves show name, type, power but NOT level or method (lines 219-231)

---

## Work Objectives

### Core Objective

Make the pokemon editor more complete by allowing editing of types, abilities, and move details, plus adding stats visualization.

### Concrete Deliverables

- Type editing: Two dropdown selectors for primary/secondary type
- Abilities editing: List with add/remove functionality
- Stats section: Show total (sum of all stats) + horizontal bar graph per stat
- Move editing: Inline editable level and method fields per move

### Must Have

- Dropdown for type selection from 18 standard Pokemon types
- Ability to have 0-2 types (secondary optional)
- Add/remove abilities
- Stats total calculation
- Visual bar representation of stats (max 255 for scale)
- Level input per move (number)
- Method dropdown per move (level-up, machine, egg, tutor, form-change)

### Must NOT Have (Guardrails)

- No type effectiveness editing
- No adding new types to the global list
- No stat EV/IV editing (just base stats)
- No move effects editing

---

## TODOs

- [ ] 1. Enhance PokedexManager Editor

  **What to do**:

  **A. Editable Types Section** (replace lines 155-162):
  - Add two `<select>` dropdowns for type1 and type2
  - Type options: normal, fire, water, electric, grass, ice, fighting, poison, ground, flying, psychic, bug, rock, ghost, dragon, dark, steel, fairy
  - Type2 should have an empty option for single-type pokemon
  - Update `editingPokemon.types` array on change

  **B. Abilities Section** (add new section after Types):
  - Display current abilities as a list
  - Each ability has a remove button
  - Input field + Add button for new abilities
  - Store in `editingPokemon.abilities` array

  **C. Stats Visualization** (enhance lines 165-217):
  - Add `statsTotal` derived value: sum of hp, attack, defense, spAttack, spDefense, speed
  - Display total prominently: "Base Stat Total: 525"
  - Add visual bar for each stat:
    - Bar width = (statValue / 255) \* 100%
    - Color code: HP=green, Attack=red, Defense=orange, SpAtk=blue, SpDef=purple, Speed=pink
  - Keep existing number inputs

  **D. Move Level/Method Editing** (enhance lines 219-231):
  - Add editable `level` input (number, 0-100) per move
  - Add `method` dropdown (level-up, machine, egg, tutor, form-change) per move
  - Update move object on change
  - Show level and method in move item display

  **Must NOT do**:
  - Do not add third type option
  - Do not change move name/type/power editing (keep as display only)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI enhancement with form elements and visualization
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Form controls, visual design, bar charts

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: None
  - **Blocked By**: None

  **References**:

  **File to Modify**:
  - `src/lib/admin/tabs/PokedexManager.svelte` - Full file read above

  **Key Sections**:
  - Lines 155-162: Current types display (replace with dropdowns)
  - Lines 165-217: Current stats section (add total + bars)
  - Lines 219-231: Current moves section (add level/method editing)
  - Lines 110-122: Existing updateStat and removeMove functions (add new handlers)

  **Type Constants to Add**:

  ```typescript
  const ALL_TYPES = [
  	'normal',
  	'fire',
  	'water',
  	'electric',
  	'grass',
  	'ice',
  	'fighting',
  	'poison',
  	'ground',
  	'flying',
  	'psychic',
  	'bug',
  	'rock',
  	'ghost',
  	'dragon',
  	'dark',
  	'steel',
  	'fairy'
  ];
  const LEARN_METHODS = ['level-up', 'machine', 'egg', 'tutor', 'form-change'];
  ```

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Change pokemon type via dropdown
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, editor open for a pokemon
    Steps:
      1. Navigate to: http://localhost:5173/#admin
      2. Click first pokemon to open editor
      3. Find type1 select dropdown
      4. Change value to "fire"
      5. Assert: Type badge updates to show "fire"
      6. Screenshot: .sisyphus/evidence/task-1-type-edit.png
    Expected Result: Type can be changed via dropdown
    Evidence: .sisyphus/evidence/task-1-type-edit.png

  Scenario: Add and remove ability
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, editor open
    Steps:
      1. Find abilities section
      2. Type "Overgrow" in ability input
      3. Click Add button
      4. Assert: "Overgrow" appears in abilities list
      5. Click Remove button on "Overgrow"
      6. Assert: "Overgrow" removed from list
      7. Screenshot: .sisyphus/evidence/task-1-ability-edit.png
    Expected Result: Abilities can be added and removed
    Evidence: .sisyphus/evidence/task-1-ability-edit.png

  Scenario: Stats show total and bars
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, editor open
    Steps:
      1. Find stats section
      2. Assert: "Total:" label visible with number
      3. Assert: Each stat has a visual bar element
      4. Change HP value to 100
      5. Assert: Total updates accordingly
      6. Assert: HP bar width changes
      7. Screenshot: .sisyphus/evidence/task-1-stats-viz.png
    Expected Result: Stats show total and visual bars
    Evidence: .sisyphus/evidence/task-1-stats-viz.png

  Scenario: Edit move level and method
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, editor open for pokemon with moves
    Steps:
      1. Find moves section
      2. Find first move item
      3. Assert: Level input visible
      4. Assert: Method dropdown visible
      5. Change level to 15
      6. Change method to "machine"
      7. Assert: Values persist in UI
      8. Screenshot: .sisyphus/evidence/task-1-move-edit.png
    Expected Result: Move level and method editable
    Evidence: .sisyphus/evidence/task-1-move-edit.png
  ```

  **Commit**: YES
  - Message: `feat(admin): enhance editor with type/ability/stats/move editing`
  - Files: `src/lib/admin/tabs/PokedexManager.svelte`
  - Pre-commit: `npm run test:run`

---

## Commit Strategy

| After Task | Message                                                            | Files                 | Verification     |
| ---------- | ------------------------------------------------------------------ | --------------------- | ---------------- |
| 1          | `feat(admin): enhance editor with type/ability/stats/move editing` | PokedexManager.svelte | npm run test:run |

---

## Success Criteria

### Verification Commands

```bash
npm run test:run     # Expected: All tests pass
```

### Final Checklist

- [ ] Types editable via dropdown (primary + optional secondary)
- [ ] Abilities section with add/remove
- [ ] Stats show total sum
- [ ] Stats have visual bar graphs
- [ ] Move level editable
- [ ] Move method editable via dropdown
- [ ] All existing functionality preserved
