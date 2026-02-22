<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Billboard } from '@threlte/extras';
	import * as THREE from 'three';
	import { NPC } from '$js/characters/npc';
	import { TileType3D, TILE_HEIGHTS, type ThrelteMapData } from '$js/mapping/threlte-maps/types';

	interface Props {
		npc: NPC;
		mapData: ThrelteMapData;
	}

	let { npc, mapData }: Props = $props();

	const BASE_HEIGHT = 1;
	const MOVEMENT_SPEED = 3;
	const ANIM_FPS = 8;

	const DIRECTION_UV_Y: Record<string, number> = {
		down: 0.75,
		left: 0.5,
		right: 0.25,
		up: 0.0
	};

	let texture = $state<THREE.Texture | null>(null);
	let animFrame = $state(0);
	let animElapsed = $state(0);

	// Alert animation state
	let alertElapsed = $state(0);
	let alertBounce = $derived(Math.sin(alertElapsed / 300) * 0.1);

	function gridTo3D(gridX: number, gridY: number): { x: number; y: number; z: number } {
		const tileType = mapData.tiles[gridY]?.[gridX] ?? TileType3D.GRASS;
		const tileHeight = TILE_HEIGHTS.get(tileType) ?? 0.2;
		return {
			x: gridX - mapData.width / 2 + 0.5,
			y: BASE_HEIGHT + tileHeight + 0.5,
			z: gridY - mapData.height / 2 + 0.5
		};
	}

	// Initialize position
	const startPos = gridTo3D(npc.position.currentGridPosition.x, npc.position.currentGridPosition.y);
	let visualPosition = $state({ ...startPos });

	// Load texture
	$effect(() => {
		const walking = npc.spriteSheet.overworld.walking;
		const source = walking.source;
		const frameCount = walking.frameNumber ?? 4;
		const loader = new THREE.TextureLoader();
		const tex = loader.load(source);
		tex.magFilter = THREE.NearestFilter;
		tex.minFilter = THREE.NearestFilter;
		tex.colorSpace = THREE.SRGBColorSpace;
		tex.repeat.set(1 / frameCount, 0.25);
		texture = tex;
	});

	// Movement + animation task
	useTask('npc-movement-' + npc.id, (delta) => {
		if (!texture) return;

		// Update alert animation
		if (npc.alerted) {
			alertElapsed += delta * 1000;
		} else {
			alertElapsed = 0;
		}

		const direction = npc.direction;
		const frameCount = npc.spriteSheet.overworld.walking.frameNumber ?? 4;
		const uvY = DIRECTION_UV_Y[direction] ?? 0.75;
		texture.offset.y = uvY;

		if (npc.position.isMovingToTarget) {
			const target = gridTo3D(npc.position.targetGridPosition.x, npc.position.targetGridPosition.y);

			const dx = target.x - visualPosition.x;
			const dy = target.y - visualPosition.y;
			const dz = target.z - visualPosition.z;
			const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

			if (dist < 0.05) {
				visualPosition = { ...target };
				npc.position.arriveAtTarget();
				npc.moving = false;
				animFrame = 0;
				animElapsed = 0;
			} else {
				const step = MOVEMENT_SPEED * delta;
				const ratio = Math.min(step / dist, 1);
				visualPosition = {
					x: visualPosition.x + dx * ratio,
					y: visualPosition.y + dy * ratio,
					z: visualPosition.z + dz * ratio
				};
			}

			// Animate walk frames
			animElapsed += delta;
			if (animElapsed >= 1 / ANIM_FPS) {
				animElapsed = 0;
				animFrame = (animFrame + 1) % frameCount;
			}
			texture.offset.x = animFrame * (1 / frameCount);
		} else {
			// Idle
			const current = gridTo3D(
				npc.position.currentGridPosition.x,
				npc.position.currentGridPosition.y
			);
			visualPosition = { ...current };
			texture.offset.x = 0;
			animFrame = 0;
			animElapsed = 0;
		}
	});
</script>

{#if texture}
	<T.Mesh
		position={[visualPosition.x, visualPosition.y - 0.49, visualPosition.z]}
		rotation.x={-Math.PI / 2}
	>
		<T.CircleGeometry args={[0.3, 16]} />
		<T.MeshBasicMaterial color="#000000" transparent opacity={0.25} depthWrite={false} />
	</T.Mesh>
	<Billboard position={[visualPosition.x, visualPosition.y, visualPosition.z]}>
		<T.Mesh>
			<T.PlaneGeometry args={[1, 1]} />
			<T.MeshStandardMaterial map={texture} transparent alphaTest={0.5} side={THREE.DoubleSide} />
		</T.Mesh>

		{#if npc.alerted}
			<T.Mesh position.y={0.8 + alertBounce}>
				<T.SphereGeometry args={[0.15]} />
				<T.MeshBasicMaterial color="red" />
			</T.Mesh>
		{/if}
	</Billboard>
{/if}
