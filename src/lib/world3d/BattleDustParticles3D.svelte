<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { BufferGeometry, Float32BufferAttribute, Color, NormalBlending } from 'three';

	interface Props {
		active: boolean;
		playerPosition: { x: number; z: number };
		radius?: number;
	}

	const { active, playerPosition, radius: _radius = 6 }: Props = $props();

	const MAIN_PARTICLE_COUNT = 250;
	const mainPositions = new Float32Array(MAIN_PARTICLE_COUNT * 3);
	const mainVelocities = new Float32Array(MAIN_PARTICLE_COUNT * 3);
	const mainColors = new Float32Array(MAIN_PARTICLE_COUNT * 3);

	const CHUNK_PARTICLE_COUNT = 30;
	const chunkPositions = new Float32Array(CHUNK_PARTICLE_COUNT * 3);
	const chunkVelocities = new Float32Array(CHUNK_PARTICLE_COUNT * 3);
	const chunkColors = new Float32Array(CHUNK_PARTICLE_COUNT * 3);

	const mainPalette = [0xffffff, 0xe0e0e0, 0xd4a574];
	const chunkPalette = [0xd4a574, 0xc49a6c, 0xa07850];

	for (let i = 0; i < MAIN_PARTICLE_COUNT; i++) {
		const color = new Color(mainPalette[Math.floor(Math.random() * mainPalette.length)]);
		mainColors[i * 3] = color.r;
		mainColors[i * 3 + 1] = color.g;
		mainColors[i * 3 + 2] = color.b;
	}

	for (let i = 0; i < CHUNK_PARTICLE_COUNT; i++) {
		const color = new Color(chunkPalette[Math.floor(Math.random() * chunkPalette.length)]);
		chunkColors[i * 3] = color.r;
		chunkColors[i * 3 + 1] = color.g;
		chunkColors[i * 3 + 2] = color.b;
	}

	let animationActive = $state(false);
	let mainGeometry = $state<BufferGeometry>();
	let chunkGeometry = $state<BufferGeometry>();
	let globalOpacity = $state(0);

	function initializeParticles() {
		for (let i = 0; i < MAIN_PARTICLE_COUNT; i++) {
			mainPositions[i * 3] = playerPosition.x;
			mainPositions[i * 3 + 1] = 0.8 + Math.random() * 0.4;
			mainPositions[i * 3 + 2] = playerPosition.z;

			const angle = Math.random() * Math.PI * 2;
			const speed = 2.0 + Math.random() * 3.0;
			mainVelocities[i * 3] = Math.cos(angle) * speed;
			mainVelocities[i * 3 + 1] = 1.0 + Math.random() * 2.0;
			mainVelocities[i * 3 + 2] = Math.sin(angle) * speed;
		}

		for (let i = 0; i < CHUNK_PARTICLE_COUNT; i++) {
			chunkPositions[i * 3] = playerPosition.x;
			chunkPositions[i * 3 + 1] = 0.5 + Math.random() * 0.3;
			chunkPositions[i * 3 + 2] = playerPosition.z;

			const angle = Math.random() * Math.PI * 2;
			const speed = 1.0 + Math.random() * 1.5;
			chunkVelocities[i * 3] = Math.cos(angle) * speed;
			chunkVelocities[i * 3 + 1] = 2.0 + Math.random() * 3.0;
			chunkVelocities[i * 3 + 2] = Math.sin(angle) * speed;
		}

		if (mainGeometry) {
			mainGeometry.attributes.position.needsUpdate = true;
		}
		if (chunkGeometry) {
			chunkGeometry.attributes.position.needsUpdate = true;
		}
		globalOpacity = 1;
		animationActive = true;
	}

	$effect(() => {
		if (active) {
			initializeParticles();
		}
	});

	useTask((delta) => {
		if (!animationActive || !mainGeometry || !chunkGeometry) {
			return;
		}

		const mainPosAttribute = mainGeometry.attributes.position;
		const mainPosArray = mainPosAttribute.array as Float32Array;

		for (let i = 0; i < MAIN_PARTICLE_COUNT; i++) {
			mainPosArray[i * 3] += mainVelocities[i * 3] * delta;
			mainPosArray[i * 3 + 1] += mainVelocities[i * 3 + 1] * delta;
			mainPosArray[i * 3 + 2] += mainVelocities[i * 3 + 2] * delta;
		}

		mainPosAttribute.needsUpdate = true;

		const chunkPosAttribute = chunkGeometry.attributes.position;
		const chunkPosArray = chunkPosAttribute.array as Float32Array;

		for (let i = 0; i < CHUNK_PARTICLE_COUNT; i++) {
			chunkVelocities[i * 3 + 1] -= 4.0 * delta;
			chunkPosArray[i * 3] += chunkVelocities[i * 3] * delta;
			chunkPosArray[i * 3 + 1] += chunkVelocities[i * 3 + 1] * delta;
			chunkPosArray[i * 3 + 2] += chunkVelocities[i * 3 + 2] * delta;
		}

		chunkPosAttribute.needsUpdate = true;

		globalOpacity = Math.max(0, globalOpacity - delta * 0.5);

		if (globalOpacity <= 0) {
			animationActive = false;
		}
	});
</script>

{#if animationActive}
	<T.Points>
		<T.BufferGeometry
			oncreate={(ref) => {
				ref.setAttribute('position', new Float32BufferAttribute(mainPositions, 3));
				ref.setAttribute('color', new Float32BufferAttribute(mainColors, 3));
				mainGeometry = ref as BufferGeometry;
			}}
		/>
		<T.PointsMaterial
			size={0.1}
			vertexColors
			transparent
			opacity={globalOpacity}
			depthWrite={false}
			blending={NormalBlending}
			sizeAttenuation
		/>
	</T.Points>
	<T.Points>
		<T.BufferGeometry
			oncreate={(ref) => {
				ref.setAttribute('position', new Float32BufferAttribute(chunkPositions, 3));
				ref.setAttribute('color', new Float32BufferAttribute(chunkColors, 3));
				chunkGeometry = ref as BufferGeometry;
			}}
		/>
		<T.PointsMaterial
			size={0.1}
			vertexColors
			transparent
			opacity={globalOpacity}
			depthWrite={false}
			blending={NormalBlending}
			sizeAttenuation
		/>
	</T.Points>
{/if}
