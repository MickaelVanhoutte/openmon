<script lang="ts">
	import { onMount } from 'svelte';
	import { SavesHolder } from '../../js/context/savesHolder';
	import { CHARACTER_SPRITES } from '../../js/sprites/sprites';
	import { TRAINER_CLASSES, getClassSpriteId } from '../../js/characters/trainer-class';
	import { getClassPerks, type PerkDefinition } from '../../js/characters/perks';
	import Modal from '../common/Modal.svelte';

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
	let showPerkModal = $state(false);
	let selectedPerk = $state<PerkDefinition | null>(null);

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
				<p class="class-desc" style="grid-area: desc;">
					{selectedClassData.description}
				</p>
				<div class="class-perks" style="grid-area: perks;">
					{#each getClassPerks(selectedClass).slice(0, 3) as perk}
						<button
							class="perk-preview"
							type="button"
							onclick={() => { selectedPerk = perk; showPerkModal = true; }}
						>
							{perk.name}
						</button>
					{/each}
				</div>
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

	{#if selectedPerk}
		<Modal bind:showModal={showPerkModal}>
			{#snippet header()}
				<h3 style="margin: 0">{selectedPerk.name}</h3>
			{/snippet}
			<p style="margin: 4px 0 8px">{selectedPerk.description}</p>
			<div class="perk-detail-row">
				<span class="perk-tier-badge">{selectedPerk.tier}</span>
			</div>
		</Modal>
	{/if}
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
				'.         perks     sprite'
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

		.class-perks {
			display: flex;
			gap: 6px;
			flex-wrap: wrap;

			.perk-preview {
				background: rgba(232, 168, 124, 0.2);
				border: 1px solid #E8A87C;
				color: #E8A87C;
				padding: 2px 8px;
				border-radius: 4px;
				font-size: 1rem;
				cursor: pointer;
				font-family: inherit;

				&:hover {
					background: rgba(232, 168, 124, 0.4);
				}
			}
		}

		.perk-detail-row {
			display: flex;
			gap: 8px;
		}

		.perk-tier-badge {
			font-size: 0.85rem;
			padding: 2px 8px;
			border-radius: 3px;
			text-transform: capitalize;
			background: #E8A87C;
			color: #1a1a2e;
		}
	}

	@media (max-width: 968px) {
		.create {
			form {
				max-width: 95%;
				gap: 10px;
			}

			.form-grid {
				grid-template-columns: 1fr;
				grid-template-areas:
					'sprite'
					'lbl-sex'
					'sex'
					'lbl-class'
					'class'
					'desc'
					'perks'
					'lbl-name'
					'name'
					'start';
				gap: 8px;
				font-size: 1.6rem;
			}

			.sprite-col {
				width: auto;
				justify-self: center;
			}

			h1 {
				margin: 0.2em 0;
				font-size: 1.3em;
			}
		}
	}
</style>
