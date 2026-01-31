<script lang="ts">
	import type { PokemonInstance } from '../../../js/pokemons/pokedex';
	import type { BoxSelection } from '../../../js/pokemons/boxes';

	interface Props {
		pokemon?: PokemonInstance;
		isOver: boolean;
		isMoving: boolean;
		isSelected?: boolean;
		movingPokemon?: BoxSelection;
		showMovingPreview: boolean;
		showTitle?: boolean;
		onClick: () => void;
	}

	let {
		pokemon,
		isOver,
		isMoving,
		isSelected = false,
		movingPokemon,
		showMovingPreview,
		showTitle = false,
		onClick
	}: Props = $props();
</script>

<div
	class="entry"
	tabindex="1"
	class:over={isOver}
	class:moving={isMoving}
	class:selected={isSelected}
	onclick={onClick}
	onkeydown={(e) => e.key === 'Enter' && onClick()}
	role="button"
	aria-label={pokemon ? `${pokemon.name} level ${pokemon.level}` : 'Empty slot'}
>
	{#if showMovingPreview && movingPokemon?.selected}
		<img class="moving" src={movingPokemon.selected.getSprite()} alt="moving pokemon" />
	{/if}

	{#if showTitle && pokemon}
		<div class="title show">
			{pokemon.name}
		</div>
	{/if}

	{#if pokemon && !(movingPokemon?.selected === pokemon && movingPokemon.moving)}
		<img src={pokemon.getSprite()} alt={pokemon.name} />
	{/if}

	{#if pokemon && !showTitle}
		<div class="info">
			<span>{pokemon.name}</span>
			<span>({pokemon.level})</span>
		</div>
	{/if}
</div>

<style lang="scss">
	.entry {
		width: 100%;
		aspect-ratio: 1;
		border: 2px solid transparent;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		background: rgba(0, 0, 0, 0.2);
		transition: all 0.15s ease;
		cursor: pointer;

		&:hover,
		&.over {
			background: rgba(255, 215, 0, 0.15);
			border-color: var(--pixel-text-gold);
			box-shadow: inset 0 0 8px rgba(255, 215, 0, 0.3);
		}

		&.selected {
			background: rgba(0, 136, 204, 0.2);
			border-color: var(--pixel-bg-header);
		}

		&.moving {
			opacity: 0.5;
		}

		img {
			width: 80%;
			height: 80%;
			object-fit: contain;
			image-rendering: pixelated;

			&.moving {
				position: absolute;
				opacity: 0.7;
				animation: float 0.5s ease-in-out infinite alternate;
			}
		}

		.title {
			position: absolute;
			top: -20px;
			left: 50%;
			transform: translateX(-50%);
			background: var(--pixel-bg-panel);
			border: 1px solid var(--pixel-border-color);
			padding: 2px 8px;
			font-size: 12px;
			white-space: nowrap;
			opacity: 0;
			transition: opacity 0.2s;

			&.show {
				opacity: 1;
			}
		}

		.info {
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			background: rgba(0, 0, 0, 0.7);
			padding: 2px 4px;
			font-size: 10px;
			display: flex;
			justify-content: space-between;
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
