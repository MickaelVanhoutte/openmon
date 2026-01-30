<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { backInOut } from 'svelte/easing';
	import { PokemonInstance } from '../../../js/pokemons/pokedex';
	import PokemonSkillsEdit from './PokemonSkillsEdit.svelte';
	import type { GameContext } from '../../../js/context/gameContext';
	import { typeChart } from '../../../js/battle/battle-model';

	export let context: GameContext;
	export let selected: number;

	export let zIndex: number;
	export let selectedMove: number;
	export let pkmnList: PokemonInstance[];
	//let pkmnList: PokemonInstance[] = context.player.monsters;

	export let moveEdit: boolean;

	let nextZIndex = zIndex + 1;

	let mechanicRegex = /{[^}]*}/g;

	$: selectedMons = pkmnList[selected];
	$: description = selectedMons.moves[selectedMove].description
		?.replace('$effect_chance', String(selectedMons?.moves[selectedMove]?.effectChance))
		?.replace(mechanicRegex, '');

	function getTypeColor(type: string) {
		return typeChart[type as keyof typeof typeChart]?.color || '#000';
	}
</script>

<div
	class="skills"
	style="--zIndex:{zIndex}"
	in:slide={{ duration: 500, delay: 100, axis: 'x', easing: backInOut }}
	out:fade
