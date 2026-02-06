<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import type { PokemonInstance } from '../../js/pokemons/pokedex';
	import { abilityPopupStore, type PopupData } from '../../js/battle/ability-popup-store';

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
		entranceDelay?: number;
		side?: 'ally' | 'opponent';
		index?: number;
	}

	const {
		pokemon,
		position = { bottom: '62%', left: '22%' },
		isAlly = true,
		showExpBar = false,
		expPercent = 0,
		spriteElement = null,
		visible = true,
		entranceDelay = 0,
		side = 'ally',
		index = 0
	}: Props = $props();

	let containerElement: HTMLDivElement;

	function animateEntrance() {
		if (!containerElement) {
			return;
		}
		gsap.fromTo(
			containerElement,
			{ opacity: 0, y: -20, scale: 0.9 },
			{
				opacity: 1,
				y: 0,
				scale: 1,
				duration: 0.3,
				delay: entranceDelay / 1000,
				ease: 'power2.out'
			}
		);
	}

	// Force reactivity tick - increment this to force re-render
	let hpTick = $state(0);

	// Reactive derived values from pokemon object (hpTick dependency forces re-evaluation on poll changes)
	const name = $derived(hpTick >= 0 ? pokemon.name : pokemon.name);
	const level = $derived(hpTick >= 0 ? pokemon.level : pokemon.level);
	const currentHp = $derived(hpTick >= 0 ? pokemon.currentHp : pokemon.currentHp);
	const maxHp = $derived(hpTick >= 0 ? pokemon.currentStats.hp : pokemon.currentStats.hp);
	const gender = $derived(hpTick >= 0 ? pokemon.gender || 'unknown' : pokemon.gender || 'unknown');
	const statusAbr = $derived(hpTick >= 0 ? pokemon.status?.abr || null : null);

	// Subscribe to ability popup store and filter for this pokemon
	let activeAbilityPopup = $state<PopupData | null>(null);

	$effect(() => {
		const unsubscribe = abilityPopupStore.subscribe((popups) => {
			// Find a popup that matches this FloatingPokemonInfo's side and index
			const matching = popups.find((p) => p.side === side && p.index === index);
			activeAbilityPopup = matching ?? null;
		});
		return unsubscribe;
	});

	const statsFormat: Record<string, string> = {
		attack: 'ATK',
		defense: 'DEF',
		specialAttack: 'SP.A',
		specialDefense: 'SP.D',
		speed: 'SPD'
	};

	const statChanges = $derived.by(() => {
		if (hpTick < 0) {
			return [];
		}
		const changes: StatChange[] = [];
		if (pokemon.statsChanges) {
			for (const [stat, value] of Object.entries(pokemon.statsChanges)) {
				if (statsFormat[stat] && value !== 0) {
					changes.push({ stat: statsFormat[stat], stages: value as number });
				}
			}
		}
		return changes;
	});

	// Poll for HP/status/stat changes
	let pollInterval: ReturnType<typeof setInterval>;
	let lastHp = $state(pokemon.currentHp);

	onMount(() => {
		let lastName = pokemon.name;
		let lastStatus = pokemon.status?.abr;
		let lastStatsJson = JSON.stringify(pokemon.statsChanges || {});

		pollInterval = setInterval(() => {
			const currentName = pokemon.name;
			const currentStatus = pokemon.status?.abr;
			const currentStatsJson = JSON.stringify(pokemon.statsChanges || {});

			if (
				currentName !== lastName ||
				pokemon.currentHp !== lastHp ||
				currentStatus !== lastStatus ||
				currentStatsJson !== lastStatsJson
			) {
				lastName = currentName;
				lastHp = pokemon.currentHp;
				lastStatus = currentStatus;
				lastStatsJson = currentStatsJson;
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

	// Check if sprite is ready for positioning (loaded, visible, animation complete, and has dimensions)
	function isSpritePositioned(): boolean {
		if (!spriteElement) {
			return false;
		}

		// If it's an image, ensure it has fully loaded
		if (spriteElement instanceof HTMLImageElement) {
			if (!spriteElement.complete || spriteElement.naturalWidth === 0) {
				return false;
			}
		}

		const rect = spriteElement.getBoundingClientRect();

		// Check sprite is visible (not during entry animation's initial scale: 0, opacity: 0 phase)
		const style = window.getComputedStyle(spriteElement);
		const opacity = parseFloat(style.opacity);
		if (opacity < 0.5) {
			return false;
		}

		// Check that scale animation is complete by comparing rendered size to natural size
		// The entry animation scales from 0 to 1, so we wait until the sprite is at its full size
		if (spriteElement instanceof HTMLImageElement && spriteElement.naturalWidth > 0) {
			// Get the actual rendered width vs natural width ratio
			// Account for CSS scaling (the sprite might have a CSS width set)
			const cssWidth = parseFloat(style.width);
			if (cssWidth > 0) {
				// Calculate expected width based on natural aspect ratio and CSS height
				const cssHeight = parseFloat(style.height);
				const aspectRatio = spriteElement.naturalWidth / spriteElement.naturalHeight;
				const expectedWidth = cssHeight * aspectRatio;
				// If rendered width is significantly smaller than expected, animation is still in progress
				// Use 0.9 threshold to account for slight variations
				if (rect.width < expectedWidth * 0.9) {
					return false;
				}
			}
		}

		// Check position AND that sprite has valid dimensions (not scaled to 0)
		return (rect.x > 0 || rect.y > 0) && rect.width > 0 && rect.height > 0;
	}

	// Poll until sprite is positioned
	function waitForSpritePosition() {
		if (isSpritePositioned()) {
			spriteReady = true;
			updatePositionFromSprite();
			// Trigger entrance animation after position is set
			setTimeout(() => animateEntrance(), 50);
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
		// Use .battle container (sprite is in .wrapper which is inside .battle)
		const container = spriteElement.closest('.battle') as HTMLElement | null;
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

		function handleVisibilityChange() {
			if (document.visibilityState === 'visible' && containerElement && spriteReady) {
				gsap.set(containerElement, { opacity: 1, y: 0, scale: 1 });
			}
		}
		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			window.removeEventListener('resize', updatePositionFromSprite);
			observer?.disconnect();
			document.removeEventListener('visibilitychange', handleVisibilityChange);
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
		if (hpPercent > 50) {
			return '#4ade80';
		}
		if (hpPercent > 20) {
			return '#facc15';
		}
		return '#ef4444';
	});

	const hpGradient = $derived(() => {
		const color = hpColor();
		const darkColor = hpPercent > 50 ? '#22c55e' : hpPercent > 20 ? '#eab308' : '#dc2626';
		return `linear-gradient(90deg, ${darkColor} 0%, ${color} 100%)`;
	});

	const genderSymbol = $derived(() => {
		if (gender === 'male') {
			return '\u2642';
		}
		if (gender === 'female') {
			return '\u2640';
		}
		return '';
	});

	const genderColor = $derived(() => {
		if (gender === 'male') {
			return '#60a5fa';
		}
		if (gender === 'female') {
			return '#f472b6';
		}
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
		bind:this={containerElement}
		class="floating-pokemon-info spatial-panel"
		data-testid={isAlly ? 'ally-pokemon-info' : 'opponent-pokemon-info'}
		style="{useComputedPosition
			? computedStyle
			: `bottom: ${position.bottom}; left: ${position.left};`} opacity: 0;"
	>
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

		<div class="hp-bar-container" data-testid={isAlly ? 'ally-hp-bar' : 'opponent-hp-bar'}>
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

		<div class="leader-line"></div>

		<div class="below-box-indicators">
			{#if activeAbilityPopup}
				<div class="ability-chip" class:ally={side === 'ally'} class:opponent={side === 'opponent'}>
					<span class="spatial-text ability-text">{activeAbilityPopup.abilityName}</span>
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

			{#if statusAbr}
				<div class="status-chip" style="background-color: {getStatusColor(statusAbr)}">
					<span class="spatial-text">{statusAbr}</span>
				</div>
			{/if}
		</div>
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

	.below-box-indicators {
		position: absolute;
		top: 50px;
		left: -3px;
		right: 0;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		pointer-events: none;
		padding: 0 4px;
	}

	.stat-changes {
		display: flex;
		flex-wrap: wrap;
		gap: 3px;
		max-width: 47%;
	}

	.stat-change {
		padding: 2px 6px;
		transform: skewX(var(--skew-angle));
		font-size: 0.75rem;
		font-weight: 600;
		color: white;
	}

	.stat-change.positive {
		background: rgba(34, 197, 94, 0.7);
		border-left: 2px solid #4ade80;
	}

	.stat-change.negative {
		background: rgba(239, 68, 68, 0.7);
		border-left: 2px solid #f87171;
	}

	.status-chip {
		padding: 2px 8px;
		transform: skewX(var(--skew-angle));
		font-size: 0.75rem;
		font-weight: 700;
		color: white;
		text-transform: uppercase;
	}

	.ability-chip {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		margin-top: 4px;
		padding: 4px 10px;
		transform: skewX(var(--skew-angle));
		font-size: 0.7rem;
		font-weight: 700;
		color: #cbd5e1;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		background: linear-gradient(135deg, rgba(40, 50, 70, 0.95) 0%, rgba(30, 40, 55, 0.95) 100%);
		border: 1px solid rgba(255, 255, 255, 0.25);
		border-left: 4px solid rgba(255, 255, 255, 0.6);
		box-shadow:
			0 2px 8px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		animation: abilitySlideIn 0.25s ease-out;
		text-align: center;
		z-index: 51;
	}

	.ability-chip .ability-text {
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
	}

	@keyframes abilitySlideIn {
		from {
			opacity: 0;
			transform: skewX(var(--skew-angle)) translateY(-8px);
		}
		to {
			opacity: 1;
			transform: skewX(var(--skew-angle)) translateY(0);
		}
	}
</style>
