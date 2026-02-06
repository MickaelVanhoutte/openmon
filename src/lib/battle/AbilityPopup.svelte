<script lang="ts">
	import { abilityPopupStore, type PopupData } from '$js/battle/ability-popup-store';

	let popups = $state<PopupData[]>([]);

	$effect(() => {
		const unsubscribe = abilityPopupStore.subscribe((value) => {
			popups = value;
		});
		return unsubscribe;
	});
</script>

<div class="ability-popup-container">
	{#each popups as popup (popup.id)}
		<div class="ability-popup">
			<span class="pokemon-name">{popup.pokemonName}'s</span>
			<span class="ability-name">{popup.abilityName}!</span>
		</div>
	{/each}
</div>

<style>
	.ability-popup-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		pointer-events: none;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding-top: 15%;
	}

	.ability-popup {
		background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
		border: 2px solid #ffd700;
		border-radius: 8px;
		padding: 12px 24px;
		color: white;
		font-size: 1.4rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
		animation:
			slideIn 0.3s ease-out,
			fadeOut 0.3s ease-in 1.2s forwards;
	}

	.pokemon-name {
		color: #87ceeb;
		margin-right: 4px;
	}

	.ability-name {
		color: #ffd700;
		font-weight: bold;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(-30px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes fadeOut {
		to {
			opacity: 0;
			transform: translateX(30px);
		}
	}
</style>
