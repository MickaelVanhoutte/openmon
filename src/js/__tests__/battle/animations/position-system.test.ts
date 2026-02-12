import { describe, it, expect, beforeEach } from 'vitest';
import { BattlePositionSystem, type Position } from '$js/battle/animations/position-system';

describe('BattlePositionSystem', () => {
	let positionSystem: BattlePositionSystem;

	beforeEach(() => {
		positionSystem = new BattlePositionSystem();
		positionSystem.setContainerBounds(800, 600);
	});

	describe('getSlotPosition', () => {
		it('should return player position in single battle', () => {
			positionSystem.setLayout('SINGLE');
			const pos = positionSystem.getSlotPosition({ side: 'player', index: 0 });

			expect(pos.x).toBe(22);
			expect(pos.y).toBe(80);
			expect(pos.z).toBe(0);
			expect(pos.scale).toBe(1.0);
		});

		it('should return opponent position in single battle', () => {
			positionSystem.setLayout('SINGLE');
			const pos = positionSystem.getSlotPosition({ side: 'opponent', index: 0 });

			expect(pos.x).toBe(75);
			expect(pos.y).toBe(37);
			expect(pos.z).toBe(200);
			expect(pos.scale).toBe(0.85);
		});

		it('should return all 4 positions in double battle', () => {
			positionSystem.setLayout('DOUBLE');

			const player0 = positionSystem.getSlotPosition({ side: 'player', index: 0 });
			const player1 = positionSystem.getSlotPosition({ side: 'player', index: 1 });
			const opponent0 = positionSystem.getSlotPosition({ side: 'opponent', index: 0 });
			const opponent1 = positionSystem.getSlotPosition({ side: 'opponent', index: 1 });

			expect(player0.x).toBe(22);
			expect(player1.x).toBe(35);
			expect(opponent0.x).toBe(60);
			expect(opponent1.x).toBe(92);
		});

		it('should return fallback position for invalid slot', () => {
			positionSystem.setLayout('SINGLE');
			const pos = positionSystem.getSlotPosition({ side: 'player', index: 5 });

			expect(pos.x).toBe(50);
			expect(pos.y).toBe(50);
		});
	});

	describe('toScreenCoords', () => {
		it('should convert percentage position to pixel coords', () => {
			const pos: Position = { x: 50, y: 50, z: 0, scale: 1, opacity: 1 };
			const coords = positionSystem.toScreenCoords(pos, 96);

			expect(coords.left).toBe(400 - 48);
			expect(coords.top).toBe(300 - 48);
			expect(coords.width).toBe(96);
			expect(coords.height).toBe(96);
		});

		it('should apply scale to sprite size', () => {
			const pos: Position = { x: 50, y: 50, z: 0, scale: 0.5, opacity: 1 };
			const coords = positionSystem.toScreenCoords(pos, 96);

			expect(coords.width).toBe(48);
			expect(coords.height).toBe(48);
		});

		it('should preserve opacity', () => {
			const pos: Position = { x: 50, y: 50, z: 0, scale: 1, opacity: 0.7 };
			const coords = positionSystem.toScreenCoords(pos, 96);

			expect(coords.opacity).toBe(0.7);
		});
	});

	describe('lerp', () => {
		it('should return start position at t=0', () => {
			const from: Position = { x: 0, y: 0, z: 0, scale: 1, opacity: 1 };
			const to: Position = { x: 100, y: 100, z: 200, scale: 0.5, opacity: 0 };

			const result = positionSystem.lerp(from, to, 0);

			expect(result.x).toBe(0);
			expect(result.y).toBe(0);
			expect(result.z).toBe(0);
		});

		it('should return end position at t=1', () => {
			const from: Position = { x: 0, y: 0, z: 0, scale: 1, opacity: 1 };
			const to: Position = { x: 100, y: 100, z: 200, scale: 0.5, opacity: 0 };

			const result = positionSystem.lerp(from, to, 1);

			expect(result.x).toBe(100);
			expect(result.y).toBe(100);
			expect(result.z).toBe(200);
		});

		it('should return midpoint at t=0.5', () => {
			const from: Position = { x: 0, y: 0, z: 0, scale: 1, opacity: 1 };
			const to: Position = { x: 100, y: 100, z: 200, scale: 0.5, opacity: 0 };

			const result = positionSystem.lerp(from, to, 0.5);

			expect(result.x).toBe(50);
			expect(result.y).toBe(50);
			expect(result.z).toBe(100);
			expect(result.scale).toBe(0.75);
			expect(result.opacity).toBe(0.5);
		});

		it('should clamp t to valid range', () => {
			const from: Position = { x: 0, y: 0, z: 0, scale: 1, opacity: 1 };
			const to: Position = { x: 100, y: 100, z: 200, scale: 0.5, opacity: 0 };

			const resultNegative = positionSystem.lerp(from, to, -1);
			const resultOver = positionSystem.lerp(from, to, 2);

			expect(resultNegative.x).toBe(0);
			expect(resultOver.x).toBe(100);
		});
	});

	describe('behind', () => {
		it('should increase z by positive distance', () => {
			const pos: Position = { x: 50, y: 50, z: 100, scale: 1, opacity: 1 };
			const result = positionSystem.behind(pos, 30);

			expect(result.z).toBe(130);
			expect(result.x).toBe(50);
			expect(result.y).toBe(50);
		});

		it('should decrease z by negative distance (in front)', () => {
			const pos: Position = { x: 50, y: 50, z: 100, scale: 1, opacity: 1 };
			const result = positionSystem.behind(pos, -30);

			expect(result.z).toBe(70);
		});
	});

	describe('above', () => {
		it('should decrease y by positive distance', () => {
			const pos: Position = { x: 50, y: 50, z: 100, scale: 1, opacity: 1 };
			const result = positionSystem.above(pos, 10);

			expect(result.y).toBe(40);
			expect(result.x).toBe(50);
			expect(result.z).toBe(100);
		});
	});
});
