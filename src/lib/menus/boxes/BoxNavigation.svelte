<script lang="ts">
	import type { BoxSelection } from '../../../js/pokemons/boxes';

	interface Props {
		boxName: string;
		isOver: boolean;
		leftHover: boolean;
		rightHover: boolean;
		movingPokemon?: BoxSelection;
		showMovingPreview: boolean;
		onPrev: () => void;
		onNext: () => void;
	}

	const {
		boxName,
		isOver,
		leftHover,
		rightHover,
		movingPokemon,
		showMovingPreview,
		onPrev,
		onNext
	}: Props = $props();
</script>

<div class="box-change" class:over={isOver}>
	<button onclick={onPrev} class:hover={leftHover} aria-label="Previous box">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
			<path
				d="M4.83578 12L11.0429 18.2071L12.4571 16.7929L7.66421 12L12.4571 7.20712L11.0429 5.79291L4.83578 12ZM10.4857 12L16.6928 18.2071L18.107 16.7929L13.3141 12L18.107 7.20712L16.6928 5.79291L10.4857 12Z"
			></path>
		</svg>
	</button>

	{#if showMovingPreview && movingPokemon?.selected}
		<img class="moving" src={movingPokemon.selected.getSprite()} alt="moving pokemon" />
	{/if}

	<span class:hover={isOver}>
		{boxName}
	</span>

	<button onclick={onNext} class:hover={rightHover} aria-label="Next box">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
			<path
				d="M19.1642 12L12.9571 5.79291L11.5429 7.20712L16.3358 12L11.5429 16.7929L12.9571 18.2071L19.1642 12ZM13.5143 12L7.30722 5.79291L5.89301 7.20712L10.6859 12L5.89301 16.7929L7.30722 18.2071L13.5143 12Z"
			></path>
		</svg>
	</button>
</div>

<style lang="scss">
	.box-change {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: clamp(8px, 2vmin, 16px);
		padding: clamp(8px, 2vmin, 16px);
		background: var(--pixel-bg-header);
		border-bottom: 2px solid var(--pixel-border-color);

		button {
			background: transparent;
			border: none;
			color: var(--pixel-text-white);
			cursor: pointer;
			padding: 4px;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: transform 0.15s;

			&:hover,
			&.hover {
				transform: scale(1.2);
			}

			svg {
				width: clamp(24px, 5vmin, 36px);
				height: clamp(24px, 5vmin, 36px);
			}
		}

		span {
			font-size: clamp(18px, 4vmin, 28px);
			font-weight: bold;
			color: var(--pixel-text-white);
			min-width: 120px;
			text-align: center;

			&.hover {
				text-shadow: 0 0 8px var(--pixel-text-gold);
			}
		}

		img.moving {
			position: absolute;
			width: 48px;
			height: 48px;
			opacity: 0.7;
			animation: float 0.5s ease-in-out infinite alternate;
		}

		&.over {
			background: #006699;
			box-shadow: inset 0 0 10px rgba(255, 215, 0, 0.3);
		}
	}

	@keyframes float {
		from {
			transform: translateY(0);
		}
		to {
			transform: translateY(-5px);
		}
	}
</style>
