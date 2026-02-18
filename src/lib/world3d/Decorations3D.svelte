<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { untrack } from 'svelte';
	import * as THREE from 'three';
	import { TileType3D, TILE_HEIGHTS, type ThrelteMapData } from '$js/mapping/threlte-maps/types';
	import {
		TREE_TEXTURES,
		BUSH_TEXTURES,
		ROCK_TEXTURES
	} from '$js/mapping/threlte-maps/tile-textures';
	import gsap from 'gsap';
	interface Props {
		mapData: ThrelteMapData;
		playerPosition: { x: number; y: number; z: number };
		battleActive?: boolean;
	}

	const { mapData, playerPosition, battleActive = false }: Props = $props();
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
	// Custom tree shader material: supports per-instance opacity via instanceColor.r
	// instanceColor.r = opacity multiplier (1 = fully visible, 0.1 = ghosted)
	// Three.js InstancedMesh auto-injects instanceMatrix; instanceColor is declared manually.
	function makeTreeMaterial(tex: THREE.Texture, polygonOffset = false) {
		const mat = new THREE.ShaderMaterial({
			uniforms: {
				map: { value: tex }
			},
			vertexShader: /* glsl */ `
				attribute vec3 instanceColor;
				varying vec2 vUv;
				varying float vOpacity;
				void main() {
					vUv = uv;
					vOpacity = instanceColor.r;
					vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
					gl_Position = projectionMatrix * mvPosition;
				}
			`,
			fragmentShader: /* glsl */ `
				uniform sampler2D map;
				varying vec2 vUv;
				varying float vOpacity;
				void main() {
					vec4 texColor = texture2D(map, vUv);
					if (texColor.a < 0.5) discard;
					gl_FragColor = vec4(texColor.rgb, texColor.a * vOpacity);
				}
			`,
			transparent: true,
			side: THREE.DoubleSide,
			depthWrite: false
		});
		if (polygonOffset) {
			mat.polygonOffset = true;
			mat.polygonOffsetFactor = -1;
			mat.polygonOffsetUnits = -1;
		}
		return mat;
	}

	// Pre-create shared materials (one per texture variant instead of one per mesh)
	// plane1 has polygon offset to prevent z-fighting with plane2 at cross intersections
	const treeMaterialsPlane1 = treeTextures.map((tex) => makeTreeMaterial(tex, true));
	const treeMaterialsPlane2 = treeTextures.map((tex) => makeTreeMaterial(tex, false));

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
		{ z: 0.45, y: 0.0, x: 0.0 }, // front layer
		{ z: -0.15, y: -0.02, x: 0.008 },
		{ z: 0.2, y: 0.0, x: 0.0 },
		{ z: -0.3, y: 0.02, x: -0.08 } // back layer, slightly higher, offset left
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

	// Tree ref storage (2 cross-planes per texture group)
	const treeMeshRefs: THREE.InstancedMesh[] = [];
	const treeBaseMatrices: THREE.Matrix4[][] = [];

	const TREE_FULL_OPACITY_COLOR = new THREE.Color(1, 1, 1);

	function initTreeMesh(ref: THREE.InstancedMesh, matrices: THREE.Matrix4[], index: number) {
		applyMatrices(ref, matrices);
		// Initialize all instances to full opacity
		for (let i = 0; i < matrices.length; i++) {
			ref.setColorAt(i, TREE_FULL_OPACITY_COLOR);
		}
		if (ref.instanceColor) ref.instanceColor.needsUpdate = true;
		treeMeshRefs[index] = ref;
		treeBaseMatrices[index] = matrices.map((m) => m.clone());
	}

	// Rock ref storage
	const rockMeshRefs: THREE.InstancedMesh[] = [];
	const rockBaseMatrices: THREE.Matrix4[][] = [];

	function initRockMesh(ref: THREE.InstancedMesh, matrices: THREE.Matrix4[], index: number) {
		applyMatrices(ref, matrices);
		rockMeshRefs[index] = ref;
		rockBaseMatrices[index] = matrices.map((m) => m.clone());
	}

	// Battle push animation
	const CLEARING_RADIUS = 6; // world units
	const MAX_PUSH_DISTANCE = 4; // max push offset
	let pushProgress = $state(0); // 0 = normal, 1 = fully pushed
	let playerSnapshot = { x: 0, z: 0 }; // captured when battle starts
	let pushTween: gsap.core.Tween | undefined;
	const pushTmpMatrix = new THREE.Matrix4();

	function restoreAllToBase() {
		bushMeshRefs.forEach((mesh, idx) => {
			if (mesh && bushBaseMatrices[idx]) {
				applyMatrices(mesh, bushBaseMatrices[idx]);
			}
		});
		treeMeshRefs.forEach((mesh, idx) => {
			if (mesh && treeBaseMatrices[idx]) {
				applyMatrices(mesh, treeBaseMatrices[idx]);
			}
		});
		rockMeshRefs.forEach((mesh, idx) => {
			if (mesh && rockBaseMatrices[idx]) {
				applyMatrices(mesh, rockBaseMatrices[idx]);
			}
		});
	}

	$effect(() => {
		// Kill any in-progress tween
		if (pushTween) {
			pushTween.kill();
		}

		// Read pushProgress without tracking to avoid re-triggering
		// the effect on every tween update (Zeno's paradox bug)
		const currentProgress = untrack(() => pushProgress);

		if (battleActive) {
			// Snapshot player position at battle start (untracked to avoid re-triggering)
			playerSnapshot = untrack(() => ({ x: playerPosition.x, z: playerPosition.z }));

			// Push outward: 0 → 1 over 0.8s
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
			// Reverse: 1 → 0 over 1.2s
			pushTween = gsap.to(
				{ value: currentProgress },
				{
					value: 0,
					duration: 1.2,
					ease: 'power2.inOut',
					onUpdate: function () {
						pushProgress = this.targets()[0].value;
					},
					onComplete: () => {
						pushProgress = 0;
						restoreAllToBase();
					}
				}
			);
		}
	});

	useTask('bush-sway', (delta) => {
		// Pause sway during battle
		if (battleActive) return;
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

	useTask('battle-push', () => {
		// Only run when there's actually a push happening
		if (pushProgress === 0) return;

		// Helper: apply push to a single decoration mesh
		const applyPushToMesh = (mesh: THREE.InstancedMesh, baseMatrices: THREE.Matrix4[]) => {
			for (let i = 0; i < mesh.count; i++) {
				const base = baseMatrices[i];
				if (!base) continue;

				// Get base position from stored matrix
				const baseX = base.elements[12];
				const baseZ = base.elements[14];

				// Calculate distance from player snapshot
				const dx = baseX - playerSnapshot.x;
				const dz = baseZ - playerSnapshot.z;
				const distance = Math.sqrt(dx * dx + dz * dz);

				// Only push decorations within clearing radius
				if (distance >= CLEARING_RADIUS) {
					// Outside radius — restore to base position
					mesh.setMatrixAt(i, base);
					continue;
				}

				// Guard zero distance (decoration exactly on player)
				if (distance < 0.01) continue;

				// Calculate push amount (stronger near center, weaker at edge)
				const pushAmount = MAX_PUSH_DISTANCE * (1 - distance / CLEARING_RADIUS) * pushProgress;

				// Direction: radial outward from player in XZ plane
				const dirX = dx / distance;
				const dirZ = dz / distance;

				// Apply offset to base matrix
				pushTmpMatrix.copy(base);
				pushTmpMatrix.elements[12] = baseX + dirX * pushAmount;
				pushTmpMatrix.elements[14] = baseZ + dirZ * pushAmount;

				mesh.setMatrixAt(i, pushTmpMatrix);
			}
			mesh.instanceMatrix.needsUpdate = true;
		};

		// Apply push to ALL decoration types

		// Bushes (multiple mesh refs, multiple layers)
		bushMeshRefs.forEach((mesh, meshIdx) => {
			if (mesh && bushBaseMatrices[meshIdx]) {
				applyPushToMesh(mesh, bushBaseMatrices[meshIdx]);
			}
		});

		// Trees (multiple mesh refs for cross-planes)
		treeMeshRefs.forEach((mesh, meshIdx) => {
			if (mesh && treeBaseMatrices[meshIdx]) {
				applyPushToMesh(mesh, treeBaseMatrices[meshIdx]);
			}
		});

		// Rocks
		rockMeshRefs.forEach((mesh, meshIdx) => {
			if (mesh && rockBaseMatrices[meshIdx]) {
				applyPushToMesh(mesh, rockBaseMatrices[meshIdx]);
			}
		});
	});

	// Camera-occlusion fade: fade trees behind the player to semi-transparent
	const FADE_ZONE_RADIUS = 5.0; // fade trees within 5 world units of player
	const FADE_START_Z = 0.3; // start fading trees 0.3 units behind player (positive Z)
	const FADE_FULL_Z = 1.5; // fully faded at 1.5 units behind player
	const MIN_OPACITY = 0.1; // minimum opacity when fully faded (see-through but still visible)

	const fadeColor = new THREE.Color();

	useTask('camera-occlusion-fade', () => {
		// Only run when NOT in battle (battle push already handles trees)
		if (battleActive || pushProgress > 0) return;

		// Process tree plane pairs (plane1 and plane2 share same world positions)
		for (let meshIdx = 0; meshIdx < treeMeshRefs.length; meshIdx += 2) {
			const plane1Mesh = treeMeshRefs[meshIdx];
			const plane2Mesh = treeMeshRefs[meshIdx + 1];
			const bases = treeBaseMatrices[meshIdx];
			if (!plane1Mesh || !plane2Mesh || !bases) continue;

			let colorDirty = false;

			for (let i = 0; i < bases.length; i++) {
				const base = bases[i];
				if (!base) continue;

				const baseX = base.elements[12];
				const baseZ = base.elements[14];
				const dx = baseX - playerPosition.x;
				const dz = baseZ - playerPosition.z;
				const distXZ = Math.sqrt(dx * dx + dz * dz);
				const deltaZ = baseZ - playerPosition.z;

				let opacity: number;

				if (distXZ >= FADE_ZONE_RADIUS || deltaZ <= FADE_START_Z) {
					// Outside fade zone or in front of player — fully visible
					opacity = 1.0;
				} else {
					// Behind player within fade zone — fade to MIN_OPACITY
					const fadeProgress = (deltaZ - FADE_START_Z) / (FADE_FULL_Z - FADE_START_Z);
					const clamped = Math.min(Math.max(fadeProgress, 0), 1);
					opacity = 1.0 - clamped * (1.0 - MIN_OPACITY);
				}

				// Encode opacity in instance color R channel (shader reads vOpacity = instanceColor.r)
				fadeColor.setRGB(opacity, opacity, opacity);
				plane1Mesh.setColorAt(i, fadeColor);
				plane2Mesh.setColorAt(i, fadeColor);
				colorDirty = true;
			}

			if (colorDirty) {
				if (plane1Mesh.instanceColor) plane1Mesh.instanceColor.needsUpdate = true;
				if (plane2Mesh.instanceColor) plane2Mesh.instanceColor.needsUpdate = true;
			}
		}
	});
</script>

{#key mapData}
	<!-- Tree cross-billboards: plane 1 (facing Z) -->
	{#each instances.treePlane1Groups as group, groupIndex (group.texIdx)}
		<T.InstancedMesh
			args={[undefined, undefined, group.matrices.length]}
			material={treeMaterialsPlane1[group.texIdx]}
			castShadow
			oncreate={(ref) => initTreeMesh(ref, group.matrices, groupIndex * 2)}
		>
			<T.PlaneGeometry args={[1.5, 1.5]} />
		</T.InstancedMesh>
	{/each}

	<!-- Tree cross-billboards: plane 2 (facing X, rotated 90deg) -->
	{#each instances.treePlane2Groups as group, groupIndex (group.texIdx)}
		<T.InstancedMesh
			args={[undefined, undefined, group.matrices.length]}
			material={treeMaterialsPlane2[group.texIdx]}
			castShadow
			oncreate={(ref) => initTreeMesh(ref, group.matrices, groupIndex * 2 + 1)}
		>
			<T.PlaneGeometry args={[1.5, 1.5]} />
		</T.InstancedMesh>
	{/each}

	<!-- Bush sprites (one instanced mesh per texture variant) -->
	{#each instances.bushSpriteGroups as group, groupIndex (group.texIdx)}
		<T.InstancedMesh
			args={[undefined, undefined, group.matrices.length]}
			material={bushSpriteMaterials[group.texIdx]}
			oncreate={(ref) => initBushMesh(ref, group.matrices, groupIndex)}
		>
			<T.PlaneGeometry args={[1, 0.6]} />
		</T.InstancedMesh>
	{/each}

	<!-- Rock sprites (one instanced mesh per texture variant) -->
	{#each instances.rockSpriteGroups as group, groupIndex (group.texIdx)}
		<T.InstancedMesh
			args={[undefined, undefined, group.matrices.length]}
			material={rockSpriteMaterials[group.texIdx]}
			oncreate={(ref) => initRockMesh(ref, group.matrices, groupIndex)}
		>
			<T.PlaneGeometry args={[1, 1]} />
		</T.InstancedMesh>
	{/each}
{/key}
