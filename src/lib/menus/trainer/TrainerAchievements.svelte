<script lang="ts">
	import type { GameContext } from '../../../js/context/gameContext';
	import { ACHIEVEMENTS } from '../../../js/achievements/achievement-registry';
	import { AchievementCategory } from '../../../js/achievements/achievement-definitions';
	import type {
		AchievementDefinition,
		AchievementTier
	} from '../../../js/achievements/achievement-definitions';

	interface Props {
		context: GameContext;
	}

	const { context }: Props = $props();
	const am = context.achievementManager;

	let selectedCategory = $state<AchievementCategory | 'all'>('all');

	const categories: { key: AchievementCategory | 'all'; label: string; icon: string }[] = [
		{ key: 'all', label: 'All', icon: '★' },
		{ key: AchievementCategory.CAPTURE, label: 'Capture', icon: '◉' },
		{ key: AchievementCategory.BATTLE, label: 'Battle', icon: '⚔' },
		{ key: AchievementCategory.PROGRESSION, label: 'Progress', icon: '▲' },
		{ key: AchievementCategory.ECONOMY, label: 'Economy', icon: '$' },
		{ key: AchievementCategory.EXPLORATION, label: 'Explore', icon: '⬡' },
		{ key: AchievementCategory.COLLECTION, label: 'Collect', icon: '◈' }
	];

	const filteredAchievements = $derived(
		selectedCategory === 'all'
			? ACHIEVEMENTS
			: ACHIEVEMENTS.filter((a) => a.category === selectedCategory)
	);

	const summary = $derived(am.getSummary());

	function getProgressValue(def: AchievementDefinition): number {
		return def.getProgress(am.stats, context);
	}

	function getCurrentTier(achievementId: string): number {
		return am.state.getProgress(achievementId).currentTier;
	}

	function getNextTier(def: AchievementDefinition): AchievementTier | undefined {
		const current = getCurrentTier(def.id);
		return def.tiers.find((t) => t.tier > current);
	}

	function getHighestUnlockedTier(def: AchievementDefinition): AchievementTier | undefined {
		const current = getCurrentTier(def.id);
		return [...def.tiers].reverse().find((t) => t.tier <= current);
	}

	function isFullyCompleted(def: AchievementDefinition): boolean {
		return getCurrentTier(def.id) >= def.tiers[def.tiers.length - 1].tier;
	}

	function getProgressPercent(def: AchievementDefinition): number {
		const next = getNextTier(def);
		if (!next) return 100;
		const currentTierNum = getCurrentTier(def.id);
		const prevTier = def.tiers.find((t) => t.tier === currentTierNum);
		const floor = prevTier?.threshold ?? 0;
		const progress = getProgressValue(def);
		const range = next.threshold - floor;
		if (range <= 0) return 100;
		return Math.min(100, Math.floor(((progress - floor) / range) * 100));
	}

	function getTierColor(label: string): string {
		switch (label.toLowerCase()) {
			case 'bronze':
				return '#cd7f32';
			case 'silver':
				return '#c0c0c0';
			case 'gold':
				return '#ffd700';
			case 'platinum':
				return '#e5e4e2';
			case 'diamond':
				return '#b9f2ff';
			default:
				return '#888';
		}
	}

	function getTierGradient(label: string): string {
		switch (label.toLowerCase()) {
			case 'bronze':
				return 'linear-gradient(135deg, #cd7f32, #a0522d)';
			case 'silver':
				return 'linear-gradient(135deg, #e0e0e0, #a0a0a0)';
			case 'gold':
				return 'linear-gradient(135deg, #ffd700, #daa520)';
			case 'platinum':
				return 'linear-gradient(135deg, #e5e4e2, #b0b0b0)';
			case 'diamond':
				return 'linear-gradient(135deg, #b9f2ff, #7ec8e3)';
			default:
				return 'linear-gradient(135deg, #888, #666)';
		}
	}

	function getCategoryColor(key: AchievementCategory | 'all'): string {
		switch (key) {
			case 'all':
				return '#ffd700';
			case AchievementCategory.CAPTURE:
				return '#ff6b6b';
			case AchievementCategory.BATTLE:
				return '#f0932b';
			case AchievementCategory.PROGRESSION:
				return '#6c5ce7';
			case AchievementCategory.ECONOMY:
				return '#ffd700';
			case AchievementCategory.EXPLORATION:
				return '#00b894';
			case AchievementCategory.COLLECTION:
				return '#0984e3';
			default:
				return '#68c0c8';
		}
	}

	function formatDescription(def: AchievementDefinition): string {
		const next = getNextTier(def);
		if (!next) {
			const lastTier = def.tiers[def.tiers.length - 1];
			return def.description.replace('{threshold}', lastTier.threshold.toLocaleString());
		}
		return def.description.replace('{threshold}', next.threshold.toLocaleString());
	}

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

	function formatReward(tier: AchievementTier): string[] {
		const parts: string[] = [];
		if (tier.reward.money) parts.push(`${tier.reward.money}$`);
		if (tier.reward.items) {
			for (const item of tier.reward.items) {
				const name = ITEM_NAMES[item.itemId] ?? 'Item';
				parts.push(`${item.quantity}x ${name}`);
			}
		}
		if (tier.reward.pokemon) {
			for (const p of tier.reward.pokemon) {
				const name = POKEMON_NAMES[p.pokedexId] ?? 'Pokemon';
				parts.push(`Lv.${p.level} ${name}`);
			}
		}
		if (tier.reward.masteryPoints) parts.push(`${tier.reward.masteryPoints} SP`);
		return parts;
	}
