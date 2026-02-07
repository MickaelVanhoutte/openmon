<script lang="ts">
	import type { MoveInstance } from '$js/pokemons/pokedex';
	import SplitMoveSelector from './action-bar/SplitMoveSelector.svelte';

	interface Props {
		moves: MoveInstance[];
		disabled: boolean;
		selectedMoveIdx: number | undefined;
		spriteElement: HTMLElement | null;
		onMoveClick: (index: number) => void;
		onCancel: () => void;
		onHover: (idx: number) => void;
		onInfoClick: (idx: number) => void;
		onBack: () => void;
	}

	let {
		moves,
		disabled,
		selectedMoveIdx,
		spriteElement,
		onMoveClick,
		onCancel,
		onHover,
		onInfoClick,
		onBack
	}: Props = $props();
</script>

<button class="back-plate" onclick={onBack} aria-label="Go back to action menu">
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
		<path
			d="M5.82843 6.99955L8.36396 9.53509L6.94975 10.9493L2 5.99955L6.94975 1.0498L8.36396 2.46402L5.82843 4.99955H13C17.4183 4.99955 21 8.58127 21 12.9996C21 17.4178 17.4183 20.9996 13 20.9996H4V18.9996H13C16.3137 18.9996 19 16.3133 19 12.9996C19 9.68584 16.3137 6.99955 13 6.99955H5.82843Z"
		></path>
	</svg>
	<span class="back-label">BACK</span>
</button>

<SplitMoveSelector
	show={true}
	{moves}
	{disabled}
	{selectedMoveIdx}
	{spriteElement}
	{onMoveClick}
	{onCancel}
	{onHover}
	{onInfoClick}
/>

<style lang="scss">
	/* Angular Back Button - Spatial UI Style */
	.back-plate {
		position: absolute;
		bottom: 4%;
		left: 5%;
		padding: 6px 12px;
		transform: skewX(-15deg);
		background-color: #3d365c;
		border: 3px solid #2a224d;
		color: white;
		z-index: 100;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 10px;
		pointer-events: auto;
		overflow: visible;
		box-shadow: none;
		transition:
			transform 0.15s ease,
			border-color 0.15s ease;
	}

	.back-plate::before {
		content: '';
		position: absolute;
		top: -7px;
		right: -7px;
		width: 60%;
		height: 70%;
		background-color: transparent;
		border-top: 3px solid #2a224d;
		border-right: 3px solid #2a224d;
		z-index: -1;
	}

	.back-plate::after {
		content: '';
		position: absolute;
		bottom: -7px;
		left: 3px;
		width: 84%;
		height: 100%;
		background-color: transparent;
		border-bottom: 3px solid #2a224d;
		z-index: -1;
	}

	.back-plate:hover {
		transform: skewX(-15deg) scale(1.08);
		border-color: white;
		box-shadow: 0 0 12px rgba(90, 82, 136, 0.5);
	}

	.back-plate:active {
		transform: skewX(-15deg) scale(0.98);
	}

	.back-plate svg {
		width: 20px;
		height: 20px;
		fill: white;
		transform: skewX(15deg);
		opacity: 0.9;
	}

	.back-label {
		transform: skewX(15deg);
		font-weight: 700;
		letter-spacing: 1.5px;
		text-transform: uppercase;
		color: white;
		text-shadow: none;
	}
</style>
