<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Billboard } from '@threlte/extras';
	import * as THREE from 'three';
	import type { OverworldItem } from '$js/items/overworldItem';
	import { TileType3D, TILE_HEIGHTS, type ThrelteMapData } from '$js/mapping/threlte-maps/types';

	interface Props {
		item: OverworldItem;
		mapData: ThrelteMapData;
	}

	let { item, mapData }: Props = $props();

	const BASE_HEIGHT = 1;

	let texture = $state<THREE.Texture | null>(null);
	let yOffset = $state(0);

	function gridTo3D(gridX: number, gridY: number): { x: number; y: number; z: number } {
		const tileType = mapData.tiles[gridY]?.[gridX] ?? TileType3D.GRASS;
		const tileHeight = TILE_HEIGHTS.get(tileType) ?? 0.2;
		return {
			x: gridX - mapData.width / 2 + 0.5,
			y: BASE_HEIGHT + tileHeight + 0.5,
			z: gridY - mapData.height / 2 + 0.5
		};
	}

	// Static position
	const position = $derived(gridTo3D(item.position.x, item.position.y));

	// Load texture
	$effect(() => {
		if (!item.spriteSrc) return;
		const loader = new THREE.TextureLoader();
		const tex = loader.load(item.spriteSrc);
		tex.magFilter = THREE.NearestFilter;
		tex.minFilter = THREE.NearestFilter;
		tex.colorSpace = THREE.SRGBColorSpace;
		texture = tex;
	});

	// Bobbing animation
	useTask((_delta) => {
		yOffset = Math.sin(Date.now() / 500) * 0.05;
	});
</script>

{#if !item.pickedUp && item.visible && texture}
	<Billboard position={[position.x, position.y + yOffset, position.z]}>
		<T.Mesh castShadow>
			<T.PlaneGeometry args={[0.6, 0.6]} />
			<T.MeshStandardMaterial map={texture} transparent alphaTest={0.5} side={THREE.DoubleSide} />
		</T.Mesh>
	</Billboard>
{/if}
