<script lang="ts">
	import { onMount } from 'svelte';
	import type { GameContext } from '../../js/context/gameContext';
	import type { OpenMoveRelearner } from '../../js/scripting/scripts';
	import { MoveInstance, type Move, type PokemonInstance } from '../../js/pokemons/pokedex';

	interface Props {
		relearner: OpenMoveRelearner | undefined;
		context: GameContext;
	}

	const { relearner, context }: Props = $props();

	let selectedPokemonIdx = $state(0);
	let selectedMoveIdx = $state(0);
	let phase = $state<'pokemon' | 'moves'>('pokemon');

	const team = $derived(context.player.monsters.filter((m) => !m.fainted));
	const selectedPokemon = $derived(team[selectedPokemonIdx]);

	// Get all moves this Pokemon can learn (any method) that it doesn't currently know
	const availableMoves = $derived.by(() => {
		if (!selectedPokemon) return [];
		const currentMoveIds = new Set(selectedPokemon.moves.map((m) => m.id));
		return selectedPokemon.moves.length > 0
			? (selectedPokemon as PokemonInstance).moves
				? getLearnableMoves(selectedPokemon)
					.filter((m) => !currentMoveIds.has(m.id))
				: []
			: [];
	});

	function getLearnableMoves(pkmn: PokemonInstance): Move[] {
		const entry = context.POKEDEX.findById(pkmn.id);
		if (!entry.found) return [];
		// All moves the species can learn at or below current level (any method)
		return entry.result.moves.filter(
			(m) => m.method === 1 ? m.level <= pkmn.level : true
		);
	}

	const selectedMove = $derived(availableMoves[selectedMoveIdx]);

	function selectPokemon() {
		phase = 'moves';
		selectedMoveIdx = 0;
	}

	function teachMove() {
		if (!selectedPokemon || !selectedMove) return;

		if (selectedPokemon.moves.length < 4) {
			// Add directly
			selectedPokemon.moves.push(
				new MoveInstance(
					selectedMove.id,
					selectedMove.name,
					selectedMove.type,
					selectedMove.category,
					selectedMove.power,
					selectedMove.accuracy,
					selectedMove.pp,
					selectedMove.priority,
					selectedMove.target,
					selectedMove.effect,
					selectedMove.effectChance,
					selectedMove.description,
					selectedMove.level
				)
			);
			close();
		} else {
			// Need to replace a move — enter replace mode
			replaceMode = true;
			replaceIdx = 0;
		}
	}

	let replaceMode = $state(false);
	let replaceIdx = $state(0);

	function replaceMove() {
		if (!selectedPokemon || !selectedMove) return;
		selectedPokemon.moves[replaceIdx] = new MoveInstance(
			selectedMove.id,
			selectedMove.name,
			selectedMove.type,
			selectedMove.category,
			selectedMove.power,
			selectedMove.accuracy,
			selectedMove.pp,
			selectedMove.priority,
			selectedMove.target,
			selectedMove.effect,
			selectedMove.effectChance,
			selectedMove.description,
			selectedMove.level
		);
		close();
	}

	function close() {
		context.scriptRunner?.playingScript?.nextAction(context);
	}

	function back() {
		if (replaceMode) {
			replaceMode = false;
		} else if (phase === 'moves') {
			phase = 'pokemon';
			selectedPokemonIdx = 0;
		} else {
			close();
		}
	}

	const listener = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			back();
			return;
		}

		if (replaceMode) {
			if (e.key === 'ArrowUp') replaceIdx = Math.max(replaceIdx - 1, 0);
			if (e.key === 'ArrowDown') replaceIdx = Math.min(replaceIdx + 1, 3);
			if (e.key === 'Enter') replaceMove();
			return;
		}

		if (phase === 'pokemon') {
			if (e.key === 'ArrowUp') selectedPokemonIdx = Math.max(selectedPokemonIdx - 1, 0);
			if (e.key === 'ArrowDown')
				selectedPokemonIdx = Math.min(selectedPokemonIdx + 1, team.length - 1);
			if (e.key === 'Enter') selectPokemon();
		} else {
			if (e.key === 'ArrowUp') selectedMoveIdx = Math.max(selectedMoveIdx - 1, 0);
			if (e.key === 'ArrowDown')
				selectedMoveIdx = Math.min(selectedMoveIdx + 1, availableMoves.length - 1);
			if (e.key === 'Enter') teachMove();
		}
	};

	onMount(() => {
		window.addEventListener('keydown', listener);
		return () => window.removeEventListener('keydown', listener);
	});
