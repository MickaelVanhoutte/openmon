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
		const offsetMultiplier = popup.index * 16; // 22% offset for 2v2
		if (popup.side === 'ally') {
			return `left: calc(12% + ${offsetMultiplier}%); top: calc(3% + 70px);`;
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
		<span class="popup-text pokemon-name">{popup.pokemonName}'s</span>
		<span class="popup-text ability-name">{popup.abilityName}</span>
	</div>
{/each}

<style lang="scss">
	:root {
		--skew-angle: -15deg;
		--skew-counter: 15deg;
	}

	.ability-popup {
		position: fixed;
		z-index: 1000;
		pointer-events: none;

		// Spatial skewed design matching FloatingPokemonInfo
		transform: skewX(var(--skew-angle));
		background: rgb(43, 71, 112);
		border: 2px solid rgba(255, 255, 255, 0.25);
		border-left: 4px solid rgba(255, 255, 255, 0.6);
		box-shadow:
			0 4px 20px rgba(0, 0, 0, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);

		// Layout
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;

		// Animation
		animation:
			slideIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	.ability-popup.opponent {
		animation:
			slideInRight 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275),
			fadeOutLeft 0.3s ease-in 1.5s forwards;
	}

	.popup-text {
		transform: skewX(var(--skew-counter));
		display: inline-block;
	}

	.pokemon-name {
		color: #cbd5e1;
		font-size: 0.85rem;
		font-weight: 600;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
	}

	.ability-name {
		color: white;
		font-size: 0.95rem;
		font-weight: 700;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: skewX(var(--skew-angle)) translateX(-30px);
		}
		to {
			opacity: 1;
			transform: skewX(var(--skew-angle)) translateX(0);
		}
	}

	@keyframes slideInRight {
		from {
			opacity: 0;
			transform: skewX(var(--skew-angle)) translateX(30px);
		}
		to {
			opacity: 1;
			transform: skewX(var(--skew-angle)) translateX(0);
		}
	}

	@keyframes fadeOut {
		to {
			opacity: 0;
			transform: skewX(var(--skew-angle)) translateX(20px);
		}
	}

	@keyframes fadeOutLeft {
		to {
			opacity: 0;
			transform: skewX(var(--skew-angle)) translateX(-20px);
		}
	}
</style>
