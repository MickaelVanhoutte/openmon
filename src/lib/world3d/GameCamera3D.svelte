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

	const OVERWORLD_OFFSET = { x: 0, y: 5, z: 4.25 };
	const BATTLE_OFFSET = { x: 0, y: 1, z: 3 };
	const BATTLE_LOOKAT_Y_OFFSET = 0.5;

	// Mutable offset object for GSAP to animate
	const currentOffset = { ...OVERWORLD_OFFSET };
	const lookAtOffset = { y: 0 };
	const swayOffset = { x: 0, y: 0 };
	let elapsedTime = 0;

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
			gsap.to(lookAtOffset, {
				y: BATTLE_LOOKAT_Y_OFFSET,
				duration: 1.5,
				ease: 'power2.inOut'
			});
		} else {
			gsap.to(currentOffset, {
				y: OVERWORLD_OFFSET.y,
				z: OVERWORLD_OFFSET.z,
				duration: 2,
				ease: 'back.out(1.2)'
			});
			gsap.to(lookAtOffset, {
				y: 0,
				duration: 2,
				ease: 'back.out(1.2)'
			});
		}
	});

	useTask(
		'camera-follow',
		(delta) => {
			if (!camera) {
				return;
			}

			if (battleActive) {
				elapsedTime += delta;
				swayOffset.y = Math.sin(elapsedTime * ((2 * Math.PI) / 5)) * 0.15;
				swayOffset.x = Math.sin(elapsedTime * ((2 * Math.PI) / 8)) * 0.05;
			} else {
				elapsedTime = 0;
				swayOffset.x = 0;
				swayOffset.y = 0;
			}

			// Calculate clamped target position
			// The map is centered at (0,0) in 3D space for the camera clamping logic
			// Reduced padding from 2 to 1 tile since camera is now closer and shows less map
			const minX = -mapData.width / 2 + 1;
			const maxX = mapData.width / 2 - 1;
			const minZ = -mapData.height / 2 + 1;
			const maxZ = mapData.height / 2 - 1;

			const clampedX = Math.max(minX, Math.min(maxX, targetPosition.x));
			const clampedZ = Math.max(minZ, Math.min(maxZ, targetPosition.z));

			const desiredX = clampedX + currentOffset.x + swayOffset.x;
			const desiredY = targetPosition.y + currentOffset.y + swayOffset.y;
			const desiredZ = clampedZ + currentOffset.z;

			camera.position.x += (desiredX - camera.position.x) * LERP_FACTOR;
			camera.position.y += (desiredY - camera.position.y) * LERP_FACTOR;
			camera.position.z += (desiredZ - camera.position.z) * LERP_FACTOR;

			camera.lookAt(clampedX, targetPosition.y + lookAtOffset.y, clampedZ);
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
		// Reduced padding from 2 to 1 tile since camera is now closer and shows less map
		const minX = -mapData.width / 2 + 1;
		const maxX = mapData.width / 2 - 1;
		const minZ = -mapData.height / 2 + 1;
		const maxZ = mapData.height / 2 - 1;

		const clampedX = Math.max(minX, Math.min(maxX, targetPosition.x));
		const clampedZ = Math.max(minZ, Math.min(maxZ, targetPosition.z));

		camera.position.set(
			clampedX + currentOffset.x,
			targetPosition.y + currentOffset.y,
			clampedZ + currentOffset.z
		);
		camera.lookAt(clampedX, targetPosition.y + lookAtOffset.y, clampedZ);
	}}
/>
