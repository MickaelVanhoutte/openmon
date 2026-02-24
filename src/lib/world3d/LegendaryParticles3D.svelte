<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { BufferGeometry, Float32BufferAttribute, Color, AdditiveBlending } from 'three';
	import { TYPE_COLORS } from '$js/battle/animations/animation-engine';

	interface Props {
		active: boolean;
		playerPosition: { x: number; z: number };
		types: string[];
	}

	const { active, playerPosition, types }: Props = $props();

	const PARTICLE_COUNT = 80;
	const TRAIL_STEPS    = 10; // ghost points per particle

	const angles        = new Float32Array(PARTICLE_COUNT);
	const angularSpeeds = new Float32Array(PARTICLE_COUNT); // radians/s — spin around center
	const radii         = new Float32Array(PARTICLE_COUNT);
	const speeds        = new Float32Array(PARTICLE_COUNT); // inward radial speed
	const maxRadii      = new Float32Array(PARTICLE_COUNT);
	const yPos          = new Float32Array(PARTICLE_COUNT);
	const positions     = new Float32Array(PARTICLE_COUNT * 3);
	const colors        = new Float32Array(PARTICLE_COUNT * 3);

	// Trail: ring-buffer of past (angle, radius, y) per particle
	const tAngles = new Float32Array(PARTICLE_COUNT * TRAIL_STEPS); // [particle * TRAIL_STEPS + step]
	const tRadii  = new Float32Array(PARTICLE_COUNT * TRAIL_STEPS);
	const tY      = new Float32Array(PARTICLE_COUNT * TRAIL_STEPS);
	let   tHead   = 0; // current write slot in the ring (0..TRAIL_STEPS-1)
	let   tFrame  = 0; // frame counter to throttle trail snapshots

	// Trail GPU buffers — PARTICLE_COUNT * TRAIL_STEPS points, colors fade to black
	const trailPositions = new Float32Array(PARTICLE_COUNT * TRAIL_STEPS * 3);
	const trailColors    = new Float32Array(PARTICLE_COUNT * TRAIL_STEPS * 3);

	let geometry      = $state<BufferGeometry | undefined>(undefined);
	let trailGeometry = $state<BufferGeometry | undefined>(undefined);
	let running = $state(false);

	function buildTypeColors(): Color[] {
		const list = types.length > 0 ? types : ['normal'];
		return list.map(t => new Color(TYPE_COLORS[t.toLowerCase()] ?? '#ffffff'));
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

			// Seed trail ring with current position so there's no pop on start
			for (let s = 0; s < TRAIL_STEPS; s++) {
				tAngles[i * TRAIL_STEPS + s] = angles[i];
				tRadii [i * TRAIL_STEPS + s] = radii[i];
				tY     [i * TRAIL_STEPS + s] = yPos[i];
				// Pre-fill trail colors: fade from full color → black
				const fade = (TRAIL_STEPS - 1 - s) / TRAIL_STEPS;
				const ti = (i * TRAIL_STEPS + s) * 3;
				trailColors[ti]     = c.r * fade;
				trailColors[ti + 1] = c.g * fade;
				trailColors[ti + 2] = c.b * fade;
			}
		}
		tHead = 0; tFrame = 0;
		if (geometry) {
			geometry.attributes.position.needsUpdate = true;
			geometry.attributes.color.needsUpdate = true;
		}
		if (trailGeometry) {
			trailGeometry.attributes.position.needsUpdate = true;
			trailGeometry.attributes.color.needsUpdate    = true;
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

		// Every 2 frames, snapshot current positions into the trail ring-buffer
		tFrame++;
		const snapshot = tFrame % 2 === 0;
		if (snapshot) tHead = (tHead + 1) % TRAIL_STEPS;

		for (let i = 0; i < PARTICLE_COUNT; i++) {
			angles[i] += angularSpeeds[i] * delta;
			radii[i]  -= speeds[i] * delta;

			if (radii[i] <= 4.0) {
				radii[i] = maxRadii[i];
				yPos[i]  = 0.2 + Math.random() * 1.2;
			}

			posArr[i * 3]     = playerPosition.x + radii[i] * Math.cos(angles[i]);
			posArr[i * 3 + 1] = yPos[i] + Math.sin((maxRadii[i] - radii[i]) * 0.5) * 0.5;
			posArr[i * 3 + 2] = playerPosition.z + radii[i] * Math.sin(angles[i]);

			// Write this frame into the ring at tHead
			if (snapshot) {
				tAngles[i * TRAIL_STEPS + tHead] = angles[i];
				tRadii [i * TRAIL_STEPS + tHead] = radii[i];
				tY     [i * TRAIL_STEPS + tHead] = yPos[i];
			}
		}

		posAttr.needsUpdate = true;

		// Update trail geometry
		if (trailGeometry) {
			const tPosAttr = trailGeometry.attributes.position;
			const tPosArr  = tPosAttr.array as Float32Array;

			for (let i = 0; i < PARTICLE_COUNT; i++) {
				for (let s = 0; s < TRAIL_STEPS; s++) {
					// Read slots from newest→oldest: tHead, tHead-1, tHead-2 …
					const slot = (tHead - s + TRAIL_STEPS) % TRAIL_STEPS;
					const r = tRadii [i * TRAIL_STEPS + slot];
					const a = tAngles[i * TRAIL_STEPS + slot];
					const y = tY     [i * TRAIL_STEPS + slot];
					const ti = (i * TRAIL_STEPS + s) * 3;
					tPosArr[ti]     = playerPosition.x + r * Math.cos(a);
					tPosArr[ti + 1] = y + Math.sin((maxRadii[i] - r) * 0.5) * 0.5;
					tPosArr[ti + 2] = playerPosition.z + r * Math.sin(a);
				}
			}
			tPosAttr.needsUpdate = true;
		}
	});
</script>

{#if running}
	<!-- Trail points — rendered first (behind head points) -->
	<T.Points>
		<T.BufferGeometry
			oncreate={(ref) => {
				ref.setAttribute('position', new Float32BufferAttribute(trailPositions, 3));
				ref.setAttribute('color',    new Float32BufferAttribute(trailColors, 3));
				trailGeometry = ref as BufferGeometry;
				trailGeometry.attributes.position.needsUpdate = true;
				trailGeometry.attributes.color.needsUpdate    = true;
			}}
		/>
		<T.PointsMaterial
			size={0.16}
			vertexColors
			transparent
			opacity={0.8}
			depthWrite={false}
			blending={AdditiveBlending}
			sizeAttenuation
		/>
	</T.Points>

	<!-- Head points — the bright particle itself -->
	<T.Points>
		<T.BufferGeometry
			oncreate={(ref) => {
				ref.setAttribute('position', new Float32BufferAttribute(positions, 3));
				ref.setAttribute('color',    new Float32BufferAttribute(colors, 3));
				geometry = ref as BufferGeometry;
				geometry.attributes.position.needsUpdate = true;
				geometry.attributes.color.needsUpdate = true;
			}}
		/>
		<T.PointsMaterial
			size={0.2}
			vertexColors
			transparent
			opacity={1}
			depthWrite={false}
			blending={AdditiveBlending}
			sizeAttenuation
		/>
	</T.Points>
{/if}
