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
		border: none;
		background: rgb(220, 231, 233);
		color: #bd4040;
		border-radius: 50%;
	}

	.move {
		background: rgb(220, 231, 233);
		background: linear-gradient(
			180deg,
			rgba(220, 231, 233, 1) 0%,
			rgba(255, 255, 255, 1) 50%,
			rgba(220, 231, 233, 0.713344712885154) 100%
		);
		color: #54506c;
		padding: 12px;
		border-radius: 8px;
		position: relative;
		height: calc((100% - 4 * 4%) / 4);
		box-sizing: border-box;
		text-shadow: none;
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
			border: 3px solid #54506c;
		}

		.type {
			color: white;
			text-shadow: 1px 1px 1px black;
			background-color: var(--bg);
			border-radius: 8px;
			padding: 4px;
			font-size: 22px;
			position: absolute;
			top: -4px;
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
