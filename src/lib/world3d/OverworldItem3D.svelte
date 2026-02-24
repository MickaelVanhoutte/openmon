<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Billboard } from '@threlte/extras';
	import { DoubleSide, NearestFilter, SRGBColorSpace, Texture, TextureLoader } from 'three';
	import type { OverworldItem } from '$js/items/overworldItem';
	import { TileType3D, TILE_HEIGHTS, type ThrelteMapData } from '$js/mapping/threlte-maps/types';

	interface Props {
		item: OverworldItem;
		mapData: ThrelteMapData;
	}

	let { item, mapData }: Props = $props();

	const BASE_HEIGHT = 1;

	let texture = $state<Texture | null>(null);
	let yOffset = $state(0);
	// Initialized to false; the useTask below updates this every frame from item state.
	let isVisible = $state(false);

	function gridTo3D(gridX: number, gridY: number): { x: number; y: number; z: number } {
		const tileType = mapData.tiles[gridY]?.[gridX] ?? TileType3D.GRASS;
		const tileHeight = TILE_HEIGHTS.get(tileType) ?? 0.2;
		return {
			x: gridX - mapData.width / 2 + 0.5,
			y: BASE_HEIGHT + tileHeight + 0.3,
			z: gridY - mapData.height / 2 + 0.5
		};
	}

	// Static position
	const position = $derived(gridTo3D(item.position.x, item.position.y));

	// Load texture
	$effect(() => {
		if (!item.spriteSrc) return;
		const loader = new TextureLoader();
		const tex = loader.load(item.spriteSrc);
		tex.magFilter = NearestFilter;
		tex.minFilter = NearestFilter;
		tex.colorSpace = SRGBColorSpace;
		texture = tex;
	});

	// Bobbing animation + poll visibility
	useTask((_delta) => {
		yOffset = Math.sin(Date.now() / 500) * 0.05;
		isVisible = !item.pickedUp && item.visible;
	});
</script>

{#if isVisible && texture}
	<T.Mesh position={[position.x, position.y - 0.29, position.z]} rotation.x={-Math.PI / 2}>
		<T.CircleGeometry args={[0.2, 16]} />
		<T.MeshBasicMaterial color="#000000" transparent opacity={0.25} depthWrite={false} />
	</T.Mesh>
	<Billboard position={[position.x, position.y + yOffset, position.z]}>
		<T.Mesh>
			<T.PlaneGeometry args={[0.6, 0.6]} />
			<T.MeshStandardMaterial map={texture} transparent alphaTest={0.5} side={DoubleSide} />
		</T.Mesh>
	</Billboard>
{/if}