</script>

<div class="relearner-overlay">
	<div class="relearner-panel">
		<h2>Move Tutor</h2>

		{#if phase === 'pokemon'}
			<p>Which Pokemon should learn a move?</p>
			<div class="list">
				{#each team as pkmn, i}
					<button
						class="list-item"
						class:selected={selectedPokemonIdx === i}
						onclick={() => {
							selectedPokemonIdx = i;
							selectPokemon();
						}}
					>
						<img src={pkmn.getSprite()} alt={pkmn.name} />
						<span>{pkmn.name} Lv.{pkmn.level}</span>
					</button>
				{/each}
			</div>
		{:else if replaceMode}
			<p>Replace which move?</p>
			<div class="list">
				{#each selectedPokemon.moves as move, i}
					<button
						class="list-item"
						class:selected={replaceIdx === i}
						onclick={() => {
							replaceIdx = i;
							replaceMove();
						}}
					>
						<span class="type-badge {move.type}">{move.type}</span>
						<span>{move.name}</span>
						<span class="stat">Pow: {move.power || '-'}</span>
					</button>
				{/each}
			</div>
		{:else}
			<p>Teach {selectedPokemon?.name} a move:</p>
			{#if availableMoves.length === 0}
				<p>No new moves available.</p>
			{:else}
				<div class="list">
					{#each availableMoves as move, i}
						<button
							class="list-item"
							class:selected={selectedMoveIdx === i}
							onclick={() => {
								selectedMoveIdx = i;
								teachMove();
							}}
						>
							<span class="type-badge {move.type}">{move.type}</span>
							<span>{move.name}</span>
							<span class="stat">{move.category}</span>
							<span class="stat">Pow: {move.power || '-'}</span>
							<span class="stat">Acc: {move.accuracy || '-'}</span>
						</button>
					{/each}
				</div>
			{/if}
		{/if}

		<div class="controls">
			<button onclick={back}>Back</button>
		</div>
	</div>
</div>

<style lang="scss">
	.relearner-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100dvw;
		height: 100dvh;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.relearner-panel {
		background: var(--pixel-bg-panel, #1a1a2e);
		border: 2px solid var(--pixel-border-color, #ffd700);
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
		padding: 16px;
		min-width: 400px;
		max-width: 600px;
		max-height: 80dvh;
		color: var(--pixel-text-white, #ececec);
		overflow-y: auto;

		h2 {
			margin: 0 0 8px;
			font-size: 1.6rem;
			color: #ffd700;
		}

		p {
			margin: 4px 0 8px;
			font-size: 1.2rem;
		}
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 4px;
		max-height: 50dvh;
		overflow-y: auto;
	}

	.list-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 8px;
		background: rgba(255, 255, 255, 0.05);
		border: 2px solid transparent;
		color: #ececec;
		cursor: pointer;
		font-size: 1.1rem;

		img {
			width: 32px;
			height: 32px;
		}

		&.selected {
			border-color: #ffd700;
			background: rgba(255, 215, 0, 0.1);
		}

		&:hover {
			background: rgba(255, 255, 255, 0.1);
		}
	}

	.type-badge {
		padding: 2px 6px;
		border-radius: 2px;
		font-size: 0.9rem;
		text-transform: uppercase;
		min-width: 60px;
		text-align: center;
	}

	.stat {
		font-size: 0.9rem;
		opacity: 0.7;
	}

	.controls {
		margin-top: 12px;
		display: flex;
		justify-content: flex-end;

		button {
			background: var(--pixel-bg-header, #2a2a4e);
			color: #ececec;
			border: 2px solid var(--pixel-border-color, #ffd700);
			padding: 4px 16px;
			cursor: pointer;
		}
	}
</style>
