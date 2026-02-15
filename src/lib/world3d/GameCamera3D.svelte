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

	const OVERWORLD_OFFSET = { x: 0, y: 4, z: 4 };
	const BATTLE_OFFSET = { x: 2, y: 1, z: 3 };
	const BATTLE_LOOKAT_Y_OFFSET = 0.5;

	// Mutable offset object for GSAP to animate
	const currentOffset = { ...OVERWORLD_OFFSET };
	const lookAtOffset = { x: 0, y: 0, z: 0 };
	const swayOffset = { x: 0, y: 0 };
	const shakeOffset = { x: 0, y: 0 };
	let elapsedTime = 0;

	const LERP_FACTOR = 0.08;

	let camera: PerspectiveCamera | undefined = $state();

	$effect(() => {
		if (battleActive) {
			const tl = gsap.timeline();

			// 1. Zoom IN (0-0.2s): Camera pulls closer
			tl.to(
				currentOffset,
				{
					y: currentOffset.y * 0.7,
					z: currentOffset.z * 0.7,
					duration: 0.2,
					ease: 'power3.in'
				},
				0
			);

			// 2. SHAKE (0.1-0.6s): Horizontal displacement
			tl.to(
				shakeOffset,
				{
					x: 0.25,
					duration: 0.05,
					repeat: 6,
					yoyo: true,
					ease: 'none'
				},
				0.1
			);

			// 3. Settle shake (0.6-1.0s): Ease shake back to 0
			tl.to(
				shakeOffset,
				{
					x: 0,
					y: 0,
					duration: 0.4,
					ease: 'power2.out'
				},
				0.6
			);

			// 4. Whip pan to BATTLE_OFFSET (0.3-1.6s)
			tl.to(
				currentOffset,
				{
					...BATTLE_OFFSET,
					duration: 1.3,
					ease: 'back.out(1.5)'
				},
				0.3
			);

			// 5. LookAt transition (same timing as whip pan)
			tl.to(
				lookAtOffset,
				{
					x: BATTLE_OFFSET.x * 0.5,
					y: BATTLE_LOOKAT_Y_OFFSET,
					z: 0,
					duration: 1.3,
					ease: 'power2.inOut'
				},
				0.3
			);
		} else {
			gsap.to(currentOffset, {
				x: OVERWORLD_OFFSET.x,
				y: OVERWORLD_OFFSET.y,
				z: OVERWORLD_OFFSET.z,
				duration: 2,
				ease: 'back.out(1.2)'
			});
			gsap.to(lookAtOffset, {
				x: 0,
				y: 0,
				z: 0,
				duration: 2,
				ease: 'back.out(1.2)'
			});
			gsap.to(shakeOffset, { x: 0, y: 0, duration: 0.3 });
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

			const desiredX = clampedX + currentOffset.x + swayOffset.x + shakeOffset.x;
			const desiredY = targetPosition.y + currentOffset.y + swayOffset.y + shakeOffset.y;
			const desiredZ = clampedZ + currentOffset.z;

			camera.position.x += (desiredX - camera.position.x) * LERP_FACTOR;
			camera.position.y += (desiredY - camera.position.y) * LERP_FACTOR;
			camera.position.z += (desiredZ - camera.position.z) * LERP_FACTOR;

			camera.lookAt(
				clampedX + lookAtOffset.x,
				targetPosition.y + lookAtOffset.y,
				clampedZ + lookAtOffset.z
			);
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
		camera.lookAt(
			clampedX + lookAtOffset.x,
			targetPosition.y + lookAtOffset.y,
			clampedZ + lookAtOffset.z
		);
	}}
/>
