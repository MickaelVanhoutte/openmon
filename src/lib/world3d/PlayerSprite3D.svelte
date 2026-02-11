<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Billboard } from '@threlte/extras';
	import * as THREE from 'three';
	import type { Player } from '$js/characters/player';
	import { TileType3D, TILE_HEIGHTS, type ThrelteMapData } from '$js/mapping/threlte-maps/types';

	interface Props {
		player: Player;
		mapData: ThrelteMapData;
		visualPosition?: { x: number; y: number; z: number };
	}

	let { player, mapData, visualPosition = $bindable({ x: 0, y: 1.7, z: 0 }) }: Props = $props();

	const BASE_HEIGHT = 1;
	const WALKING_SPEED_3D = 4;
	const RUNNING_SPEED_3D = 8;
	const ANIM_FPS = 8;

	const DIRECTION_UV_Y: Record<string, number> = {
		down: 0.75,
		left: 0.5,
		right: 0.25,
		up: 0.0
	};

	let walkingTexture = $state<THREE.Texture | null>(null);
	let runningTexture = $state<THREE.Texture | null>(null);
	let currentTexture = $state<THREE.Texture | null>(null);
	let animFrame = $state(0);
	let animElapsed = $state(0);

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
	const startPos = gridTo3D(
		player.position.currentGridPosition.x,
		player.position.currentGridPosition.y
	);
	visualPosition = { ...startPos };

	// Load walking and running textures
	$effect(() => {
		const loader = new THREE.TextureLoader();

		const walkSrc = player.sprite.overworld.walking.source;
		const walkTex = loader.load(walkSrc);
		walkTex.magFilter = THREE.NearestFilter;
		walkTex.minFilter = THREE.NearestFilter;
		walkTex.colorSpace = THREE.SRGBColorSpace;
		walkTex.repeat.set(0.25, 0.25);
		walkingTexture = walkTex;

		const runSrc = player.sprite.overworld.running?.source;
		if (runSrc) {
			const runTex = loader.load(runSrc);
			runTex.magFilter = THREE.NearestFilter;
			runTex.minFilter = THREE.NearestFilter;
			runTex.colorSpace = THREE.SRGBColorSpace;
			runTex.repeat.set(0.25, 0.25);
			runningTexture = runTex;
		}
	});

	// Movement + animation task
	useTask('player-movement', (delta) => {
		const tex =
			player.running && player.position.isMovingToTarget ? runningTexture : walkingTexture;
		if (!tex) return;
		currentTexture = tex;

		const speed = player.running ? RUNNING_SPEED_3D : WALKING_SPEED_3D;

		const direction = player.position.movementDirection;
		const uvY = DIRECTION_UV_Y[direction] ?? 0.75;
		tex.offset.y = uvY;

		if (player.position.isMovingToTarget) {
			const target = gridTo3D(
				player.position.targetGridPosition.x,
				player.position.targetGridPosition.y
			);

			const dx = target.x - visualPosition.x;
			const dy = target.y - visualPosition.y;
			const dz = target.z - visualPosition.z;
			const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

			if (dist < 0.05) {
				visualPosition = { ...target };
				player.position.arriveAtTarget();
				player.moving = false;
				animFrame = 0;
				animElapsed = 0;
			} else {
				const step = speed * delta;
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
			tex.offset.x = animFrame * 0.25;
		} else {
			// Idle
			const current = gridTo3D(
				player.position.currentGridPosition.x,
				player.position.currentGridPosition.y
			);
			visualPosition = { ...current };
			tex.offset.x = 0;
			animFrame = 0;
			animElapsed = 0;
		}
	});
</script>

{#if walkingTexture}
	<Billboard position={[visualPosition.x, visualPosition.y, visualPosition.z]}>
		<T.Mesh castShadow>
			<T.PlaneGeometry args={[1, 1]} />
			<T.MeshStandardMaterial
				map={currentTexture}
				transparent
				alphaTest={0.5}
				side={THREE.DoubleSide}
			/>
		</T.Mesh>
	</Billboard>
{/if}
