<script lang="ts">
	import { T } from '@threlte/core';
	import { Billboard } from '@threlte/extras';
	import * as THREE from 'three';
	import { TileType3D, TILE_HEIGHTS, type ThrelteMapData } from '$js/mapping/threlte-maps/types';

	interface Props {
		mapData: ThrelteMapData;
	}

	let { mapData }: Props = $props();

	const BASE_HEIGHT = 1;
	const TREE_WIDTH = 1.5;
	const TREE_HEIGHT = 2.5;
	const FLOWER_WIDTH = 0.6;
	const FLOWER_HEIGHT = 0.6;

	const decorations = $derived.by(() => {
		const trees: Array<{ x: number; y: number; z: number }> = [];
		const flowers: Array<{ x: number; y: number; z: number }> = [];

		for (let row = 0; row < mapData.height; row++) {
			for (let col = 0; col < mapData.width; col++) {
				const tile = mapData.tiles[row][col];
				const x = col - mapData.width / 2 + 0.5;
				const z = row - mapData.height / 2 + 0.5;

				if (tile === TileType3D.TREE_GROUND) {
					const tileHeight = TILE_HEIGHTS.get(tile) ?? 0.1;
					trees.push({
						x,
						y: BASE_HEIGHT + tileHeight + TREE_HEIGHT / 2,
						z
					});
				} else if (tile === TileType3D.TALL_GRASS && (row * 7 + col * 13) % 3 === 0) {
					const tileHeight = TILE_HEIGHTS.get(tile) ?? 0.15;
					flowers.push({
						x,
						y: BASE_HEIGHT + tileHeight + FLOWER_HEIGHT / 2,
						z
					});
				}
			}
		}

		return { trees, flowers };
	});
</script>

{#key mapData}
	{#each decorations.trees as pos}
		<Billboard position={[pos.x, pos.y, pos.z]}>
			<T.Mesh castShadow>
				<T.PlaneGeometry args={[TREE_WIDTH, TREE_HEIGHT]} />
				<T.MeshStandardMaterial
					color="#2d5a1b"
					transparent
					alphaTest={0.1}
					side={THREE.DoubleSide}
				/>
			</T.Mesh>
		</Billboard>
	{/each}

	{#each decorations.flowers as pos}
		<Billboard position={[pos.x, pos.y, pos.z]}>
			<T.Mesh>
				<T.PlaneGeometry args={[FLOWER_WIDTH, FLOWER_HEIGHT]} />
				<T.MeshStandardMaterial
					color="#4a7c2e"
					transparent
					alphaTest={0.1}
					side={THREE.DoubleSide}
				/>
			</T.Mesh>
		</Billboard>
	{/each}
{/key}
