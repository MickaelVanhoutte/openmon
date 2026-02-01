# Floating Pokemon Info - Stats & Status Display

## TL;DR

> **Quick Summary**: Fix FloatingPokemonInfo.svelte to properly display stat changes and status effects with reactive updates
>
> **Deliverables**:
>
> - Reactive stat changes display (ATK+2, DEF-1, etc.)
> - Reactive status effect display (PSN, BRN, PAR, etc.)
> - Modern spatial UI styling matching existing design
>
> **Estimated Effort**: Quick
> **Parallel Execution**: NO - sequential
> **Critical Path**: Task 1 → Task 2

---

## Context

### Original Request

The stats changes and status effects do not appear anymore with the new FloatingPokemonInfo UI component. The user wants them displayed with styling that matches the modern spatial UI design.

### Analysis Findings

- `FloatingPokemonInfo.svelte` has the template code for status and stat changes
- **Status (`statusAbr`)**: Derived but not reactive to polling tick
- **Stat changes (`statChanges`)**: Hardcoded as empty array `const statChanges: StatChange[] = []` - never populated
- The component polls HP changes every 100ms via `hpTick` but doesn't use it for status/stats reactivity
- `AllyInfo.svelte` and `EnemyInfo.svelte` have working implementations that can be referenced

---

## Work Objectives

### Core Objective

Make stat changes and status effects reactive and visible in the FloatingPokemonInfo component.

### Concrete Deliverables

- `src/lib/battle/FloatingPokemonInfo.svelte` updated with reactive stat/status

### Definition of Done

- [ ] Status effects (PSN, BRN, PAR, SLP, FRZ, TOX) display when pokemon has status
- [ ] Stat changes display with +/- indicators and correct colors
- [ ] Updates reactively when status/stats change during battle

### Must NOT Have (Guardrails)

- Do NOT modify HP polling logic (it works)
- Do NOT add unnecessary comments
- Do NOT change the spatial UI styling approach

---

## TODOs

- [ ] 1. Update FloatingPokemonInfo.svelte to make stats and status reactive

  **What to do**:
  - Make `statusAbr` depend on `hpTick` so it re-evaluates when polling detects changes
  - Change `statChanges` from static empty array to `$derived.by()` that reads from `pokemon.statsChanges`
  - Add `statsFormat` mapping (like in AllyInfo.svelte) to convert stat keys to display abbreviations

  **Code changes**:

  Replace lines 56-62:

  ```typescript
  const name = $derived(pokemon.name);
  const level = $derived(pokemon.level);
  const currentHp = $derived(hpTick >= 0 ? pokemon.currentHp : pokemon.currentHp);
  const maxHp = $derived(hpTick >= 0 ? pokemon.currentStats.hp : pokemon.currentStats.hp);
  const gender = $derived(pokemon.gender || 'unknown');
  const statusAbr = $derived(pokemon.status?.abr || null);
  const statChanges: StatChange[] = [];
  ```

  With:

  ```typescript
  const name = $derived(pokemon.name);
  const level = $derived(pokemon.level);
  const currentHp = $derived(hpTick >= 0 ? pokemon.currentHp : pokemon.currentHp);
  const maxHp = $derived(hpTick >= 0 ? pokemon.currentStats.hp : pokemon.currentStats.hp);
  const gender = $derived(pokemon.gender || 'unknown');
  const statusAbr = $derived(hpTick >= 0 ? pokemon.status?.abr || null : null);

  const statsFormat: Record<string, string> = {
  	attack: 'ATK',
  	defense: 'DEF',
  	specialAttack: 'SP.A',
  	specialDefense: 'SP.D',
  	speed: 'SPD'
  };

  const statChanges = $derived.by(() => {
  	if (hpTick < 0) return [];
  	const changes: StatChange[] = [];
  	if (pokemon.statsChanges) {
  		for (const [stat, value] of Object.entries(pokemon.statsChanges)) {
  			if (statsFormat[stat] && value !== 0) {
  				changes.push({ stat: statsFormat[stat], stages: value as number });
  			}
  		}
  	}
  	return changes;
  });
  ```

  **Must NOT do**:
  - Do NOT change the polling interval
  - Do NOT add comments

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 2
  - **Blocked By**: None

  **References**:
  - `src/lib/battle/FloatingPokemonInfo.svelte:56-62` - Current broken implementation
  - `src/lib/battle/AllyInfo.svelte:32-43` - Working statsFormat mapping
  - `src/lib/battle/AllyInfo.svelte:86-89` - Working stats snapshot logic

  **Acceptance Criteria**:
  - [ ] `npm run build` succeeds
  - [ ] `statChanges` is a `$derived.by()` that returns array of StatChange
  - [ ] `statusAbr` derived depends on `hpTick` for reactivity

  **Commit**: YES
  - Message: `fix(battle): make stat changes and status reactive in FloatingPokemonInfo`
  - Files: `src/lib/battle/FloatingPokemonInfo.svelte`

---

- [ ] 2. Extend polling to detect stat and status changes

  **What to do**:
  - Update the polling interval to also check for status and stat changes, not just HP
  - Increment `hpTick` when any of these change

  **Code changes**:

  Replace lines 70-75 in the onMount polling:

  ```typescript
  pollInterval = setInterval(() => {
  	if (pokemon.currentHp !== lastHp) {
  		lastHp = pokemon.currentHp;
  		hpTick++;
  	}
  }, 100);
  ```

  With:

  ```typescript
  let lastStatus = pokemon.status?.abr;
  let lastStatsJson = JSON.stringify(pokemon.statsChanges || {});

  pollInterval = setInterval(() => {
  	const currentStatus = pokemon.status?.abr;
  	const currentStatsJson = JSON.stringify(pokemon.statsChanges || {});

  	if (
  		pokemon.currentHp !== lastHp ||
  		currentStatus !== lastStatus ||
  		currentStatsJson !== lastStatsJson
  	) {
  		lastHp = pokemon.currentHp;
  		lastStatus = currentStatus;
  		lastStatsJson = currentStatsJson;
  		hpTick++;
  	}
  }, 100);
  ```

  **Must NOT do**:
  - Do NOT change polling interval (100ms is fine)
  - Do NOT add unnecessary variables outside the closure

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: None
  - **Blocked By**: Task 1

  **References**:
  - `src/lib/battle/FloatingPokemonInfo.svelte:68-80` - Current onMount with polling
  - `src/lib/battle/AllyInfo.svelte:83-90` - Reference for how AllyInfo handles updates

  **Acceptance Criteria**:
  - [ ] `npm run build` succeeds
  - [ ] Polling checks HP, status, and statsChanges
  - [ ] `hpTick` increments when any of these change

  **Commit**: YES (groups with Task 1)
  - Message: `fix(battle): make stat changes and status reactive in FloatingPokemonInfo`
  - Files: `src/lib/battle/FloatingPokemonInfo.svelte`

---

## Commit Strategy

| After Task | Message                                                                     | Files                      | Verification  |
| ---------- | --------------------------------------------------------------------------- | -------------------------- | ------------- |
| 2          | `fix(battle): make stat changes and status reactive in FloatingPokemonInfo` | FloatingPokemonInfo.svelte | npm run build |

---

## Success Criteria

### Verification Commands

```bash
npm run build  # Expected: Build succeeds
```

### Final Checklist

- [ ] Status chip appears when pokemon has status effect
- [ ] Stat change chips appear with correct +/- values
- [ ] Colors match the spatial UI design (green for buffs, red for debuffs)
- [ ] Updates reactively during battle without page refresh
