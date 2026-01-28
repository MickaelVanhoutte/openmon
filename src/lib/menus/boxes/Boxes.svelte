<script lang="ts">
	import { onMount } from 'svelte';
	import { BoxSelection } from '../../../js/pokemons/boxes';
	import { PokemonInstance } from '../../../js/pokemons/pokedex';
	import PokemonSummary from '../pokemon-list/PokemonSummary.svelte';
	import type { GameContext } from '../../../js/context/gameContext';
	import { MenuType } from '../../../js/context/overworldContext';
	import { backInOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';

	let selectZone: 'party' | 'box' | 'box-change' = 'box';
	export let context: GameContext;

	let selectedBox = 0;
	let over: number = 0;

	$: box = context.boxes[selectedBox];
	$: teamSlot = context.player.monsters.concat(
		new Array(6 - context.player.monsters.length).fill(undefined)
	);
	$: pkmnList =
		selectZone === 'box'
			? box.values.filter((p) => p instanceof PokemonInstance)
			: context.player.monsters;
	let isBattle = false;
	let zIndexNext = 10;
	let changeLeftHover = false;
	let changeRightHover = false;
	let previewOpened: boolean = false;
	let hasInteracted: boolean = false;
	let optionsOpened: boolean = false;
	let selectedOption: number = 0;
	let firstSelection: BoxSelection | undefined;
	export let pkmnListSelectedIndex: number = 0;

	let touchStartX = 0;
	let touchEndX = 0;

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.changedTouches[0].screenX;
	}

	function handleTouchEnd(e: TouchEvent) {
		touchEndX = e.changedTouches[0].screenX;
		handleSwipe();
	}

	function handleSwipe() {
		if (touchEndX < touchStartX - 50) {
			nextBox();
		}
		if (touchEndX > touchStartX + 50) {
			prevBox();
		}
	}

	function openOptions(selection: BoxSelection) {
		if (!firstSelection && selection.selected instanceof PokemonInstance) {
			selectZone = selection.zone;
			over = selection.index;
			selectedOption = 0;
			optionsOpened = true;
			firstSelection = selection;
		} else if (
			firstSelection &&
			firstSelection.selected instanceof PokemonInstance &&
			firstSelection.moving
		) {
			swapPokemon(firstSelection, selection);
			optionsOpened = false;
			over = selection.index;
			selectZone = selection.zone;
		} else if (selection.selected instanceof PokemonInstance) {
			optionsOpened = false;
			setTimeout(() => {
				over = selection.index;
				selectZone = selection.zone;
				selectedOption = 0;
				firstSelection = selection;
				optionsOpened = true;
			}, 200);
		} else {
			optionsOpened = false;
			firstSelection = undefined;
			selectZone = selection.zone;
			over = selection.index;
		}
	}

	function setMoving() {
		if (firstSelection) {
			firstSelection.moving = true;
			optionsOpened = false;
		}
	}

	function prevBox() {
		changeLeftHover = true;
		setTimeout(() => {
			changeLeftHover = false;
			selectedBox = selectedBox - 1;
			if (selectedBox < 0) {
				selectedBox = context.boxes.length - 1;
			}
			selectZone = 'box-change';
			over = 0;
		}, 200);
	}

	function nextBox() {
		changeRightHover = true;
		setTimeout(() => {
			changeRightHover = false;
			selectedBox = selectedBox + 1;
			if (selectedBox > context.boxes.length - 1) {
				selectedBox = 0;
			}
			selectZone = 'box-change';
			over = 0;
		}, 200);
	}

	function swapPokemon(select1: BoxSelection, select2: BoxSelection) {
		if (select1.zone === 'party' && context.player.monsters.length === 1) {
			return;
		}

		let sourceList =
			select1.zone === 'party' ? context.player.monsters : context.boxes[select1.box].values;
		let targetList =
			select2.zone === 'party' ? context.player.monsters : context.boxes[select2.box].values;
		let sourceIndex = select1.index;
		let targetIndex = select2.index;

		// swap
		let temp = sourceList[sourceIndex];
		sourceList[sourceIndex] = targetList[targetIndex];
		targetList[targetIndex] = temp;

		context.player.monsters = context.player.monsters.filter((p) => !!p);

		firstSelection = undefined;
	}

	function openSum() {
		let box = context.boxes[selectedBox];
		let list =
			selectZone === 'box'
				? box.values.filter((p) => p instanceof PokemonInstance)
				: context.player.monsters;
		pkmnListSelectedIndex = list.indexOf(firstSelection?.selected);
		context.overWorldContext.openMenu(MenuType.SUMMARY);
	}

	function cancel() {
		firstSelection = undefined;
		optionsOpened = false;
	}

	const listener = (e: KeyboardEvent) => {
		if (context.overWorldContext.menus.openSummary) {
			return;
		}
		if (e.key.startsWith('Arrow') || e.key === 'Enter') {
			hasInteracted = true;
		}
		if (!optionsOpened) {
			if (e.key === 'Escape') {
				context.overWorldContext.closeMenu(MenuType.BOX);
			}

			// LEFT
			if (e.key === 'ArrowLeft') {
				if (selectZone === 'box') {
					if (over === 0 || over % 6 === 0) {
						selectZone = 'party';
						over = over / 6;
					} else {
						over--;
					}
				} else if (selectZone === 'party') {
					selectZone = 'box';
					over = (over + 1) * 6 - 1;
				} else if (selectZone === 'box-change') {
					prevBox();
				}

				// RIGHT
			} else if (e.key === 'ArrowRight') {
				if (selectZone === 'box') {
					if (over === 5 || over % 6 === 5) {
						selectZone = 'party';
						over = (over + 1) / 6 - 1;
					} else {
						over++;
					}
				} else if (selectZone === 'party') {
					selectZone = 'box';
					over = over * 6;
				} else if (selectZone === 'box-change') {
					nextBox();
				}

				// UP
			} else if (e.key === 'ArrowUp') {
				if (selectZone === 'box') {
					if (over - 6 >= 0) {
						over -= 6;
					} else {
						selectZone = 'box-change';
					}
				} else if (selectZone === 'party') {
					if (over - 1 >= 0) {
						over--;
					} else {
						over = teamSlot.length;
					}
				} else if (selectZone === 'box-change') {
					selectZone = 'box';
					over = box.values.length - 1;
				}

				// DOWN
			} else if (e.key === 'ArrowDown') {
				if (selectZone === 'box') {
					if (over + 6 < box.values.length) {
						over += 6;
					} else {
						selectZone = 'box-change';
					}
				} else if (selectZone === 'party') {
					if (over + 1 < teamSlot.length) {
						over++;
					} else {
						over = 0;
					}
				} else if (selectZone === 'box-change') {
					selectZone = 'box';
					over = 0;
				}

				// ENTER
			} else if (e.key === 'Enter') {
				if (selectZone === 'box') {
					openOptions(new BoxSelection('box', over, selectedBox, box.values[over]));
				} else if (selectZone === 'party') {
					openOptions(new BoxSelection('party', over, undefined, context.player.monsters[over]));
				}
			}
		} else {
			// OPTIONS
			if (e.key === 'ArrowDown') {
				selectedOption = selectedOption + 1;
				if (selectedOption > 3) {
					selectedOption = 0;
				}
			} else if (e.key === 'ArrowUp') {
				selectedOption = selectedOption - 1;
				if (selectedOption < 0) {
					selectedOption = 3;
				}
			} else if (e.key === 'Enter') {
				if (selectedOption === 0 && firstSelection) {
					setMoving();
				} else if (selectedOption === 1) {
					openSum();
				} /*else if (selectedOption === 2) {
                        //save.releasePokemon(firstSelection);
                        //optionsOpened = false;
                    } */ else if (selectedOption === 2) {
					firstSelection = undefined;
					optionsOpened = false;
				}
			} else if (e.key === 'Escape') {
				firstSelection = undefined;
				optionsOpened = false;
			}
		}
	};

	onMount(() => {
		window.addEventListener('keydown', listener);
		return () => {
			window.removeEventListener('keydown', listener);
		};
	});