>
	<div class="img-skillDesc" class:enlarge={moveEdit}>
		<div class="img-wrapper">
			<div class="img-bg">
				<img src={selectedMons.getSprite()} alt="{selectedMons.name} img" />
			</div>
		</div>

		<div class="skillDesc move-description">
			{description}
		</div>
	</div>

	<div class="moves">
		<div class="__wrapper">
			<button class="edit" on:click={() => (moveEdit = !moveEdit)}>
				<span class="svg">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
						><path
							d="M5.33409 4.54491C6.3494 3.63637 7.55145 2.9322 8.87555 2.49707C9.60856 3.4128 10.7358 3.99928 12 3.99928C13.2642 3.99928 14.3914 3.4128 15.1245 2.49707C16.4486 2.9322 17.6506 3.63637 18.6659 4.54491C18.2405 5.637 18.2966 6.90531 18.9282 7.99928C19.5602 9.09388 20.6314 9.77679 21.7906 9.95392C21.9279 10.6142 22 11.2983 22 11.9993C22 12.7002 21.9279 13.3844 21.7906 14.0446C20.6314 14.2218 19.5602 14.9047 18.9282 15.9993C18.2966 17.0932 18.2405 18.3616 18.6659 19.4536C17.6506 20.3622 16.4486 21.0664 15.1245 21.5015C14.3914 20.5858 13.2642 19.9993 12 19.9993C10.7358 19.9993 9.60856 20.5858 8.87555 21.5015C7.55145 21.0664 6.3494 20.3622 5.33409 19.4536C5.75952 18.3616 5.7034 17.0932 5.0718 15.9993C4.43983 14.9047 3.36862 14.2218 2.20935 14.0446C2.07212 13.3844 2 12.7002 2 11.9993C2 11.2983 2.07212 10.6142 2.20935 9.95392C3.36862 9.77679 4.43983 9.09388 5.0718 7.99928C5.7034 6.90531 5.75952 5.637 5.33409 4.54491ZM13.5 14.5974C14.9349 13.7689 15.4265 11.9342 14.5981 10.4993C13.7696 9.0644 11.9349 8.57277 10.5 9.4012C9.06512 10.2296 8.5735 12.0644 9.40192 13.4993C10.2304 14.9342 12.0651 15.4258 13.5 14.5974Z"
						></path></svg
					>
				</span>
			</button>

			{#each selectedMons.moves as move, index}
				<div
					class="move move-card"
					class:selected={index === selectedMove}
					on:click={() => (selectedMove = index)}
				>
					<span style="--bg:{getTypeColor(move.type)}" class="type type-badge"
						>{move.type.toUpperCase()}</span
					>

					<div class="move-grid">
						<div class="flex-col name-col">
							<span class="name" class:long-name={move.name.length > 10}>{move.name}</span>
							<span class="category"
								>{move.category === 'no-damage' ? 'status' : move.category}</span
							>
						</div>

						<div class="move-stats">
							<div class="stat-col">
								<span class="stat-label">PWR</span>
								<span class="stat-value">{move.power ? move.power : '-'}</span>
							</div>
							<div class="stat-col">
								<span class="stat-label">ACC</span>
								<span class="stat-value">{move.accuracy ? move.accuracy : '-'}</span>
							</div>
							<div class="stat-col">
								<span class="stat-label">PP</span>
								<span class="stat-value">{move.currentPp}/{move.pp}</span>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<div class="edit" class:opened={moveEdit}>
	{#if moveEdit}
		<PokemonSkillsEdit bind:context bind:moveEdit bind:selectedMons bind:zIndex={nextZIndex} />
	{/if}
</div>

<style lang="scss">
	.skills {
		height: 100%;
		width: 100%;
		box-sizing: border-box;
		position: relative;
		display: flex;
		flex-direction: row;
		background: rgb(0, 29, 43);
		color: #fff;

		text-shadow: 1px 1px 0 black;
		z-index: var(--zIndex, 11);

		.img-skillDesc {
			display: flex;
			flex-direction: column;
			width: 40%;
			height: 100%;

			&.enlarge {
				.skillDesc {
					height: 0;
					opacity: 0;
					padding: 0;
					border: none;
				}

				.img-wrapper {
					height: 100%;
				}
			}

			.img-wrapper {
				height: 50%;
				width: 100%;
				display: flex;
				flex-direction: column;
				background-color: rgba(44, 56, 69, 0.65);
				justify-content: space-between;

				transition: all 0.5s ease-in-out;

				.img-bg {
					display: flex;
					justify-content: center;
					height: 100%;
					width: 100%;

					img {
						width: auto;
						height: 50%;
						margin: auto;
					}
				}
			}

			.skillDesc {
				height: 50%;
				width: 100%;
				display: flex;
				flex-direction: column;
				box-sizing: border-box;
				color: white;
				justify-content: flex-start;
				align-items: flex-start;
				gap: 10px;

				transition: all 0.5s ease-in-out;

				font-size: 22px;

				/* Move Description */
				background: #1c4b72;
				border: 2px solid #000;
				padding: 12px;
				text-align: left;
			}
		}

		.moves {
			width: 60%;
			height: 100%;
			box-sizing: border-box;
			padding: 1%;
			background-color: rgba(44, 56, 69, 0.3);

			.__wrapper {
				display: flex;
				flex-direction: column;
				position: relative;
				gap: 12px;
				padding: 1% 3%;
				height: 100%;
				box-sizing: border-box;
				align-items: flex-end;

				.edit {
					position: absolute;
					left: 0;
					top: 0;

					background-color: transparent;
					border: none;
					cursor: pointer;
					padding: 0;
					margin: 0;
					width: 20%;
					display: flex;
					flex-direction: row;
					align-items: center;
					justify-content: center;
					font-family: pokemon, serif;
					font-size: 22px;
					text-shadow: 1px 1px 1px black;
					gap: 2%;
					color: white;
					outline: none;
					-webkit-touch-callout: none;
					-webkit-user-select: none;
					-khtml-user-select: none;
					-moz-user-select: none;
					-ms-user-select: none;
					user-select: none;
					-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
					touch-action: pan-x pan-y;

					svg {
						width: 32px;
						height: 32px;
					}
				}
			}
		}
	}

	.move {
		/* Move Card */
		background: #143855;
		border: 2px solid #000;
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
		padding: 12px;
		margin-bottom: 8px;
		border-radius: 0;

		color: #fff;
		position: relative;
		height: calc((100% - 4 * 4%) / 4);
		box-sizing: border-box;
		text-shadow: none;
		width: 80%;
		display: flex;
		align-items: center;

		.move-grid {
			display: grid;
			grid-template-columns: 1fr auto;
			align-items: center;
			width: 100%;
			padding-left: 20%;
			box-sizing: border-box;
			gap: 8px;
		}

		.flex-col {
			display: flex;
			flex-direction: column;
			min-width: 0;

			&.name-col {
				overflow: hidden;
			}
		}

		.move-stats {
			/* Move Stats Layout */
			display: grid;
			grid-template-columns: repeat(3, 60px);
			gap: 4px;
			text-align: right;
			flex-shrink: 0;

			.stat-col {
				display: flex;
				flex-direction: column;
			}

			.stat-label {
				color: #ffffff;
				opacity: 0.7;
				font-size: 12px;
			}
			.stat-value {
				color: #ffffff;
				font-size: 16px;
			}
		}

		&.selected {
			border: 3px solid #ffd700;
		}

		.type {
			/* Type Badges */
			background: var(--bg);
			border: 2px solid #000;
			box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);
			padding: 4px 8px;
			border-radius: 0;

			color: white;
			text-shadow: 1px 1px 0 black;
			font-size: 18px;
			position: absolute;
			top: 50%;
			left: -10px;
			transform: translateY(-50%);
			z-index: 1;
		}

		.name {
			font-size: 20px;
			text-transform: uppercase;
			font-weight: bold;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;

			&.long-name {
				font-size: 16px;
			}
		}

		.category {
			font-size: 16px;
		}

		.pp {
			font-size: 18px;
			text-transform: uppercase;
		}
	}

	/* Tab Navigation */
	.tab.active {
		border-bottom: 3px solid #ffd700;
		color: #ffd700;
	}
</style>
