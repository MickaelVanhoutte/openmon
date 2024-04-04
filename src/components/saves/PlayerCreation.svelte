<script lang="ts">
	import { SavesHolder } from '../../js/context/savesHolder';

	/**
	 * Player creation component
	 * lots todo here (design, classes, etc)
	 */

	let playerName = 'Ethan';
	let playerClasses = ['conqueror'];
	let selected = playerClasses[0];
	export let savesHolder: SavesHolder;

	function handleSubmit() {
		savesHolder.newGame(1, playerName, 'MALE');
	}
</script>

<h1>player creation</h1>

<form on:submit|preventDefault={handleSubmit}>
	<select bind:value={selected}>
		{#each playerClasses as pClass}
			<option value={pClass}>
				{pClass}
			</option>
		{/each}
	</select>

	<input bind:value={playerName} />

	<button type="submit"> Let's go ! </button>
</form>

<style lang="scss">
</style>
