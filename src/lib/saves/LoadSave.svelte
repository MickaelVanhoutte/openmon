<script lang="ts">
	import { onMount } from 'svelte';
	import { SaveContext, SavesHolder } from '../../js/context/savesHolder';

	/**
	 * Saves loading  component
	 * lots todo here (design, bugs - team preview not updated-, etc.)
	 */

	export let savesHolder: SavesHolder;

	let preview: HTMLDivElement;

	let selected: SaveContext;
	let drawnId: number = 0;

	$: if (selected && drawnId !== selected.id) {
		drawPreview(selected);
	}

	function drawPreview(selected: SaveContext) {
		preview.innerHTML = '';

		//let sprite = CHARACTER_SPRITES.getSprite(selected.player.spriteId);
		let playerImg = new Image();
		playerImg.classList.add('player');
		playerImg.src = selected.player.sprite.front.source;
		playerImg.style.maxHeight = '-webkit-fill-available';
		preview.appendChild(playerImg);

		selected.player.monsters.forEach((monster) => {
			let img = new Image();
			img.src = monster.sprites?.male?.front?.[monster.isShiny? 'shiny1' : 'frame1'] || 'assets/monsters/animated/000.png';
			img.style.maxHeight = '-webkit-fill-available';

			preview.appendChild(img);
		});
		drawnId = selected.id;
	}

	function handleSubmit(save: SaveContext) {
		savesHolder.selectSave(savesHolder.saves.indexOf(save));
	}

	function remove(save: SaveContext) {
		savesHolder.removeSave(savesHolder.saves.indexOf(save));
		selected = savesHolder.saves[0] || null;
	}

	function startNew() {
		savesHolder.requestNexGame$.set(true);
	}

	onMount(() => {
		selected = savesHolder.saves[0] || null;
		drawPreview(selected);
	});
</script>

<div class="load-screen">
	{#each Array.from({ length: 15 }) as i}
		<div class="firefly"></div>
	{/each}
	<div class="preview" bind:this={preview}>
		<!-- <div class="player-wrapper" bind:this={playerWrapper}></div>
         <div class="monster-wrapper" bind:this={monsterWrapper}></div>-->
	</div>

	<div class="save-list">
		{#each savesHolder.saves as save}
			<div class="save-wrapper">
				<button
					class="save"
					tabindex="1"
					on:click={() => (selected = save)}
					on:focus={() => (selected = save)}
				>
					<p>{new Date(save.updated).toUTCString()}</p>
					<p>{save.id} - {save.player.name}</p>
				</button>
				{#if selected === save}
					<div class="actions">
						<button class="go" on:click={() => handleSubmit(save)} tabindex="1"> Continue </button>
						<button class="erase" on:click={() => remove(save)} tabindex="1"> Erase </button>
					</div>
				{/if}
			</div>
		{/each}
	</div>
	<div class="new-game">
		<button on:click={() => startNew()}> Start a new game </button>
	</div>
</div>

<style lang="scss">
	.preview {
		width: 100%;
		height: 30%;
		display: flex;
		flex-direction: row;
		gap: 8px;
		box-sizing: border-box;
		align-items: flex-end;
		justify-content: flex-start;
		margin-bottom: 2%;

		:global(img) {
			max-width: calc(100% / 7);
			height: auto;
		}
	}

	.load-screen {
		height: 100dvh;
		width: 100dvw;
		color: #262626;
		box-sizing: border-box;
		padding: 2%;
		background: #0f0c29; /* fallback for old browsers */
		background: -webkit-linear-gradient(
			to right,
			#24243e,
			#302b63,
			#0f0c29
		); /* Chrome 10-25, Safari 5.1-6 */
		background: linear-gradient(
			to right,
			#24243e,
			#302b63,
			#0f0c29
		); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

		.new-game {
			position: absolute;
			bottom: 1%;
			right: 1%;

			button {
				background: #599bdc;
				color: #ececec;
				border: none;
				padding: 8px;
				border-radius: 8px;
				width: 160px;
				height: 32px;
			}
		}

		.save-list {
			height: 70%;
			width: 100%;

			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 8px;

			overflow-y: scroll;

			.save-wrapper {
				width: 100%;
				display: flex;
				flex-direction: row;
				justify-content: flex-start;
				align-items: center;
				gap: 8px;

				.actions {
					display: flex;
					flex-direction: column;
					gap: 8px;

					.go {
						//background: #262626;
						//color: #ececec;
						border: none;
						padding: 8px;
						border-radius: 8px;
						cursor: pointer;
						width: 160px;
						height: 32px;
					}

					.erase {
						background: #dc5959;
						color: #ececec;
						border: none;
						padding: 8px;
						border-radius: 8px;
						cursor: pointer;
						width: 160px;
						height: 32px;
					}
				}

				.save {
					border: 1px solid #262626;
					border-radius: 8px;
					padding: 8px;
					cursor: pointer;

					display: flex;
					flex-direction: column;
					gap: 6px;
					font-size: 24px;

					p {
						margin: 0;
					}
				}
			}
		}
	}
</style>
