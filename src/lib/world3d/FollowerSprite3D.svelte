<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Billboard } from '@threlte/extras';
	import * as THREE from 'three';
	import type { Follower } from '$js/characters/follower';
	import { TileType3D, TILE_HEIGHTS, type ThrelteMapData } from '$js/mapping/threlte-maps/types';
	import {
		getPMDSpritePath,
		PMD_DIRECTION_MAP,
		getPMDSpriteInfoFromAnimData
	} from '$js/sprites/pmd-sprite-data';
	import { loadAnimData } from '$js/sprites/pmd-anim-data';

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

	function getDirectionUVY(direction: string): number {
		const row = PMD_DIRECTION_MAP[direction] ?? 0;
		return 1 - ((row + 1) * frameHeight) / imgHeight;
	}

	let texture = $state<THREE.Texture | null>(null);
	let frameCount = $state(4); // default, updated after image loads
	let frameWidth = $state(0);
	let frameHeight = $state(0);
	let imgWidth = $state(1);
	let imgHeight = $state(1);
	let animFrame = $state(0);
	let animElapsed = $state(0);
	let stationaryTime = $state(0);

	function gridTo3D(gridX: number, gridY: number): { x: number; y: number; z: number } {
		const tileType = mapData.tiles[gridY]?.[gridX] ?? TileType3D.GRASS;
		const tileHeight = TILE_HEIGHTS.get(tileType) ?? 0.2;
		return {
			x: gridX - mapData.width / 2 + 0.5,
			y: BASE_HEIGHT + tileHeight + 0.3,
			z: gridY - mapData.height / 2 + 0.5
		};
	}

	// Initialize position
	const startPos = gridTo3D(
		follower.position.currentGridPosition.x,
		follower.position.currentGridPosition.y
	);
	let visualPosition = $state({ ...startPos });

	// Load/reload texture when pokemon changes
	$effect(() => {
		const pokemonId = follower.pokemon.regionalId;
		const isShiny = follower.pokemon.isShiny;
		const path = getPMDSpritePath(pokemonId, 'Walk', isShiny);

		// Load AnimData.xml for exact frame dimensions
		loadAnimData(pokemonId, isShiny).then((animDataFile) => {
			const img = new Image();
			img.src = path;
			img.onload = () => {
				// Get accurate sprite info from AnimData
				const info = getPMDSpriteInfoFromAnimData(animDataFile, 'Walk', pokemonId, img);
				frameCount = info.frameCount;
				frameWidth = info.frameWidth;
				frameHeight = info.frameHeight;
				imgWidth = img.width;
				imgHeight = img.height;

				const loader = new THREE.TextureLoader();
				const tex = loader.load(path);
				tex.magFilter = THREE.NearestFilter;
				tex.minFilter = THREE.NearestFilter;
				tex.colorSpace = THREE.SRGBColorSpace;
				// CORRECT UV: use pixel ratios, not assumptions
				tex.repeat.set(info.frameWidth / img.width, info.frameHeight / img.height);
				texture = tex;
			};
			img.onerror = () => {
				if (isShiny) {
					// Fallback to non-shiny
					const fallbackPath = getPMDSpritePath(pokemonId, 'Walk', false);
					loadAnimData(pokemonId, false).then((fallbackAnimData) => {
						const fallbackImg = new Image();
						fallbackImg.src = fallbackPath;
						fallbackImg.onload = () => {
							const info = getPMDSpriteInfoFromAnimData(
								fallbackAnimData,
								'Walk',
								pokemonId,
								fallbackImg
							);
							frameCount = info.frameCount;
							frameWidth = info.frameWidth;
							frameHeight = info.frameHeight;
							imgWidth = fallbackImg.width;
							imgHeight = fallbackImg.height;

							const loader = new THREE.TextureLoader();
							const tex = loader.load(fallbackPath);
							tex.magFilter = THREE.NearestFilter;
							tex.minFilter = THREE.NearestFilter;
							tex.colorSpace = THREE.SRGBColorSpace;
							tex.repeat.set(
								info.frameWidth / fallbackImg.width,
								info.frameHeight / fallbackImg.height
							);
							texture = tex;
						};
					});
				}
			};
		});
	});

	// Movement + animation task
	useTask('follower-movement', (delta) => {
		if (!texture || frameWidth === 0) return;

		const direction = follower.position.movementDirection;
		texture.offset.y = getDirectionUVY(direction);

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

			if (dist > 2) {
				// Teleport — snap instantly (map change, warp, etc.)
				visualPosition = { ...target };
			} else if (dist < 0.05) {
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
			const currentAnimFPS = running ? 14 : ANIM_FPS;
			if (animElapsed >= 1 / currentAnimFPS) {
				animElapsed = 0;
				animFrame = (animFrame + 1) % frameCount;
			}
			texture.offset.x = (animFrame * frameWidth) / imgWidth;
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
			<T.PlaneGeometry args={[1.3, 1.3]} />
			<T.MeshStandardMaterial map={texture} transparent alphaTest={0.5} side={THREE.DoubleSide} />
		</T.Mesh>
	</Billboard>
{/if}
