<script lang="ts">
	import { BIOMES } from '$js/dungeon/biomes';
	import { dungeonContext, type DungeonContext } from '$js/dungeon/dungeon-context';
	import type { GameContext } from '$js/context/gameContext';

	interface Props {
		context: GameContext;
	}

	const { context }: Props = $props();

	// Each biome entry: label + representative floor (first floor of the biome)
	const options = BIOMES.map((b) => ({
		label: b.name,
		floor: b.floorRange[0]
	}));

	let selectedFloor = $state(options[0].floor);

	let dungeonCtx = $state<DungeonContext | undefined>(undefined);
	$effect(() => {
		const unsub = dungeonContext.subscribe((v) => {
			dungeonCtx = v;
		});
		return unsub;
	});

	function jump() {
		if (!dungeonCtx) return;
		context.jumpToFloor(selectedFloor, dungeonCtx);
	}
</script>

<div class="debug-biome-picker">
	<span class="label">Biome</span>
	<select bind:value={selectedFloor}>
		{#each options as opt}
			<option value={opt.floor}>{opt.label} (F{opt.floor})</option>
		{/each}
	</select>
	<button onclick={jump}>Go</button>
</div>

<style lang="scss">
	.debug-biome-picker {
		position: absolute;
		bottom: 8px;
		left: 8px;
		z-index: 20;
		display: flex;
		align-items: center;
		gap: 4px;
		background: rgba(0, 0, 0, 0.65);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		padding: 4px 6px;
		font-family: monospace;
		font-size: 11px;
		color: #fff;
		pointer-events: all;

		.label {
			opacity: 0.6;
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}

		select {
			background: rgba(255, 255, 255, 0.1);
			color: #fff;
			border: 1px solid rgba(255, 255, 255, 0.25);
			border-radius: 3px;
			padding: 1px 4px;
			font-family: inherit;
			font-size: inherit;
			cursor: pointer;

			option {
				background: #1a1a2e;
				color: #fff;
			}
		}

		button {
			background: rgba(255, 255, 255, 0.15);
			color: #fff;
			border: 1px solid rgba(255, 255, 255, 0.3);
			border-radius: 3px;
			padding: 1px 8px;
			font-family: inherit;
			font-size: inherit;
			cursor: pointer;

			&:hover {
				background: rgba(255, 255, 255, 0.28);
			}
		}
	}
</style>
