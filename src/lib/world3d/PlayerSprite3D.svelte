<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Billboard } from '@threlte/extras';
	import { DoubleSide, Mesh, NearestFilter, SRGBColorSpace, Texture, TextureLoader } from 'three';
	import { untrack } from 'svelte';
	import type { Player } from '$js/characters/player';
	import { TileType3D, TILE_HEIGHTS, type ThrelteMapData } from '$js/mapping/threlte-maps/types';

	interface Props {
		player: Player;
		mapData: ThrelteMapData;
		visualPosition?: { x: number; y: number; z: number };
		portalAnimating?: boolean;
	}

	let { player, mapData, visualPosition = $bindable({ x: 0, y: 1.7, z: 0 }), portalAnimating = false }: Props = $props();

	const BASE_HEIGHT = 1;
	const WALKING_SPEED_3D = 4;
	const RUNNING_SPEED_3D = 8;
	const ANIM_FPS = 8;
	// Total portal animation duration must match the setTimeout in changeMap (900ms)
	const PORTAL_ANIM_DURATION = 0.9;

	const DIRECTION_UV_Y: Record<string, number> = {
		down: 0.75,
		left: 0.5,
		right: 0.25,
		up: 0.0
	};

	let walkingTexture = $state<Texture | null>(null);
	let runningTexture = $state<Texture | null>(null);
	let currentTexture = $state<Texture | null>(null);
	let animFrame = $state(0);
	let animElapsed = $state(0);

	// Portal suck-in animation state — plain mutable, not $state, to avoid frame-rate reactivity
	let portalAnimTime = 0;
	// Reactive scale/rotation for the portal mesh (drives Svelte template binding)
	let portalScale = $state(1);
	let portalRotation = $state(0);

	function gridTo3D(gridX: number, gridY: number): { x: number; y: number; z: number } {
		const tileType = mapData.tiles[gridY]?.[gridX] ?? TileType3D.GRASS;
		const tileHeight = TILE_HEIGHTS.get(tileType) ?? 0.2;
		return {
			x: gridX - mapData.width / 2 + 0.5,
			y: BASE_HEIGHT + tileHeight + 0.5,
			z: gridY - mapData.height / 2 + 0.5
		};
	}

	// Initialize position — untrack to avoid false reactive capture warning;
	// actual position updates happen in the useTask loop below.
	const startPos = untrack(() =>
		gridTo3D(player.position.currentGridPosition.x, player.position.currentGridPosition.y)
	);
	visualPosition = { ...startPos };

	// Load walking and running textures
	$effect(() => {
		const loader = new TextureLoader();

		const walkSrc = player.sprite.overworld.walking.source;
		const walkTex = loader.load(walkSrc);
		walkTex.magFilter = NearestFilter;
		walkTex.minFilter = NearestFilter;
		walkTex.colorSpace = SRGBColorSpace;
		walkTex.repeat.set(0.25, 0.25);
		walkingTexture = walkTex;

		const runSrc = player.sprite.overworld.running?.source;
		if (runSrc) {
			const runTex = loader.load(runSrc);
			runTex.magFilter = NearestFilter;
			runTex.minFilter = NearestFilter;
			runTex.colorSpace = SRGBColorSpace;
			runTex.repeat.set(0.25, 0.25);
			runningTexture = runTex;
		}
	});

	// Ref for the shadow mesh
	let shadowMeshRef: Mesh | null = null;

	// Movement + animation task
	useTask('player-movement', (delta) => {
		const tex =
			player.running && player.position.isMovingToTarget && runningTexture
				? runningTexture
				: walkingTexture;
		if (!tex) return;
		currentTexture = tex;

		const speed = player.running ? RUNNING_SPEED_3D : WALKING_SPEED_3D;

		// Portal suck-in animation: spin and shrink the sprite.
		// During this phase we render a plain T.Mesh (no Billboard) so rotation is not cancelled.
		if (portalAnimating) {
			if (portalAnimTime === 0) {
				// First frame: lock position to current grid tile.
				// Player stays on the tile in front of the portal (never walks onto the wall tile),
				// so we just snap to their current grid position for a clean animation start.
				visualPosition = { ...gridTo3D(
					player.position.currentGridPosition.x,
					player.position.currentGridPosition.y
				) };
				// Cancel any residual movement
				if (player.position.isMovingToTarget) {
					player.position.arriveAtTarget();
					player.moving = false;
				}
			}
			portalAnimTime = Math.min(portalAnimTime + delta, PORTAL_ANIM_DURATION);
			const p = portalAnimTime / PORTAL_ANIM_DURATION; // 0 → 1
			portalScale = 1 - p;                              // 1 → 0 (shrink)
			portalRotation += delta * (4 + p * 12);           // accelerating spin
			if (shadowMeshRef) {
				shadowMeshRef.scale.set(portalScale, portalScale, portalScale);
			}
			return; // freeze position updates during animation
		}

		// Reset animation state when not animating
		if (portalAnimTime > 0) {
			portalAnimTime = 0;
			portalScale = 1;
			portalRotation = 0;
			if (shadowMeshRef) {
				shadowMeshRef.scale.set(1, 1, 1);
			}
		}

		const direction = player.position.movementDirection;
		const uvY = DIRECTION_UV_Y[direction] ?? 0.75;
		tex.offset.y = uvY;

		if (player.position.isMovingToTarget) {
			const target = gridTo3D(
				player.position.targetGridPosition.x,
				player.position.targetGridPosition.y
			);
			// Clamp target Y to floor height for wall tiles (e.g. legendary portal triggers).
			// Wall tiles have height 1.0 which would make the player climb visually — keep them grounded.
			const targetTileType = mapData.tiles[player.position.targetGridPosition.y]?.[player.position.targetGridPosition.x];
			if (targetTileType === TileType3D.WALL) {
				target.y = BASE_HEIGHT + 0.5;
			}

			const dx = target.x - visualPosition.x;
			const dy = target.y - visualPosition.y;
			const dz = target.z - visualPosition.z;
			const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

			if (dist > 2) {
				// Teleport — snap instantly (map change, warp, etc.)
				visualPosition = { ...target };
			} else if (dist < 0.05) {
				visualPosition = { ...target };
				player.position.arriveAtTarget();
				player.moving = false;
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
			const currentAnimFPS = player.running ? 14 : ANIM_FPS;
			if (animElapsed >= 1 / currentAnimFPS) {
				animElapsed = 0;
				animFrame = (animFrame + 1) % 4;
			}
			tex.offset.x = animFrame * 0.25;
		} else {
			// Idle — show neutral frame without resetting the cycle
			const current = gridTo3D(
				player.position.currentGridPosition.x,
				player.position.currentGridPosition.y
			);
			visualPosition = { ...current };
			tex.offset.x = 0;
			animElapsed = 0;
		}
	});
</script>

{#if walkingTexture}
	<T.Mesh
		position={[visualPosition.x, visualPosition.y - 0.49, visualPosition.z]}
		rotation.x={-Math.PI / 2}
		oncreate={(ref) => { shadowMeshRef = ref; }}
		ondestroy={() => { shadowMeshRef = null; }}
	>
		<T.CircleGeometry args={[0.3, 16]} />
		<T.MeshBasicMaterial color="#000000" transparent opacity={0.25} depthWrite={false} />
	</T.Mesh>

	{#if portalAnimating}
		<!-- Plain mesh during portal animation: no Billboard so rotation.z is not cancelled out -->
		<T.Mesh
			position={[visualPosition.x, visualPosition.y, visualPosition.z]}
			scale={[portalScale, portalScale, portalScale]}
			rotation.z={portalRotation}
		>
			<T.PlaneGeometry args={[1, 1]} />
			<T.MeshStandardMaterial
				map={currentTexture}
				transparent
				alphaTest={0.5}
				side={DoubleSide}
			/>
		</T.Mesh>
	{:else}
		<!-- Normal mode: Billboard keeps the sprite camera-facing -->
		<Billboard position={[visualPosition.x, visualPosition.y, visualPosition.z]}>
			<T.Mesh>
				<T.PlaneGeometry args={[1, 1]} />
				<T.MeshStandardMaterial
					map={currentTexture}
					transparent
					alphaTest={0.5}
					side={DoubleSide}
				/>
			</T.Mesh>
		</Billboard>
	{/if}
{/if}
