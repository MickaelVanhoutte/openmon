<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { PerspectiveCamera } from 'three';
	import type { ThrelteMapData } from '$js/mapping/threlte-maps/types';
	import gsap from 'gsap';

	interface Props {
		targetPosition: { x: number; y: number; z: number };
		mapData: ThrelteMapData;
		battleActive?: boolean;
	}

	let { targetPosition, mapData, battleActive = false }: Props = $props();

	const OVERWORLD_OFFSET = { x: 0, y: 10, z: 10 };
	const BATTLE_OFFSET = { x: 0, y: 4, z: 5 };

	// Mutable offset object for GSAP to animate
	const currentOffset = { ...OVERWORLD_OFFSET };

	const LERP_FACTOR = 0.08;

	let camera: PerspectiveCamera | undefined = $state();

	$effect(() => {
		if (battleActive) {
			gsap.to(currentOffset, {
				y: BATTLE_OFFSET.y,
				z: BATTLE_OFFSET.z,
				duration: 1.5,
				ease: 'power2.inOut'
			});
		} else {
			gsap.to(currentOffset, {
				y: OVERWORLD_OFFSET.y,
				z: OVERWORLD_OFFSET.z,
				duration: 2,
				ease: 'power2.inOut'
			});
		}
	});

	useTask(
		'camera-follow',
		() => {
			if (!camera) {
				return;
			}

			// Calculate clamped target position
			// The map is centered at (0,0) in 3D space for the camera clamping logic
			// based on the instruction: [-mapWidth/2+2, mapWidth/2-2]
			const minX = -mapData.width / 2 + 2;
			const maxX = mapData.width / 2 - 2;
			const minZ = -mapData.height / 2 + 2;
			const maxZ = mapData.height / 2 - 2;

			const clampedX = Math.max(minX, Math.min(maxX, targetPosition.x));
			const clampedZ = Math.max(minZ, Math.min(maxZ, targetPosition.z));

			const desiredX = clampedX + currentOffset.x;
			const desiredY = targetPosition.y + currentOffset.y;
			const desiredZ = clampedZ + currentOffset.z;

			camera.position.x += (desiredX - camera.position.x) * LERP_FACTOR;
			camera.position.y += (desiredY - camera.position.y) * LERP_FACTOR;
			camera.position.z += (desiredZ - camera.position.z) * LERP_FACTOR;

			camera.lookAt(clampedX, targetPosition.y, clampedZ);
		},
		{ after: 'player-movement' }
	);
</script>

<T.PerspectiveCamera
	makeDefault
	fov={45}
	near={0.1}
	far={100}
	oncreate={(ref: PerspectiveCamera) => {
		camera = ref;
		// Set initial position immediately to avoid jumping
		const minX = -mapData.width / 2 + 2;
		const maxX = mapData.width / 2 - 2;
		const minZ = -mapData.height / 2 + 2;
		const maxZ = mapData.height / 2 - 2;

		const clampedX = Math.max(minX, Math.min(maxX, targetPosition.x));
		const clampedZ = Math.max(minZ, Math.min(maxZ, targetPosition.z));

		camera.position.set(
			clampedX + currentOffset.x,
			targetPosition.y + currentOffset.y,
			clampedZ + currentOffset.z
		);
		camera.lookAt(clampedX, targetPosition.y, clampedZ);
	}}
/>
