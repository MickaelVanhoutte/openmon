<script lang="ts">
	interface Props {
		types: string[];
	}

	const { types }: Props = $props();

	const TYPE_PARTICLE_CONFIG: Record<string, { color: string; glow: string; trail: string }> = {
		fire:     { color: '#FF8040', glow: '#FF4000', trail: 'rgba(255,100,20,0.6)' },
		water:    { color: '#70A8FF', glow: '#2060FF', trail: 'rgba(60,120,255,0.5)' },
		ice:      { color: '#C8F8FF', glow: '#80E8FF', trail: 'rgba(140,230,255,0.6)' },
		electric: { color: '#FFE840', glow: '#FFB800', trail: 'rgba(255,220,0,0.7)'  },
		grass:    { color: '#90E860', glow: '#40C020', trail: 'rgba(80,200,40,0.5)'  },
		psychic:  { color: '#FF70B0', glow: '#FF0080', trail: 'rgba(255,40,140,0.6)' },
		ghost:    { color: '#C090FF', glow: '#8040FF', trail: 'rgba(140,60,255,0.6)' },
		dragon:   { color: '#9868FF', glow: '#5020FF', trail: 'rgba(100,40,255,0.6)' },
		dark:     { color: '#D8B8FF', glow: '#9040FF', trail: 'rgba(160,80,255,0.7)' },
		flying:   { color: '#D0C8FF', glow: '#A090FF', trail: 'rgba(160,140,255,0.5)'},
		fighting: { color: '#FF6050', glow: '#CC1000', trail: 'rgba(220,40,20,0.6)'  },
		steel:    { color: '#E8E8FF', glow: '#A0A0E0', trail: 'rgba(180,180,240,0.5)'},
		rock:     { color: '#F0D050', glow: '#C09000', trail: 'rgba(200,160,20,0.5)' },
		ground:   { color: '#F8D880', glow: '#C09040', trail: 'rgba(200,170,60,0.5)' },
		poison:   { color: '#E870E8', glow: '#A000A0', trail: 'rgba(180,40,180,0.6)' },
		bug:      { color: '#D0F030', glow: '#80C000', trail: 'rgba(150,210,0,0.5)'  },
		normal:   { color: '#E0E0C0', glow: '#A0A080', trail: 'rgba(180,180,140,0.4)'},
		fairy:    { color: '#FFC0D8', glow: '#FF60A0', trail: 'rgba(255,120,180,0.6)'},
	};

	const DEFAULT = { color: '#ffffff', glow: '#aaaaaa', trail: 'rgba(200,200,200,0.5)' };

	// Deterministic pseudo-random 0..1
	function pr(seed: number, i: number): number {
		const x = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
		return x - Math.floor(x);
	}

	// Each particle gets a fixed angle on the circle (its "lane"),
	// a travel duration (how fast it spirals inward),
	// an animation delay (negative = pre-started, so all are mid-flight on mount),
	// and a size.
	interface Particle {
		angle: number;       // deg — fixed lane, particle travels along this spoke
		duration: number;    // s — time to travel from edge to center
		delay: number;       // s — negative offset so particles are already mid-flight
		size: number;        // px
		color: string;
		glow: string;
		trail: string;
	}

	function makeParticles(count: number, seed: number, cfg: { color: string; glow: string; trail: string }): Particle[] {
		return Array.from({ length: count }, (_, i) => ({
			angle:    (i / count) * 360 + pr(seed, i * 3) * (360 / count) * 0.6,
			duration: 1.2 + pr(seed, i * 7) * 1.4,   // 1.2–2.6s to reach center
			delay:    -(pr(seed, i * 11) * 2.5),       // stagger so not all start at edge
			size:     5 + pr(seed, i * 13) * 8,        // 5–13px
			...cfg,
		}));
	}

	// How many particles total and how we split across types
	const TOTAL = $derived(types.length === 1 ? 40 : 24);

	interface Group { particles: Particle[] }
	const groups = $derived(
		types.map((t, idx): Group => {
			const cfg = TYPE_PARTICLE_CONFIG[t.toLowerCase()] ?? DEFAULT;
			return { particles: makeParticles(TOTAL, idx * 53 + 17, cfg) };
		})
	);

	const allParticles = $derived(groups.flatMap(g => g.particles));

	// Combined background tint color
	const bgColor = $derived(
		types.map(t => (TYPE_PARTICLE_CONFIG[t.toLowerCase()] ?? DEFAULT).trail).join(', ')
	);
