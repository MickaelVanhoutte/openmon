<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { BufferGeometry, Float32BufferAttribute, Color, AdditiveBlending } from 'three';

	interface Props {
		active: boolean;
		playerPosition: { x: number; z: number };
		types: string[];
	}

	const { active, playerPosition, types }: Props = $props();

	// Type → hex color
	const TYPE_COLORS: Record<string, number> = {
		fire:     0xff6020,
		water:    0x4488ff,
		ice:      0x88eeff,
		electric: 0xffee00,
		grass:    0x66dd22,
		psychic:  0xff2288,
		ghost:    0x9944ff,
		dragon:   0x5522ff,
		dark:     0xcc88ff,
		flying:   0xaaaaff,
		fighting: 0xff2200,
		steel:    0xaaaacc,
		rock:     0xddbb00,
		ground:   0xeecc44,
		poison:   0xcc22cc,
		bug:      0x99dd00,
		normal:   0xccccaa,
		fairy:    0xff88cc,
	};

	const PARTICLE_COUNT = 80;

	const angles        = new Float32Array(PARTICLE_COUNT);
	const angularSpeeds = new Float32Array(PARTICLE_COUNT); // radians/s — spin around center
	const radii         = new Float32Array(PARTICLE_COUNT);
	const speeds        = new Float32Array(PARTICLE_COUNT); // inward radial speed
	const maxRadii      = new Float32Array(PARTICLE_COUNT);
	const yPos          = new Float32Array(PARTICLE_COUNT);
	const positions     = new Float32Array(PARTICLE_COUNT * 3);
	const colors        = new Float32Array(PARTICLE_COUNT * 3);

	let geometry = $state<BufferGeometry | undefined>(undefined);
	let running = $state(false);

	function buildTypeColors(): Color[] {
		const list = types.length > 0 ? types : ['normal'];
		return list.map(t => new Color(TYPE_COLORS[t.toLowerCase()] ?? 0xffffff));
	}

	function initAll() {
		const tc = buildTypeColors();
		for (let i = 0; i < PARTICLE_COUNT; i++) {
			// Evenly spread angles around the full circle
			angles[i] = (i / PARTICLE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
			const outer = 4 + Math.random() * 6;  // 4–10 world units from center
			maxRadii[i] = outer;
			// Stagger start positions so they're mid-flight immediately
			radii[i]  = Math.random() * outer;
			speeds[i] = 1.5 + Math.random() * 1.2;  // 0.8–1.8 units/s inward (slow = many orbits)
			// Angular speed: all spin same direction, faster = tighter spiral feel
			angularSpeeds[i] = 1.2 + Math.random() * 0.6; // 0.6–1.2 rad/s (~5–10s per orbit)
			yPos[i]   = 0.2 + Math.random() * 1.2;

			const c = tc[i % tc.length];
			colors[i * 3]     = c.r;
			colors[i * 3 + 1] = c.g;
			colors[i * 3 + 2] = c.b;

			positions[i * 3]     = playerPosition.x + radii[i] * Math.cos(angles[i]);
			positions[i * 3 + 1] = yPos[i];
			positions[i * 3 + 2] = playerPosition.z + radii[i] * Math.sin(angles[i]);
		}
		if (geometry) {
			geometry.attributes.position.needsUpdate = true;
			geometry.attributes.color.needsUpdate = true;
		}
		running = true;
	}

	$effect(() => {
		if (active) {
			initAll();
		} else {
			running = false;
		}
	});

	useTask('legendary-particles-3d', (delta) => {
		if (!running || !geometry) return;

		const posAttr = geometry.attributes.position;
		const posArr  = posAttr.array as Float32Array;

		for (let i = 0; i < PARTICLE_COUNT; i++) {
			// Spin around center (tornado rotation)
			angles[i] += angularSpeeds[i] * delta;

			// Spiral inward
			radii[i] -= speeds[i] * delta;

			if (radii[i] <= 4.0) {
				// Reset to outer edge — particle has completed its inward spiral
				radii[i] = maxRadii[i];
				yPos[i]  = 0.2 + Math.random() * 1.2;
				// No angle reset — it just continues spinning from wherever it is
			}

			posArr[i * 3]     = playerPosition.x + radii[i] * Math.cos(angles[i]);
			posArr[i * 3 + 1] = yPos[i] + Math.sin((maxRadii[i] - radii[i]) * 0.5) * 0.5; // Add some vertical movement as it spirals in
			posArr[i * 3 + 2] = playerPosition.z + radii[i] * Math.sin(angles[i]);
		}

		posAttr.needsUpdate = true;
	});
</script>

{#if running}
	<T.Points>
		<T.BufferGeometry
			oncreate={(ref) => {
				ref.setAttribute('position', new Float32BufferAttribute(positions, 3));
				ref.setAttribute('color',    new Float32BufferAttribute(colors, 3));
				geometry = ref as BufferGeometry;
				// Geometry now exists — trigger a needsUpdate so the pre-filled arrays render
				geometry.attributes.position.needsUpdate = true;
				geometry.attributes.color.needsUpdate = true;
			}}
		/>
		<T.PointsMaterial
			size={0.2}
			vertexColors
			transparent
			opacity={0.95}
			depthWrite={false}
			blending={AdditiveBlending}
			sizeAttenuation
		/>
	</T.Points>
{/if}
