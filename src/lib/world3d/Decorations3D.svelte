<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import * as THREE from 'three';
	import { TileType3D, TILE_HEIGHTS, type ThrelteMapData } from '$js/mapping/threlte-maps/types';
	import {
		TREE_TEXTURES,
		BUSH_TEXTURES,
		ROCK_TEXTURES
	} from '$js/mapping/threlte-maps/tile-textures';
	interface Props {
		mapData: ThrelteMapData;
		playerPosition: { x: number; y: number; z: number };
	}

	const { mapData, playerPosition }: Props = $props();

	const BASE_HEIGHT = 1;

	const textureLoader = new THREE.TextureLoader();

	function loadTexture(url: string): THREE.Texture {
		const tex = textureLoader.load(url);
		tex.magFilter = THREE.NearestFilter;
		tex.minFilter = THREE.NearestFilter;
		tex.colorSpace = THREE.SRGBColorSpace;
		return tex;
	}

	const treeTextures = TREE_TEXTURES.map(loadTexture);
	const bushTextures = BUSH_TEXTURES.map(loadTexture);
	const rockTextures = ROCK_TEXTURES.map(loadTexture);
	// Pre-create shared materials (one per texture variant instead of one per mesh)
	const treeMaterials = treeTextures.map(
		(tex) =>
			new THREE.MeshStandardMaterial({
				map: tex,
				transparent: true,
				alphaTest: 0.5,
				side: THREE.DoubleSide,
				color: 0xffffff
			})
	);

	const bushSpriteMaterials = bushTextures.map(
		(tex) =>
			new THREE.MeshStandardMaterial({
				map: tex,
				transparent: true,
				alphaTest: 0.5,
				side: THREE.DoubleSide,
				roughness: 0.9,
				color: 0xffffff
			})
	);

	const rockSpriteMaterials = rockTextures.map(
		(tex) =>
			new THREE.MeshStandardMaterial({
				map: tex,
				transparent: true,
				alphaTest: 0.5,
				side: THREE.DoubleSide,
				roughness: 0.9,
				color: 0xffffff
			})
	);

	// Reusable quaternions and scale for matrix composition
	const yRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0));
	const identityQuat = new THREE.Quaternion();
	const oneScale = new THREE.Vector3(1, 1, 1);

	// Bush layer offsets: [zOffset, yVariation, xVariation] for multi-layer fill
	const BUSH_LAYERS = [
		{ z: 0.4, y: 0.0, x: 0.0 }, // front layer
		{ z: 0.0, y: -0.04, x: 0.15 }, // middle layer, slightly lower, offset right
		{ z: -0.35, y: 0.03, x: -0.1 } // back layer, slightly higher, offset left
	];

	interface InstanceGroupData {
		texIdx: number;
		matrices: THREE.Matrix4[];
	}

	const instances = $derived.by(() => {
		const treePlane1Map = new Map<number, THREE.Matrix4[]>();
		const treePlane2Map = new Map<number, THREE.Matrix4[]>();
		const bushSpriteMap = new Map<number, THREE.Matrix4[]>();
		const rockSpriteMap = new Map<number, THREE.Matrix4[]>();

		for (let row = 0; row < mapData.height; row++) {
			for (let col = 0; col < mapData.width; col++) {
				const tile = mapData.tiles[row][col];
				const x = col - mapData.width / 2 + 0.5;
				const z = row - mapData.height / 2 + 0.5;

				if (tile === TileType3D.TREE_GROUND) {
					const tileHeight = TILE_HEIGHTS.get(tile) ?? 0.1;
					const textureIndex = (row * 3 + col * 7) % treeTextures.length;
					const treeY = BASE_HEIGHT + tileHeight + 1;

					// Tree plane 1 (facing Z)
					const mat1 = new THREE.Matrix4();
					mat1.compose(new THREE.Vector3(x, treeY, z), identityQuat, oneScale);
					if (!treePlane1Map.has(textureIndex)) {
						treePlane1Map.set(textureIndex, []);
					}
					treePlane1Map.get(textureIndex)!.push(mat1);

					// Tree plane 2 (facing X, cross billboard)
					const mat2 = new THREE.Matrix4();
					mat2.compose(new THREE.Vector3(x, treeY, z), yRotation, oneScale);
					if (!treePlane2Map.has(textureIndex)) {
						treePlane2Map.set(textureIndex, []);
					}
					treePlane2Map.get(textureIndex)!.push(mat2);

					// Add 1-2 bushes near each tree
					const bushCount = 1 + ((row * 5 + col * 11) % 2);
					for (let b = 0; b < bushCount; b++) {
						const bushTexIdx = (row * 7 + col * 3 + b * 5) % bushTextures.length;
						const offsetX = (((row * 13 + col * 17 + b * 7) % 7) - 3) * 0.12;
						const offsetZ = (((row * 11 + col * 19 + b * 3) % 7) - 3) * 0.12;
						const bx = x + offsetX;
						const by = BASE_HEIGHT + tileHeight;
						const bz = z + offsetZ;

						for (const layer of BUSH_LAYERS) {
							const spriteMat = new THREE.Matrix4();
							spriteMat.compose(
								new THREE.Vector3(bx + layer.x, by + 0.3 + layer.y, bz + layer.z),
								identityQuat,
								oneScale
							);
							if (!bushSpriteMap.has(bushTexIdx)) {
								bushSpriteMap.set(bushTexIdx, []);
							}
							bushSpriteMap.get(bushTexIdx)!.push(spriteMat);
						}
					}
				}

				// Scatter rocks and bushes on GRASS, SAND, PATH tiles
				if (tile === TileType3D.GRASS || tile === TileType3D.SAND || tile === TileType3D.PATH) {
					const tileHeight = TILE_HEIGHTS.get(tile) ?? 0;

					// Rocks (1/8 chance)
					const rockRand = (row * 29 + col * 43) % 8;
					if (rockRand === 0) {
						const rockTexIdx = (row * 31 + col * 37) % rockTextures.length;
						const ry = BASE_HEIGHT + tileHeight;

						const spriteMat = new THREE.Matrix4();
						spriteMat.compose(new THREE.Vector3(x, ry + 0.5, z), identityQuat, oneScale);
						if (!rockSpriteMap.has(rockTexIdx)) {
							rockSpriteMap.set(rockTexIdx, []);
						}
						rockSpriteMap.get(rockTexIdx)!.push(spriteMat);
					}

					// Bushes (1/6 chance)
					const bushRand = (row * 41 + col * 53) % 6;
					if (bushRand === 0) {
						const bushTexIdx = (row * 47 + col * 59) % bushTextures.length;
						const by = BASE_HEIGHT + tileHeight;

						for (const layer of BUSH_LAYERS) {
							const spriteMat = new THREE.Matrix4();
							spriteMat.compose(
								new THREE.Vector3(x + layer.x, by + 0.3 + layer.y, z + layer.z),
								identityQuat,
								oneScale
							);
							if (!bushSpriteMap.has(bushTexIdx)) {
								bushSpriteMap.set(bushTexIdx, []);
							}
							bushSpriteMap.get(bushTexIdx)!.push(spriteMat);
						}
					}
				}

				// Place high-grass billboards on every TALL_GRASS tile
				if (tile === TileType3D.TALL_GRASS) {
					const tileHeight = TILE_HEIGHTS.get(tile) ?? 0;
					const bushTexIdx = (row * 7 + col * 3) % bushTextures.length;
					const by = BASE_HEIGHT + tileHeight;

					for (const layer of BUSH_LAYERS) {
						const spriteMat = new THREE.Matrix4();
						spriteMat.compose(
							new THREE.Vector3(x + layer.x, by + 0.3 + layer.y, z + layer.z),
							identityQuat,
							oneScale
						);
						if (!bushSpriteMap.has(bushTexIdx)) {
							bushSpriteMap.set(bushTexIdx, []);
						}
						bushSpriteMap.get(bushTexIdx)!.push(spriteMat);
					}
				}
			}
		}

		const treePlane1Groups: InstanceGroupData[] = [...treePlane1Map.entries()].map(
			([texIdx, matrices]) => ({ texIdx, matrices })
		);
		const treePlane2Groups: InstanceGroupData[] = [...treePlane2Map.entries()].map(
			([texIdx, matrices]) => ({ texIdx, matrices })
		);
		const bushSpriteGroups: InstanceGroupData[] = [...bushSpriteMap.entries()].map(
			([texIdx, matrices]) => ({ texIdx, matrices })
		);
		const rockSpriteGroups: InstanceGroupData[] = [...rockSpriteMap.entries()].map(
			([texIdx, matrices]) => ({ texIdx, matrices })
		);

		return {
			treePlane1Groups,
			treePlane2Groups,
			bushSpriteGroups,
			rockSpriteGroups
		};
	});

	function applyMatrices(ref: THREE.InstancedMesh, matrices: THREE.Matrix4[]) {
		for (let i = 0; i < matrices.length; i++) {
			ref.setMatrixAt(i, matrices[i]);
		}
		ref.instanceMatrix.needsUpdate = true;
	}

	// Bush sway animation state
	const bushMeshRefs: THREE.InstancedMesh[] = [];
	const bushBaseMatrices: THREE.Matrix4[][] = [];
	const swayTriggers = new Map<string, number>(); // key -> trigger time
	const SWAY_RADIUS = 0.5;
	const SWAY_STRENGTH = 0.1;
	const SWAY_DECAY = 4.0; // exponential decay rate (higher = faster stop)
	const SWAY_THRESHOLD = 0.002; // amplitude below which we stop
	const tmpMatrix = new THREE.Matrix4();
	let elapsedTime = 0;

	function initBushMesh(ref: THREE.InstancedMesh, matrices: THREE.Matrix4[], groupIndex: number) {
		applyMatrices(ref, matrices);
		bushMeshRefs[groupIndex] = ref;
		bushBaseMatrices[groupIndex] = matrices.map((m) => m.clone());
	}

	useTask('bush-sway', (delta) => {
		elapsedTime += delta;

		for (let g = 0; g < bushMeshRefs.length; g++) {
			const mesh = bushMeshRefs[g];
			const bases = bushBaseMatrices[g];
			if (!mesh || !bases) {
				continue;
			}

			let needsUpdate = false;

			for (let i = 0; i < bases.length; i++) {
				const baseX = bases[i].elements[12];
				const baseZ = bases[i].elements[14];
				const dx = baseX - playerPosition.x;
				const dz = baseZ - playerPosition.z;
				const key = `${g}-${i}`;

				// Quick reject: skip instances far from player
				if (Math.abs(dx) > 2 || Math.abs(dz) > 2) {
					if (swayTriggers.has(key)) {
						const triggerTime = swayTriggers.get(key)!;
						if (triggerTime < 0) {
							// Sentinel: decay finished, player far away, clean up
							swayTriggers.delete(key);
							continue;
						}
						// Check if still decaying
						const age = elapsedTime - triggerTime;
						const amplitude = SWAY_STRENGTH * Math.exp(-SWAY_DECAY * age);
						if (amplitude < SWAY_THRESHOLD) {
							mesh.setMatrixAt(i, bases[i]);
							swayTriggers.delete(key);
							needsUpdate = true;
						} else {
							const sway = Math.sin(elapsedTime * 10 + i * 1.5) * amplitude;
							tmpMatrix.copy(bases[i]);
							tmpMatrix.elements[12] += sway;
							mesh.setMatrixAt(i, tmpMatrix);
							needsUpdate = true;
						}
					}
					continue;
				}

				const dist = Math.sqrt(dx * dx + dz * dz);

				if (dist < SWAY_RADIUS) {
					// Trigger sway if not already triggered
					if (!swayTriggers.has(key)) {
						swayTriggers.set(key, elapsedTime);
					}
				}

				// Animate if triggered (skip sentinel: decay finished)
				if (swayTriggers.has(key) && swayTriggers.get(key)! >= 0) {
					const age = elapsedTime - swayTriggers.get(key)!;
					const amplitude = SWAY_STRENGTH * Math.exp(-SWAY_DECAY * age);

					if (amplitude < SWAY_THRESHOLD) {
						// Decay finished — reset to base, keep sentinel to prevent re-trigger
						mesh.setMatrixAt(i, bases[i]);
						swayTriggers.set(key, -1);
						needsUpdate = true;
					} else {
						const sway = Math.sin(elapsedTime * 10 + i * 1.5) * amplitude;
						tmpMatrix.copy(bases[i]);
						tmpMatrix.elements[12] += sway;
						mesh.setMatrixAt(i, tmpMatrix);
						needsUpdate = true;
					}
				} else if (swayTriggers.get(key) === -1 && dist >= SWAY_RADIUS) {
					// Player left tile, clear sentinel so re-entry can trigger again
					swayTriggers.delete(key);
				}
			}

			if (needsUpdate) {
				mesh.instanceMatrix.needsUpdate = true;
			}
		}
	});
