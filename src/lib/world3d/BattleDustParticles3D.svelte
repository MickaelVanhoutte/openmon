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
	const mainAngles = new Float32Array(MAIN_PARTICLE_COUNT);
	const mainAngularSpeeds = new Float32Array(MAIN_PARTICLE_COUNT);
	const mainRadii = new Float32Array(MAIN_PARTICLE_COUNT);
	const mainRadialSpeeds = new Float32Array(MAIN_PARTICLE_COUNT);
	const mainColors = new Float32Array(MAIN_PARTICLE_COUNT * 3);

	const CHUNK_PARTICLE_COUNT = 30;
	const chunkPositions = new Float32Array(CHUNK_PARTICLE_COUNT * 3);
	const chunkAngles = new Float32Array(CHUNK_PARTICLE_COUNT);
	const chunkAngularSpeeds = new Float32Array(CHUNK_PARTICLE_COUNT);
	const chunkRadii = new Float32Array(CHUNK_PARTICLE_COUNT);
	const chunkRadialSpeeds = new Float32Array(CHUNK_PARTICLE_COUNT);
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
			mainAngles[i] = Math.random() * Math.PI * 2;
			mainAngularSpeeds[i] = 3 + Math.random() * 4;
			mainRadii[i] = 0.5 + Math.random() * 1;
			mainRadialSpeeds[i] = 2 + Math.random() * 3;

			mainPositions[i * 3] = playerPosition.x + mainRadii[i] * Math.cos(mainAngles[i]);
			mainPositions[i * 3 + 1] = 0.8 + Math.random() * 0.4;
			mainPositions[i * 3 + 2] = playerPosition.z + mainRadii[i] * Math.sin(mainAngles[i]);
		}

		for (let i = 0; i < CHUNK_PARTICLE_COUNT; i++) {
			chunkAngles[i] = Math.random() * Math.PI * 2;
			chunkAngularSpeeds[i] = 2 + Math.random() * 3;
			chunkRadii[i] = 0.3 + Math.random() * 0.5;
			chunkRadialSpeeds[i] = 1.5 + Math.random() * 2;

			chunkPositions[i * 3] = playerPosition.x + chunkRadii[i] * Math.cos(chunkAngles[i]);
			chunkPositions[i * 3 + 1] = 0.5 + Math.random() * 0.3;
			chunkPositions[i * 3 + 2] = playerPosition.z + chunkRadii[i] * Math.sin(chunkAngles[i]);
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
			mainAngles[i] += mainAngularSpeeds[i] * delta;
			mainRadii[i] += mainRadialSpeeds[i] * delta;

			mainPosArray[i * 3] = playerPosition.x + mainRadii[i] * Math.cos(mainAngles[i]);
			mainPosArray[i * 3 + 1] += 0.5 * delta;
			mainPosArray[i * 3 + 2] = playerPosition.z + mainRadii[i] * Math.sin(mainAngles[i]);
		}

		mainPosAttribute.needsUpdate = true;

		const chunkPosAttribute = chunkGeometry.attributes.position;
		const chunkPosArray = chunkPosAttribute.array as Float32Array;

		for (let i = 0; i < CHUNK_PARTICLE_COUNT; i++) {
			chunkAngles[i] += chunkAngularSpeeds[i] * delta;
			chunkRadii[i] += chunkRadialSpeeds[i] * delta;

			chunkPosArray[i * 3] = playerPosition.x + chunkRadii[i] * Math.cos(chunkAngles[i]);
			chunkPosArray[i * 3 + 1] += 0.5 * delta;
			chunkPosArray[i * 3 + 2] = playerPosition.z + chunkRadii[i] * Math.sin(chunkAngles[i]);
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
