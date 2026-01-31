<script lang="ts">
	import type { GameContext } from '../../js/context/gameContext';
	import { MenuType } from '../../js/context/overworldContext';
	import type { PokemonInstance } from '../../js/pokemons/pokedex';
	import { fade } from 'svelte/transition';

	interface Props {
		context: GameContext;
	}

	const { context }: Props = $props();

	// Use $state + polling $effect to track non-reactive context.player.monsters
	let team = $state<PokemonInstance[]>([...context.player.monsters]);
	let selectedIndex = $state<number | null>(null);
	let menuPos = $state({ x: 0, y: 0, flipUp: false });

	// Poll for team changes (handles box swaps, reordering from other components, etc.)
	$effect(() => {
		const interval = setInterval(() => {
			const currentMonsters = context.player.monsters;
			// Check if team changed (reference or content)
			if (team.length !== currentMonsters.length || team.some((m, i) => m !== currentMonsters[i])) {
				team = [...currentMonsters];
			}
		}, 100);

		return () => clearInterval(interval);
	});

	function openMenu(e: MouseEvent, index: number) {
		e.stopPropagation();
		if (selectedIndex === index) {
			selectedIndex = null;
		} else {
			selectedIndex = index;
			// Position menu to the right of the icon
			const target = e.currentTarget as HTMLElement;
			const rect = target.getBoundingClientRect();

			// Calculate menu height: Summary button + (team.length - 1) move buttons
			// Each button is ~34px (8px padding top + 8px bottom + 14px font + 2px gap)
			const buttonCount = team.length; // Summary + (team.length - 1) move options
			const menuHeight = buttonCount * 36 + 8; // 8px for menu padding

			// Check if menu would overflow bottom of viewport
			const viewportHeight = window.innerHeight;
			const flipUp = rect.top + menuHeight > viewportHeight - 20;

			menuPos = {
				x: rect.right + 10,
				y: flipUp ? rect.bottom : rect.top,
				flipUp
			};
		}
	}

	function closeMenu() {
		selectedIndex = null;
	}

	function viewSummary(index: number) {
		context.overWorldContext.menus.summaryIndex = index;
		context.overWorldContext.openMenu(MenuType.SUMMARY);
		closeMenu();
	}

	function movePokemon(fromIndex: number, toIndex: number) {
		if (toIndex < 0 || toIndex >= team.length) {
			return;
		}

		const newTeam = [...team];
		const temp = newTeam[fromIndex];
		newTeam[fromIndex] = newTeam[toIndex];
		newTeam[toIndex] = temp;

		context.player.monsters = newTeam;

		// Update follower if the first pokemon changed
		if (fromIndex === 0 || toIndex === 0) {
			context.player.setFollower(newTeam[0]);
		}

		closeMenu();
	}

	function handleOutsideClick(e: MouseEvent) {
		if (selectedIndex !== null) {
			const target = e.target as HTMLElement;
			if (!target.closest('.team-panel-menu') && !target.closest('.team-icon')) {
				closeMenu();
			}
		}
	}

	function getHpColor(percent: number): string {
		if (percent > 50) return '#4ade80'; // green
		if (percent > 20) return '#facc15'; // yellow
		return '#ef4444'; // red
	}

	function getHpGradient(monster: PokemonInstance): string {
		const percent = (monster.currentHp / monster.currentStats.hp) * 100;
		const color = getHpColor(percent);
		// Conic gradient starting from top (-90deg), HP portion colored, rest dark
		return `conic-gradient(from -90deg, ${color} ${percent}%, rgba(60, 60, 60, 0.9) ${percent}%)`;
	}
</script>

<svelte:window onclick={handleOutsideClick} />

<div class="team-panel">
	{#each team as monster, i}
		<div class="team-slot">
			<div class="hp-ring" style="background: {getHpGradient(monster)};">
				<button
					class="team-icon"
					class:selected={selectedIndex === i}
					onclick={(e) => openMenu(e, i)}
					title={monster.name}
				>
					<img src={monster.getSprite()} alt={monster.name} />
				</button>
			</div>

			{#if selectedIndex === i}
				<div
					class="team-panel-menu"
					class:flip-up={menuPos.flipUp}
					style="{menuPos.flipUp ? 'bottom' : 'top'}: {menuPos.flipUp
						? window.innerHeight - menuPos.y
						: menuPos.y}px; left: {menuPos.x}px;"
					transition:fade={{ duration: 100 }}
				>
					<button onclick={() => viewSummary(i)}>Summary</button>
					{#each team as _, targetIndex}
						{#if targetIndex !== i}
							<button onclick={() => movePokemon(i, targetIndex)}>
								Move to #{targetIndex + 1}
							</button>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.team-panel {
		position: absolute;
		top: calc(4% + 60px);
		left: max(20px, env(safe-area-inset-left, 20px));
		display: flex;
		flex-direction: column;
		gap: 6px;
		z-index: 7;
		background: var(--pixel-bg-panel);
		border: 2px solid var(--pixel-border-color);
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
		padding: 4px;
	}

	.team-slot {
		position: relative;
		border: 2px solid var(--pixel-border-color);
		height: calc(100dvh / 9);
	}

	.hp-ring {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		padding: 3px;
		box-sizing: border-box;
		transition: transform 0.1s;
	}

	.hp-ring:hover {
		transform: scale(1.1);
	}

	.hp-ring:has(.team-icon.selected) {
		transform: scale(1.1);
		box-shadow: 0 0 8px rgba(242, 114, 65, 0.6);
	}

	.team-icon {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		border: none;
		background-color: rgba(0, 0, 0, 0.7);
		padding: 0;
		cursor: pointer;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.team-icon:hover {
		/* Hover handled by .hp-ring */
	}

	.team-icon.selected {
		/* Selection handled by .hp-ring */
	}

	.team-icon img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		transform: scale(1.5);
	}

	.team-panel-menu {
		position: fixed;
		background-color: rgba(0, 0, 0, 0.8);
		border: 1px solid white;
		padding: 4px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 120px;
		z-index: 100;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
	}

	.team-panel-menu.flip-up {
		flex-direction: column-reverse;
	}

	.team-panel-menu button {
		background: none;
		border: none;
		color: white;
		text-align: left;
		padding: 8px 12px;
		cursor: pointer;
		font-family: inherit;
		font-size: 14px;
	}

	.team-panel-menu button:hover {
		background-color: rgba(255, 255, 255, 0.2);
	}

	/* Mobile landscape */
	@media (max-width: 960px) {
	}
</style>
