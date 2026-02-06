<script lang="ts">
	import { abilityPopupStore, type PopupData } from '$js/battle/ability-popup-store';

	let popups = $state<PopupData[]>([]);

	$effect(() => {
		const unsubscribe = abilityPopupStore.subscribe((value) => {
			popups = value;
		});
		return unsubscribe;
	});

	function getPopupStyle(popup: PopupData): string {
		// Position under HP bar: ally on left, opponent on right
		// AllyInfo: top:3%, left:2%; EnemyInfo: top:3%, right:2%
		// HP bar is about 60px tall, popup goes below it (roughly top: calc(3% + 70px))
		const offsetMultiplier = popup.index * 22; // 22% offset for 2v2
		if (popup.side === 'ally') {
			return `left: calc(2% + ${offsetMultiplier}%); top: calc(3% + 70px);`;
		} else {
			return `right: calc(2% + ${offsetMultiplier}%); top: calc(3% + 70px);`;
		}
	}
</script>

{#each popups as popup (popup.id)}
	<div
		class="ability-popup"
		class:opponent={popup.side === 'opponent'}
		style={getPopupStyle(popup)}
	>
		<span class="pokemon-name">{popup.pokemonName}'s</span>
		<span class="ability-name">{popup.abilityName}</span>
	</div>
{/each}

<style>
	.ability-popup {
		position: fixed;
		background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
		border: 2px solid #ffd700;
		border-radius: 6px;
		padding: 6px 12px;
		color: white;
		font-size: 0.85rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
		pointer-events: none;
		z-index: 1000;
		animation:
			slideIn 0.3s ease-out,
			fadeOut 0.3s ease-in 1.2s forwards;
		white-space: nowrap;
	}

	.ability-popup.opponent {
		animation:
			slideInRight 0.3s ease-out,
			fadeOutLeft 0.3s ease-in 1.2s forwards;
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
			transform: translateX(-20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes slideInRight {
		from {
			opacity: 0;
			transform: translateX(20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes fadeOut {
		to {
			opacity: 0;
			transform: translateX(20px);
		}
	}

	@keyframes fadeOutLeft {
		to {
			opacity: 0;
			transform: translateX(-20px);
		}
	}
</style>
