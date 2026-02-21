<script lang="ts">
	import { TileType3D, TILE_WALKABLE } from '$js/mapping/threlte-maps/types';
	import type { ExplorationTracker } from '$js/dungeon/exploration-tracker';

	interface Props {
		tiles: TileType3D[][];
		width: number;
		height: number;
		playerX: number;
		playerY: number;
		explorationTracker: ExplorationTracker;
		floorNumber: number;
		biomeName: string;
		floorType: 'normal' | 'boss' | 'rest';
		tileColorOverrides?: Partial<Record<TileType3D, number>>;
		stairsX?: number;
		stairsY?: number;
		visible?: boolean;
		money?: number;
	}

	const {
		tiles,
		width,
		height,
		playerX,
		playerY,
		explorationTracker,
		floorNumber,
		biomeName,
		floorType,
		tileColorOverrides,
		stairsX,
		stairsY,
		visible = true,
		money = 0
	}: Props = $props();

	const CANVAS_SIZE = 220;
	const PLAYER_COLOR = '#ffffff';
	const STAIRS_COLOR = 'rgba(255, 255, 255, 0.5)';
	const DIMMED_ALPHA = 0.3;
	const WALL_COLOR = '#3a3a3a';
	const FLOOR_COLOR = '#c8b89a';

	let canvas: HTMLCanvasElement | undefined = $state(undefined);

	const tileSize = $derived(Math.min(CANVAS_SIZE / width, CANVAS_SIZE / height));
	const offsetX = $derived((CANVAS_SIZE - width * tileSize) / 2);
	const offsetY = $derived((CANVAS_SIZE - height * tileSize) / 2);

	function getTileColor(tileType: TileType3D): string {
		const isWalkable = TILE_WALKABLE.get(tileType) ?? false;
		return isWalkable ? FLOOR_COLOR : WALL_COLOR;
	}

	function drawMinimap(ctx: CanvasRenderingContext2D): void {
		// Clear and fill with semi-transparent black background
		ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
		ctx.fillStyle = 'rgba(0, 0, 0, 0)';
		ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

		// First pass: draw dimmed (visited but not visible) tiles
		ctx.globalAlpha = DIMMED_ALPHA;
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				if (
					!explorationTracker.isVisible(x, y, playerX, playerY) &&
					explorationTracker.isVisited(x, y)
				) {
					const tile = tiles[y][x];
					ctx.fillStyle = getTileColor(tile);
					ctx.fillRect(offsetX + x * tileSize, offsetY + y * tileSize, tileSize, tileSize);
				}
			}
		}

		// Second pass: draw fully visible tiles
		ctx.globalAlpha = 1.0;
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				if (explorationTracker.isVisible(x, y, playerX, playerY)) {
					const tile = tiles[y][x];
					ctx.fillStyle = getTileColor(tile);
					ctx.fillRect(offsetX + x * tileSize, offsetY + y * tileSize, tileSize, tileSize);
				}
			}
		}

		// Draw stairs when visible or visited
		if (stairsX !== undefined && stairsY !== undefined) {
			const stairsVisible = explorationTracker.isVisible(stairsX, stairsY, playerX, playerY);
			const stairsVisited = explorationTracker.isVisited(stairsX, stairsY);

			if (stairsVisible || stairsVisited) {
				ctx.globalAlpha = stairsVisible ? 1.0 : DIMMED_ALPHA;
				ctx.fillStyle = STAIRS_COLOR;
				const stairsCenterX = offsetX + stairsX * tileSize + tileSize / 2;
				const stairsCenterY = offsetY + stairsY * tileSize + tileSize / 2;
				const stairsRadius = Math.max(tileSize * 0.6, 2);
				ctx.beginPath();
				ctx.arc(stairsCenterX, stairsCenterY, stairsRadius, 0, Math.PI * 2);
				ctx.fill();
				ctx.globalAlpha = 1.0;
			}
		}

		// Draw player dot (always visible)
		ctx.fillStyle = PLAYER_COLOR;
		const playerCenterX = offsetX + playerX * tileSize + tileSize / 2;
		const playerCenterY = offsetY + playerY * tileSize + tileSize / 2;
		const playerRadius = Math.max(tileSize * 0.7, 2.5);
		ctx.beginPath();
		ctx.arc(playerCenterX, playerCenterY, playerRadius, 0, Math.PI * 2);
		ctx.fill();

		// Draw floor number in top-left corner
		ctx.fillStyle = '#ffffff';
		ctx.font = '10px monospace';
		ctx.textAlign = 'right';
		ctx.textBaseline = 'top';
		ctx.fillText(`F${floorNumber}`, 24, 4);
	}

	$effect(() => {
		if (!canvas || !visible) {
			return;
		}

		const dpr = window.devicePixelRatio || 1;
		canvas.width = CANVAS_SIZE * dpr;
		canvas.height = CANVAS_SIZE * dpr;

		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}

		ctx.scale(dpr, dpr);

		let animId: number;
		let lastPlayerX = -1;
		let lastPlayerY = -1;

		function draw(): void {
			if (!ctx) {
				return;
			}
			// Only redraw when player position changes
			if (playerX !== lastPlayerX || playerY !== lastPlayerY) {
				lastPlayerX = playerX;
				lastPlayerY = playerY;
				drawMinimap(ctx);
			}
			animId = requestAnimationFrame(draw);
		}

		animId = requestAnimationFrame(draw);

		return () => {
			cancelAnimationFrame(animId);
		};
	});
</script>

{#if visible}
	<div class="dungeon-minimap">
		<canvas bind:this={canvas} style="width: {CANVAS_SIZE}px; height: {CANVAS_SIZE}px;"></canvas>
		<div class="money-display">{money}$</div>
	</div>
{/if}

<style lang="scss">
	.dungeon-minimap {
		position: absolute;
		top: 4px;
		left: 4px;
		z-index: 5;
		opacity: 0.5;
		//border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 4px;
		background: transparent;
		pointer-events: none;
		transition: opacity 0.3s ease;

		canvas {
			display: block;
			image-rendering: pixelated;
			border-radius: 4px;
		}

		.money-display {
			margin-top: 4px;
			color: #ffd700;
			font-family: monospace;
			font-size: 11px;
			text-align: center;
			text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.9);
			pointer-events: none;
		}
	}
</style>
