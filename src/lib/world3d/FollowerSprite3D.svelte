<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Billboard } from '@threlte/extras';
	import * as THREE from 'three';
	import type { Follower } from '$js/characters/follower';
	import { TileType3D, TILE_HEIGHTS, type ThrelteMapData } from '$js/mapping/threlte-maps/types';

	interface Props {
		follower: Follower;
		mapData: ThrelteMapData;
		running?: boolean;
	}

	let { follower, mapData, running = false }: Props = $props();

	const BASE_HEIGHT = 1;
	const WALKING_SPEED_3D = 4;
	const RUNNING_SPEED_3D = 8;
	const ANIM_FPS = 8;
	const IDLE_THRESHOLD_MS = 2000;

	const DIRECTION_UV_Y: Record<string, number> = {
		down: 0.75,
		left: 0.5,
		right: 0.25,
		up: 0.0
	};

	let texture = $state<THREE.Texture | null>(null);
	let animFrame = $state(0);
	let animElapsed = $state(0);
	let stationaryTime = $state(0);

	function gridTo3D(gridX: number, gridY: number): { x: number; y: number; z: number } {
		const tileType = mapData.tiles[gridY]?.[gridX] ?? TileType3D.GRASS;
		const tileHeight = TILE_HEIGHTS.get(tileType) ?? 0.2;
		return {
			x: gridX - mapData.width / 2 + 0.5,
			y: BASE_HEIGHT + tileHeight + 0.5,
			z: gridY - mapData.height / 2 + 0.5
		};
	}

	function getFollowerSpritePath(pokemonId: number, isShiny: boolean): string {
		let id = ('00' + pokemonId).slice(-3);
		id = isShiny ? id + 's' : id;
		return `src/assets/monsters/walking/${id}.png`;
	}

	// Initialize position
	const startPos = gridTo3D(
		follower.position.currentGridPosition.x,
		follower.position.currentGridPosition.y
	);
	let visualPosition = $state({ ...startPos });

	// Load/reload texture when pokemon changes
	$effect(() => {
		const path = getFollowerSpritePath(follower.pokemon.id, follower.pokemon.isShiny);
		const loader = new THREE.TextureLoader();
		const tex = loader.load(path);
		tex.magFilter = THREE.NearestFilter;
		tex.minFilter = THREE.NearestFilter;
		tex.colorSpace = THREE.SRGBColorSpace;
		tex.repeat.set(0.25, 0.25);
		texture = tex;
	});

	// Movement + animation task
	useTask('follower-movement', (delta) => {
		if (!texture) return;

		const direction = follower.position.movementDirection;
		const uvY = DIRECTION_UV_Y[direction] ?? 0.75;
		texture.offset.y = uvY;

		if (follower.position.isMovingToTarget) {
			// Reset stationary time when moving
			stationaryTime = 0;

			const target = gridTo3D(
				follower.position.targetGridPosition.x,
				follower.position.targetGridPosition.y
			);

			const dx = target.x - visualPosition.x;
			const dy = target.y - visualPosition.y;
			const dz = target.z - visualPosition.z;
			const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

			if (dist < 0.05) {
				visualPosition = { ...target };
				follower.position.arriveAtTarget();
				follower.moving = false;
				animFrame = 0;
				animElapsed = 0;
			} else {
				const speed = running ? RUNNING_SPEED_3D : WALKING_SPEED_3D;
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
			texture.offset.x = animFrame * 0.25;
		} else {
			// Not moving — accumulate stationary time
			stationaryTime += delta * 1000;

			const current = gridTo3D(
				follower.position.currentGridPosition.x,
				follower.position.currentGridPosition.y
			);
			visualPosition = { ...current };

			if (stationaryTime > IDLE_THRESHOLD_MS) {
				// Idle — show standing frame
				texture.offset.x = 0;
				animFrame = 0;
				animElapsed = 0;
			} else {
				// Recently stopped — show standing frame
				texture.offset.x = 0;
				animFrame = 0;
				animElapsed = 0;
			}
		}
	});
</script>

{#if texture}
	<Billboard position={[visualPosition.x, visualPosition.y, visualPosition.z]}>
		<T.Mesh castShadow>
			<T.PlaneGeometry args={[1, 1]} />
			<T.MeshStandardMaterial map={texture} transparent alphaTest={0.5} side={THREE.DoubleSide} />
		</T.Mesh>
	</Billboard>
{/if}
