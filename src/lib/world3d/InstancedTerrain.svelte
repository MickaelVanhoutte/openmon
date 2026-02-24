<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { untrack } from 'svelte';
	import { InstancedMesh, Matrix4, MeshStandardMaterial, NearestFilter, Quaternion, RepeatWrapping, SRGBColorSpace, Texture, TextureLoader, Vector3 } from 'three';
	import {
		TileType3D,
		TILE_HEIGHTS,
		TILE_WALKABLE,
		TILE_COLORS,
		type ThrelteMapData
	} from '$js/mapping/threlte-maps/types';
	import {
		TILE_TEXTURES,
		WALL_SIDE_TEXTURE,
		GRASS_TEXTURES,
		FOREST_GRASS_TEXTURES,
		BIOME_FLOOR_TEXTURES
	} from '$js/mapping/threlte-maps/tile-textures';
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
	const GROUND_Y = 0;

	// Push animation state
	let pushProgress = $state(0);
	let playerSnapshot = { x: 0, z: 0 };
	let pushTween: gsap.core.Tween | undefined;
	const pushTmpMatrix = new Matrix4();
	const pushTmpPos = new Vector3();

	// Storage for wall mesh refs and base matrices
	const wallMeshData: Map<
		string,
		{ mesh: InstancedMesh; baseMatrices: Matrix4[] }
	> = new Map();

	const textureLoader = new TextureLoader();
	// Textures keyed by URL (shared across tile types that use the same image)
	const loadedTexturesByUrl = new Map<string, Texture>();

	function loadTexture(url: string): Texture {
		if (loadedTexturesByUrl.has(url)) return loadedTexturesByUrl.get(url)!;
		const texture = textureLoader.load(url);
		texture.magFilter = NearestFilter;
		texture.minFilter = NearestFilter;
		texture.colorSpace = SRGBColorSpace;
		texture.wrapS = RepeatWrapping;
		texture.wrapT = RepeatWrapping;
		loadedTexturesByUrl.set(url, texture);
		return texture;
	}

	// Load base tile textures
	for (const url of Object.values(TILE_TEXTURES)) {
		if (url !== null) loadTexture(url);
	}
	// Load grass variant textures into the shared cache
	GRASS_TEXTURES.forEach(loadTexture);
	FOREST_GRASS_TEXTURES.forEach(loadTexture);
	// Load biome floor textures (may overlap with above; cache deduplicates by URL)
	for (const urls of Object.values(BIOME_FLOOR_TEXTURES)) {
		urls.forEach(loadTexture);
	}

	const wallSideTexture = loadTexture(WALL_SIDE_TEXTURE);

	/**
	 * Non-linear 2D integer hash — breaks diagonal patterns produced by linear
	 * hashes like (row * A + col * B). Based on a simple xorshift scramble.
	 * Returns a non-negative integer suitable for modulo indexing.
	 */
	function tileHash(row: number, col: number): number {
		let h = (row * 1619 + col * 31337) | 0;
		h ^= h >>> 16;
		h = Math.imul(h, 0x45d9f3b);
		h ^= h >>> 16;
		return h >>> 0; // unsigned
	}

	/**
	 * For the Fire Volcanic biome, determines whether a tile is within a sand cluster.
	 * Clusters are seeded on a coarse grid (spacing ~6 tiles) with jitter.
	 * Returns true if this tile falls within a sand patch.
	 */
	function isVolcanicSandCluster(row: number, col: number): boolean {
		const CLUSTER_SPACING = 6;
		const CLUSTER_RADIUS_SQ = 4; // radius ~2 tiles → ~4-5 tile patches
		const CLUSTER_DENSITY = 3; // ~1 in 3 cluster seeds become sand
		let inSand = false;

		// Check the 9 nearest coarse-grid cells for a cluster center
		const cellRow = Math.round(row / CLUSTER_SPACING);
		const cellCol = Math.round(col / CLUSTER_SPACING);
		for (let dr = -1; dr <= 1; dr++) {
			for (let dc = -1; dc <= 1; dc++) {
				const cr = cellRow + dr;
				const cc = cellCol + dc;
				// Deterministic hash for this cell
				const cellSeed = tileHash(cr * 1000, cc * 1000);
				// Only ~1/CLUSTER_DENSITY cells become sand clusters
				if (cellSeed % CLUSTER_DENSITY !== 0) continue;
				// Jitter the cluster center within the cell
				const jitterR = (cellSeed >> 4) % CLUSTER_SPACING;
				const jitterC = (cellSeed >> 8) % CLUSTER_SPACING;
				const centerR = cr * CLUSTER_SPACING + jitterR;
				const centerC = cc * CLUSTER_SPACING + jitterC;
				const dRow = row - centerR;
				const dCol = col - centerC;
				if (dRow * dRow + dCol * dCol <= CLUSTER_RADIUS_SQ) {
					inSand = true;
					break;
				}
			}
			if (inSand) break;
		}
		return inSand;
	}

	/**
	 * Returns the texture URL for a given tile type and tile coordinates.
	 * For GRASS, TALL_GRASS, TREE_GROUND, and FLOWER_GROUND tiles, picks a
	 * variant using a coord hash. DUNGEON_FLOOR tiles pick from the biome-specific
	 * floor texture pool. Other tiles use the base TILE_TEXTURES entry.
	 */
	function getTileTextureUrl(type: TileType3D, row: number, col: number): string | null {
		if (type === TileType3D.GRASS || type === TileType3D.TALL_GRASS) {
			return GRASS_TEXTURES[tileHash(row, col) % GRASS_TEXTURES.length];
		}
		if (type === TileType3D.TREE_GROUND || type === TileType3D.FLOWER_GROUND) {
			return FOREST_GRASS_TEXTURES[tileHash(row, col) % FOREST_GRASS_TEXTURES.length];
		}
		if (type === TileType3D.DUNGEON_FLOOR) {
			const biome = mapData.biome ?? 'Cave Rock';
			if (biome === 'Fire Volcanic') {
				// Use clustered sand placement instead of random per-tile
				if (isVolcanicSandCluster(row, col)) {
					return BIOME_FLOOR_TEXTURES['Fire Volcanic'][12]; // sandUrl entry
				}
				return BIOME_FLOOR_TEXTURES['Fire Volcanic'][0]; // dirtUrl entry
			}
			const biomeFloors = BIOME_FLOOR_TEXTURES[biome] ?? BIOME_FLOOR_TEXTURES['Cave Rock'];
			return biomeFloors[tileHash(row, col) % biomeFloors.length];
		}
		return TILE_TEXTURES[type];
	}

	/**
	 * Returns a unique group key for a tile — includes the variant index for
	 * tiles that use per-tile texture variation so they get separate InstancedMeshes.
	 */
	function getTileGroupKey(type: TileType3D, row: number, col: number): string {
		if (
			type === TileType3D.GRASS ||
			type === TileType3D.TALL_GRASS ||
			type === TileType3D.TREE_GROUND ||
			type === TileType3D.FLOWER_GROUND
		) {
			const urls =
				type === TileType3D.TREE_GROUND || type === TileType3D.FLOWER_GROUND
					? FOREST_GRASS_TEXTURES
					: GRASS_TEXTURES;
			return `${type}-${tileHash(row, col) % urls.length}`;
		}
		if (type === TileType3D.DUNGEON_FLOOR) {
			const biome = mapData.biome ?? 'Cave Rock';
			if (biome === 'Fire Volcanic') {
				return `${type}-${isVolcanicSandCluster(row, col) ? 'sand' : 'dirt'}`;
			}
			const biomeFloors = BIOME_FLOOR_TEXTURES[biome] ?? BIOME_FLOOR_TEXTURES['Cave Rock'];
			return `${type}-${tileHash(row, col) % biomeFloors.length}`;
		}
		return `${type}`;
	}

	function createMaterialForUrl(
		url: string | null,
		fallbackColor: number,
		tileHeight: number
	): MeshStandardMaterial | MeshStandardMaterial[] {
		const topTexture = url ? loadedTexturesByUrl.get(url) ?? null : null;

		if (tileHeight >= 0.3) {
			const sideMat = new MeshStandardMaterial({
				map: wallSideTexture,
				roughness: 0.9
			});
			const topMat = topTexture
				? new MeshStandardMaterial({
						map: topTexture,
						color: 0xffffff,
						roughness: 0.9
					})
				: new MeshStandardMaterial({
						color: fallbackColor,
						roughness: 0.9
					});
			const bottomMat = new MeshStandardMaterial({
				color: 0x333333,
				roughness: 0.9
			});
			// BoxGeometry face order: right(+x), left(-x), top(+y), bottom(-y), front(+z), back(-z)
			return [sideMat, sideMat, topMat, bottomMat, sideMat, sideMat];
		}

		if (topTexture) {
			return new MeshStandardMaterial({
				map: topTexture,
				color: 0xffffff,
				roughness: 0.9
			});
		}
		return new MeshStandardMaterial({
			color: fallbackColor,
			roughness: 0.9
		});
	}

	interface TileGroup {
		type: TileType3D;
		textureUrl: string | null;
		matrices: Matrix4[];
	}

	let terrainGroups = $derived.by(() => {
		const groups = new Map<string, TileGroup>();
		const { width, height, tiles, paddingHeightScales } = mapData;

		for (let row = 0; row < height; row++) {
			for (let col = 0; col < width; col++) {
				const type = tiles[row][col];
				const key = getTileGroupKey(type, row, col);

				if (!groups.has(key)) {
					const textureUrl = getTileTextureUrl(type, row, col);
					groups.set(key, { type, textureUrl, matrices: [] });
				}

				const tileHeight = TILE_HEIGHTS.get(type) ?? 0;
				const x = col - width / 2 + 0.5;
				const z = row - height / 2 + 0.5;

				const scaleY = paddingHeightScales?.get(row * width + col) ?? 1;
				const y = scaleY * (BASE_HEIGHT + tileHeight) / 2;

				const matrix = new Matrix4();
				if (scaleY !== 1) {
					matrix.compose(
						new Vector3(x, y, z),
						new Quaternion(),
						new Vector3(1, scaleY, 1)
					);
				} else {
					matrix.setPosition(x, y, z);
				}
				groups.get(key)!.matrices.push(matrix);
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

	function applyPushToMesh(mesh: InstancedMesh, baseMatrices: Matrix4[]) {
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
	{#each [...terrainGroups.entries()] as [key, group] (key)}
		{@const tileHeight = TILE_HEIGHTS.get(group.type) ?? 0}
		{@const fallbackColor = TILE_COLORS.get(group.type) ?? 0xffffff}
		{@const materials = createMaterialForUrl(group.textureUrl, fallbackColor, tileHeight)}
		{@const geometryHeight = BASE_HEIGHT + tileHeight}

		<T.InstancedMesh
			args={[undefined, undefined, group.matrices.length]}
			material={materials}
			receiveShadow
			oncreate={(ref: InstancedMesh) => {
				for (let i = 0; i < group.matrices.length; i++) {
					ref.setMatrixAt(i, group.matrices[i]);
				}
				ref.instanceMatrix.needsUpdate = true;
				// Store non-walkable mesh data for battle push animation
				if (!(TILE_WALKABLE.get(group.type) ?? true)) {
					wallMeshData.set(key, {
						mesh: ref,
						baseMatrices: group.matrices.map((m) => m.clone())
					});
				}
			}}
		>
			<T.BoxGeometry args={[1, geometryHeight, 1]} />
		</T.InstancedMesh>
	{/each}
{/key}
