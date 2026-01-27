<script lang="ts">
	import type { GameContext } from '../../js/context/gameContext';
	import { MenuType } from '../../js/context/overworldContext';
	import { fade } from 'svelte/transition';

	interface Props {
		context: GameContext;
	}

	let { context }: Props = $props();

	let team = $derived(context.player.monsters);
	let selectedIndex = $state<number | null>(null);
	let menuPos = $state({ x: 0, y: 0 });

	function openMenu(e: MouseEvent, index: number) {
		e.stopPropagation();
		if (selectedIndex === index) {
			selectedIndex = null;
		} else {
			selectedIndex = index;
			// Position menu to the right of the icon
			const target = e.currentTarget as HTMLElement;
			const rect = target.getBoundingClientRect();
			menuPos = { x: rect.right + 10, y: rect.top };
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
		if (toIndex < 0 || toIndex >= team.length) return;

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
</script>

<svelte:window onclick={handleOutsideClick} />

<div class="team-panel">
	{#each team as monster, i}
		<div class="team-slot">
			<button
				class="team-icon"
				class:selected={selectedIndex === i}
				onclick={(e) => openMenu(e, i)}
				title={monster.name}
			>
				<img src={monster.getSprite()} alt={monster.name} />
			</button>

			{#if selectedIndex === i}
				<div
					class="team-panel-menu"
					style="top: {menuPos.y}px; left: {menuPos.x}px;"
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
		top: calc(4% + 100px);
		left: 10px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		z-index: 7;
	}

	.team-slot {
		position: relative;
	}

	.team-icon {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: 2px solid white;
		background-color: rgba(0, 0, 0, 0.5);
		padding: 0;
		cursor: pointer;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			transform 0.1s,
			border-color 0.1s;
	}

	.team-icon:hover {
		transform: scale(1.1);
	}

	.team-icon.selected {
		border-color: #f27241;
		transform: scale(1.1);
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
		border-radius: 4px;
		padding: 4px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 120px;
		z-index: 100;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
	}

	.team-panel-menu button {
		background: none;
		border: none;
		color: white;
		text-align: left;
		padding: 6px 12px;
		cursor: pointer;
		font-family: inherit;
		font-size: 14px;
		border-radius: 2px;
	}

	.team-panel-menu button:hover {
		background-color: rgba(255, 255, 255, 0.2);
	}
</style>
