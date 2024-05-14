<script lang="ts">
	import { onMount } from 'svelte';
	import { SavesHolder } from '../../js/context/savesHolder';

	/**
	 * Player creation component
	 * lots todo here (design, classes, etc)
	 */

	let playerName = 'Ethan';
	let playerClasses = ['conqueror'];
	let selected = playerClasses[0];
	export let savesHolder: SavesHolder;
	let sound: Howl;
	let soundPlaying: boolean;

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

	function handleSubmit() {
		savesHolder.newGame(1, playerName, 'MALE');
	}

	onMount(() => {
		loadSound();
		return () => {
			sound.stop();
		};
	});
</script>

<div class="create">
	{#each Array.from({ length: 15 }) as i}
		<div class="firefly"></div>
	{/each}

	<form on:submit|preventDefault={handleSubmit}>
		<h1>New game</h1>
		<select bind:value={selected}>
			{#each playerClasses as pClass}
				<option value={pClass}>
					{pClass}
				</option>
			{/each}
		</select>

		<input bind:value={playerName} />

		<button type="submit">Start</button>
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

		color: #e0e0e0;
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

		form {
			max-width: 40%;
			margin: 0 auto;
			display: flex;
			flex-direction: column;
			gap: 16px;
		}
	}
</style>
