<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Billboard } from '@threlte/extras';
	import { DoubleSide, NearestFilter, SRGBColorSpace, Texture, TextureLoader } from 'three';
	import { untrack } from 'svelte';
	import { NPC } from '$js/characters/npc';
	import { TileType3D, TILE_HEIGHTS, type ThrelteMapData } from '$js/mapping/threlte-maps/types';
	import {
		getPMDSpritePath,
		PMD_DIRECTION_MAP,
		getPMDSpriteInfoFromAnimData
	} from '$js/sprites/pmd-sprite-data';
	import { loadAnimData } from '$js/sprites/pmd-anim-data';

	interface Props {
		npc: NPC;
		mapData: ThrelteMapData;
	}

	let { npc, mapData }: Props = $props();

	const BASE_HEIGHT = 1;
	const MOVEMENT_SPEED = 3;
	const ANIM_FPS = 8;

	// UV Y offsets for standard 4-row character sprite sheets (down, left, right, up)
	const DIRECTION_UV_Y: Record<string, number> = {
		down: 0.75,
		left: 0.5,
		right: 0.25,
		up: 0.0
	};

	let texture = $state<Texture | null>(null);
	let animFrame = $state(0);
	let animElapsed = $state(0);

	// PMD idle animation state (Pokémon NPCs only)
	let pmdFrameCount = $state(4);
	let pmdFrameWidth = $state(0);
	let pmdFrameHeight = $state(0);
	let pmdImgWidth = $state(1);
	let pmdImgHeight = $state(1);
	let pmdDurations = $state<number[]>([]);

	// Alert animation state
	let alertElapsed = $state(0);
	let alertBounce = $derived(Math.sin(alertElapsed / 300) * 0.1);

	function getDirectionUVY(direction: string): number {
		const row = PMD_DIRECTION_MAP[direction] ?? 0;
		if (pmdFrameHeight === 0 || pmdImgHeight === 0) return 1 - (row + 1) / 8;
		return 1 - ((row + 1) * pmdFrameHeight) / pmdImgHeight;
	}

	function gridTo3D(gridX: number, gridY: number): { x: number; y: number; z: number } {
		const tileType = mapData.tiles[gridY]?.[gridX] ?? TileType3D.GRASS;
		const tileHeight = TILE_HEIGHTS.get(tileType) ?? 0.2;
		return {
			x: gridX - mapData.width / 2 + 0.5,
			y: BASE_HEIGHT + tileHeight + 0.5,
			z: gridY - mapData.height / 2 + 0.5
		};
	}

	// Initialize position — untrack to avoid false reactive capture warning
	const startPos = untrack(() =>
		gridTo3D(npc.position.currentGridPosition.x, npc.position.currentGridPosition.y)
	);
	let visualPosition = $state({ ...startPos });

	// Load texture
	$effect(() => {
		if (npc.spriteId >= 100) {
			// PMD Pokémon NPC: use Idle-Anim.png with AnimData for correct frame dimensions
			const idlePath = getPMDSpritePath(npc.spriteId, 'Idle', false);

			loadAnimData(npc.spriteId, false).then((animDataFile) => {
				const img = new Image();
				img.src = idlePath;
				img.onload = () => {
					const info = getPMDSpriteInfoFromAnimData(animDataFile, 'Idle', npc.spriteId, img);
					pmdFrameCount = info.frameCount;
					pmdFrameWidth = info.frameWidth;
					pmdFrameHeight = info.frameHeight;
					pmdImgWidth = img.width;
					pmdImgHeight = img.height;
					pmdDurations = info.durations;

					const loader = new TextureLoader();
					const tex = loader.load(idlePath);
					tex.magFilter = NearestFilter;
					tex.minFilter = NearestFilter;
					tex.colorSpace = SRGBColorSpace;
					tex.repeat.set(info.frameWidth / img.width, info.frameHeight / img.height);
					texture = tex;
					animFrame = 0;
					animElapsed = 0;
				};
				img.onerror = () => {
					// Idle not available — fall back to Walk-Anim
					const walkPath = getPMDSpritePath(npc.spriteId, 'Walk', false);
					loadAnimData(npc.spriteId, false).then((walkAnimData) => {
						const wImg = new Image();
						wImg.src = walkPath;
						wImg.onload = () => {
							const info = getPMDSpriteInfoFromAnimData(walkAnimData, 'Walk', npc.spriteId, wImg);
							pmdFrameCount = info.frameCount;
							pmdFrameWidth = info.frameWidth;
							pmdFrameHeight = info.frameHeight;
							pmdImgWidth = wImg.width;
							pmdImgHeight = wImg.height;
							pmdDurations = info.durations;

							const loader = new TextureLoader();
							const tex = loader.load(walkPath);
							tex.magFilter = NearestFilter;
							tex.minFilter = NearestFilter;
							tex.colorSpace = SRGBColorSpace;
							tex.repeat.set(info.frameWidth / wImg.width, info.frameHeight / wImg.height);
							texture = tex;
							animFrame = 0;
							animElapsed = 0;
						};
					});
				};
			});
		} else {
			// Regular human NPC: use overworld walking sprite sheet
			const walking = npc.spriteSheet.overworld.walking;
			const loader = new TextureLoader();
			const tex = loader.load(walking.source);
			tex.magFilter = NearestFilter;
			tex.minFilter = NearestFilter;
			tex.colorSpace = SRGBColorSpace;
			const frameCount = walking.frameNumber ?? 4;
			tex.repeat.set(1 / frameCount, 1 / 4);
			texture = tex;
			animFrame = 0;
			animElapsed = 0;
		}
	});

	// Movement + animation task
	useTask('npc-movement-' + untrack(() => npc.id), (delta) => {
		if (!texture) return;

		// Update alert animation
		if (npc.alerted) {
			alertElapsed += delta * 1000;
		} else {
			alertElapsed = 0;
		}

		const isPokemon = npc.spriteId >= 100;

		if (isPokemon) {
			// PMD idle animation: cycle frames using per-frame durations
			// Direction UV uses pixel-accurate row offsets
			const direction = npc.direction;
			texture.offset.y = getDirectionUVY(direction);

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
			} else {
				const current = gridTo3D(npc.position.currentGridPosition.x, npc.position.currentGridPosition.y);
				visualPosition = { ...current };
			}

			// Always animate idle frames (PMD idle plays continuously)
			if (pmdFrameCount > 0 && pmdImgWidth > 0) {
				animElapsed += delta * 1000; // convert to ms
				const frameDurationMs = (pmdDurations[animFrame] ?? 8) * (1000 / 60); // durations in game-frames at 60fps
				if (animElapsed >= frameDurationMs) {
					animElapsed = 0;
					animFrame = (animFrame + 1) % pmdFrameCount;
				}
				texture.offset.x = (animFrame * pmdFrameWidth) / pmdImgWidth;
			}
		} else {
			// Regular NPC
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
				animElapsed += delta;
				if (animElapsed >= 1 / ANIM_FPS) {
					animElapsed = 0;
					animFrame = (animFrame + 1) % frameCount;
				}
				texture.offset.x = animFrame * (1 / frameCount);
			} else {
				const current = gridTo3D(npc.position.currentGridPosition.x, npc.position.currentGridPosition.y);
				visualPosition = { ...current };
				texture.offset.x = 0;
				animFrame = 0;
				animElapsed = 0;
			}
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
			<T.MeshStandardMaterial map={texture} transparent alphaTest={0.5} side={DoubleSide} />
		</T.Mesh>

		{#if npc.alerted}
			<T.Mesh position.y={0.8 + alertBounce}>
				<T.SphereGeometry args={[0.15]} />
				<T.MeshBasicMaterial color="red" />
			</T.Mesh>
		{/if}
	</Billboard>
{/if}
