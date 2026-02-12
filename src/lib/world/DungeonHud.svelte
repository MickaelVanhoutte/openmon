<script lang="ts">
	import { onMount } from 'svelte';
	import { dungeonContext } from '$js/dungeon/dungeon-context';
	import { getThrelteMap } from '$js/mapping/threlte-maps/threlte-map-registry';
	import { TileType3D, TILE_COLORS } from '$js/mapping/threlte-maps/types';
	import type { GameContext } from '$js/context/gameContext';

	interface Props {
		context: GameContext;
	}

	let { context }: Props = $props();

	let canvas: HTMLCanvasElement | undefined = $state(undefined);
	let ctx: CanvasRenderingContext2D | null = null;
	let frameId: number;

	let currentFloor = $derived($dungeonContext?.currentFloor);
	let currentBiome = $derived($dungeonContext?.currentBiome);
	let floorType = $derived($dungeonContext?.getCurrentFloorType());
	let isDungeonMode = $derived($dungeonContext?.isDungeonMode);

	function numberToHex(color: number): string {
		return '#' + color.toString(16).padStart(6, '0');
	}

	function getTileColor(tileType: TileType3D): string {
		const defaultColor = TILE_COLORS.get(tileType) ?? 0x000000;
		const override = currentBiome?.tileColorOverrides?.[tileType];
		return numberToHex(override ?? defaultColor);
	}

	function drawMinimap() {
		if (!canvas || !ctx || !isDungeonMode || !currentFloor) return;

		const mapId = 1000 + currentFloor;
		const mapData = getThrelteMap(mapId);

		if (!mapData) return;

		const { width, height, tiles } = mapData;
		const scale = Math.floor(100 / Math.max(width, height));
		const offsetX = (100 - width * scale) / 2;
		const offsetY = (100 - height * scale) / 2;

		// Clear canvas
		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.fillRect(0, 0, 100, 100);

		// Draw tiles
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const tile = tiles[y][x];
				if (tile !== TileType3D.WALL) {
					// Don't draw walls to keep it clean, or maybe draw them dark?
					// Actually, let's draw everything based on type
					ctx.fillStyle = getTileColor(tile);
					ctx.fillRect(offsetX + x * scale, offsetY + y * scale, scale, scale);
				} else {
					ctx.fillStyle = getTileColor(TileType3D.WALL);
					ctx.fillRect(offsetX + x * scale, offsetY + y * scale, scale, scale);
				}
			}
		}

		// Draw player
		if (context.player?.position?.positionOnMap) {
			const { x, y } = context.player.position.positionOnMap;
			ctx.fillStyle = 'red';
			ctx.beginPath();
			ctx.arc(
				offsetX + x * scale + scale / 2,
				offsetY + y * scale + scale / 2,
				scale / 2,
				0,
				Math.PI * 2
			);
			ctx.fill();
		}
	}

	function loop() {
		if (isDungeonMode) {
			drawMinimap();
			frameId = requestAnimationFrame(loop);
		}
	}

	$effect(() => {
		if (isDungeonMode && canvas) {
			ctx = canvas.getContext('2d');
			loop();
		}
		return () => {
			if (frameId) cancelAnimationFrame(frameId);
		};
	});
</script>

{#if isDungeonMode}
	<div class="dungeon-hud">
		<div class="info">
			<span class="floor">Floor {currentFloor}</span>
			<span class="biome">{currentBiome?.name}</span>
			<span class="type {floorType}">{floorType?.toUpperCase()}</span>
		</div>
		<canvas bind:this={canvas} width="100" height="100"></canvas>
	</div>
{/if}

<style lang="scss">
	.dungeon-hud {
		position: absolute;
		top: 10px;
		right: 10px;
		z-index: 100;
		background-color: rgba(0, 0, 0, 0.7);
		padding: 8px;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		pointer-events: none; // Let clicks pass through
		border: 1px solid rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(4px);

		.info {
			display: flex;
			flex-direction: column;
			align-items: center;
			width: 100%;
			gap: 2px;

			span {
				color: white;
				font-family: monospace;
				font-size: 12px;
				text-shadow: 1px 1px 0 #000;
				line-height: 1.2;

				&.floor {
					font-weight: bold;
					font-size: 14px;
					color: #ffd700;
				}

				&.biome {
					color: #aaa;
					font-size: 10px;
				}

				&.type {
					font-weight: bold;
					padding: 2px 6px;
					border-radius: 4px;
					margin-top: 2px;
					font-size: 10px;

					&.normal {
						background-color: rgba(255, 255, 255, 0.2);
					}
					&.boss {
						background-color: rgba(255, 0, 0, 0.5);
						color: #fff;
					}
					&.rest {
						background-color: rgba(0, 255, 0, 0.3);
						color: #fff;
					}
				}
			}
		}

		canvas {
			border: 1px solid rgba(255, 255, 255, 0.3);
			background-color: rgba(0, 0, 0, 0.5);
			border-radius: 4px;
			image-rendering: pixelated; // Keep pixels sharp
		}
	}
</style>
