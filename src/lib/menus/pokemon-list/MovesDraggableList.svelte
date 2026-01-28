<script lang="ts">
	import type { Move } from '../../../js/pokemons/pokedex';
	import { MoveInstance } from '../../../js/pokemons/pokedex';
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import { typeChart } from '../../../js/battle/battle-model';

	export let list: Move[];

	export let finalList: boolean;
	export let removable: boolean;

	function handleDndConsider(e) {
		list = e.detail.items;
	}

	function handleDndFinalize(e) {
		list = finalList
			? e.detail.items.map((item) => {
					return new MoveInstance(
						item.id,
						item.name,
						item.type,
						item.category,
						item.power,
						item.accuracy,
						item.pp,
						item.priority,
						item.target,
						item.effect,
						item.effectChance,
						item.description,
						item.level
					);
				})
			: e.detail.items;
	}

	function remove(index: number) {
		if (!removable || list?.length === 1) return;
		list = list.filter((_, i) => i !== index);
	}
</script>

<div
	class="__wrapper"
	use:dndzone={{
		items: list,
		dropFromOthersDisabled: finalList ? list.length === 4 : false,
		flipDurationMs: 200,
		dragDisabled: finalList ? list.length === 1 : false
	}}
	on:consider={handleDndConsider}
	on:finalize={handleDndFinalize}
>
	{#each list as move, index (move.id)}
		<div class="move draggable" animate:flip={{ duration: 200 }}>
			<span style="--bg:{typeChart[move.type].color}" class="type">{move.type.toUpperCase()}</span>

			<div class="flex-row">
				<div class="flex-col">
					<span class="name">{move.name}</span>
					<span>{move.category === 'no-damage' ? 'status' : move.category}</span>
				</div>

				<div class="flex-col">
					<span>power {move.power ? move.power : '/'}</span>
					<span class="pp">PP {move.pp}</span>
				</div>
			</div>
		</div>
	{/each}
</div>

<style lang="scss">
	.__wrapper {
		display: flex;
		flex-direction: column;
		position: relative;
		gap: 4%;
		padding: 1% 10%;
		height: 100%;
		box-sizing: border-box;
		align-items: flex-end;
		overflow-y: auto;

		scrollbar-width: thin;
		scrollbar-color: #68c0c8 #0e2742f0;

		.move {
			width: 100%;
			height: calc((100dvh - 46px) * 0.21);
			font-size: 22px;

			.name,
			.pp,
			.type {
				font-size: 22px;
			}
		}
	}

	.remove {
		position: absolute;
		top: -10px;
		right: -10px;
		width: 30px;
		height: 30px;
		padding: 0;
		border: 2px solid #000;
		background: #404040;
		color: #ff6b6b;
		border-radius: 0;
		box-shadow: 2px 2px 0 black;
		cursor: pointer;
	}

	.move {
		/* Retro Dark Theme */
		background: #143855;
		border: 2px solid #000;
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
		color: #fff;
		padding: 12px;
		border-radius: 0;
		position: relative;
		height: calc((100% - 4 * 4%) / 4);
		box-sizing: border-box;
		text-shadow: 2px 2px 0 black;
		width: 80%;

		.flex-row {
			gap: 6%;
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			height: 100%;
			width: 100%;
			padding-left: 20%;
			box-sizing: border-box;
		}

		.flex-col {
			display: flex;
			flex-direction: column;
		}

		&.selected {
			border: 3px solid #ffd700;
		}

		.type {
			color: white;
			text-shadow: 1px 1px 1px black;
			background-color: var(--bg);
			border: 2px solid #000;
			box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);
			padding: 4px 8px;
			border-radius: 0;
			font-size: 18px;
			position: absolute;
			top: -10px;
			left: -10px;
		}

		.name {
			font-size: 22px;
			text-transform: uppercase;
		}

		.pp {
			font-size: 22px;
			text-transform: uppercase;
		}
	}
</style>
