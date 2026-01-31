<script lang="ts">
	import { fade } from 'svelte/transition';

	interface StatChange {
		stat: string;
		stages: number;
	}

	interface Props {
		name: string;
		level: number;
		currentHp: number;
		maxHp: number;
		gender?: 'male' | 'female' | 'unknown';
		statusAbr?: string | null;
		statChanges?: StatChange[];
		position?: { bottom: string; left: string };
		isAlly?: boolean;
		showExpBar?: boolean;
		expPercent?: number;
		spriteElement?: HTMLElement | null;
		visible?: boolean;
	}

	let {
		name,
		level,
		currentHp,
		maxHp,
		gender = 'unknown',
		statusAbr = null,
		statChanges = [],
		position = { bottom: '42%', left: '22%' },
		isAlly = true,
		showExpBar = false,
		expPercent = 0,
		spriteElement = null,
		visible = true
	}: Props = $props();

	const hpPercent = $derived((currentHp / maxHp) * 100);

	const hpColor = $derived(() => {
		if (hpPercent > 50) return '#4ade80';
		if (hpPercent > 20) return '#facc15';
		return '#ef4444';
	});

	const hpGradient = $derived(() => {
		const color = hpColor();
		const darkColor = hpPercent > 50 ? '#22c55e' : hpPercent > 20 ? '#eab308' : '#dc2626';
		return `linear-gradient(90deg, ${darkColor} 0%, ${color} 100%)`;
	});

	const genderSymbol = $derived(() => {
		if (gender === 'male') return '\u2642';
		if (gender === 'female') return '\u2640';
		return '';
	});

	const genderColor = $derived(() => {
		if (gender === 'male') return '#60a5fa';
		if (gender === 'female') return '#f472b6';
		return 'transparent';
	});

	function getStatusColor(status: string): string {
		const colors: Record<string, string> = {
			PSN: '#A040A0',
			TOX: '#700070',
			BRN: '#F08030',
			PAR: '#F8D030',
			SLP: '#A8A8A8',
			FRZ: '#98D8D8'
		};
		return colors[status] || '#666666';
	}

	// Suppress unused warning - spriteElement will be used in Task 7
	void spriteElement;
</script>

{#if visible}
	<div
		class="floating-pokemon-info spatial-panel"
		style="bottom: {position.bottom}; left: {position.left};"
		transition:fade={{ duration: 200 }}
	>
		<div class="leader-line"></div>

		<div class="info-header">
			<span class="pokemon-name spatial-text">{name}</span>
			{#if genderSymbol()}
				<span class="gender-symbol spatial-text" style="color: {genderColor()}"
					>{genderSymbol()}</span
				>
			{/if}
			<div class="level-badge">
				<span class="level-text spatial-text">Lv.{level}</span>
			</div>
		</div>

		<div class="hp-bar-container">
			<div class="hp-bar-bg">
				<div class="hp-bar-fill" style="width: {hpPercent}%; background: {hpGradient()}"></div>
			</div>
			<div class="hp-numbers spatial-text">{currentHp} / {maxHp}</div>
		</div>

		{#if showExpBar && isAlly}
			<div class="exp-bar-container">
				<div class="exp-bar-bg">
					<div class="exp-bar-fill" style="width: {expPercent}%"></div>
				</div>
			</div>
		{/if}

		{#if statusAbr}
			<div class="status-chip" style="background-color: {getStatusColor(statusAbr)}">
				<span class="spatial-text">{statusAbr}</span>
			</div>
		{/if}

		{#if statChanges && statChanges.length > 0}
			<div class="stat-changes">
				{#each statChanges as change}
					<span
						class="stat-change"
						class:positive={change.stages > 0}
						class:negative={change.stages < 0}
					>
						<span class="spatial-text">
							{change.stat}
							{change.stages > 0 ? '+' : ''}{change.stages}
						</span>
					</span>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	:root {
		--skew-angle: -15deg;
		--skew-counter: 15deg;
		--spatial-bg: rgba(20, 25, 35, 0.92);
	}

	.floating-pokemon-info {
		position: absolute;
		z-index: 50;
		min-width: 180px;
		padding: 10px 16px 10px 20px;
		transform: skewX(var(--skew-angle));
		background: var(--spatial-bg);
		border: 2px solid rgba(255, 255, 255, 0.25);
		border-left: 4px solid rgba(255, 255, 255, 0.6);
		box-shadow:
			0 4px 20px rgba(0, 0, 0, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.spatial-text {
		transform: skewX(var(--skew-counter));
		display: inline-block;
	}

	.leader-line {
		position: absolute;
		width: 2px;
		height: 35px;
		bottom: -35px;
		left: 50%;
		transform: translateX(-50%) skewX(var(--skew-counter));
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.1) 100%);
		pointer-events: none;
	}

	.info-header {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 8px;
	}

	.pokemon-name {
		font-size: 1.1rem;
		font-weight: 700;
		color: white;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
		max-width: 120px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.gender-symbol {
		font-size: 1rem;
		font-weight: bold;
	}

	.level-badge {
		margin-left: auto;
		padding: 2px 10px;
		background: rgba(0, 0, 0, 0.5);
		transform: skewX(var(--skew-angle));
		clip-path: polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%);
	}

	.level-text {
		font-size: 0.85rem;
		font-weight: 600;
		color: #cbd5e1;
	}

	.hp-bar-container {
		margin-bottom: 4px;
	}

	.hp-bar-bg {
		height: 8px;
		background: rgba(0, 0, 0, 0.6);
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.15);
		clip-path: polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%);
	}

	.hp-bar-fill {
		height: 100%;
		transition:
			width 0.4s ease-out,
			background 0.3s ease;
	}

	.hp-numbers {
		text-align: right;
		font-size: 0.8rem;
		color: #94a3b8;
		margin-top: 2px;
	}

	.exp-bar-container {
		margin-top: 4px;
	}

	.exp-bar-bg {
		height: 4px;
		background: rgba(0, 0, 0, 0.5);
		overflow: hidden;
		clip-path: polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%);
	}

	.exp-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
		transition: width 0.5s ease-out;
	}

	.status-chip {
		display: inline-block;
		margin-top: 6px;
		padding: 2px 10px;
		transform: skewX(var(--skew-angle));
		font-size: 0.75rem;
		font-weight: 700;
		color: white;
		text-transform: uppercase;
	}

	.stat-changes {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-top: 6px;
	}

	.stat-change {
		padding: 2px 8px;
		transform: skewX(var(--skew-angle));
		font-size: 0.7rem;
		font-weight: 600;
	}

	.stat-change.positive {
		background: rgba(34, 197, 94, 0.3);
		color: #4ade80;
		border-left: 2px solid #4ade80;
	}

	.stat-change.negative {
		background: rgba(239, 68, 68, 0.3);
		color: #f87171;
		border-left: 2px solid #f87171;
	}
</style>
