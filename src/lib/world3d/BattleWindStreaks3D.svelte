<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { BufferGeometry, Float32BufferAttribute, AdditiveBlending } from 'three';

	interface Props {
		active: boolean;
		playerPosition: { x: number; z: number };
	}

	let { active, playerPosition }: Props = $props();

	const PARTICLE_COUNT = 40;
	const positions = new Float32Array(PARTICLE_COUNT * 3);
	const angles = new Float32Array(PARTICLE_COUNT);
	const angularSpeeds = new Float32Array(PARTICLE_COUNT);
	const radii = new Float32Array(PARTICLE_COUNT);
	const radialSpeeds = new Float32Array(PARTICLE_COUNT);
	const yPositions = new Float32Array(PARTICLE_COUNT);

	let animationActive = $state(false);
	let geometry = $state<BufferGeometry | undefined>(undefined);
	let globalOpacity = $state(0);

	function initializeParticles() {
		for (let i = 0; i < PARTICLE_COUNT; i++) {
			angles[i] = Math.random() * Math.PI * 2;
			angularSpeeds[i] = 5 + Math.random() * 5;
			radii[i] = 8 + Math.random() * 4;
			radialSpeeds[i] = -(10 + Math.random() * 5);
			yPositions[i] = 0.5 + Math.random() * 2.0;

			positions[i * 3] = playerPosition.x + radii[i] * Math.cos(angles[i]);
			positions[i * 3 + 1] = yPositions[i];
			positions[i * 3 + 2] = playerPosition.z + radii[i] * Math.sin(angles[i]);
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

	useTask('battle-wind-streaks', (delta) => {
		if (!animationActive || !geometry) {
			return;
		}

		const posAttribute = geometry.attributes.position;
		const posArray = posAttribute.array as Float32Array;
		let allExpired = true;

		for (let i = 0; i < PARTICLE_COUNT; i++) {
			if (radii[i] >= 0.5) {
				allExpired = false;
				//angles[i] += angularSpeeds[i] * delta;
				radii[i] += radialSpeeds[i] * delta;

				posArray[i * 3] = playerPosition.x + radii[i] * Math.cos(angles[i]);
				posArray[i * 3 + 1] = yPositions[i];
				posArray[i * 3 + 2] = playerPosition.z + radii[i] * Math.sin(angles[i]);
			} else {
				posArray[i * 3 + 1] = -100;
			}
		}

		globalOpacity = Math.max(0, globalOpacity - delta * 1.5);
		posAttribute.needsUpdate = true;

		if (allExpired || globalOpacity <= 0) {
			animationActive = false;
		}
	});
</script>

{#if animationActive}
	<T.Points>
		<T.BufferGeometry
			oncreate={(ref) => {
				ref.setAttribute('position', new Float32BufferAttribute(positions, 3));
				geometry = ref as BufferGeometry;
			}}
		/>
		<T.PointsMaterial
			size={0.3}
			color={0xffffff}
			transparent
			opacity={globalOpacity}
			depthWrite={false}
			blending={AdditiveBlending}
			sizeAttenuation
		/>
	</T.Points>
{/if}
