<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { BufferGeometry, Float32BufferAttribute, PointsMaterial } from 'three';

	interface Props {
		weatherType?: 'RAIN' | 'SNOW' | 'SANDSTORM' | undefined;
		running?: boolean;
	}

	let { weatherType, running = false }: Props = $props();

	const PARTICLE_COUNT = 300;
	const positions = new Float32Array(PARTICLE_COUNT * 3);

	// Initialize random positions
	for (let i = 0; i < PARTICLE_COUNT; i++) {
		positions[i * 3] = (Math.random() - 0.5) * 30; // x: -15 to 15
		positions[i * 3 + 1] = Math.random() * 15; // y: 0 to 15
		positions[i * 3 + 2] = (Math.random() - 0.5) * 30; // z: -15 to 15
	}

	const WEATHER_CONFIGS = {
		RAIN: { speed: 12, size: 0.05, color: 0x6699cc, opacity: 0.6 },
		SNOW: { speed: 3, size: 0.15, color: 0xffffff, opacity: 0.8 },
		SANDSTORM: { speed: 0, xSpeed: 5, size: 0.08, color: 0xd2b48c, opacity: 0.5 }
	};

	let config = $derived(
		weatherType && WEATHER_CONFIGS[weatherType] ? WEATHER_CONFIGS[weatherType] : undefined
	);

	let geometry: BufferGeometry | undefined = $state(undefined);

	useTask((delta) => {
		if (!running || !config || !geometry) return;

		const posAttribute = geometry.attributes.position;
		const array = posAttribute.array as Float32Array;

		for (let i = 0; i < PARTICLE_COUNT; i++) {
			// Update Y
			if (config.speed > 0) {
				array[i * 3 + 1] -= delta * config.speed;
			}

			// Update X (for sandstorm)
			if (config.xSpeed) {
				array[i * 3] += delta * config.xSpeed;
			}

			// Reset if out of bounds
			if (array[i * 3 + 1] < 0) {
				array[i * 3 + 1] = 15;
				array[i * 3] = (Math.random() - 0.5) * 30;
				array[i * 3 + 2] = (Math.random() - 0.5) * 30;
			}

			// Wrap X for sandstorm
			if (array[i * 3] > 15) {
				array[i * 3] = -15;
			}
		}

		posAttribute.needsUpdate = true;
	});
</script>

{#if running && config}
	<T.Points>
		<T.BufferGeometry
			oncreate={(ref) => {
				ref.setAttribute('position', new Float32BufferAttribute(positions, 3));
				geometry = ref;
			}}
		/>
		<T.PointsMaterial
			size={config.size}
			color={config.color}
			transparent
			opacity={config.opacity}
			sizeAttenuation
		/>
	</T.Points>
{/if}
