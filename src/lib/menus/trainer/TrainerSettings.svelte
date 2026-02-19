<script lang="ts">
	import type { GameContext } from '../../../js/context/gameContext';

	interface Props {
		context: GameContext;
	}

	let { context }: Props = $props();

	let musicVolume = $state(context.settings.musicVolume);
	let sfxVolume = $state(context.settings.sfxVolume);
	let cryVolume = $state(context.settings.cryVolume);
	let soundEnabled = $state(context.settings.soundEnabled);
	let xpShare = $state(context.settings.xpShare);
	let difficulty = $state(context.settings.difficulty);

	function onMusicVolume(e: Event) {
		const v = Number((e.target as HTMLInputElement).value) / 100;
		musicVolume = v;
		context.settings.musicVolume = v;
		context.soundManager.setMusicVolume(v);
	}

	function onSfxVolume(e: Event) {
		const v = Number((e.target as HTMLInputElement).value) / 100;
		sfxVolume = v;
		context.soundManager.setSfxVolume(v);
	}

	function onCryVolume(e: Event) {
		const v = Number((e.target as HTMLInputElement).value) / 100;
		cryVolume = v;
		context.soundManager.setCryVolume(v);
	}

	function onSoundEnabled(e: Event) {
		const v = (e.target as HTMLInputElement).checked;
		soundEnabled = v;
		context.soundManager.setEnabled(v);
	}

	function onXpShare(e: Event) {
		const v = (e.target as HTMLInputElement).checked;
		xpShare = v;
		context.settings.xpShare = v;
	}

	function onDifficulty(e: Event) {
		const v = (e.target as HTMLInputElement).value as 'NORMAL' | 'HARD';
		difficulty = v;
		context.settings.difficulty = v;
	}

	const musicPct = $derived(Math.round(musicVolume * 100));
	const sfxPct = $derived(Math.round(sfxVolume * 100));
	const cryPct = $derived(Math.round(cryVolume * 100));
</script>

<div class="settings">
	<section class="section">
		<h2 class="section-title">Audio</h2>

		<div class="control-row">
			<label class="control-label" for="sound-toggle">Sound Enabled</label>
			<label class="toggle">
				<input id="sound-toggle" type="checkbox" checked={soundEnabled} onchange={onSoundEnabled} />
				<span class="toggle-track">
					<span class="toggle-thumb"></span>
				</span>
			</label>
		</div>

		<div class="control-row" class:disabled={!soundEnabled}>
			<label class="control-label" for="music-vol">Music Volume</label>
			<div class="slider-wrap">
				<input
					id="music-vol"
					type="range"
					min="0"
					max="100"
					step="1"
					value={musicPct}
					oninput={onMusicVolume}
					disabled={!soundEnabled}
				/>
				<span class="pct">{musicPct}%</span>
			</div>
		</div>

		<div class="control-row" class:disabled={!soundEnabled}>
			<label class="control-label" for="sfx-vol">SFX Volume</label>
			<div class="slider-wrap">
				<input
					id="sfx-vol"
					type="range"
					min="0"
					max="100"
					step="1"
					value={sfxPct}
					oninput={onSfxVolume}
					disabled={!soundEnabled}
				/>
				<span class="pct">{sfxPct}%</span>
			</div>
		</div>

		<div class="control-row" class:disabled={!soundEnabled}>
			<label class="control-label" for="cry-vol">Cry Volume</label>
			<div class="slider-wrap">
				<input
					id="cry-vol"
					type="range"
					min="0"
					max="100"
					step="1"
					value={cryPct}
					oninput={onCryVolume}
					disabled={!soundEnabled}
				/>
				<span class="pct">{cryPct}%</span>
			</div>
		</div>
	</section>

	<section class="section">
		<h2 class="section-title">Gameplay</h2>

		<div class="control-row">
			<label class="control-label" for="xp-share">XP Share</label>
			<label class="toggle">
				<input id="xp-share" type="checkbox" checked={xpShare} onchange={onXpShare} />
				<span class="toggle-track">
					<span class="toggle-thumb"></span>
				</span>
			</label>
		</div>

		<div class="control-row">
			<span class="control-label">Difficulty</span>
			<div class="radio-group">
				<label class="radio-label" class:selected={difficulty === 'NORMAL'}>
					<input
						type="radio"
						name="difficulty"
						value="NORMAL"
						checked={difficulty === 'NORMAL'}
						onchange={onDifficulty}
					/>
					Normal
				</label>
				<label class="radio-label" class:selected={difficulty === 'HARD'}>
					<input
						type="radio"
						name="difficulty"
						value="HARD"
						checked={difficulty === 'HARD'}
						onchange={onDifficulty}
					/>
					Hard
				</label>
			</div>
		</div>
	</section>
