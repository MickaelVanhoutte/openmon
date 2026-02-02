<script lang="ts">
	import { Hazard, type SideState } from '../../js/battle/battle-field';
	import caltropImg from '../../assets/battle/fx/caltrop.png';
	import poisonCaltropImg from '../../assets/battle/fx/poisoncaltrop.png';
	import rockImg from '../../assets/battle/fx/rock-sprite.png';

	interface Props {
		allySide: SideState;
		enemySide: SideState;
	}

	const { allySide, enemySide }: Props = $props();

	function getHazardLayers(side: SideState, hazard: Hazard): number {
		return side.hazards.get(hazard) || 0;
	}

	function generatePositions(
		count: number,
		isAlly: boolean
	): Array<{ x: number; y: number; delay: number }> {
		const positions = [];
		const baseX = isAlly ? 15 : 60;
		const spreadX = 25;
		const baseY = isAlly ? 75 : 55;

		for (let i = 0; i < count; i++) {
			positions.push({
				x: baseX + Math.random() * spreadX,
				y: baseY + Math.random() * 10,
				delay: i * 0.1
			});
		}
		return positions;
	}
</script>

<div class="hazard-sprites">
	<!-- Ally Side Hazards -->
	{#if getHazardLayers(allySide, Hazard.STEALTH_ROCK) > 0}
		<div class="hazard-group ally stealth-rock">
			{#each generatePositions(3, true) as pos}
				<img
					src={rockImg}
					alt="Stealth Rock"
					class="hazard-sprite rock"
					style="left: {pos.x}%; bottom: {pos.y}%; animation-delay: {pos.delay}s"
				/>
			{/each}
		</div>
	{/if}

	{#if getHazardLayers(allySide, Hazard.SPIKES) > 0}
		{@const layers = getHazardLayers(allySide, Hazard.SPIKES)}
		<div class="hazard-group ally spikes">
			{#each generatePositions(layers * 2, true) as pos}
				<img
					src={caltropImg}
					alt="Spikes"
					class="hazard-sprite caltrop"
					style="left: {pos.x}%; bottom: {pos.y - 5}%; animation-delay: {pos.delay}s"
				/>
			{/each}
		</div>
	{/if}

	{#if getHazardLayers(allySide, Hazard.TOXIC_SPIKES) > 0}
		{@const layers = getHazardLayers(allySide, Hazard.TOXIC_SPIKES)}
		<div class="hazard-group ally toxic-spikes">
			{#each generatePositions(layers * 2, true) as pos}
				<img
					src={poisonCaltropImg}
					alt="Toxic Spikes"
					class="hazard-sprite poison-caltrop"
					style="left: {pos.x}%; bottom: {pos.y - 5}%; animation-delay: {pos.delay}s"
				/>
			{/each}
		</div>
	{/if}

	<!-- Enemy Side Hazards -->
	{#if getHazardLayers(enemySide, Hazard.STEALTH_ROCK) > 0}
		<div class="hazard-group enemy stealth-rock">
			{#each generatePositions(3, false) as pos}
				<img
					src={rockImg}
					alt="Stealth Rock"
					class="hazard-sprite rock"
					style="left: {pos.x}%; bottom: {pos.y}%; animation-delay: {pos.delay}s"
				/>
			{/each}
		</div>
	{/if}

	{#if getHazardLayers(enemySide, Hazard.SPIKES) > 0}
		{@const layers = getHazardLayers(enemySide, Hazard.SPIKES)}
		<div class="hazard-group enemy spikes">
			{#each generatePositions(layers * 2, false) as pos}
				<img
					src={caltropImg}
					alt="Spikes"
					class="hazard-sprite caltrop"
					style="left: {pos.x}%; bottom: {pos.y - 5}%; animation-delay: {pos.delay}s"
				/>
			{/each}
		</div>
	{/if}

	{#if getHazardLayers(enemySide, Hazard.TOXIC_SPIKES) > 0}
		{@const layers = getHazardLayers(enemySide, Hazard.TOXIC_SPIKES)}
		<div class="hazard-group enemy toxic-spikes">
			{#each generatePositions(layers * 2, false) as pos}
				<img
					src={poisonCaltropImg}
					alt="Toxic Spikes"
					class="hazard-sprite poison-caltrop"
					style="left: {pos.x}%; bottom: {pos.y - 5}%; animation-delay: {pos.delay}s"
				/>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	.hazard-sprites {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 3;
	}

	.hazard-group {
		position: absolute;
		width: 100%;
		height: 100%;
	}

	.hazard-sprite {
		position: absolute;
		image-rendering: pixelated;
		animation: dropIn 0.4s ease-out forwards;
		opacity: 0;
		transform: translateY(-50px);

		&.rock {
			width: 24px;
			height: 24px;
			filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.4));
			animation:
				floatRock 3s ease-in-out infinite,
				dropIn 0.4s ease-out forwards;
		}

		&.caltrop {
			width: 20px;
			height: 20px;
			filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
		}

		&.poison-caltrop {
			width: 20px;
			height: 20px;
			filter: drop-shadow(0 0 4px rgba(160, 50, 200, 0.6)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
		}

		&.web {
			width: 60px;
			height: 60px;
			opacity: 0.8;
			filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
		}
	}

	@keyframes dropIn {
		0% {
			opacity: 0;
			transform: translateY(-50px);
		}
		60% {
			opacity: 1;
			transform: translateY(5px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes floatRock {
		0%,
		100% {
			transform: translateY(0) rotate(0deg);
		}
		50% {
			transform: translateY(-8px) rotate(5deg);
		}
	}
</style>
