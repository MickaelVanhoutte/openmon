# Display Status Effects and Stat Changes Under HP Box

## TL;DR

> **Quick Summary**: Add a new section UNDER the HP box in battle UI showing status effect icons (SVG) and stat changes in "+N" format.
>
> **Deliverables**:
>
> - SVG icons for status effects (BRN, PSN, PAR, SLP, FRZ, TOX, CNF)
> - New UI section under HP bar for both AllyInfo and EnemyInfo
> - Stat changes displayed as "atk +2" format instead of multipliers
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves

---

## Context

### User Request

Stats changes and status effects are not visually displayed under the HP box. User wants:

1. Status effects shown as SVG icons
2. Stat changes shown as "atk +2" format (not multipliers)
3. Both displayed UNDER the HP box

### Current Implementation

- Status badges exist but are positioned ABOVE the name (lines 101-116 AllyInfo, 74-80 EnemyInfo)
- Stat changes show multipliers like "Atk : 1.50x" (lines 144-157 AllyInfo, 100-113 EnemyInfo)
- No SVG icons for status effects exist

---

## TODOs

- [x] 1. Create SVG icons for status effects

  **What to do**:
  - Create directory `src/assets/status/`
  - Create SVG files: brn.svg, psn.svg, par.svg, slp.svg, frz.svg, tox.svg, cnf.svg
  - Each SVG should be 24x24 viewBox, use fill="currentColor"

  **SVG Content**:

  **brn.svg (Burn - flame icon)**:

  ```svg
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2c-1 3-4 5-4 9 0 2.5 1.5 4.5 3 5.5-.5-1-.5-2.5.5-4 1 1.5 2 3 2 5 0 1-.5 2-1.5 2.5 3-1 5-3.5 5-6.5 0-5-3-8-5-11.5z"/>
  </svg>
  ```

  **psn.svg (Poison - skull/droplet)**:

  ```svg
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C9 2 7 4 7 7c0 2 1 3 1 5-2 0-3 1-3 3 0 2.5 2 4 4 4 0 1.5 1.5 3 3 3s3-1.5 3-3c2 0 4-1.5 4-4 0-2-1-3-3-3 0-2 1-3 1-5 0-3-2-5-5-5zm-2 6a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm4 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/>
  </svg>
  ```

  **par.svg (Paralysis - lightning)**:

  ```svg
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 2l3 7H7l4 8-1-5h3l-2-5h2L7 2zm6 0l3 7h-3l4 8-1-5h3l-2-5h2l-6-5z"/>
  </svg>
  ```

  **slp.svg (Sleep - Zzz)**:

  ```svg
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 5h5v2H7.5l2.5 3v2H5V10h2.5L5 7V5zm6 4h5v2h-2.5l2.5 3v2h-5v-2h2.5L11 11V9zm-3 6h5v2h-2.5l2.5 3v2H3v-2h2.5L3 17v-2z"/>
  </svg>
  ```

  **frz.svg (Freeze - snowflake)**:

  ```svg
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11 1v4.07A6 6 0 006.07 10H2v4h4.07A6 6 0 0011 18.93V23h2v-4.07A6 6 0 0017.93 14H22v-4h-4.07A6 6 0 0013 5.07V1h-2zm1 7a4 4 0 110 8 4 4 0 010-8z"/>
  </svg>
  ```

  **tox.svg (Badly Poisoned - skull with drip)**:

  ```svg
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C9 2 7 4 7 7c0 2 1 3 1 5-2 0-3 1-3 3 0 2.5 2 4 4 4 0 1.5 1.5 3 3 3s3-1.5 3-3c2 0 4-1.5 4-4 0-2-1-3-3-3 0-2 1-3 1-5 0-3-2-5-5-5zm-2 6a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm4 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm-2 5l2 4h-4l2-4z"/>
  </svg>
  ```

  **cnf.svg (Confused - spiral)**:

  ```svg
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a6 6 0 11-1 11.9V16a4 4 0 10-3-3.9H6a6 6 0 016-6.1z"/>
  </svg>
  ```

  **Acceptance Criteria**:
  - [ ] Directory `src/assets/status/` created
  - [ ] All 7 SVG files created with valid SVG content
  - [ ] SVGs use fill="currentColor" for dynamic coloring

  **Commit**: YES
  - Message: `feat(ui): add SVG icons for status effects`

---