</div>

<style lang="scss">
	.settings {
		height: 100%;
		width: 100%;
		box-sizing: border-box;
		overflow-y: auto;
		padding: 24px 32px;
		display: flex;
		flex-direction: column;
		gap: 32px;

		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.25) transparent;

		&::-webkit-scrollbar {
			width: 6px;
		}
		&::-webkit-scrollbar-thumb {
			background: rgba(255, 255, 255, 0.25);
			border-radius: 3px;
		}
	}

	.section {
		background: rgba(0, 0, 0, 0.25);
		border: 1px solid rgba(104, 192, 200, 0.3);
		border-radius: 8px;
		padding: 20px 24px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		backdrop-filter: blur(4px);
	}

	.section-title {
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #68c0c8;
		text-shadow: 0 0 12px rgba(104, 192, 200, 0.5);
		margin: 0 0 4px 0;
		padding-bottom: 12px;
		border-bottom: 1px solid rgba(104, 192, 200, 0.2);
	}

	.control-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		min-height: 36px;
		transition: opacity 0.2s ease;

		&.disabled {
			opacity: 0.4;
			pointer-events: none;
		}
	}

	.control-label {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.9);
		text-shadow: 1px 1px 1px black;
		white-space: nowrap;
		min-width: 120px;
		flex-shrink: 0;
	}

	/* Slider */
	.slider-wrap {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 1;
		min-width: 0;
	}

	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		flex: 1;
		height: 4px;
		border-radius: 2px;
		background: rgba(255, 255, 255, 0.2);
		outline: none;
		cursor: pointer;
		min-width: 0;

		&::-webkit-slider-thumb {
			-webkit-appearance: none;
			appearance: none;
			width: 18px;
			height: 18px;
			border-radius: 50%;
			background: #68c0c8;
			box-shadow: 0 0 8px rgba(104, 192, 200, 0.6);
			cursor: pointer;
			transition: transform 0.15s ease;

			&:hover {
				transform: scale(1.2);
			}
		}

		&::-moz-range-thumb {
			width: 18px;
			height: 18px;
			border: none;
			border-radius: 50%;
			background: #68c0c8;
			box-shadow: 0 0 8px rgba(104, 192, 200, 0.6);
			cursor: pointer;
		}

		&::-webkit-slider-runnable-track {
			height: 4px;
			border-radius: 2px;
		}

		&:disabled {
			cursor: not-allowed;
		}
	}

	.pct {
		font-size: 13px;
		color: rgba(255, 255, 255, 0.7);
		min-width: 36px;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	/* Toggle switch */
	.toggle {
		display: flex;
		align-items: center;
		cursor: pointer;
		gap: 0;

		input[type='checkbox'] {
			position: absolute;
			opacity: 0;
			width: 0;
			height: 0;
			pointer-events: none;
		}

		input[type='checkbox']:checked + .toggle-track {
			background: #68c0c8;
			border-color: #68c0c8;
		}

		input[type='checkbox']:checked + .toggle-track .toggle-thumb {
			transform: translateX(20px);
		}
	}

	.toggle-track {
		position: relative;
		width: 44px;
		height: 24px;
		background: rgba(255, 255, 255, 0.15);
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 12px;
		transition:
			background 0.2s ease,
			border-color 0.2s ease;
	}

	.toggle-thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 16px;
		height: 16px;
		background: white;
		border-radius: 50%;
		transition: transform 0.2s ease;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
	}

	/* Radio group */
	.radio-group {
		display: flex;
		gap: 8px;
	}

	.radio-label {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 16px;
		border-radius: 20px;
		border: 1px solid rgba(255, 255, 255, 0.25);
		background: rgba(255, 255, 255, 0.08);
		font-size: 13px;
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		transition: all 0.15s ease;

		&:hover {
			border-color: rgba(104, 192, 200, 0.5);
			color: rgba(255, 255, 255, 0.9);
		}

		&.selected {
			background: rgba(104, 192, 200, 0.25);
			border-color: #68c0c8;
			color: #fff;
			text-shadow: 0 0 8px rgba(104, 192, 200, 0.5);
		}

		input[type='radio'] {
			position: absolute;
			opacity: 0;
			width: 0;
			height: 0;
			pointer-events: none;
		}
	}
</style>
