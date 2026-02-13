<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Billboard } from '@threlte/extras';
	import * as THREE from 'three';
	import type { OverworldSpawn } from '$js/characters/overworld-spawn';
	import { TileType3D, TILE_HEIGHTS, type ThrelteMapData } from '$js/mapping/threlte-maps/types';

	interface Props {
		spawn: OverworldSpawn;
		mapData: ThrelteMapData;
	}

	let { spawn, mapData }: Props = $props();

	const BASE_HEIGHT = 1;
	const MOVEMENT_SPEED = 4;
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
	let visualPosition = $state({ x: 0, y: 0, z: 0 });

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
	$effect(() => {
		const startPos = gridTo3D(
			spawn.position.currentGridPosition.x,
			spawn.position.currentGridPosition.y
		);
		// Only set initial position if it hasn't been set yet (or if we want to reset on spawn change)
		// For now, we initialize once.
		if (visualPosition.x === 0 && visualPosition.y === 0 && visualPosition.z === 0) {
			visualPosition = { ...startPos };
		}
	});

	// Load texture
	$effect(() => {
		let id = ('00' + spawn.pokemon.id).slice(-3);
		id = spawn.pokemon.isShiny ? id + 's' : id;
		const source = `src/assets/monsters/walking/${id}.png`;

		const loader = new THREE.TextureLoader();
		const tex = loader.load(source);
		tex.magFilter = THREE.NearestFilter;
		tex.minFilter = THREE.NearestFilter;
		tex.colorSpace = THREE.SRGBColorSpace;
		tex.repeat.set(0.25, 0.25);
		texture = tex;
	});

	// Movement + animation task
	useTask('spawn-movement', (delta) => {
		if (!texture) return;

		const direction = spawn.position.movementDirection;
		const uvY = DIRECTION_UV_Y[direction] ?? 0.75;
		texture.offset.y = uvY;

		if (spawn.moving) {
			const target = gridTo3D(
				spawn.position.targetGridPosition.x,
				spawn.position.targetGridPosition.y
			);

			const dx = target.x - visualPosition.x;
			const dy = target.y - visualPosition.y;
			const dz = target.z - visualPosition.z;
			const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

			if (dist < 0.05) {
				visualPosition = { ...target };
				spawn.position.arriveAtTarget();
				spawn.moving = false;
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
				animFrame = (animFrame + 1) % 4;
			}
			texture.offset.x = animFrame * 0.25;
		} else {
			// Idle - snap to current grid position to be safe
			const current = gridTo3D(
				spawn.position.currentGridPosition.x,
				spawn.position.currentGridPosition.y
			);
			// We can lerp to idle position too if needed, but snapping is usually fine for idle
			// However, if we just stopped moving, we are already at target (which is now current).
			// If the spawn is teleported, we might want to update visualPosition.
			// For now, let's just update visualPosition to match current if not moving,
			// but only if significantly different to avoid jitter?
			// Actually, PlayerSprite3D does: visualPosition = { ...current };
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
	</Billboard>
{/if}
