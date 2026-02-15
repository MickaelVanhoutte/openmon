<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { untrack } from 'svelte';
	import * as THREE from 'three';
	import {
		TileType3D,
		TILE_HEIGHTS,
		TILE_WALKABLE,
		TILE_COLORS,
		type ThrelteMapData
	} from '$js/mapping/threlte-maps/types';
	import { TILE_TEXTURES, WALL_SIDE_TEXTURE } from '$js/mapping/threlte-maps/tile-textures';
	import gsap from 'gsap';

	interface Props {
		mapData: ThrelteMapData;
		battleActive?: boolean;
		playerPosition?: { x: number; y: number; z: number };
	}

	let { mapData, battleActive = false, playerPosition }: Props = $props();

	const BASE_HEIGHT = 1;

	// Battle push animation constants
	const CLEARING_RADIUS = 6;
	const GROUND_Y = 0.2;

	// Push animation state
	let pushProgress = $state(0);
	let playerSnapshot = { x: 0, z: 0 };
	let pushTween: gsap.core.Tween | undefined;
	const pushTmpMatrix = new THREE.Matrix4();
	const pushTmpPos = new THREE.Vector3();

	// Storage for wall mesh refs and base matrices
	const wallMeshData: Map<
		TileType3D,
		{ mesh: THREE.InstancedMesh; baseMatrices: THREE.Matrix4[] }
	> = new Map();

	const textureLoader = new THREE.TextureLoader();
	const loadedTextures = new Map<TileType3D, THREE.Texture>();

	for (const [typeKey, url] of Object.entries(TILE_TEXTURES)) {
		const type = Number(typeKey) as TileType3D;
		if (url !== null) {
			const texture = textureLoader.load(url);
			texture.magFilter = THREE.NearestFilter;
			texture.minFilter = THREE.NearestFilter;
			texture.colorSpace = THREE.SRGBColorSpace;
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			loadedTextures.set(type, texture);
		}
	}

	const wallSideTexture = textureLoader.load(WALL_SIDE_TEXTURE);
	wallSideTexture.magFilter = THREE.NearestFilter;
	wallSideTexture.minFilter = THREE.NearestFilter;
	wallSideTexture.colorSpace = THREE.SRGBColorSpace;
	wallSideTexture.wrapS = THREE.RepeatWrapping;
	wallSideTexture.wrapT = THREE.RepeatWrapping;

	function createMaterials(
		type: TileType3D
	): THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] {
		const tileHeight = TILE_HEIGHTS.get(type) ?? 0;
		const topTexture = loadedTextures.get(type);
		const fallbackColor = TILE_COLORS.get(type) ?? 0xffffff;

		if (tileHeight >= 0.3) {
			const sideMat = new THREE.MeshStandardMaterial({
				map: wallSideTexture,
				roughness: 0.9
			});
			const topMat = topTexture
				? new THREE.MeshStandardMaterial({
						map: topTexture,
						color: 0xffffff,
						roughness: 0.9
					})
				: new THREE.MeshStandardMaterial({
						color: fallbackColor,
						roughness: 0.9
					});
			const bottomMat = new THREE.MeshStandardMaterial({
				color: 0x333333,
				roughness: 0.9
			});
			// BoxGeometry face order: right(+x), left(-x), top(+y), bottom(-y), front(+z), back(-z)
			return [sideMat, sideMat, topMat, bottomMat, sideMat, sideMat];
		}

		if (topTexture) {
			return new THREE.MeshStandardMaterial({
				map: topTexture,
				color: 0xffffff,
				roughness: 0.9
			});
		}
		return new THREE.MeshStandardMaterial({
			color: fallbackColor,
			roughness: 0.9
		});
	}

	let terrainGroups = $derived.by(() => {
		const groups = new Map<TileType3D, THREE.Matrix4[]>();
		const { width, height, tiles } = mapData;

		for (let row = 0; row < height; row++) {
			for (let col = 0; col < width; col++) {
				const type = tiles[row][col];
				if (!groups.has(type)) {
					groups.set(type, []);
				}

				const tileHeight = TILE_HEIGHTS.get(type) ?? 0;
				// Position calculation:
				// x: col - width/2 + 0.5 (center 0,0 at map center)
				// z: row - height/2 + 0.5
				// y: (BASE_HEIGHT + tileHeight) / 2 (center of the box)
				const x = col - width / 2 + 0.5;
				const z = row - height / 2 + 0.5;
				const y = (BASE_HEIGHT + tileHeight) / 2;

				const matrix = new THREE.Matrix4();
				matrix.setPosition(x, y, z);
				groups.get(type)!.push(matrix);
			}
		}
		return groups;
	});

	function restoreAllToBase() {
		wallMeshData.forEach(({ mesh, baseMatrices }) => {
			for (let i = 0; i < baseMatrices.length; i++) {
				mesh.setMatrixAt(i, baseMatrices[i]);
			}
			mesh.instanceMatrix.needsUpdate = true;
		});
	}

	function applyPushToMesh(mesh: THREE.InstancedMesh, baseMatrices: THREE.Matrix4[]) {
		for (let i = 0; i < baseMatrices.length; i++) {
			pushTmpPos.setFromMatrixPosition(baseMatrices[i]);
			const dx = pushTmpPos.x - playerSnapshot.x;
			const dz = pushTmpPos.z - playerSnapshot.z;
			const dist = Math.sqrt(dx * dx + dz * dz);

			if (dist < CLEARING_RADIUS) {
				pushTmpMatrix.copy(baseMatrices[i]);
				pushTmpPos.setFromMatrixPosition(pushTmpMatrix);
				const baseY = pushTmpPos.y;
				pushTmpPos.y = baseY + (GROUND_Y - baseY) * pushProgress;
				pushTmpMatrix.setPosition(pushTmpPos);
				mesh.setMatrixAt(i, pushTmpMatrix);
			} else {
				mesh.setMatrixAt(i, baseMatrices[i]);
			}
		}
		mesh.instanceMatrix.needsUpdate = true;
	}

	$effect(() => {
		if (battleActive) {
			const pos = untrack(() => playerPosition);
			if (pos) {
				playerSnapshot = { x: pos.x, z: pos.z };
			}
			pushTween?.kill();
			const currentProgress = untrack(() => pushProgress);
			pushTween = gsap.to(
				{ value: currentProgress },
				{
					value: 1,
					duration: 0.8,
					ease: 'power3.out',
					onUpdate: function () {
						pushProgress = this.targets()[0].value;
					}
				}
			);
		} else {
			pushTween?.kill();
			const currentProgress = untrack(() => pushProgress);
			pushTween = gsap.to(
				{ value: currentProgress },
				{
					value: 0,
					duration: 1.2,
					ease: 'power2.inOut',
					onUpdate: function () {
						pushProgress = this.targets()[0].value;
					},
					onComplete: () => restoreAllToBase()
				}
			);
		}
	});

	useTask('wall-battle-push', () => {
		if (pushProgress <= 0) return;
		wallMeshData.forEach(({ mesh, baseMatrices }) => {
			applyPushToMesh(mesh, baseMatrices);
		});
	});
</script>

{#key mapData}
	{#each [...terrainGroups.entries()] as [type, matrices] (type)}
		{@const materials = createMaterials(type)}
		{@const height = TILE_HEIGHTS.get(type) ?? 0}
		{@const geometryHeight = BASE_HEIGHT + height}

		<T.InstancedMesh
			args={[undefined, undefined, matrices.length]}
			material={materials}
			receiveShadow
			oncreate={(ref: THREE.InstancedMesh) => {
				for (let i = 0; i < matrices.length; i++) {
					ref.setMatrixAt(i, matrices[i]);
				}
				ref.instanceMatrix.needsUpdate = true;
				// Store non-walkable mesh data for battle push animation
				if (!(TILE_WALKABLE.get(type) ?? true)) {
					wallMeshData.set(type, {
						mesh: ref,
						baseMatrices: matrices.map((m) => m.clone())
					});
				}
			}}
		>
			<T.BoxGeometry args={[1, geometryHeight, 1]} />
		</T.InstancedMesh>
	{/each}
{/key}
