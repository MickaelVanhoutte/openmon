<script lang="ts">
	import { onMount } from 'svelte';
	import { SaveContext, SavesHolder } from '../../js/context/savesHolder';
	import { MapGenerator } from '../../js/tiles/generator';
	import type { Layer } from '../../js/tiles/tiles';

	let canvas: HTMLCanvasElement;
	const generator = new MapGenerator();
	let images = new Map<string, HTMLImageElement>();

	generator.generate(600, 350).then((map) => {
		console.log(map);
		drawMap(map);
	});


	function drawMap(map: Layer[]) {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		// let img = new Image();
		// img.src = 'data:image/png;base64,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';
		// img.onload = () => {
		// 	ctx.drawImage(img, 0, 0, 300, 300);
		// }
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		// sort layers by order
		map.sort((a, b) => a.order - b.order).forEach((layer) => {
			if (!images.has(layer.tileSet.source)) {
				const img = new Image();
				img.src = layer.tileSet.source;
				img.onload = () => {
					images.set(layer.tileSet.source, img);
					drawLayer(layer, ctx);
				};
			} else {
				drawLayer(layer, ctx);
			}
		});
		// setTimeout(() => {
		// 	console.log(canvas.toDataURL('image/png'));
		// }, 2000);
	}

	function drawLayer(layer: Layer, ctx: CanvasRenderingContext2D) {
		if (!ctx) return;
		console.log(layer);
		for (let y = 0; y < layer.height; y++) {
			for (let x = 0; x < layer.width; x++) {
				const tile = layer.tiles[y][x];
				const img = images.get(layer.tileSet.source);
				if (img && tile) {
					ctx.drawImage(
						img,
						tile.x,
						tile.y,
						tile.width,
						tile.height,
						x * tile.width / 1.6,
						y * tile.height / 1.6,
						tile.width / 1.6,
						tile.height / 1.6
					);
					//ctx.strokeRect(x * tile.width * (layer.tileSet.width / 800), y * tile.height * (layer.tileSet.width / 800), tile.width * (layer.tileSet.width / 800), tile.height * (layer.tileSet.width / 800));
				}
			}
		}
	}

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
			img.src = monster.sprites?.male?.front?.frame1 || 'assets/monsters/animated/000.png';
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
	<div class="row">
		<canvas id="map" width="9600" height="9600" bind:this={canvas}> </canvas>
	</div>


	<div class="preview row" bind:this={preview}>
	</div>

	<div class="row">
		<div class="save-list col">
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
							<button class="go" on:click={() => handleSubmit(save)} tabindex="1">
								Continue
							</button>
							<button class="erase" on:click={() => remove(save)} tabindex="1"> Erase </button>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
	<div class="new-game row">
		<button on:click={() => startNew()}> Start a new game </button>
	</div>
</div>

<style lang="scss">
	.preview {
		width: 100%;
		height: 33%;
		display: flex;
		flex-direction: row;
		gap: 8px;
		box-sizing: border-box;
		align-content: center;
		align-items: center;
		justify-content: flex-start;

		:global(img) {
			width: calc(100% / 7);
			height: auto;
		}
	}

	.load-screen {
		height: 100dvh;
		width: 100dvw;
		background: #ececec;
		color: #262626;
		box-sizing: border-box;
		//padding: 2%;
		overflow: auto;

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
						background: #262626;
						color: #ececec;
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
					gap: 4px;

					p {
						margin: 0;
					}
				}
			}
		}
	}
</style>
