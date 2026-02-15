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
	const velocities = new Float32Array(PARTICLE_COUNT * 3);
	const lifetimes = new Float32Array(PARTICLE_COUNT);
	const maxLifetimes = new Float32Array(PARTICLE_COUNT);

	let animationActive = $state(false);
	let geometry = $state<BufferGeometry | undefined>(undefined);
	let globalOpacity = $state(0);

	function initializeParticles() {
		for (let i = 0; i < PARTICLE_COUNT; i++) {
			const spawnRadius = 8 + Math.random() * 4;
			const angle = Math.random() * Math.PI * 2;
			const spawnX = playerPosition.x + Math.cos(angle) * spawnRadius;
			const spawnZ = playerPosition.z + Math.sin(angle) * spawnRadius;
			const spawnY = 0.5 + Math.random() * 2.0;

			positions[i * 3] = spawnX;
			positions[i * 3 + 1] = spawnY;
			positions[i * 3 + 2] = spawnZ;

			const dx = playerPosition.x - spawnX;
			const dz = playerPosition.z - spawnZ;
			const dist = Math.sqrt(dx * dx + dz * dz);
			const speed = 15 + Math.random() * 10;

			velocities[i * 3] = (dx / dist) * speed;
			velocities[i * 3 + 1] = 0;
			velocities[i * 3 + 2] = (dz / dist) * speed;

			lifetimes[i] = 0;
			maxLifetimes[i] = 0.3 + Math.random() * 0.5;
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
					posArray[i * 3 + 1] = -100;
				}
			}

			globalOpacity = Math.max(0, globalOpacity - delta * 1.5);
			posAttribute.needsUpdate = true;

			if (allExpired || globalOpacity <= 0) {
				animationActive = false;
			}
		},
		{ name: 'battle-wind-streaks' }
	);
</script>

{#if animationActive}
	<T.Points>
		<T.BufferGeometry
			oncreate={(ref) => {
				ref.setAttribute('position', new Float32BufferAttribute(positions, 3));
				geometry = ref;
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