</script>

<!--
  How this works (matches BattleWindStreaks3D.svelte mechanic):
  - Each particle lives at a fixed angle (its "spoke" / lane)
  - It animates from the outer edge (--start: 42vw) inward to the center (--end: 0vw)
  - Duration varies per particle → they arrive at different times
  - Negative delay means they're already mid-travel when the component mounts
  - On each loop iteration the particle resets to the outer edge and travels in again
  - Result: a continuous inward tornado/vortex matching the battle enter wind effect

  The host div sits at the Pokémon midpoint (left 50%, bottom 20%) so everything
  orbits around where the Pokémon actually are.
-->
<div class="lp-host">
	<div
		class="lp-bg"
		style="background: radial-gradient(ellipse 80vw 60vh at 50% 50%, {bgColor}, transparent 70%);"
	></div>

	{#each allParticles as p, i (i)}
		<!--
		  We rotate the spoke (wrapper) to the particle's fixed angle,
		  then animate a child div along the X axis from far → 0.
		  This gives a straight inward rush along the spoke, same as the 3D wind effect.
		-->
		<div class="spoke" style="--angle: {p.angle}deg;">
			<div
				class="dot"
				style="
					--dur:   {p.duration}s;
					--del:   {p.delay}s;
					--size:  {p.size}px;
					--color: {p.color};
					--glow:  {p.glow};
					--trail: {p.trail};
				"
			></div>
		</div>
	{/each}
</div>

<style lang="scss">
	// Center of the orbit — midpoint between ally (bottom 2%, left ~30%)
	// and opponent (bottom 10%, right ~30%). Sits at battle floor level.
	.lp-host {
		position: absolute;
		left: 50%;
		bottom: 20%;
		width: 0;
		height: 0;
		pointer-events: none;
		z-index: 4;
		overflow: visible;
	}

	// Atmospheric background tint
	.lp-bg {
		position: absolute;
		width: 80vw;
		height: 60vh;
		top: -30vh;
		left: -40vw;
		pointer-events: none;
		animation: bgBreath 3s ease-in-out infinite;
	}

	@keyframes bgBreath {
		0%, 100% { opacity: 0.4; }
		50%       { opacity: 0.9; }
	}

	// Each spoke is a zero-size div rotated to the particle's fixed angle.
	// The particle travels along the local X axis (inward = decreasing X).
	.spoke {
		position: absolute;
		top: 0;
		left: 0;
		width: 0;
		height: 0;
		transform: rotate(var(--angle));
		pointer-events: none;
	}

	// The dot starts at the outer edge and rushes to the center.
	// It fades in quickly and fades out as it approaches center.
	// On each iteration it resets to the outer edge automatically (CSS animation loops).
	.dot {
		position: absolute;
		width:  var(--size);
		height: var(--size);
		border-radius: 50%;
		background: radial-gradient(circle, white 15%, var(--color) 60%, transparent 100%);
		box-shadow: 0 0 8px 3px var(--glow), 0 0 20px 6px color-mix(in srgb, var(--glow) 40%, transparent);
		// Center the dot on the spoke axis
		top:  calc(var(--size) * -0.5);
		// Start position handled by the animation keyframes
		animation: rush var(--dur) linear var(--del) infinite;
		pointer-events: none;
	}

	// Rush: particle travels from far edge (42vw) inward to center (0),
	// fading in at the start and fading out at the end.
	// This exactly mirrors the 3D wind streaks: radii[i] += radialSpeeds[i] * delta
	// where radialSpeeds is negative (inward).
	@keyframes rush {
		0% {
			left: 42vw;
			opacity: 0;
		}
		8% {
			opacity: 1;
		}
		75% {
			opacity: 0.9;
		}
		100% {
			left: 0vw;
			opacity: 0;
		}
	}
</style>