</script>

<div class="achievements-panel">
	<!-- Left sidebar with categories -->
	<div class="sidebar">
		<div class="sidebar-header">
			<span class="sidebar-count">{summary.unlocked}</span>
			<span class="sidebar-total">/{summary.total}</span>
		</div>
		{#each categories as cat}
			<button
				class="cat-btn"
				class:active={selectedCategory === cat.key}
				onclick={() => (selectedCategory = cat.key)}
				type="button"
				style="--cat-color: {getCategoryColor(cat.key)}"
			>
				<span class="cat-icon">{cat.icon}</span>
				<span class="cat-label">{cat.label}</span>
			</button>
		{/each}
	</div>

	<!-- Right content area -->
	<div class="content">
		<div class="content-header">
			<span class="content-title">
				{selectedCategory === 'all' ? 'All Achievements' : categories.find((c) => c.key === selectedCategory)?.label}
			</span>
			<span class="content-count">{filteredAchievements.length} achievements</span>
		</div>

		<div class="achievements-list">
			{#each filteredAchievements as def (def.id)}
				{@const progress = getProgressValue(def)}
				{@const nextTier = getNextTier(def)}
				{@const completed = isFullyCompleted(def)}
				{@const percent = getProgressPercent(def)}
				{@const unlockedTier = getHighestUnlockedTier(def)}
				{@const currentTierNum = getCurrentTier(def.id)}

				<div class="achievement-card" class:completed>
					<!-- Icon area -->
					<div class="card-icon-area">
						<div
							class="card-icon"
							class:glow={completed}
							style="--icon-accent: {getCategoryColor(def.category)}"
						>
							{#if completed}
								<span class="icon-check">&#10003;</span>
							{:else}
								<img src={def.icon} alt={def.name} class="icon-img" />
							{/if}
						</div>
						{#if unlockedTier}
							<div class="tier-medal" style="background: {getTierGradient(unlockedTier.label)}">
								{unlockedTier.label.charAt(0)}
							</div>
						{/if}
					</div>

					<!-- Main info -->
					<div class="card-body">
						<div class="card-title-row">
							<span class="card-name">{def.name}</span>
							{#if unlockedTier}
								<span
									class="card-tier-label"
									style="color: {getTierColor(unlockedTier.label)}"
								>
									{unlockedTier.label}
								</span>
							{:else}
								<span class="card-tier-label locked">Locked</span>
							{/if}
						</div>

						<div class="card-desc">{formatDescription(def)}</div>

						<!-- Tier pips -->
						<div class="tier-pips">
							{#each def.tiers as tier, i}
								<div
									class="pip"
									class:unlocked={tier.tier <= currentTierNum}
									class:next={tier.tier === currentTierNum + 1}
									style="--pip-color: {getTierColor(tier.label)}"
								>
									<div class="pip-fill"></div>
								</div>
								{#if i < def.tiers.length - 1}
									<div
										class="pip-line"
										class:filled={tier.tier <= currentTierNum}
									></div>
								{/if}
							{/each}
						</div>

						<!-- Progress bar -->
						<div class="progress-row">
							<div class="progress-track">
								<div
									class="progress-fill"
									class:complete={completed}
									style="width: {percent}%"
								></div>
							</div>
							<span class="progress-label">
								{#if nextTier}
									{progress}/{nextTier.threshold}
								{:else}
									MAX
								{/if}
							</span>
						</div>
					</div>

					<!-- Rewards -->
					<div class="card-rewards">
						{#if nextTier}
							{#each formatReward(nextTier) as reward}
								<div class="reward-pill">{reward}</div>
							{/each}
						{:else}
							<div class="reward-pill done">&#10003;</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	.achievements-panel {
		height: 100%;
		width: 100%;
		display: flex;
		overflow: hidden;
	}

	/* ---- SIDEBAR ---- */
	.sidebar {
		width: 110px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 8px 6px;
		background: rgba(0, 15, 30, 0.6);
		border-right: 2px solid rgba(0, 0, 0, 0.5);
		overflow-y: auto;

		.sidebar-header {
			text-align: center;
			padding: 6px 0 8px;
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			margin-bottom: 4px;

			.sidebar-count {
				font-size: 22px;
				color: #ffd700;
				text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
			}
			.sidebar-total {
				font-size: 14px;
				color: rgba(255, 255, 255, 0.4);
			}
		}

		.cat-btn {
			display: flex;
			align-items: center;
			gap: 6px;
			padding: 8px 8px;
			background: rgba(20, 56, 85, 0.5);
			border: 2px solid transparent;
			color: rgba(255, 255, 255, 0.5);
			font-family: pokemon, serif;
			font-size: 13px;
			cursor: pointer;
			transition: all 0.15s ease;

			.cat-icon {
				font-size: 14px;
				width: 20px;
				text-align: center;
			}

			.cat-label {
				flex: 1;
				text-align: left;
			}

			&:hover {
				background: rgba(20, 56, 85, 0.8);
				color: rgba(255, 255, 255, 0.8);
			}

			&.active {
				background: linear-gradient(
					135deg,
					rgba(0, 120, 192, 0.6),
					rgba(0, 80, 140, 0.8)
				);
				border-color: var(--cat-color);
				color: white;
				box-shadow:
					0 0 10px rgba(0, 120, 192, 0.3),
					inset 0 1px 0 rgba(255, 255, 255, 0.1);

				.cat-icon {
					color: var(--cat-color);
				}
			}
		}
	}

	/* ---- CONTENT ---- */
	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;

		.content-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 8px 14px;
			background: rgba(0, 15, 30, 0.4);
			border-bottom: 1px solid rgba(255, 255, 255, 0.08);

			.content-title {
				font-size: 18px;
				color: #fff;
				text-shadow: 1px 1px 2px black;
			}
			.content-count {
				font-size: 12px;
				color: rgba(255, 255, 255, 0.35);
			}
		}
	}

	.achievements-list {
		flex: 1;
		overflow-y: auto;
		padding: 10px 12px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	/* ---- CARD ---- */
	.achievement-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
		background: linear-gradient(
			135deg,
			rgba(20, 56, 85, 0.9) 0%,
			rgba(15, 40, 65, 0.95) 100%
		);
		border: 2px solid rgba(60, 100, 140, 0.4);
		box-shadow:
			0 2px 8px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
		min-height: 80px;

		&.completed {
			border-color: rgba(255, 215, 0, 0.5);
			background: linear-gradient(
				135deg,
				rgba(40, 60, 80, 0.9) 0%,
				rgba(30, 50, 70, 0.95) 100%
			);
			box-shadow:
				0 2px 12px rgba(255, 215, 0, 0.1),
				0 2px 8px rgba(0, 0, 0, 0.3),
				inset 0 1px 0 rgba(255, 215, 0, 0.1);
		}
	}

	/* ---- CARD ICON ---- */
	.card-icon-area {
		flex-shrink: 0;
		position: relative;

		.card-icon {
			width: 52px;
			height: 52px;
			display: flex;
			align-items: center;
			justify-content: center;
			background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.08), transparent);
			border: 2px solid rgba(100, 140, 180, 0.4);
			border-radius: 10px;
			overflow: hidden;

			&.glow {
				border-color: rgba(255, 215, 0, 0.6);
				box-shadow: 0 0 12px rgba(255, 215, 0, 0.25);
				background: radial-gradient(
					circle at 30% 30%,
					rgba(255, 215, 0, 0.15),
					transparent
				);
			}

			.icon-check {
				font-size: 26px;
				color: #ffd700;
				text-shadow: 0 0 6px rgba(255, 215, 0, 0.5);
			}

			.icon-img {
				width: 36px;
				height: 36px;
				image-rendering: pixelated;
				filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
			}
		}

		.tier-medal {
			position: absolute;
			bottom: -4px;
			right: -4px;
			width: 20px;
			height: 20px;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 11px;
			font-weight: bold;
			color: rgba(0, 0, 0, 0.7);
			border: 2px solid rgba(0, 0, 0, 0.3);
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
		}
	}

	/* ---- CARD BODY ---- */
	.card-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;

		.card-title-row {
			display: flex;
			align-items: center;
			gap: 8px;

			.card-name {
				font-size: 16px;
				color: #fff;
				text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.card-tier-label {
				font-size: 11px;
				padding: 1px 8px;
				border-radius: 8px;
				background: rgba(0, 0, 0, 0.3);
				white-space: nowrap;
				text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);

				&.locked {
					color: rgba(255, 255, 255, 0.3);
				}
			}
		}

		.card-desc {
			font-size: 12px;
			color: rgba(255, 255, 255, 0.5);
			line-height: 1.3;
		}

		.tier-pips {
			display: flex;
			align-items: center;
			gap: 0;
			margin: 2px 0;

			.pip {
				width: 14px;
				height: 14px;
				border-radius: 50%;
				border: 2px solid rgba(60, 80, 100, 0.6);
				display: flex;
				align-items: center;
				justify-content: center;
				background: rgba(0, 0, 0, 0.3);
				position: relative;

				.pip-fill {
					width: 0;
					height: 0;
					border-radius: 50%;
					transition: all 0.3s ease;
				}

				&.unlocked {
					border-color: var(--pip-color);

					.pip-fill {
						width: 8px;
						height: 8px;
						background: var(--pip-color);
						box-shadow: 0 0 4px var(--pip-color);
					}
				}

				&.next {
					border-color: rgba(255, 255, 255, 0.3);
					animation: pip-pulse 2s ease-in-out infinite;
				}
			}

			.pip-line {
				width: 12px;
				height: 2px;
				background: rgba(60, 80, 100, 0.4);

				&.filled {
					background: rgba(255, 255, 255, 0.3);
				}
			}
		}

		.progress-row {
			display: flex;
			align-items: center;
			gap: 10px;

			.progress-track {
				flex: 1;
				height: 10px;
				background: rgba(0, 0, 0, 0.4);
				border-radius: 5px;
				overflow: hidden;
				border: 1px solid rgba(60, 100, 140, 0.3);

				.progress-fill {
					height: 100%;
					background: linear-gradient(90deg, #0078c0, #00b4d8);
					border-radius: 5px;
					transition: width 0.4s ease;
					box-shadow: 0 0 6px rgba(0, 120, 192, 0.4);
					position: relative;

					&::after {
						content: '';
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						height: 50%;
						background: linear-gradient(
							180deg,
							rgba(255, 255, 255, 0.2),
							transparent
						);
						border-radius: 5px 5px 0 0;
					}

					&.complete {
						background: linear-gradient(90deg, #daa520, #ffd700);
						box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
					}
				}
			}

			.progress-label {
				font-size: 13px;
				color: #68c0c8;
				white-space: nowrap;
				min-width: 48px;
				text-align: right;
				text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
			}
		}
	}

	/* ---- CARD REWARDS ---- */
	.card-rewards {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		min-width: 56px;

		.reward-pill {
			font-size: 12px;
			padding: 2px 10px;
			background: rgba(255, 215, 0, 0.15);
			border: 1px solid rgba(255, 215, 0, 0.3);
			border-radius: 10px;
			color: #ffd700;
			white-space: nowrap;
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);

			&.done {
				background: rgba(255, 215, 0, 0.2);
				border-color: rgba(255, 215, 0, 0.5);
				font-size: 16px;
				padding: 4px 12px;
				box-shadow: 0 0 8px rgba(255, 215, 0, 0.2);
			}
		}
	}

	/* ---- ANIMATIONS ---- */
	@keyframes pip-pulse {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
		}
		50% {
			box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.15);
		}
	}
</style>
