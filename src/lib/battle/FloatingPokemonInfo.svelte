<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import type { PokemonInstance } from '../../js/pokemons/pokedex';

	interface StatChange {
		stat: string;
		stages: number;
	}

	interface Props {
		pokemon: PokemonInstance;
		position?: { bottom: string; left: string };
		isAlly?: boolean;
		showExpBar?: boolean;
		expPercent?: number;
		spriteElement?: HTMLElement | null;
		visible?: boolean;
	}

	let {
		pokemon,
		position = { bottom: '62%', left: '22%' },
		isAlly = true,
		showExpBar = false,
		expPercent = 0,
		spriteElement = null,
		visible = true
	}: Props = $props();

	// Force reactivity tick - increment this to force re-render
	let hpTick = $state(0);

	// Reactive derived values from pokemon object
	// The hpTick dependency forces re-evaluation when tick changes
	const name = $derived(pokemon.name);
	const level = $derived(pokemon.level);
	const currentHp = $derived(hpTick >= 0 ? pokemon.currentHp : pokemon.currentHp);
	const maxHp = $derived(hpTick >= 0 ? pokemon.currentStats.hp : pokemon.currentStats.hp);
	const gender = $derived(pokemon.gender || 'unknown');
	const statusAbr = $derived(pokemon.status?.abr || null);
	const statChanges: StatChange[] = [];

	// Poll for HP changes (simple but effective solution)
	let pollInterval: ReturnType<typeof setInterval>;
	let lastHp = $state(pokemon.currentHp);

	onMount(() => {
		// Check for HP changes every 100ms during battle
		pollInterval = setInterval(() => {
			if (pokemon.currentHp !== lastHp) {
				lastHp = pokemon.currentHp;
				hpTick++;
			}
		}, 100);

		return () => {
			clearInterval(pollInterval);
		};
	});

	let computedStyle = $state('');
	let useComputedPosition = $state(false);
	let spriteReady = $state(false);

	// Check if sprite has valid position (not at 0,0)
	function isSpritePositioned(): boolean {
		if (!spriteElement) return false;
		const rect = spriteElement.getBoundingClientRect();
		return rect.x > 0 || rect.y > 0;
	}

	// Poll until sprite is positioned
	function waitForSpritePosition() {
		if (isSpritePositioned()) {
			spriteReady = true;
			updatePositionFromSprite();
		} else {
			requestAnimationFrame(waitForSpritePosition);
		}
	}

	function updatePositionFromSprite() {
		if (!spriteElement) {
			useComputedPosition = false;
			return;
		}

		const rect = spriteElement.getBoundingClientRect();
		const container = spriteElement.closest('.scene') as HTMLElement | null;
		const containerRect = container?.getBoundingClientRect() || { top: 0, left: 0 };

		const widgetHeight = 80;
		const widgetWidth = 180;

		const top = rect.top - containerRect.top - widgetHeight - 10;
		const left = rect.left - containerRect.left + rect.width / 2 - widgetWidth / 2;

		computedStyle = `top: ${top}px; left: ${left}px;`;
		useComputedPosition = true;
	}

	onMount(() => {
		if (spriteElement) {
			waitForSpritePosition();
		}

		window.addEventListener('resize', updatePositionFromSprite);

		let observer: ResizeObserver | null = null;
		if (spriteElement) {
			observer = new ResizeObserver(updatePositionFromSprite);
			observer.observe(spriteElement);
		}

		return () => {
			window.removeEventListener('resize', updatePositionFromSprite);
			observer?.disconnect();
		};
	});

	$effect(() => {
		if (spriteElement) {
			spriteReady = false;
			waitForSpritePosition();
		}
	});

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
</script>

{#if visible && (!spriteElement || spriteReady)}
	<div
		class="floating-pokemon-info spatial-panel"
		style={useComputedPosition
			? computedStyle
			: `bottom: ${position.bottom}; left: ${position.left};`}
		transition:fade={{ duration: 200 }}
	>
		<div class="leader-line"></div>

		<div class="info-header">
			<span class="pokemon-name spatial-text"
				>{name}

				{#if genderSymbol()}
					<span class="gender-symbol spatial-text" style="color: {genderColor()}"
						>{genderSymbol()}</span
					>
				{/if}
			</span>

			<span class="level-text spatial-text">Lv.{level}</span>
		</div>

		<div class="hp-bar-container">
			<div class="hp-bar-bg">
				<div class="hp-bar-fill" style="width: {hpPercent}%; background: {hpGradient()}">
					<span class="hp-value">{currentHp} / {maxHp}</span>
				</div>
			</div>
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
		min-width: 160px;
		padding: 0 8px 8px 8px;
		transform: skewX(var(--skew-angle));
		background: rgb(43, 71, 112);
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
		padding: 4px;
		justify-content: space-between;
	}

	.pokemon-name {
		font-size: 1.5rem;
		font-weight: 700;
		color: white;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
		max-width: 120px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.gender-symbol {
		font-size: 1.5rem;
		font-weight: bold;
		margin-left: 6px;
	}

	.level-text {
		font-size: 1.5rem;
		font-weight: 600;
		color: #cbd5e1;
		transform: skewX(var(--skew-angle));
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
		position: relative;
		transition:
			width 0.4s ease-out,
			background 0.3s ease;
	}

	.hp-value {
		position: absolute;
		top: -4px;
		left: 12px;
		font-size: 1rem;
		font-weight: bold;
		color: white;
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
