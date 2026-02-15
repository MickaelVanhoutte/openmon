import { describe, it, expect } from 'vitest';

describe('GameContext Utility Functions (Characterization)', () => {
	describe('isOutsideQuestBounds', () => {
		const isOutsideQuestBounds = (
			futurePosition: { x: number; y: number },
			area: { start: { x: number; y: number }; end: { x: number; y: number } }
		): boolean => {
			return (
				futurePosition.x < area.start.x ||
				futurePosition.x > area.end.x ||
				futurePosition.y < area.start.y ||
				futurePosition.y > area.end.y
			);
		};

		const questArea = { start: { x: 10, y: 10 }, end: { x: 20, y: 20 } };

		it('should return false when position is inside bounds', () => {
			expect(isOutsideQuestBounds({ x: 15, y: 15 }, questArea)).toBe(false);
			expect(isOutsideQuestBounds({ x: 10, y: 10 }, questArea)).toBe(false);
			expect(isOutsideQuestBounds({ x: 20, y: 20 }, questArea)).toBe(false);
		});

		it('should return true when x is below start', () => {
			expect(isOutsideQuestBounds({ x: 9, y: 15 }, questArea)).toBe(true);
		});

		it('should return true when x is above end', () => {
			expect(isOutsideQuestBounds({ x: 21, y: 15 }, questArea)).toBe(true);
		});

		it('should return true when y is below start', () => {
			expect(isOutsideQuestBounds({ x: 15, y: 9 }, questArea)).toBe(true);
		});

		it('should return true when y is above end', () => {
			expect(isOutsideQuestBounds({ x: 15, y: 21 }, questArea)).toBe(true);
		});
	});

	describe('hasQuestLimit', () => {
		const hasQuestLimit = (
			currentQuest:
				| { area?: { start: { x: number; y: number }; end: { x: number; y: number } } }
				| undefined,
			futurePosition: { x: number; y: number }
		): boolean => {
			if (!currentQuest || !currentQuest.area) {
				return false;
			}
			const area = currentQuest.area;
			return (
				futurePosition.x < area.start.x ||
				futurePosition.x > area.end.x ||
				futurePosition.y < area.start.y ||
				futurePosition.y > area.end.y
			);
		};

		it('should return false when no current quest', () => {
			expect(hasQuestLimit(undefined, { x: 15, y: 15 })).toBe(false);
		});

		it('should return false when quest has no area', () => {
			expect(hasQuestLimit({}, { x: 15, y: 15 })).toBe(false);
		});

		it('should return true when position is outside quest area', () => {
			const quest = { area: { start: { x: 10, y: 10 }, end: { x: 20, y: 20 } } };
			expect(hasQuestLimit(quest, { x: 25, y: 15 })).toBe(true);
		});

		it('should return false when position is inside quest area', () => {
			const quest = { area: { start: { x: 10, y: 10 }, end: { x: 20, y: 20 } } };
			expect(hasQuestLimit(quest, { x: 15, y: 15 })).toBe(false);
		});
	});

	describe('behindPlayerPosition', () => {
		const behindPlayerPosition = (
			playerPosition: { x: number; y: number },
			direction: 'up' | 'down' | 'left' | 'right'
		): { x: number; y: number } => {
			switch (direction) {
				case 'up':
					return { x: playerPosition.x, y: playerPosition.y + 1 };
				case 'down':
					return { x: playerPosition.x, y: playerPosition.y - 1 };
				case 'left':
					return { x: playerPosition.x + 1, y: playerPosition.y };
				case 'right':
					return { x: playerPosition.x - 1, y: playerPosition.y };
			}
		};

		it('should return position below when facing up', () => {
			expect(behindPlayerPosition({ x: 10, y: 10 }, 'up')).toEqual({ x: 10, y: 11 });
		});

		it('should return position above when facing down', () => {
			expect(behindPlayerPosition({ x: 10, y: 10 }, 'down')).toEqual({ x: 10, y: 9 });
		});

		it('should return position to right when facing left', () => {
			expect(behindPlayerPosition({ x: 10, y: 10 }, 'left')).toEqual({ x: 11, y: 10 });
		});

		it('should return position to left when facing right', () => {
			expect(behindPlayerPosition({ x: 10, y: 10 }, 'right')).toEqual({ x: 9, y: 10 });
		});
	});

	describe('followerAt', () => {
		const followerAt = (
			position: { x: number; y: number },
			behindPosition: { x: number; y: number } | undefined
		): boolean => {
			if (!behindPosition) {
				return false;
			}
			return behindPosition.x === position.x && behindPosition.y === position.y;
		};

		it('should return true when position matches behind position', () => {
			expect(followerAt({ x: 10, y: 11 }, { x: 10, y: 11 })).toBe(true);
		});

		it('should return false when position does not match', () => {
			expect(followerAt({ x: 10, y: 12 }, { x: 10, y: 11 })).toBe(false);
		});

		it('should return false when behind position is undefined', () => {
			expect(followerAt({ x: 10, y: 11 }, undefined)).toBe(false);
		});
	});

	describe('isMenuAvailable', () => {
		type MenuType = 'POKEMON_LIST' | 'BOX' | 'POKEDEX' | 'TRAINER' | 'BAG';

		const isMenuAvailable = (
			menuKey: MenuType,
			questStates: { id: number; objectives: { completed: boolean }[] }[]
		): boolean => {
			const quest0 = questStates.find((q) => q.id === 0);
			if (!quest0) {
				return false;
			}

			switch (menuKey) {
				case 'POKEMON_LIST':
				case 'BOX':
					return quest0.objectives[0]?.completed || false;
				case 'POKEDEX':
					return quest0.objectives[1]?.completed || false;
				case 'TRAINER':
					return quest0.objectives[2]?.completed || false;
				case 'BAG':
					return quest0.objectives[3]?.completed || false;
				default:
					return false;
			}
		};

		const noProgress = [
			{
				id: 0,
				objectives: [
					{ completed: false },
					{ completed: false },
					{ completed: false },
					{ completed: false }
				]
			}
		];
		const fullProgress = [
			{
				id: 0,
				objectives: [
					{ completed: true },
					{ completed: true },
					{ completed: true },
					{ completed: true }
				]
			}
		];

		it('should return false for all menus when no objectives completed', () => {
			expect(isMenuAvailable('POKEMON_LIST', noProgress)).toBe(false);
			expect(isMenuAvailable('BOX', noProgress)).toBe(false);
			expect(isMenuAvailable('POKEDEX', noProgress)).toBe(false);
			expect(isMenuAvailable('TRAINER', noProgress)).toBe(false);
			expect(isMenuAvailable('BAG', noProgress)).toBe(false);
		});

		it('should return true for all menus when all objectives completed', () => {
			expect(isMenuAvailable('POKEMON_LIST', fullProgress)).toBe(true);
			expect(isMenuAvailable('BOX', fullProgress)).toBe(true);
			expect(isMenuAvailable('POKEDEX', fullProgress)).toBe(true);
			expect(isMenuAvailable('TRAINER', fullProgress)).toBe(true);
			expect(isMenuAvailable('BAG', fullProgress)).toBe(true);
		});

		it('should return false when no quest state exists', () => {
			expect(isMenuAvailable('POKEMON_LIST', [])).toBe(false);
		});

		it('should map POKEMON_LIST and BOX to objective 0', () => {
			const partialProgress = [
				{
					id: 0,
					objectives: [
						{ completed: true },
						{ completed: false },
						{ completed: false },
						{ completed: false }
					]
				}
			];
			expect(isMenuAvailable('POKEMON_LIST', partialProgress)).toBe(true);
			expect(isMenuAvailable('BOX', partialProgress)).toBe(true);
			expect(isMenuAvailable('POKEDEX', partialProgress)).toBe(false);
		});
	});

	describe('haveInSight (NPC line of sight)', () => {
		const getPositionsInFront = (
			npcPosition: { x: number; y: number },
			direction: 'up' | 'down' | 'left' | 'right'
		): { x: number; y: number }[] => {
			switch (direction) {
				case 'down':
					return [
						{ x: npcPosition.x, y: npcPosition.y + 1 },
						{ x: npcPosition.x, y: npcPosition.y + 2 },
						{ x: npcPosition.x, y: npcPosition.y + 3 }
					];
				case 'up':
					return [
						{ x: npcPosition.x, y: npcPosition.y - 1 },
						{ x: npcPosition.x, y: npcPosition.y - 2 },
						{ x: npcPosition.x, y: npcPosition.y - 3 }
					];
				case 'left':
					return [
						{ x: npcPosition.x - 1, y: npcPosition.y },
						{ x: npcPosition.x - 2, y: npcPosition.y },
						{ x: npcPosition.x - 3, y: npcPosition.y }
					];
				case 'right':
					return [
						{ x: npcPosition.x + 1, y: npcPosition.y },
						{ x: npcPosition.x + 2, y: npcPosition.y },
						{ x: npcPosition.x + 3, y: npcPosition.y }
					];
			}
		};

		const haveInSight = (
			npcPosition: { x: number; y: number },
			npcDirection: 'up' | 'down' | 'left' | 'right',
			playerPosition: { x: number; y: number },
			wallPositions: Set<string> = new Set()
		): boolean => {
			const positionsInFront = getPositionsInFront(npcPosition, npcDirection);
			for (const pos of positionsInFront) {
				if (wallPositions.has(`${pos.x},${pos.y}`)) {
					return false;
				}
				if (pos.x === playerPosition.x && pos.y === playerPosition.y) {
					return true;
				}
			}
			return false;
		};

		it('should detect player 1 tile in front (down)', () => {
			expect(haveInSight({ x: 10, y: 10 }, 'down', { x: 10, y: 11 })).toBe(true);
		});

		it('should detect player 3 tiles in front (down)', () => {
			expect(haveInSight({ x: 10, y: 10 }, 'down', { x: 10, y: 13 })).toBe(true);
		});

		it('should not detect player 4 tiles in front (down)', () => {
			expect(haveInSight({ x: 10, y: 10 }, 'down', { x: 10, y: 14 })).toBe(false);
		});

		it('should not detect player to the side', () => {
			expect(haveInSight({ x: 10, y: 10 }, 'down', { x: 11, y: 11 })).toBe(false);
		});

		it('should detect player in front when facing up', () => {
			expect(haveInSight({ x: 10, y: 10 }, 'up', { x: 10, y: 8 })).toBe(true);
		});

		it('should detect player in front when facing left', () => {
			expect(haveInSight({ x: 10, y: 10 }, 'left', { x: 8, y: 10 })).toBe(true);
		});

		it('should detect player in front when facing right', () => {
			expect(haveInSight({ x: 10, y: 10 }, 'right', { x: 12, y: 10 })).toBe(true);
		});

		it('should not detect player when wall is between NPC and player', () => {
			const walls = new Set(['11,10']);
			expect(haveInSight({ x: 10, y: 10 }, 'right', { x: 12, y: 10 }, walls)).toBe(false);
		});

		it('should detect player when no wall between them', () => {
			const walls = new Set(['13,10']);
			expect(haveInSight({ x: 10, y: 10 }, 'right', { x: 12, y: 10 }, walls)).toBe(true);
		});

		it('should not detect player on a wall tile', () => {
			const walls = new Set(['10,13']);
			expect(haveInSight({ x: 10, y: 10 }, 'down', { x: 10, y: 13 }, walls)).toBe(false);
		});

		it('should stop at first wall and not see past it', () => {
			const walls = new Set(['10,11']);
			expect(haveInSight({ x: 10, y: 10 }, 'down', { x: 10, y: 12 }, walls)).toBe(false);
			expect(haveInSight({ x: 10, y: 10 }, 'down', { x: 10, y: 13 }, walls)).toBe(false);
		});

		it('should detect player before a wall', () => {
			const walls = new Set(['10,12']);
			expect(haveInSight({ x: 10, y: 10 }, 'down', { x: 10, y: 11 }, walls)).toBe(true);
		});
	});

	describe('followerInFront Logic', () => {
		const getPositionInFront = (
			playerPosition: { x: number; y: number },
			direction: 'up' | 'down' | 'left' | 'right'
		): { x: number; y: number } => {
			switch (direction) {
				case 'up':
					return { x: playerPosition.x, y: playerPosition.y - 1 };
				case 'down':
					return { x: playerPosition.x, y: playerPosition.y + 1 };
				case 'left':
					return { x: playerPosition.x - 1, y: playerPosition.y };
				case 'right':
					return { x: playerPosition.x + 1, y: playerPosition.y };
			}
		};

		const followerInFront = (
			playerPosition: { x: number; y: number },
			direction: 'up' | 'down' | 'left' | 'right',
			followerPosition: { x: number; y: number } | undefined
		): boolean => {
			if (!followerPosition) {
				return false;
			}
			const frontPos = getPositionInFront(playerPosition, direction);
			return frontPos.x === followerPosition.x && frontPos.y === followerPosition.y;
		};

		it('should return true when follower is in front', () => {
			expect(followerInFront({ x: 10, y: 10 }, 'down', { x: 10, y: 11 })).toBe(true);
		});

		it('should return false when follower is not in front', () => {
			expect(followerInFront({ x: 10, y: 10 }, 'down', { x: 10, y: 9 })).toBe(false);
		});

		it('should return false when no follower', () => {
			expect(followerInFront({ x: 10, y: 10 }, 'down', undefined)).toBe(false);
		});
	});
});