</script>

{#key mapData}
	<!-- Tree cross-billboards: plane 1 (facing Z) -->
	{#each instances.treePlane1Groups as group (group.texIdx)}
		<T.InstancedMesh
			args={[undefined, undefined, group.matrices.length]}
			material={treeMaterials[group.texIdx]}
			castShadow
			oncreate={(ref) => applyMatrices(ref, group.matrices)}
		>
			<T.PlaneGeometry args={[2, 2]} />
		</T.InstancedMesh>
	{/each}

	<!-- Tree cross-billboards: plane 2 (facing X, rotated 90deg) -->
	{#each instances.treePlane2Groups as group (group.texIdx)}
		<T.InstancedMesh
			args={[undefined, undefined, group.matrices.length]}
			material={treeMaterials[group.texIdx]}
			castShadow
			oncreate={(ref) => applyMatrices(ref, group.matrices)}
		>
			<T.PlaneGeometry args={[2, 2]} />
		</T.InstancedMesh>
	{/each}

	<!-- Bush sprites (one instanced mesh per texture variant) -->
	{#each instances.bushSpriteGroups as group, groupIndex (group.texIdx)}
		<T.InstancedMesh
			args={[undefined, undefined, group.matrices.length]}
			material={bushSpriteMaterials[group.texIdx]}
			castShadow
			oncreate={(ref) => initBushMesh(ref, group.matrices, groupIndex)}
		>
			<T.PlaneGeometry args={[1, 0.6]} />
		</T.InstancedMesh>
	{/each}

	<!-- Rock sprites (one instanced mesh per texture variant) -->
	{#each instances.rockSpriteGroups as group (group.texIdx)}
		<T.InstancedMesh
			args={[undefined, undefined, group.matrices.length]}
			material={rockSpriteMaterials[group.texIdx]}
			castShadow
			oncreate={(ref) => applyMatrices(ref, group.matrices)}
		>
			<T.PlaneGeometry args={[1, 1]} />
		</T.InstancedMesh>
	{/each}
{/key}
