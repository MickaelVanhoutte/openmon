<script lang="ts">
	import { onMount } from 'svelte';
	import { SavesHolder } from '../../js/context/savesHolder';
	import { CHARACTER_SPRITES } from '../../js/sprites/sprites';
	import { TRAINER_CLASSES, getClassSpriteId } from '../../js/characters/trainer-class';

	interface Props {
		savesHolder: SavesHolder;
	}

	const { savesHolder }: Props = $props();

	let selected = $state(1);
	const templates = [1, 2];
	let playerName = $state('');
	let selectedClass = $state('ace-trainer');
	let sound: Howl;

	const selectedClassData = $derived(TRAINER_CLASSES.find((c) => c.id === selectedClass));
	const gender = $derived<'MALE' | 'FEMALE'>(selected === 1 ? 'MALE' : 'FEMALE');
	const classSpriteId = $derived(getClassSpriteId(selectedClass, gender));
	const classSprite = $derived(CHARACTER_SPRITES.getSprite(classSpriteId));

	let previewCanvas: HTMLCanvasElement;

	// Animated sprite preview
	$effect(() => {
		const walkingSprite = classSprite?.overworld?.walking;
		if (!previewCanvas || !walkingSprite) return;

		const ctx = previewCanvas.getContext('2d');
		if (!ctx) return;

		const img = new Image();
		img.src = walkingSprite.source;

		const frameCount = walkingSprite.frameNumber;
		const frameWidth = walkingSprite.width;
		const frameHeight = walkingSprite.height;

		const scale = 3;
		previewCanvas.width = frameWidth * scale;
		previewCanvas.height = frameHeight * scale;

		let currentFrame = 0;
		let lastTime = 0;
		const FPS = 4;
		let animId: number;

		img.onload = () => {
			function animate(timestamp: number) {
				if (timestamp - lastTime >= 1000 / FPS) {
					lastTime = timestamp;
					ctx!.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
					ctx!.imageSmoothingEnabled = false;

					const sx = currentFrame * frameWidth;
					const sy = 0; // "down" row

					ctx!.drawImage(
						img,
						sx, sy,
						frameWidth, frameHeight,
						0, 0,
						frameWidth * scale, frameHeight * scale
					);

					currentFrame = (currentFrame + 1) % frameCount;
				}
				animId = requestAnimationFrame(animate);
			}
			animId = requestAnimationFrame(animate);
		};

		return () => {
			if (animId) cancelAnimationFrame(animId);
		};
	});

	function loadSound() {
		sound = new Howl({
			src: ['src/assets/audio/save.mp3'],
			autoplay: true,
			loop: true,
			volume: 0.5
		});
	}

	function handleSubmit() {
		const spriteId = getClassSpriteId(selectedClass, gender);
		savesHolder.newGame(spriteId, playerName, gender, selectedClass);
	}

	onMount(() => {
		loadSound();
		return () => {
			sound.fade(0.5, 0, 1000);
			setTimeout(() => {
				sound.stop();
			}, 1000);
		};
	});
</script>

<div class="create" data-testid="player-creation">
	{#each Array.from({ length: 15 }) as _}
		<div class="firefly"></div>
	{/each}

	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleSubmit();
		}}
	>
		<h1 style="margin: 0!important;">New game</h1>

		<div class="form-grid">
			<label for="template" style="grid-area: lbl-sex;">Are you a</label>
			<select id="template" style="grid-area: sex;" bind:value={selected}>
				{#each templates as template}
					<option value={template}>
						{template === 1 ? 'Boy' : 'Girl'}
					</option>
				{/each}
			</select>

			<label for="trainer-class" style="grid-area: lbl-class;">Trainer Class</label>
			<select id="trainer-class" style="grid-area: class;" bind:value={selectedClass}>
				{#each TRAINER_CLASSES as tc}
					<option value={tc.id}>{tc.name}</option>
				{/each}
			</select>
			{#if selectedClassData}
				<p class="class-desc" style="grid-area: desc;">{selectedClassData.description}</p>
			{/if}

			<label for="name" style="grid-area: lbl-name;">What's your name?</label>
			<input id="name" style="grid-area: name;" placeholder={selected === 1 ? 'Ethan' : 'Lyra'} bind:value={playerName} data-testid="name-input" />

			<button type="submit" style="grid-area: start;" disabled={playerName?.length === 0} data-testid="confirm-button"
				>Start</button
			>

			<div class="sprite-col">
				<canvas bind:this={previewCanvas} class="preview-sprite"></canvas>
			</div>
		</div>
	</form>
</div>

<style lang="scss">
	.create {
		position: absolute;
		top: 0;
		left: 0;
		width: 100dvw;
		height: 100dvh;
		padding: 2%;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;

		color: #e0e0e0;
		background: #0f0c29;
		background: -webkit-linear-gradient(
			to right,
			#24243e,
			#302b63,
			#0f0c29
		);
		background: linear-gradient(
			to right,
			#24243e,
			#302b63,
			#0f0c29
		);

		h1 {
			margin: 0.35em 0;
		}

		form {
			max-width: 70%;
			margin: 0 auto;
			display: flex;
			flex-direction: column;
			gap: 16px;
			position: relative;
			z-index: 2;
		}

		.form-grid {
			display: grid;
			grid-template-columns: 1fr 1fr 200px;
			grid-template-areas:
				'lbl-sex   lbl-class sprite'
				'sex       class     sprite'
				'.         desc      sprite'
				'lbl-name  .         sprite'
				'name      start     sprite';
			gap: 4px 24px;
			width: 100%;
			align-items: end;
			font-size: 2rem;
		}

		.sprite-col {
			grid-area: sprite;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 200px;
			align-self: center;
		}

		.preview-sprite {
			image-rendering: pixelated;
		}

		.class-desc {
			margin: 0;
			font-size: 1.5rem;
			color: #aaa;
			font-style: italic;
		}
	}

	@media (max-width: 968px) {
		.create {
			form {
				max-width: 95%;
				gap: 10px;
			}

			.form-grid {
				gap: 16px;
			}

			h1 {
				margin: 0.2em 0;
				font-size: 1.3em;
			}
		}
	}
</style>
