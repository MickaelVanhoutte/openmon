<script lang="ts">
	import { T } from '@threlte/core';
	import * as THREE from 'three';
	import {
		TileType3D,
		TILE_HEIGHTS,
		TILE_COLORS,
		type ThrelteMapData
	} from '$js/mapping/threlte-maps/types';

	interface Props {
		mapData: ThrelteMapData;
	}

	let { mapData }: Props = $props();

	const BASE_HEIGHT = 1;

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
</script>

{#key mapData}
	{#each [...terrainGroups.entries()] as [type, matrices] (type)}
		{@const color = TILE_COLORS.get(type) ?? 0xffffff}
		{@const height = TILE_HEIGHTS.get(type) ?? 0}
		{@const geometryHeight = BASE_HEIGHT + height}

		<T.InstancedMesh
			args={[undefined, undefined, matrices.length]}
			receiveShadow
			oncreate={(ref: THREE.InstancedMesh) => {
				for (let i = 0; i < matrices.length; i++) {
					ref.setMatrixAt(i, matrices[i]);
				}
				ref.instanceMatrix.needsUpdate = true;
			}}
		>
			<T.BoxGeometry args={[1, geometryHeight, 1]} />
			<T.MeshStandardMaterial {color} roughness={0.9} />
		</T.InstancedMesh>
	{/each}
{/key}
