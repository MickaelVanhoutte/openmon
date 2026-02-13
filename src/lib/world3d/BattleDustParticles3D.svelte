<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import {
		BufferGeometry,
		Float32BufferAttribute,
		PointsMaterial,
		Color,
		AdditiveBlending
	} from 'three';

	interface Props {
		active: boolean;
		playerPosition: { x: number; z: number };
		radius?: number;
	}

	let { active, playerPosition, radius = 6 }: Props = $props();

	const PARTICLE_COUNT = 100;
	const positions = new Float32Array(PARTICLE_COUNT * 3);
	const velocities = new Float32Array(PARTICLE_COUNT * 3);
	const lifetimes = new Float32Array(PARTICLE_COUNT);
	const maxLifetimes = new Float32Array(PARTICLE_COUNT);
	const colors = new Float32Array(PARTICLE_COUNT * 3);

	const palette = [0x8b7355, 0xa0522d, 0xd2b48c];

	// Initialize colors once
	for (let i = 0; i < PARTICLE_COUNT; i++) {
		const color = new Color(palette[Math.floor(Math.random() * palette.length)]);
		colors[i * 3] = color.r;
		colors[i * 3 + 1] = color.g;
		colors[i * 3 + 2] = color.b;
	}

	let animationActive = $state(false);
	let geometry = $state<BufferGeometry | undefined>(undefined);
	let globalOpacity = $state(0);

	function initializeParticles() {
		for (let i = 0; i < PARTICLE_COUNT; i++) {
			positions[i * 3] = playerPosition.x;
			positions[i * 3 + 1] = 0.1;
			positions[i * 3 + 2] = playerPosition.z;

			const angle = Math.random() * Math.PI * 2;
			const speed = (0.3 + Math.random() * 0.7) * radius;
			velocities[i * 3] = Math.cos(angle) * speed;
			velocities[i * 3 + 1] = 0.5 + Math.random() * 1.0;
			velocities[i * 3 + 2] = Math.sin(angle) * speed;

			lifetimes[i] = 0;
			maxLifetimes[i] = 0.8 + Math.random() * 0.4; // ~1s
		}

		if (geometry) {
			geometry.attributes.position.needsUpdate = true;
		}
		globalOpacity = 1;
		animationActive = true;
	}

	$effect(() => {
		if (active) {
			initializeParticles();
		}
	});

	useTask(
		(delta) => {
			if (!animationActive || !geometry) {
				return;
			}

			const posAttribute = geometry.attributes.position;
			const posArray = posAttribute.array as Float32Array;
			let allExpired = true;

			for (let i = 0; i < PARTICLE_COUNT; i++) {
				if (lifetimes[i] < maxLifetimes[i]) {
					allExpired = false;
					lifetimes[i] += delta;

					posArray[i * 3] += velocities[i * 3] * delta;
					posArray[i * 3 + 1] += velocities[i * 3 + 1] * delta;
					posArray[i * 3 + 2] += velocities[i * 3 + 2] * delta;
				} else {
					// Move expired particles far away
					posArray[i * 3 + 1] = -100;
				}
			}

			globalOpacity = Math.max(0, globalOpacity - delta);
			posAttribute.needsUpdate = true;

			if (allExpired || globalOpacity <= 0) {
				animationActive = false;
			}
		},
		{ name: 'battle-dust' }
	);
</script>

{#if animationActive}
	<T.Points>
		<T.BufferGeometry
			oncreate={(ref) => {
				ref.setAttribute('position', new Float32BufferAttribute(positions, 3));
				ref.setAttribute('color', new Float32BufferAttribute(colors, 3));
				geometry = ref;
			}}
		/>
		<T.PointsMaterial
			size={0.15}
			vertexColors
			transparent
			opacity={globalOpacity}
			depthWrite={false}
			blending={AdditiveBlending}
			sizeAttenuation
		/>
	</T.Points>
{/if}