</script>

<div class="boxes" in:slide={{ duration: 500, delay: 100, axis: 'x', easing: backInOut }} out:fade>
	<div class="party">
		<div class="title">
			<button class="cancel" on:click={() => context.overWorldContext.closeMenu(MenuType.BOX)}>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
					><path
						d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z"
					></path></svg
				>
			</button>
		</div>
		<div class="entries">
			{#each teamSlot as pokemon, i}
				<div
					class="entry"
					tabindex="1"
					class:over={selectZone === 'party' && over === i}
					class:moving={firstSelection?.zone === 'party' &&
						firstSelection?.index === i &&
						firstSelection?.moving}
					on:click={() => openOptions(new BoxSelection('party', i, selectedBox, pokemon))}
				>
					{#if firstSelection?.moving && selectZone === 'party' && over === i}
						<img class="moving" src={firstSelection.selected?.getSprite()} alt="moving pokemon" />
					{/if}
					{#if !!pokemon}
						<div>
							<span>{pokemon?.name}</span>
							<span>Lv. {pokemon?.level}</span>
						</div>
						<img src={pokemon.getSprite()} alt={pokemon?.name} />
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<div class="preview" class:opened={previewOpened}></div>

	<div
		class="box"
		on:touchstart={handleTouchStart}
		on:touchend={handleTouchEnd}
		role="region"
		aria-label="Pokemon Box"
	>
		<div class="box-change" class:over={selectZone === 'box-change'}>
			<button on:click={() => prevBox()} class:hover={changeLeftHover}>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M4.83578 12L11.0429 18.2071L12.4571 16.7929L7.66421 12L12.4571 7.20712L11.0429 5.79291L4.83578 12ZM10.4857 12L16.6928 18.2071L18.107 16.7929L13.3141 12L18.107 7.20712L16.6928 5.79291L10.4857 12Z"
					></path>
				</svg>
			</button>
			{#if firstSelection?.moving && selectZone === 'box-change'}
				<img class="moving" src={firstSelection?.selected?.getSprite()} alt="moving pokemon" />
			{/if}
			<span class:hover={selectZone === 'box-change'}>
				{box.name}
			</span>
			<button on:click={() => nextBox()} class:hover={changeRightHover}>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M19.1642 12L12.9571 5.79291L11.5429 7.20712L16.3358 12L11.5429 16.7929L12.9571 18.2071L19.1642 12ZM13.5143 12L7.30722 5.79291L5.89301 7.20712L10.6859 12L5.89301 16.7929L7.30722 18.2071L13.5143 12Z"
					></path>
				</svg>
			</button>
		</div>
		<div class="entries">
			{#each box.values as entry, index}
				<div
					class="entry"
					class:over={selectZone === 'box' && over === index}
					class:selected={firstSelection?.box === selectedBox &&
						firstSelection.zone === 'box' &&
						firstSelection?.index === index}
					class:moving={firstSelection?.box === selectedBox &&
						firstSelection?.zone === 'box' &&
						firstSelection?.index === index &&
						firstSelection?.moving}
					on:click={() => openOptions(new BoxSelection('box', index, selectedBox, entry))}
				>
					{#if firstSelection?.moving && selectZone === 'box' && over === index}
						<img class="moving" src={firstSelection?.selected?.getSprite()} alt="moving pokemon" />
					{/if}

					<div
						class="title"
						class:show={hasInteracted &&
							selectZone === 'box' &&
							over === index &&
							box.values[over] instanceof PokemonInstance &&
							!firstSelection}
					>
						{entry?.name}
					</div>
					{#if entry instanceof PokemonInstance && !(firstSelection?.selected === entry && firstSelection.moving)}
						<img src={entry.getSprite()} alt={entry.name} />
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<div class="options" class:opened={optionsOpened}>
		<ul>
			{#if (context.player.monsters.length > 1 && firstSelection?.zone === 'party') || firstSelection?.zone === 'box'}
				<li class:selected={selectedOption === 0} on:click={() => setMoving()}>MOVE</li>
			{/if}
			<li class:selected={selectedOption === 1} on:click={() => openSum()}>SUMMARY</li>
			<!--TODO <li class:selected={selectedOption === 2}>RELEASE</li>-->
			<li class:selected={selectedOption === 2} on:click={() => cancel()}>CANCEL</li>
		</ul>
	</div>
</div>

{#if context.overWorldContext.menus.openSummary && firstSelection}
	<PokemonSummary
		bind:context
		bind:selected={pkmnListSelectedIndex}
		bind:isBattle
		bind:zIndex={zIndexNext}
		bind:pkmnList
	/>
{/if}

<style lang="scss">
	.boxes {
		position: absolute;
		top: 0;
		left: 0;
		width: 100dvw;
		height: 100dvh;
		background: #202020;
		z-index: 10;

		display: flex;
		flex-direction: row;
		gap: 16px;
		padding: 16px;
		box-sizing: border-box;

		// Shared Panel Styles
		.party,
		.box,
		.options {
			background: #143855; // var(--pixel-bg-panel)
			border: 2px solid #000;
			box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
			border-radius: 0;
		}

		.options {
			position: absolute;
			font-size: 32px;
			font-weight: 500;
			text-align: left;
			bottom: -100%;
			right: 1%;
			padding: 22px 36px 22px 36px;
			color: white;
			box-sizing: border-box;
			transition: bottom 0.3s ease-in-out;
			z-index: 20;

			&.opened {
				bottom: 1%;
			}

			ul {
				margin: 0;
				padding: 0;
				list-style: none;
				display: flex;
				flex-direction: column;
				gap: 16px;

				li {
					cursor: pointer;
					&.selected::before {
						content: '';
						width: 0;
						height: 0;
						border-top: 12px solid transparent;
						border-bottom: 12px solid transparent;
						border-left: 12px solid #ffd700;
						position: absolute;
						left: 5px;
						margin-top: 2px;
					}
				}
			}
		}

		.party {
			height: 100%;
			width: 25%;
			min-width: 220px;

			display: flex;
			flex-direction: column;

			.title {
				height: 60px;
				width: 100%;

				display: flex;
				flex-direction: row;
				justify-content: flex-start;
				align-items: center;
				padding: 8px;
				box-sizing: border-box;

				.cancel {
					height: 44px;
					width: 44px;
					color: white;
					background-color: #0088cc;
					border: 2px solid #000;
					box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
					outline: none;
					display: flex;
					align-items: center;
					justify-content: center;
					cursor: pointer;

					&:hover {
						filter: brightness(1.1);
					}
				}
			}

			.entries {
				height: calc(100% - 60px);
				width: 100%;
				overflow-y: auto;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: flex-start;
				gap: 8px;
				padding: 8px;
				box-sizing: border-box;

				.entry {
					color: white;
					font-size: 22px;
					height: 52px;
					width: 100%;
					margin: 0 auto;
					display: flex;
					flex-direction: row;
					align-items: center;
					justify-content: space-between;
					box-sizing: border-box;
					background: rgba(0, 0, 0, 0.2);
					border-radius: 0;
					padding-left: 4%;
					position: relative;
					border: 2px solid #000;
					box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);

					img.moving {
						position: absolute;
						top: 0;
						left: 0;
						height: 70%;
					}

					div {
						display: flex;
						flex-direction: column;
						align-items: flex-start;
						justify-content: center;
					}

					&:hover,
					&.over {
						border: 3px solid #ffd700;
						animation: pixel-pulse 1s ease-in-out infinite;
						z-index: 1;
					}

					img {
						height: 100%;
					}
				}
			}
		}

		.box {
			height: 100%;
			width: 75%;
			display: flex;
			flex-direction: column;

			.box-change {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				height: 60px;
				width: 100%;
				box-sizing: border-box;
				padding: 0 20px;
				position: relative;

				img.moving {
					position: absolute;
					top: -2%;
					right: 20%;
					height: 100%;
				}

				span {
					color: white;
					font-family: pokemon, serif;
					font-size: 24px;
					text-shadow: 2px 2px 0 #000;

					&.hover {
						text-decoration: underline;
						color: white;
					}
				}

				button {
					min-width: 44px;
					min-height: 44px;
					height: 44px;
					font-size: 26px;
					text-align: center;
					font-family: pokemon, serif;
					color: white;
					text-shadow: 2px 2px 0 #000;
					background-color: #0088cc;
					border-radius: 0;
					border: 2px solid #000;
					box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
					cursor: pointer;
					display: flex;
					align-items: center;
					justify-content: center;

					&.hover,
					&:hover {
						filter: brightness(1.1);
						transform: translate(1px, 1px);
						box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.4);
					}

					svg {
						height: 24px;
						width: auto;
					}
				}
			}

			.entries {
				display: grid;
				grid-template-columns: repeat(8, 1fr);
				grid-template-rows: repeat(5, 1fr);
				gap: 6px;
				box-sizing: border-box;
				width: 100%;
				height: calc(100% - 60px);
				padding: 12px;
				justify-content: center;
				align-content: center;

				.entry {
					width: 100%;
					height: 100%;
					max-width: 72px;
					max-height: 72px;
					background: rgba(0, 0, 0, 0.2);
					display: flex;
					justify-content: center;
					align-items: center;
					align-content: center;
					flex-direction: row;
					position: relative;
					border-radius: 0;
					border: 2px solid #000;
					box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);

					&.over {
						background-color: rgba(255, 255, 255, 0.1);
						border: 3px solid #ffd700;
						animation: pixel-pulse 1s ease-in-out infinite;
						z-index: 10;
						box-shadow: none;
					}

					.title {
						position: absolute;
						top: -30px;
						right: -12.5%;
						width: 125%;
						height: auto;
						background-color: white;
						color: black;
						text-align: center;
						padding: 4px;
						border-radius: 0;
						border: 2px solid #000;
						font-size: 16px;
						display: none;
						z-index: 20;

						box-shadow: 4px 4px 0 0 rgba(0, 0, 0, 0.5);

						&.show {
							display: block;
						}
					}

					img.moving {
						position: absolute;
						top: -30%;
						left: -20%;
						height: 80%;
					}

					img {
						max-height: 90%;
					}

					&.selected {
						background-color: rgba(0, 0, 0, 0.8);
					}
				}
			}
		}
	}

	@keyframes pixel-pulse {
		0%,
		100% {
			border-color: #ffd700;
		}
		50% {
			border-color: #ffffff;
		}
	}
</style>
