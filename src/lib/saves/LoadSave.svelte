<script lang="ts">
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { SaveContext, SavesHolder } from '../../js/context/savesHolder';

	/**
	 * Saves loading  component
	 */

	export let savesHolder: SavesHolder;
	let selected: SaveContext;
	let sound: Howl;
	let soundPlaying: boolean;

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

	const listener = (e: KeyboardEvent) => {
		if (e.key === 'ArrowDown') {
			const index = savesHolder.saves.indexOf(selected);
			selected = savesHolder.saves[index + 1] || selected;
		} else if (e.key === 'ArrowUp') {
			const index = savesHolder.saves.indexOf(selected);
			selected = savesHolder.saves[index - 1] || selected;
		} else if (e.key === 'Enter') {
			handleSubmit(selected);
		} else if (e.key === 'Delete') {
			remove(selected);
		}
	};

	function loadSound() {
		sound = new Howl({
			src: ['src/assets/audio/save.mp3'],
			autoplay: true,
			loop: true,
			volume: 0.5
		});
		setTimeout(() => {
			soundPlaying = sound.playing();
		}, 200);
		console.log(sound);
	}

	onMount(() => {
		loadSound();
		selected = savesHolder.saves[0] || null;
		window.addEventListener('keydown', listener);
		return () => {
			window.removeEventListener('keydown', listener);
			sound.fade(0.5, 0, 1000);
			setTimeout(() => {
				sound.stop();
			}, 1000);
		};
	});
</script>

<div class="load-screen">
	{#each Array.from({ length: 8 }) as i}
		<div class="firefly"></div>
	{/each}

	<div class="save-list">
		{#each savesHolder.saves as save}
			<div class="preview">
				<div class="save-wrapper">
					<button
						class="save pixel-button"
						class:selected={selected === save}
						on:click={() => {
							selected === save ? handleSubmit(save) : (selected = save);
						}}
						on:focus={() => (selected = save)}
					>
						<p style="font-size: 2rem">{save.id} - {save.player.name}</p>
						<p style="font-size: 1.5rem">{new Date(save.updated).toUTCString()}</p>

						{#if selected === save}
							<i style="width: 100%; text-align: center">Continue !</i>
						{/if}
					</button>
					{#if selected === save}
						<div class="actions">
							<!-- <button class="go" on:click={() => handleSubmit(save)}> Continue </button> -->
							<button class="erase" on:click={() => remove(save)}>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
									><path
										d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM13.4142 13.9997L15.182 15.7675L13.7678 17.1817L12 15.4139L10.2322 17.1817L8.81802 15.7675L10.5858 13.9997L8.81802 12.232L10.2322 10.8178L12 12.5855L13.7678 10.8178L15.182 12.232L13.4142 13.9997ZM9 4V6H15V4H9Z"
									></path></svg
								>
							</button>
						</div>
					{/if}
				</div>

				<div
					class="images"
					on:click={() => {
						selected === save ? handleSubmit(save) : (selected = save);
					}}
					on:focus={() => (selected = save)}
				>
					<img src={save.player.sprite.face.source} alt={save.player.name} />
					{#each save.player.monsters as mon}
						<img src={mon.getSprite()} alt={mon.name} />
					{/each}
				</div>
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
		color: #ececec;

		:global(img) {
			width: calc(100% / 8);
			height: auto;
		}

		.images {
			flex-grow: 1;
		}
	}

	.load-screen {
		height: 100dvh;
		width: 100dvw;
		color: #ffffff;
		box-sizing: border-box;
		padding: 2%;
		background: #143855;
		border: 2px solid #000;
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);

		.new-game {
			position: absolute;
			bottom: 1%;
			right: 1%;

			button {
				background: #0088cc;
				color: #ffffff;
				border: 2px solid #000;
				box-shadow: 4px 4px 0px #000;
				padding: 8px;
				width: 160px;
				height: 32px;
				cursor: pointer;
			}
		}

		.save-list {
			height: 100%;
			width: 100%;

			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 8px;

			overflow-y: auto;
			color: #ececec !important;

			.save-wrapper {
				//width: 100%;
				display: flex;
				flex-direction: row;
				justify-content: flex-start;
				align-items: flex-end;
				gap: 8px;
				color: #ececec;

				.actions {
					display: flex;
					flex-direction: column;
					gap: 8px;
					justify-content: center;
					align-items: center;
					color: #ececec;

					.go {
						//background: #262626;
						//color: #ececec;
						border: none;
						padding: 8px;
						cursor: pointer;
						//width: 160px;
						height: 32px;
						color: #ececec;
					}

					.erase {
						background: #dc5959;
						color: #ececec;
						border: none;
						padding: 8px;
						cursor: pointer;
						//width: 160px;
						height: 32px;
					}
				}

				.save {
					border: 2px solid #000;
					padding: 8px;
					cursor: pointer;
					background: #1c4b72;
					min-height: 60px;

					display: flex;
					flex-direction: column;
					gap: 6px;
					font-size: 24px;

					p {
						margin: 0;
					}
				}

				.save.selected {
					border: 3px solid #ffd700;
				}

				.save:focus,
				.save:hover {
					border: 3px solid #ffd700;
				}
			}
		}
	}
</style>
