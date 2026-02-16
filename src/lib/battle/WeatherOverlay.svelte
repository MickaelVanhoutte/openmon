<script lang="ts">
	import { Weather } from '../../js/battle/battle-field';

	interface Props {
		weather: Weather;
		weatherTurns: number;
		flash?: boolean;
		intensify?: boolean;
	}

	const { weather, weatherTurns, flash = false, intensify = false }: Props = $props();

	const weatherLabels: Record<Weather, string> = {
		[Weather.NONE]: '',
		[Weather.RAIN]: 'Rain',
		[Weather.SUN]: 'Harsh Sunlight',
		[Weather.SAND]: 'Sandstorm',
		[Weather.HAIL]: 'Hail',
		[Weather.STRONG_WINDS]: 'Strong Winds'
	};

	// Generate unique keys to force animation restart when intensify triggers
	// Using $derived to avoid reactive loops
	let keyCounter = 0;
	let prevIntensify = false;

	$effect(() => {
		// Only increment when intensify transitions from false to true
		if (intensify && !prevIntensify) {
			keyCounter++;
		}
		prevIntensify = intensify;
	});

	// Use a derived value based on the counter for keying
	const animationKey = $derived(keyCounter);
</script>

{#if weather !== Weather.NONE}
	<div
		class="weather-overlay"
		class:rain={weather === Weather.RAIN}
		class:sun={weather === Weather.SUN}
		class:sand={weather === Weather.SAND}
		class:hail={weather === Weather.HAIL}
		class:flash
		class:intensify
	>
		{#if weather === Weather.RAIN}
			{#key animationKey}
				<div class="rain-container" class:intensify>
					{#each Array(intensify ? 50 : 30) as _}
						<div
							class="raindrop"
							style="--delay: {Math.random() * 2}s; --x: {Math.random() * 100}%; --duration: {0.5 +
								Math.random() * 0.5}s"
						></div>
					{/each}
				</div>
			{/key}
		{/if}

		{#if weather === Weather.SUN}
			{#key animationKey}
				<div class="sun-rays" class:intensify></div>
				<div class="sun-glow" class:intensify></div>
			{/key}
		{/if}

		{#if weather === Weather.SAND}
			{#key animationKey}
				<div class="sand-particles" class:intensify>
					{#each Array(intensify ? 60 : 40) as _}
						<div
							class="sand-particle"
							style="--delay: {Math.random() * 3}s; --x: {Math.random() *
								100}%; --y: {Math.random() * 100}%; --size: {2 + Math.random() * 4}px"
						></div>
					{/each}
				</div>
			{/key}
		{/if}

		{#if weather === Weather.HAIL}
			{#key animationKey}
				<div class="hail-container" class:intensify>
					{#each Array(intensify ? 35 : 20) as _}
						<div
							class="hailstone"
							style="--delay: {Math.random() * 2}s; --x: {Math.random() * 100}%; --duration: {0.8 +
								Math.random() * 0.4}s; --size: {4 + Math.random() * 6}px"
						></div>
					{/each}
				</div>
			{/key}
		{/if}

		<div class="weather-label">
			<span class="name">{weatherLabels[weather]}</span>
			<span class="turns">{weatherTurns}</span>
		</div>
	</div>
{/if}

<style lang="scss">
	.weather-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 2;
		overflow: hidden;
		animation: fadeIn 0.5s ease-out;

		// Flash effect for turn start weather damage
		&.flash {
			animation: weatherFlash 0.6s ease-out;
		}

		// Intensify effect - more dramatic overlay
		&.intensify {
			animation: weatherIntensify 1s ease-out;
		}
	}

	@keyframes weatherFlash {
		0% {
			filter: brightness(1);
		}
		25% {
			filter: brightness(1.8);
		}
		50% {
			filter: brightness(1.3);
		}
		100% {
			filter: brightness(1);
		}
	}

	@keyframes weatherIntensify {
		0% {
			filter: brightness(1) saturate(1);
			transform: scale(1);
		}
		20% {
			filter: brightness(1.5) saturate(1.3);
			transform: scale(1.02);
		}
		50% {
			filter: brightness(1.3) saturate(1.2);
			transform: scale(1.01);
		}
		100% {
			filter: brightness(1) saturate(1);
			transform: scale(1);
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.weather-label {
		position: absolute;
		top: 8px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 8px;
		padding: 4px 12px;
		background: rgba(0, 0, 0, 0.6);
		border-radius: 4px;
		font-size: 12px;
		font-weight: bold;
		color: #fff;
		z-index: 10;

		.turns {
			background: rgba(255, 255, 255, 0.2);
			padding: 0 6px;
			border-radius: 3px;
		}
	}

	// Rain
	.rain-container {
		position: absolute;
		width: 100%;
		height: 100%;

		&.intensify {
			filter: brightness(1.2);
		}
	}

	.raindrop {
		position: absolute;
		left: var(--x);
		top: -20px;
		width: 2px;
		height: 15px;
		background: linear-gradient(
			to bottom,
			transparent,
			rgba(100, 150, 255, 0.6),
			rgba(100, 150, 255, 0.8)
		);
		border-radius: 0 0 2px 2px;
		animation: rainfall var(--duration) linear infinite;
		animation-delay: var(--delay);
	}

	.intensify .raindrop {
		height: 20px;
		width: 3px;
		background: linear-gradient(
			to bottom,
			transparent,
			rgba(100, 150, 255, 0.8),
			rgba(100, 150, 255, 1)
		);
	}

	@keyframes rainfall {
		0% {
			transform: translateY(-20px);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		90% {
			opacity: 1;
		}
		100% {
			transform: translateY(100vh);
			opacity: 0;
		}
	}

	.rain {
		background: linear-gradient(to bottom, rgba(50, 80, 120, 0.2), rgba(30, 50, 80, 0.3));
	}

	.rain.intensify {
		background: linear-gradient(to bottom, rgba(50, 80, 120, 0.35), rgba(30, 50, 80, 0.45));
	}

	// Sun
	.sun {
		background: radial-gradient(ellipse at 70% 20%, rgba(255, 200, 100, 0.3), transparent 50%);
	}

	.sun.intensify {
		background: radial-gradient(ellipse at 70% 20%, rgba(255, 200, 100, 0.5), transparent 50%);
	}

	.sun-rays {
		position: absolute;
		top: -50%;
		right: -20%;
		width: 80%;
		height: 150%;
		background: repeating-conic-gradient(
			from 0deg,
			rgba(255, 200, 50, 0.1) 0deg 10deg,
			transparent 10deg 20deg
		);
		animation: sunRotate 30s linear infinite;
		opacity: 0.6;

		&.intensify {
			opacity: 0.9;
			background: repeating-conic-gradient(
				from 0deg,
				rgba(255, 200, 50, 0.2) 0deg 10deg,
				transparent 10deg 20deg
			);
		}
	}

	.sun-glow {
		position: absolute;
		top: 5%;
		right: 10%;
		width: 120px;
		height: 120px;
		background: radial-gradient(
			circle,
			rgba(255, 220, 100, 0.8),
			rgba(255, 180, 50, 0.4) 40%,
			transparent 70%
		);
		border-radius: 50%;
		animation: sunPulse 3s ease-in-out infinite;

		&.intensify {
			width: 150px;
			height: 150px;
			background: radial-gradient(
				circle,
				rgba(255, 220, 100, 1),
				rgba(255, 180, 50, 0.6) 40%,
				transparent 70%
			);
		}
	}

	@keyframes sunRotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes sunPulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 0.7;
		}
		50% {
			transform: scale(1.15);
			opacity: 0.9;
		}
	}

	// Sandstorm
	.sand {
		background: linear-gradient(to right, rgba(180, 140, 80, 0.3), rgba(160, 120, 60, 0.4));
	}

	.sand.intensify {
		background: linear-gradient(to right, rgba(180, 140, 80, 0.5), rgba(160, 120, 60, 0.6));
	}

	.sand-particles {
		position: absolute;
		width: 100%;
		height: 100%;

		&.intensify {
			filter: brightness(1.3);
		}
	}

	.sand-particle {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--size);
		height: var(--size);
		background: rgba(180, 140, 80, 0.7);
		border-radius: 50%;
		animation: sandSwirl 3s ease-in-out infinite;
		animation-delay: var(--delay);
	}

	.intensify .sand-particle {
		background: rgba(200, 160, 90, 0.9);
		animation-duration: 2s;
	}

	@keyframes sandSwirl {
		0% {
			transform: translate(0, 0) rotate(0deg);
			opacity: 0;
		}
		25% {
			opacity: 0.8;
		}
		50% {
			transform: translate(100px, 50px) rotate(180deg);
			opacity: 0.6;
		}
		75% {
			opacity: 0.8;
		}
		100% {
			transform: translate(200px, 0) rotate(360deg);
			opacity: 0;
		}
	}

	// Hail
	.hail {
		background: linear-gradient(to bottom, rgba(180, 220, 240, 0.15), rgba(200, 230, 250, 0.2));
	}

	.hail.intensify {
		background: linear-gradient(to bottom, rgba(180, 220, 240, 0.3), rgba(200, 230, 250, 0.4));
	}

	.hail-container {
		position: absolute;
		width: 100%;
		height: 100%;

		&.intensify {
			filter: brightness(1.2);
		}
	}

	.hailstone {
		position: absolute;
		left: var(--x);
		top: -30px;
		width: var(--size);
		height: var(--size);
		background: radial-gradient(circle at 30% 30%, #fff, rgba(180, 220, 255, 0.9));
		border-radius: 50%;
		box-shadow: 0 0 4px rgba(200, 230, 255, 0.5);
		animation: hailfall var(--duration) linear infinite;
		animation-delay: var(--delay);
	}

	.intensify .hailstone {
		box-shadow: 0 0 8px rgba(200, 230, 255, 0.8);
	}

	@keyframes hailfall {
		0% {
			transform: translateY(-30px) rotate(0deg);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		90% {
			opacity: 1;
		}
		100% {
			transform: translateY(100vh) rotate(360deg);
			opacity: 0;
		}
	}
</style>
