<script lang="ts">
	import { gsap } from 'gsap';
	import { onMount } from 'svelte';
	import type { AchievementUnlock } from '../../js/achievements/achievement-manager';

	interface Props {
		unlock: AchievementUnlock;
		onDismiss: () => void;
	}

	const { unlock, onDismiss }: Props = $props();
	let container: HTMLDivElement;
	let shimmer: HTMLDivElement;

	const ITEM_NAMES: Record<number, string> = {
		1: 'Master Ball', 2: 'Ultra Ball', 3: 'Great Ball', 4: 'Poke Ball',
		17: 'Potion', 23: 'Full Restore', 24: 'Max Potion', 25: 'Hyper Potion',
		26: 'Super Potion', 28: 'Revive', 29: 'Max Revive',
		30: 'Fresh Water', 31: 'Soda Pop', 32: 'Lemonade', 33: 'Moomoo Milk',
		4004: 'Life Orb', 4006: 'Leftovers', 4007: 'Focus Sash',
		4022: 'Lucky Egg', 4025: 'Weakness Policy', 4005: 'Expert Belt',
		4001: 'Choice Band', 4002: 'Choice Specs', 4003: 'Choice Scarf'
	};

	const POKEMON_NAMES: Record<number, string> = {
		50: 'Eevee', 224: 'Dratini', 208: 'Larvitar', 141: 'Riolu',
		221: 'Beldum', 214: 'Gible', 154: 'Ralts', 4: 'Mudkip'
	};

	function formatRewards(reward: AchievementUnlock['reward']): string[] {
		const parts: string[] = [];
		if (reward.money) parts.push(`+${reward.money}$`);
		if (reward.items) {
			for (const item of reward.items) {
				const name = ITEM_NAMES[item.itemId] ?? 'Item';
				parts.push(`${item.quantity}x ${name}`);
			}
		}
		if (reward.pokemon) {
			for (const p of reward.pokemon) {
				const name = POKEMON_NAMES[p.pokedexId] ?? 'Pokemon';
				parts.push(`Lv.${p.level} ${name}`);
			}
		}
		if (reward.masteryPoints) parts.push(`+${reward.masteryPoints} SP`);
		return parts;
	}

	function getTierColor(label: string): string {
		switch (label.toLowerCase()) {
			case 'bronze': return '#cd7f32';
			case 'silver': return '#c0c0c0';
			case 'gold': return '#ffd700';
			case 'platinum': return '#e5e4e2';
			case 'diamond': return '#b9f2ff';
			default: return '#888';
		}
	}

	onMount(() => {
		const tl = gsap.timeline();

		// Entrance
		tl.from(container, {
			y: -140,
			opacity: 0,
			scale: 0.8,
			duration: 0.6,
			ease: 'back.out(1.7)'
		})
		// Shimmer sweep
		.to(shimmer, {
			x: '400%',
			duration: 0.8,
			ease: 'power2.inOut'
		}, '-=0.2')
		// Glow pulse
		.to(container, {
			boxShadow: '0 0 30px rgba(255, 215, 0, 0.6), 0 4px 20px rgba(0, 0, 0, 0.5)',
			duration: 0.4,
			yoyo: true,
			repeat: 1
		}, '-=0.5')
		// Hold then exit
		.to(container, {
			opacity: 0,
			y: -40,
			scale: 0.95,
			duration: 0.5,
			delay: 3.5,
			ease: 'power2.in',
			onComplete: onDismiss
		});
	});
</script>

<div class="achievement-toast" bind:this={container}>
	<div class="shimmer" bind:this={shimmer}></div>

	<div class="toast-left">
		<div class="trophy-ring" style="--ring-color: {getTierColor(unlock.tierLabel)}">
			<span class="trophy">&#127942;</span>
		</div>
	</div>

	<div class="toast-center">
		<div class="toast-header">Achievement Unlocked!</div>
		<div class="toast-name">
			{unlock.definition.name}
			<span class="tier-tag" style="background: {getTierColor(unlock.tierLabel)}; color: #000">
				{unlock.tierLabel}
			</span>
		</div>
		<div class="toast-rewards">
			{#each formatRewards(unlock.reward) as r}
				<span class="reward-chip">{r}</span>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	.achievement-toast {
		position: fixed;
		top: 16px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 100;

		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 22px 14px 16px;

		background: linear-gradient(
			135deg,
			rgba(10, 20, 40, 0.95) 0%,
			rgba(15, 35, 60, 0.95) 50%,
			rgba(10, 25, 45, 0.95) 100%
		);
		border: 2px solid rgba(255, 215, 0, 0.6);
		border-radius: 12px;
		box-shadow:
			0 0 20px rgba(255, 215, 0, 0.3),
			0 8px 32px rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(8px);

		color: #fff;
		font-family: pokemon, serif;
		min-width: 320px;
		max-width: 480px;
		overflow: hidden;
	}

	.shimmer {
		position: absolute;
		top: 0;
		left: -50%;
		width: 30%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 215, 0, 0.15),
			transparent
		);
		transform: skewX(-20deg);
		pointer-events: none;
	}

	.toast-left {
		flex-shrink: 0;

		.trophy-ring {
			width: 52px;
			height: 52px;
			border-radius: 50%;
			border: 3px solid var(--ring-color);
			display: flex;
			align-items: center;
			justify-content: center;
			background: radial-gradient(circle, rgba(255, 215, 0, 0.1), transparent);
			box-shadow:
				0 0 12px rgba(255, 215, 0, 0.2),
				inset 0 0 12px rgba(255, 215, 0, 0.1);

			.trophy {
				font-size: 28px;
				animation: trophy-wobble 1.5s ease-in-out infinite;
				filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
			}
		}
	}

	.toast-center {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;

		.toast-header {
			font-size: 11px;
			color: #ffd700;
			text-transform: uppercase;
			letter-spacing: 2px;
			text-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
		}

		.toast-name {
			font-size: 18px;
			color: #fff;
			text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
			display: flex;
			align-items: center;
			gap: 8px;
			flex-wrap: wrap;

			.tier-tag {
				font-size: 10px;
				padding: 2px 8px;
				border-radius: 8px;
				font-weight: bold;
				text-transform: uppercase;
				letter-spacing: 0.5px;
				text-shadow: none;
			}
		}

		.toast-rewards {
			display: flex;
			gap: 6px;
			flex-wrap: wrap;
			margin-top: 2px;

			.reward-chip {
				font-size: 12px;
				padding: 2px 10px;
				background: rgba(104, 192, 200, 0.15);
				border: 1px solid rgba(104, 192, 200, 0.3);
				border-radius: 8px;
				color: #68c0c8;
			}
		}
	}

	@keyframes trophy-wobble {
		0%, 100% {
			transform: translateY(0) rotate(0deg);
		}
		20% {
			transform: translateY(-3px) rotate(-8deg);
		}
		40% {
			transform: translateY(-3px) rotate(8deg);
		}
		60% {
			transform: translateY(-2px) rotate(-4deg);
		}
		80% {
			transform: translateY(-1px) rotate(2deg);
		}
	}
</style>