- [x] 2. Update AllyInfo.svelte - Add status/stats section under HP box

  **What to do**:
  1. Add import for inlineSvg at the top:

  ```typescript
  import { inlineSvg } from '@svelte-put/inline-svg';
  ```

  2. Add status icon path mapping in script:

  ```typescript
  const statusIcons: Record<string, string> = {
  	BRN: '/src/assets/status/brn.svg',
  	PSN: '/src/assets/status/psn.svg',
  	PAR: '/src/assets/status/par.svg',
  	SLP: '/src/assets/status/slp.svg',
  	FRZ: '/src/assets/status/frz.svg',
  	'PSN+': '/src/assets/status/tox.svg'
  };
  ```

  3. Change statsFormat to use lowercase abbreviations:

  ```typescript
  const statsFormat: Record<string, string> = {
  	attack: 'atk',
  	defense: 'def',
  	specialAttack: 'spa',
  	specialDefense: 'spd',
  	speed: 'spe',
  	accuracy: 'acc',
  	evasion: 'eva'
  };
  ```

  4. Remove the old `.status` div from inside `.name-lvl` (lines 101-116)

  5. Add NEW section AFTER `.exp` div (after line 142), BEFORE the old stats block:

  ```svelte
  <!-- Status and Stats Section (UNDER HP box) -->
  <div class="status-stats-row">
  	{#if pokemon?.status}
  		<div class="status-icon" style="color: {getStatusColor(pokemon?.status?.abr)}">
  			<svg use:inlineSvg={statusIcons[pokemon?.status?.abr] || ''} width="16" height="16"></svg>
  		</div>
  	{/if}
  	{#if pokemon?.volatiles}
  		{#each displayedVolatiles as vol}
  			{#if pokemon.volatiles.has(vol)}
  				<span class="volatile-icon" style="color: {volatileColors[vol]}"
  					>{volatileLabels[vol]}</span
  				>
  			{/if}
  		{/each}
  	{/if}
  	{#if pokemon?.statsChanges}
  		{#each Object.entries(pokemon.statsChanges) as [stat, value]}
  			{#if statsFormat[stat] && value !== 0}
  				<span class="stat-change" class:positive={value > 0} class:negative={value < 0}>
  					{statsFormat[stat]}
  					{value > 0 ? '+' : ''}{value}
  				</span>
  			{/if}
  		{/each}
  	{/if}
  </div>
  ```

  6. Remove the old `.stats` block (lines 144-157) since it's replaced

  7. Add CSS styles:

  ```scss
  .status-stats-row {
  	display: flex;
  	flex-wrap: wrap;
  	gap: 4px;
  	padding: 2px 4px;
  	min-height: 20px;
  }

  .status-icon {
  	display: flex;
  	align-items: center;
  	justify-content: center;
  	width: 18px;
  	height: 18px;

  	:global(svg) {
  		width: 100%;
  		height: 100%;
  	}
  }

  .volatile-icon {
  	font-size: 10px;
  	font-weight: bold;
  	padding: 1px 3px;
  	border-radius: 2px;
  	background: rgba(0, 0, 0, 0.3);
  }

  .stat-change {
  	font-size: 10px;
  	font-weight: bold;
  	padding: 1px 4px;
  	border-radius: 2px;
  	background: rgba(0, 0, 0, 0.3);

  	&.positive {
  		color: #7eaf53;
  	}

  	&.negative {
  		color: #dc5959;
  	}
  }
  ```

  **Acceptance Criteria**:
  - [ ] inlineSvg imported
  - [ ] statusIcons mapping added
  - [ ] statsFormat uses lowercase (atk, def, spa, spd, spe)
  - [ ] Old .status div removed from .name-lvl
  - [ ] New .status-stats-row added after .exp
  - [ ] Old .stats block removed
  - [ ] CSS styles added
  - [ ] Stat changes show as "atk +2" format

  **Commit**: YES (combined with Task 3)
  - Message: `feat(ui): display status icons and stat changes under HP box`

---

- [x] 3. Update EnemyInfo.svelte - Same changes as AllyInfo

  **What to do**:
  Same changes as Task 2 but for EnemyInfo.svelte:
  1. Add inlineSvg import
  2. Add statusIcons mapping
  3. Change statsFormat to lowercase
  4. Remove old .status div from .name-lvl (lines 74-80)
  5. Add .status-stats-row after .hp-status (after line 99)
  6. Remove old .stats block (lines 100-113)
  7. Add CSS styles

  **Note**: EnemyInfo doesn't have .exp bar, so insert after .hp-status directly

  **Acceptance Criteria**:
  - [ ] Same changes as Task 2 applied
  - [ ] Status icons display correctly
  - [ ] Stat changes show as "atk +2" format

  **Commit**: YES (combined with Task 2)

---

- [x] 4. Test and verify

  **What to do**:
  - Run `npm run check` to verify no TypeScript errors
  - Start dev server `npm run dev`
  - Enter a battle and test:
    - Apply a status effect (burn, poison, etc.)
    - Use stat-changing moves (Agility, Swords Dance, Growl)
    - Verify icons appear under HP box
    - Verify stat changes show as "+2" format

  **Acceptance Criteria**:
  - [ ] No TypeScript errors
  - [ ] Status icons visible under HP box
  - [ ] Stat changes display as "atk +2" format
  - [ ] Colors correct (green for positive, red for negative)

---

## Commit Strategy

| After Task | Message                                                        | Files                             |
| ---------- | -------------------------------------------------------------- | --------------------------------- |
| 1          | `feat(ui): add SVG icons for status effects`                   | src/assets/status/\*.svg          |
| 2+3        | `feat(ui): display status icons and stat changes under HP box` | AllyInfo.svelte, EnemyInfo.svelte |

---

## Success Criteria

### Final Checklist

- [ ] SVG icons created for all major status effects
- [ ] Status section moved from above name to under HP box
- [ ] Stat changes display as "atk +2" not "Atk : 1.50x"
- [ ] Both AllyInfo and EnemyInfo updated
- [ ] No TypeScript errors
