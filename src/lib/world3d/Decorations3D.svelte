<script lang="ts">
	import { T } from '@threlte/core';
	import * as THREE from 'three';
	import { TileType3D, TILE_HEIGHTS, type ThrelteMapData } from '$js/mapping/threlte-maps/types';

	interface Props {
		mapData: ThrelteMapData;
	}

	let { mapData }: Props = $props();

	const BASE_HEIGHT = 1;

	const decorations = $derived.by(() => {
		const trees: Array<{
			x: number;
			y: number;
			z: number;
			scale: number;
			canopyColor: string;
		}> = [];
		const grasses: Array<{ x: number; y: number; z: number; rotation: number }> = [];

		const treeColors = ['#2d7d2e', '#3a8a3a', '#1e5e1f'];

		for (let row = 0; row < mapData.height; row++) {
			for (let col = 0; col < mapData.width; col++) {
				const tile = mapData.tiles[row][col];
				const x = col - mapData.width / 2 + 0.5;
				const z = row - mapData.height / 2 + 0.5;

				if (tile === TileType3D.TREE_GROUND) {
					const tileHeight = TILE_HEIGHTS.get(tile) ?? 0.1;
					// Deterministic random based on position
					const scale = 0.8 + ((row * 7 + col * 13) % 5) / 10;
					const colorIndex = (row * 3 + col * 7) % treeColors.length;

					trees.push({
						x,
						y: BASE_HEIGHT + tileHeight,
						z,
						scale,
						canopyColor: treeColors[colorIndex]
					});
				} else if (tile === TileType3D.TALL_GRASS) {
					const tileHeight = TILE_HEIGHTS.get(tile) ?? 0.15;
					const rotation = ((row * 11 + col * 7) % 6) * (Math.PI / 6); // deterministic rotation
					grasses.push({
						x,
						y: BASE_HEIGHT + tileHeight,
						z,
						rotation
					});
				}
			}
		}

		return { trees, grasses };
	});
</script>

{#key mapData}
	{#each decorations.trees as tree}
		<T.Group position={[tree.x, tree.y, tree.z]} scale={tree.scale}>
			<!-- Trunk -->
			<T.Mesh position.y={0.3} castShadow>
				<T.CylinderGeometry args={[0.08, 0.12, 0.6, 6]} />
				<T.MeshStandardMaterial color="#5d3a1a" />
			</T.Mesh>
			<!-- Canopy -->
			<T.Mesh position.y={0.9} castShadow>
				<T.ConeGeometry args={[0.5, 1.2, 6]} />
				<T.MeshStandardMaterial color={tree.canopyColor} />
			</T.Mesh>
		</T.Group>
	{/each}

	{#each decorations.grasses as grass}
		<T.Group position={[grass.x, grass.y + 0.25, grass.z]} rotation.y={grass.rotation}>
			<!-- Blade 1 -->
			<T.Mesh>
				<T.PlaneGeometry args={[0.5, 0.5]} />
				<T.MeshStandardMaterial
					color="#3d8b37"
					transparent
					opacity={0.9}
					side={THREE.DoubleSide}
					alphaTest={0.1}
				/>
			</T.Mesh>
			<!-- Blade 2 (rotated 90°) -->
			<T.Mesh rotation.y={Math.PI / 2}>
				<T.PlaneGeometry args={[0.5, 0.5]} />
				<T.MeshStandardMaterial
					color="#4a9e44"
					transparent
					opacity={0.9}
					side={THREE.DoubleSide}
					alphaTest={0.1}
				/>
			</T.Mesh>
		</T.Group>
	{/each}
{/key}
