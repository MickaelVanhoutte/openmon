<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Room, RoomExit } from '../../js/roguelike/types';
	import { EncounterType, RoomTheme } from '../../js/roguelike/types';

	interface Props {
		room: Room;
		onEncounterTrigger: () => void;
		onExitSelect: (exitIndex: number) => void;
		roomCleared: boolean;
	}

	let { room, onEncounterTrigger, onExitSelect, roomCleared }: Props = $props();

	const TILE_SIZE = 32;
	const PLAYER_SPEED = 4;

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let animationFrame: number;

	let playerX = $state((room.width * TILE_SIZE) / 2);
	let playerY = $state((room.height - 2) * TILE_SIZE);
	let playerDirection = $state<'up' | 'down' | 'left' | 'right'>('up');

	let encounterTriggered = $state(false);
	let keysHeld = $state({ up: false, down: false, left: false, right: false });

	const collisionSet = new Set(room.collisionIndices);

	const THEME_COLORS: Record<RoomTheme, { floor: string; wall: string; accent: string }> = {
		[RoomTheme.FOREST]: { floor: '#3d5c3d', wall: '#2d4a2d', accent: '#5a8a5a' },
		[RoomTheme.CAVE]: { floor: '#4a4a5a', wall: '#2a2a3a', accent: '#6a6a7a' },
		[RoomTheme.BEACH]: { floor: '#c2a878', wall: '#8b7355', accent: '#e8d5b0' },
		[RoomTheme.RUINS]: { floor: '#5a5a6a', wall: '#3a3a4a', accent: '#7a7a8a' }
	};

	const ENCOUNTER_ICONS: Record<EncounterType, string> = {
		[EncounterType.WILD_BATTLE]: '🌿',
		[EncounterType.TRAINER_BATTLE]: '⚔️',
		[EncounterType.CATCH_EVENT]: '🎯',
		[EncounterType.SHOP]: '🛒',
		[EncounterType.HEAL]: '💚',
		[EncounterType.BOSS]: '👑',
		[EncounterType.TREASURE]: '📦'
	};

	function getExitPositions(): { exit: RoomExit; x: number; y: number; index: number }[] {
		return room.exits.map((exit, index) => {
			let x: number, y: number;
			switch (exit.direction) {
				case 'north':
					x = room.width / 2;
					y = 0;
					break;
				case 'south':
					x = room.width / 2;
					y = room.height - 1;
					break;
				case 'east':
					x = room.width - 1;
					y = room.height / 2;
					break;
				case 'west':
					x = 0;
					y = room.height / 2;
					break;
			}
			return { exit, x: x * TILE_SIZE, y: y * TILE_SIZE, index };
		});
	}

	function hasCollision(px: number, py: number): boolean {
		const tileX = Math.floor(px / TILE_SIZE);
		const tileY = Math.floor(py / TILE_SIZE);

		if (tileX < 0 || tileX >= room.width || tileY < 0 || tileY >= room.height) {
			return true;
		}

		const index = tileY * room.width + tileX;
		return collisionSet.has(index);
	}

	function checkEncounterZone(): boolean {
		const centerX = (room.width / 2) * TILE_SIZE;
		const centerY = (room.height / 2) * TILE_SIZE;
		const distance = Math.sqrt((playerX - centerX) ** 2 + (playerY - centerY) ** 2);
		return distance < TILE_SIZE * 2;
	}

	function checkExitZone(): number | null {
		if (!roomCleared) return null;

		for (const { x, y, index } of getExitPositions()) {
			const distance = Math.sqrt((playerX - x) ** 2 + (playerY - y) ** 2);
			if (distance < TILE_SIZE) {
				return index;
			}
		}
		return null;
	}

	function update() {
		let newX = playerX;
		let newY = playerY;

		if (keysHeld.up) {
			newY -= PLAYER_SPEED;
			playerDirection = 'up';
		}
		if (keysHeld.down) {
			newY += PLAYER_SPEED;
			playerDirection = 'down';
		}
		if (keysHeld.left) {
			newX -= PLAYER_SPEED;
			playerDirection = 'left';
		}
		if (keysHeld.right) {
			newX += PLAYER_SPEED;
			playerDirection = 'right';
		}

		const playerLeft = newX - TILE_SIZE / 4;
		const playerRight = newX + TILE_SIZE / 4;
		const playerTop = newY - TILE_SIZE / 4;
		const playerBottom = newY + TILE_SIZE / 4;

		const blocked =
			hasCollision(playerLeft, playerTop) ||
			hasCollision(playerRight, playerTop) ||
			hasCollision(playerLeft, playerBottom) ||
			hasCollision(playerRight, playerBottom);

		if (!blocked) {
			playerX = newX;
			playerY = newY;
		}

		if (!encounterTriggered && !roomCleared && checkEncounterZone()) {
			encounterTriggered = true;
			onEncounterTrigger();
		}

		const exitIndex = checkExitZone();
		if (exitIndex !== null) {
			onExitSelect(exitIndex);
		}
	}

	function draw() {
		if (!ctx) return;

		const colors = THEME_COLORS[room.theme];

		ctx.fillStyle = colors.floor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = colors.wall;
		for (const index of room.collisionIndices) {
			const x = (index % room.width) * TILE_SIZE;
			const y = Math.floor(index / room.width) * TILE_SIZE;
			ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
		}

		if (!roomCleared) {
			const centerX = (room.width / 2) * TILE_SIZE;
			const centerY = (room.height / 2) * TILE_SIZE;

			ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
			ctx.beginPath();
			ctx.arc(centerX, centerY, TILE_SIZE * 2, 0, Math.PI * 2);
			ctx.fill();

			ctx.font = '32px Arial';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(ENCOUNTER_ICONS[room.encounter.type], centerX, centerY);
		}

		if (roomCleared) {
			ctx.fillStyle = colors.accent;
			for (const { exit, x, y } of getExitPositions()) {
				ctx.fillRect(x - TILE_SIZE / 2, y - TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);

				ctx.font = '16px Arial';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillStyle = '#fff';
				ctx.fillText('🚪', x, y);
			}
		}

		ctx.fillStyle = '#ff6b6b';
		ctx.beginPath();
		ctx.arc(playerX, playerY, TILE_SIZE / 3, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = '#fff';
		ctx.beginPath();
		const eyeOffset = TILE_SIZE / 6;
		let eyeX = playerX,
			eyeY = playerY;
		switch (playerDirection) {
			case 'up':
				eyeY -= eyeOffset;
				break;
			case 'down':
				eyeY += eyeOffset;
				break;
			case 'left':
				eyeX -= eyeOffset;
				break;
			case 'right':
				eyeX += eyeOffset;
				break;
		}
		ctx.arc(eyeX, eyeY, 4, 0, Math.PI * 2);
		ctx.fill();
	}

	function gameLoop() {
		update();
		draw();
		animationFrame = requestAnimationFrame(gameLoop);
	}

	function handleKeyDown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowUp':
			case 'w':
				keysHeld.up = true;
				e.preventDefault();
				break;
			case 'ArrowDown':
			case 's':
				keysHeld.down = true;
				e.preventDefault();
				break;
			case 'ArrowLeft':
			case 'a':
				keysHeld.left = true;
				e.preventDefault();
				break;
			case 'ArrowRight':
			case 'd':
				keysHeld.right = true;
				e.preventDefault();
				break;
		}
	}

	function handleKeyUp(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowUp':
			case 'w':
				keysHeld.up = false;
				break;
			case 'ArrowDown':
			case 's':
				keysHeld.down = false;
				break;
			case 'ArrowLeft':
			case 'a':
				keysHeld.left = false;
				break;
			case 'ArrowRight':
			case 'd':
				keysHeld.right = false;
				break;
		}
	}

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		gameLoop();
	});

	onDestroy(() => {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
		}
		window.removeEventListener('keydown', handleKeyDown);
		window.removeEventListener('keyup', handleKeyUp);
	});
</script>

<div class="room-container">
	<div class="room-info">
		<span class="theme">{room.theme}</span>
		<span class="floor">Floor {room.floor}</span>
		{#if roomCleared}
			<span class="cleared">✓ CLEARED</span>
		{/if}
	</div>

	<canvas
		bind:this={canvas}
		width={room.width * TILE_SIZE}
		height={room.height * TILE_SIZE}
		class="room-canvas"
	></canvas>

	<div class="controls-hint">
		<span>Arrow Keys / WASD to move</span>
		{#if !roomCleared}
			<span>Walk to center to trigger encounter</span>
		{:else}
			<span>Walk to a door to proceed</span>
		{/if}
	</div>
</div>

<style>
	.room-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
	}

	.room-info {
		display: flex;
		gap: 1.5rem;
		font-size: 1.2rem;
		color: #fff;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.room-info .theme {
		color: #7aa2f7;
	}

	.room-info .cleared {
		color: #9ece6a;
		font-weight: bold;
	}

	.room-canvas {
		border: 4px solid #3d59a1;
		border-radius: 8px;
		box-shadow: 0 0 20px rgba(122, 162, 247, 0.3);
	}

	.controls-hint {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		color: #565f89;
		font-size: 0.9rem;
	}
</style>
