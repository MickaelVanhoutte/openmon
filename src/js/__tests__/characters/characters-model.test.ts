import { describe, it, expect } from 'vitest';
import { WALKING_SPEED, RUNNING_SPEED, CharacterPosition } from '../../characters/characters-model';
import { Position } from '../../mapping/positions';

describe('Speed Constants', () => {
	it('should define WALKING_SPEED as 0.33', () => {
		expect(WALKING_SPEED).toBe(0.33);
	});

	it('should define RUNNING_SPEED as 0.66', () => {
		expect(RUNNING_SPEED).toBe(0.66);
	});

	it('should have RUNNING_SPEED be double WALKING_SPEED', () => {
		expect(RUNNING_SPEED).toBe(WALKING_SPEED * 2);
	});
});

describe('CharacterPosition', () => {
	describe('constructor with defaults', () => {
		it('should default direction to down', () => {
			const pos = new CharacterPosition();
			expect(pos.direction).toBe('down');
		});

		it('should default targetDirection to down', () => {
			const pos = new CharacterPosition();
			expect(pos.targetDirection).toBe('down');
		});

		it('should default positionOnMap to (0, 0)', () => {
			const pos = new CharacterPosition();
			expect(pos.positionOnMap.x).toBe(0);
			expect(pos.positionOnMap.y).toBe(0);
		});

		it('should default positionInPx to (0, 0)', () => {
			const pos = new CharacterPosition();
			expect(pos.positionInPx.x).toBe(0);
			expect(pos.positionInPx.y).toBe(0);
		});

		it('should default targetPosition to (0, 0)', () => {
			const pos = new CharacterPosition();
			expect(pos.targetPosition.x).toBe(0);
			expect(pos.targetPosition.y).toBe(0);
		});

		it('should default targetPositionInPx to (0, 0)', () => {
			const pos = new CharacterPosition();
			expect(pos.targetPositionInPx.x).toBe(0);
			expect(pos.targetPositionInPx.y).toBe(0);
		});

		it('should default onReachTarget to undefined', () => {
			const pos = new CharacterPosition();
			expect(pos.onReachTarget).toBeUndefined();
		});
	});

	describe('constructor with custom initialPosition', () => {
		it('should set positionOnMap from initialPosition', () => {
			const pos = new CharacterPosition(new Position(5, 10));
			expect(pos.positionOnMap.x).toBe(5);
			expect(pos.positionOnMap.y).toBe(10);
		});

		it('should set targetPosition to match initialPosition', () => {
			const pos = new CharacterPosition(new Position(5, 10));
			expect(pos.targetPosition.x).toBe(5);
			expect(pos.targetPosition.y).toBe(10);
		});

		it('should compute positionInPx with default tileSize=16 and scale=2.5', () => {
			const pos = new CharacterPosition(new Position(3, 7));
			// 3 * 16 * 2.5 = 120, 7 * 16 * 2.5 = 280
			expect(pos.positionInPx.x).toBe(120);
			expect(pos.positionInPx.y).toBe(280);
		});

		it('should compute targetPositionInPx with default tileSize and scale', () => {
			const pos = new CharacterPosition(new Position(3, 7));
			expect(pos.targetPositionInPx.x).toBe(120);
			expect(pos.targetPositionInPx.y).toBe(280);
		});

		it('should use 40x multiplier with defaults (16 * 2.5)', () => {
			const pos = new CharacterPosition(new Position(1, 1));
			expect(pos.positionInPx.x).toBe(40);
			expect(pos.positionInPx.y).toBe(40);
		});
	});

	describe('constructor with custom initialDirection', () => {
		it('should set direction to the provided value', () => {
			const pos = new CharacterPosition(undefined, 'left');
			expect(pos.direction).toBe('left');
		});

		it('should set targetDirection to match the provided direction', () => {
			const pos = new CharacterPosition(undefined, 'right');
			expect(pos.targetDirection).toBe('right');
		});

		it('should accept all four cardinal directions', () => {
			const directions = ['up', 'down', 'left', 'right'] as const;
			for (const dir of directions) {
				const pos = new CharacterPosition(undefined, dir);
				expect(pos.direction).toBe(dir);
				expect(pos.targetDirection).toBe(dir);
			}
		});
	});

	describe('constructor with custom tileSize and scale', () => {
		it('should compute positionInPx with custom tileSize', () => {
			const pos = new CharacterPosition(new Position(2, 3), undefined, 32);
			// 2 * 32 * 2.5 = 160, 3 * 32 * 2.5 = 240
			expect(pos.positionInPx.x).toBe(160);
			expect(pos.positionInPx.y).toBe(240);
		});

		it('should compute positionInPx with custom scale', () => {
			const pos = new CharacterPosition(new Position(2, 3), undefined, 16, 3);
			// 2 * 16 * 3 = 96, 3 * 16 * 3 = 144
			expect(pos.positionInPx.x).toBe(96);
			expect(pos.positionInPx.y).toBe(144);
		});

		it('should compute positionInPx with both custom tileSize and scale', () => {
			const pos = new CharacterPosition(new Position(4, 5), 'up', 8, 2);
			// 4 * 8 * 2 = 64, 5 * 8 * 2 = 80
			expect(pos.positionInPx.x).toBe(64);
			expect(pos.positionInPx.y).toBe(80);
			expect(pos.direction).toBe('up');
		});
	});

	describe('constructor with both position and direction', () => {
		it('should set all properties correctly', () => {
			const pos = new CharacterPosition(new Position(10, 20), 'up');
			expect(pos.positionOnMap.x).toBe(10);
			expect(pos.positionOnMap.y).toBe(20);
			expect(pos.direction).toBe('up');
			expect(pos.targetDirection).toBe('up');
			expect(pos.positionInPx.x).toBe(400);
			expect(pos.positionInPx.y).toBe(800);
		});
	});

	describe('setPosition', () => {
		it('should update positionOnMap to the new position', () => {
			const pos = new CharacterPosition();
			const newPos = new Position(5, 8);
			pos.setPosition(newPos);
			expect(pos.positionOnMap).toBe(newPos);
		});

		it('should compute positionInPx with default tileSize and scale', () => {
			const pos = new CharacterPosition();
			pos.setPosition(new Position(4, 6));
			// 4 * 16 * 2.5 = 160, 6 * 16 * 2.5 = 240
			expect(pos.positionInPx.x).toBe(160);
			expect(pos.positionInPx.y).toBe(240);
		});

		it('should update targetPosition to match', () => {
			const pos = new CharacterPosition();
			const newPos = new Position(3, 9);
			pos.setPosition(newPos);
			expect(pos.targetPosition).toBe(newPos);
		});

		it('should compute targetPositionInPx', () => {
			const pos = new CharacterPosition();
			pos.setPosition(new Position(2, 5));
			expect(pos.targetPositionInPx.x).toBe(80);
			expect(pos.targetPositionInPx.y).toBe(200);
		});

		it('should use custom tileSize and scale when provided', () => {
			const pos = new CharacterPosition();
			pos.setPosition(new Position(3, 4), 32, 2);
			// 3 * 32 * 2 = 192, 4 * 32 * 2 = 256
			expect(pos.positionInPx.x).toBe(192);
			expect(pos.positionInPx.y).toBe(256);
			expect(pos.targetPositionInPx.x).toBe(192);
			expect(pos.targetPositionInPx.y).toBe(256);
		});

		it('should overwrite previous position values', () => {
			const pos = new CharacterPosition(new Position(1, 1));
			expect(pos.positionInPx.x).toBe(40);
			pos.setPosition(new Position(10, 10));
			expect(pos.positionInPx.x).toBe(400);
			expect(pos.positionInPx.y).toBe(400);
		});
	});

	describe('setFuturePosition', () => {
		it('should set targetPosition to the given coordinates', () => {
			const pos = new CharacterPosition();
			pos.setFuturePosition(7, 12);
			expect(pos.targetPosition.x).toBe(7);
			expect(pos.targetPosition.y).toBe(12);
		});

		it('should compute targetPositionInPx with defaults', () => {
			const pos = new CharacterPosition();
			pos.setFuturePosition(3, 5);
			// 3 * 16 * 2.5 = 120, 5 * 16 * 2.5 = 200
			expect(pos.targetPositionInPx.x).toBe(120);
			expect(pos.targetPositionInPx.y).toBe(200);
		});

		it('should not modify positionOnMap', () => {
			const pos = new CharacterPosition(new Position(1, 2));
			pos.setFuturePosition(10, 20);
			expect(pos.positionOnMap.x).toBe(1);
			expect(pos.positionOnMap.y).toBe(2);
		});

		it('should not modify positionInPx', () => {
			const pos = new CharacterPosition(new Position(1, 2));
			const originalPxX = pos.positionInPx.x;
			const originalPxY = pos.positionInPx.y;
			pos.setFuturePosition(10, 20);
			expect(pos.positionInPx.x).toBe(originalPxX);
			expect(pos.positionInPx.y).toBe(originalPxY);
		});

		it('should set onReachTarget callback', () => {
			const pos = new CharacterPosition();
			const callback = () => {};
			pos.setFuturePosition(1, 1, callback);
			expect(pos.onReachTarget).toBe(callback);
		});

		it('should leave onReachTarget undefined when no callback given', () => {
			const pos = new CharacterPosition();
			pos.setFuturePosition(1, 1);
			expect(pos.onReachTarget).toBeUndefined();
		});

		it('should use custom tileSize and scale for targetPositionInPx', () => {
			const pos = new CharacterPosition();
			pos.setFuturePosition(2, 4, undefined, 32, 3);
			// 2 * 32 * 3 = 192, 4 * 32 * 3 = 384
			expect(pos.targetPositionInPx.x).toBe(192);
			expect(pos.targetPositionInPx.y).toBe(384);
		});

		describe('same-position behavior', () => {
			it('should fire callback immediately when target equals current position', () => {
				const pos = new CharacterPosition(new Position(5, 10));
				let called = false;
				pos.setFuturePosition(5, 10, () => {
					called = true;
				});
				expect(called).toBe(true);
			});

			it('should clear onReachTarget after immediate callback fire', () => {
				const pos = new CharacterPosition(new Position(5, 10));
				pos.setFuturePosition(5, 10, () => {});
				expect(pos.onReachTarget).toBeUndefined();
			});

			it('should NOT fire callback immediately when target differs from current', () => {
				const pos = new CharacterPosition(new Position(5, 10));
				let called = false;
				pos.setFuturePosition(6, 10, () => {
					called = true;
				});
				expect(called).toBe(false);
				expect(pos.onReachTarget).toBeDefined();
			});

			it('should not throw when at same position with no callback', () => {
				const pos = new CharacterPosition(new Position(3, 3));
				expect(() => pos.setFuturePosition(3, 3)).not.toThrow();
			});
		});
	});
});
