<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { PerspectiveCamera } from 'three';
	import type { ThrelteMapData } from '$js/mapping/threlte-maps/types';

	interface Props {
		targetPosition: { x: number; y: number; z: number };
		mapData: ThrelteMapData;
	}

	let { targetPosition, mapData }: Props = $props();

	const CAMERA_OFFSET = { x: 0, y: 10, z: 10 };
	const LERP_FACTOR = 0.08;

	let camera: PerspectiveCamera | undefined = $state();

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

			const desiredX = clampedX + CAMERA_OFFSET.x;
			const desiredY = targetPosition.y + CAMERA_OFFSET.y;
			const desiredZ = clampedZ + CAMERA_OFFSET.z;

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
			clampedX + CAMERA_OFFSET.x,
			targetPosition.y + CAMERA_OFFSET.y,
			clampedZ + CAMERA_OFFSET.z
		);
		camera.lookAt(clampedX, targetPosition.y, clampedZ);
	}}
/>
