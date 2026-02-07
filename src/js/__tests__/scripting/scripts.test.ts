import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
	StepBack,
	OpenShop,
	Dialog,
	Message,
	HealAll,
	GiveItem,
	GiveMoney,
	MoveTo,
	MoveToPlayer,
	StartBattle,
	CustomScriptable,
	Script
} from '../../scripting/scripts';
import { Position } from '../../mapping/positions';
import { BattleType } from '../../battle/battle-model';
import type { GameContext } from '../../context/gameContext';

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.clearAllTimers();
	vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// StepBack
// ---------------------------------------------------------------------------
describe('StepBack', () => {
	it('should have type StepBack', () => {
		const sb = new StepBack();
		expect(sb.type).toBe('StepBack');
		expect(sb.finished).toBe(false);
	});

	it.each([
		['up', 'down'],
		['down', 'up'],
		['left', 'right'],
		['right', 'left']
	] as const)('should reverse direction %s to %s', (initial, expected) => {
		const sb = new StepBack();
		const onEnd = vi.fn();

		const mockContext = {
			player: {
				moving: true,
				position: { direction: initial }
			}
		} as unknown as GameContext;

		sb.play(mockContext, onEnd);

		expect(mockContext.player.moving).toBe(false);
		expect(mockContext.player.position.direction).toBe(expected);
		expect(onEnd).not.toHaveBeenCalled();
		expect(sb.finished).toBe(false);
	});

	it('should call onEnd after 300ms timeout', () => {
		const sb = new StepBack();
		const onEnd = vi.fn();

		const mockContext = {
			player: {
				moving: true,
				position: { direction: 'up' }
			}
		} as unknown as GameContext;

		sb.play(mockContext, onEnd);

		vi.advanceTimersByTime(299);
		expect(onEnd).not.toHaveBeenCalled();
		expect(sb.finished).toBe(false);

		vi.advanceTimersByTime(1);
		expect(onEnd).toHaveBeenCalledOnce();
		expect(sb.finished).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// Message
// ---------------------------------------------------------------------------
describe('Message', () => {
	it('should create with text only and default speaker/options', () => {
		const msg = new Message('Hello');
		expect(msg.text).toBe('Hello');
		expect(msg.speaker).toBe('System');
		expect(msg.options).toEqual([]);
	});

	it('should create with text, speaker, and options', () => {
		const msg = new Message('Choose', 'Oak', ['Yes', 'No']);
		expect(msg.text).toBe('Choose');
		expect(msg.speaker).toBe('Oak');
		expect(msg.options).toEqual(['Yes', 'No']);
	});
});

// ---------------------------------------------------------------------------
// OpenShop
// ---------------------------------------------------------------------------
describe('OpenShop', () => {
	function createShop(items: Record<string, number>, conditionIndex = -1) {
		const shop = new OpenShop(items, conditionIndex);
		const onEnd = vi.fn();
		const mockContext = {
			player: {
				bag: {
					money: 1000,
					addItems: vi.fn()
				}
			},
			ITEMS: {}
		} as unknown as GameContext;

		shop.play(mockContext, onEnd);
		return { shop, onEnd, mockContext };
	}

	it('should have type OpenShop and store items', () => {
		const shop = new OpenShop({ '1': 100, '2': 200 });
		expect(shop.type).toBe('OpenShop');
		expect(shop.items).toEqual({ '1': 100, '2': 200 });
	});

	it('should store conditionIndex', () => {
		const shop = new OpenShop({ '1': 100 }, 2);
		expect(shop.conditionIndex).toBe(2);
	});

	it('should store context and onEnd on play()', () => {
		const { shop, mockContext } = createShop({ '1': 100 });
		expect(shop.context).toBe(mockContext);
	});

	it('buyItem should deduct money and add items when affordable', () => {
		const { shop, mockContext } = createShop({ '5': 100 });

		shop.buyItem('5', 3);

		expect(mockContext.player.bag.addItems).toHaveBeenCalledWith(5, 3, mockContext.ITEMS);
		expect(mockContext.player.bag.money).toBe(700);
	});

	it('buyItem should not purchase when insufficient money', () => {
		const { shop, mockContext } = createShop({ '5': 600 });

		shop.buyItem('5', 2); // 1200 > 1000

		expect(mockContext.player.bag.addItems).not.toHaveBeenCalled();
		expect(mockContext.player.bag.money).toBe(1000);
	});

	it('buyItem should allow purchase when money equals price exactly', () => {
		const { shop, mockContext } = createShop({ '5': 500 });

		shop.buyItem('5', 2); // 1000 === 1000

		expect(mockContext.player.bag.addItems).toHaveBeenCalledWith(5, 2, mockContext.ITEMS);
		expect(mockContext.player.bag.money).toBe(0);
	});

	it('close should set finished and call onEnd', () => {
		const { shop, onEnd } = createShop({ '1': 100 });

		expect(shop.finished).toBe(false);
		shop.close();
		expect(shop.finished).toBe(true);
		expect(onEnd).toHaveBeenCalledOnce();
	});
});

// ---------------------------------------------------------------------------
// Dialog
// ---------------------------------------------------------------------------
describe('Dialog', () => {
	function createDialog(messages: Message[], conditionIndex = -1) {
		return new Dialog(messages, conditionIndex);
	}

	it('should initialize with first message as current', () => {
		const msgs = [new Message('Hello'), new Message('World')];
		const dialog = createDialog(msgs);

		expect(dialog.type).toBe('Dialog');
		expect(dialog.current).toBe(msgs[0]);
		expect(dialog.messages).toHaveLength(2);
	});

	it('play should reset current to first message and store onEnd', () => {
		const msgs = [new Message('A'), new Message('B')];
		const dialog = createDialog(msgs);
		const onEnd = vi.fn();
		const mockContext = {} as unknown as GameContext;

		dialog.play(mockContext, onEnd);

		expect(dialog.current).toBe(msgs[0]);
	});

	it('next should advance to the next message', () => {
		const msgs = [new Message('A'), new Message('B'), new Message('C')];
		const dialog = createDialog(msgs);
		const onEnd = vi.fn();
		dialog.play({} as unknown as GameContext, onEnd);

		const second = dialog.next();
		expect(second).toBe(msgs[1]);
		expect(dialog.current).toBe(msgs[1]);
	});

	it('next on last message should finish and call onEnd', () => {
		const msgs = [new Message('Only')];
		const dialog = createDialog(msgs);
		const onEnd = vi.fn();
		dialog.play({} as unknown as GameContext, onEnd);

		const result = dialog.next();
		expect(result).toBeUndefined();
		expect(dialog.finished).toBe(true);
		expect(onEnd).toHaveBeenCalledOnce();
	});

	it('next should walk through all messages then finish', () => {
		const msgs = [new Message('A'), new Message('B'), new Message('C')];
		const dialog = createDialog(msgs);
		const onEnd = vi.fn();
		dialog.play({} as unknown as GameContext, onEnd);

		expect(dialog.next()).toBe(msgs[1]);
		expect(dialog.next()).toBe(msgs[2]);
		expect(dialog.next()).toBeUndefined();
		expect(dialog.finished).toBe(true);
		expect(onEnd).toHaveBeenCalledOnce();
	});

	it('selectOption should set selectedOption when options exist', () => {
		const msgs = [new Message('Pick', 'NPC', ['Yes', 'No'])];
		const dialog = createDialog(msgs);
		dialog.play({} as unknown as GameContext, vi.fn());

		dialog.selectOption(1);
		expect(dialog.selectedOption).toBe(1);
	});

	it('selectOption should not set when no options exist', () => {
		const msgs = [new Message('No options')];
		const dialog = createDialog(msgs);
		dialog.play({} as unknown as GameContext, vi.fn());

		dialog.selectOption(0);
		expect(dialog.selectedOption).toBe(-1);
	});

	it('should store conditionIndex', () => {
		const dialog = createDialog([new Message('Test')], 3);
		expect(dialog.conditionIndex).toBe(3);
	});
});

// ---------------------------------------------------------------------------
// HealAll
// ---------------------------------------------------------------------------
describe('HealAll', () => {
	it('should have type HealAll', () => {
		const heal = new HealAll();
		expect(heal.type).toBe('HealAll');
	});

	it('should store conditionIndex', () => {
		const heal = new HealAll(2);
		expect(heal.conditionIndex).toBe(2);
	});

	it('should call fullHeal on all monsters', () => {
		const heal = new HealAll();
		const onEnd = vi.fn();
		const monster1 = { fullHeal: vi.fn() };
		const monster2 = { fullHeal: vi.fn() };

		const mockContext = {
			player: {
				monsters: [monster1, monster2]
			}
		} as unknown as GameContext;

		heal.play(mockContext, onEnd);

		expect(monster1.fullHeal).toHaveBeenCalledOnce();
		expect(monster2.fullHeal).toHaveBeenCalledOnce();
	});

	it('should call onEnd after 2000ms timeout', () => {
		const heal = new HealAll();
		const onEnd = vi.fn();

		const mockContext = {
			player: { monsters: [] }
		} as unknown as GameContext;

		heal.play(mockContext, onEnd);

		vi.advanceTimersByTime(1999);
		expect(onEnd).not.toHaveBeenCalled();
		expect(heal.finished).toBe(false);

		vi.advanceTimersByTime(1);
		expect(onEnd).toHaveBeenCalledOnce();
		expect(heal.finished).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// GiveItem
// ---------------------------------------------------------------------------
describe('GiveItem', () => {
	it('should have type GiveItem and store itemId/qty', () => {
		const gi = new GiveItem(42, 3);
		expect(gi.type).toBe('GiveItem');
		expect(gi.itemId).toBe(42);
		expect(gi.qty).toBe(3);
	});

	it('should default qty to 1', () => {
		const gi = new GiveItem(7);
		expect(gi.qty).toBe(1);
	});

	it('should add items to bag and call onEnd after 300ms', () => {
		const gi = new GiveItem(10, 2);
		const onEnd = vi.fn();
		const addItems = vi.fn();

		const mockContext = {
			player: { bag: { addItems } },
			ITEMS: { some: 'ref' }
		} as unknown as GameContext;

		gi.play(mockContext, onEnd);

		expect(addItems).toHaveBeenCalledWith(10, 2, mockContext.ITEMS);

		vi.advanceTimersByTime(299);
		expect(onEnd).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);
		expect(onEnd).toHaveBeenCalledOnce();
		expect(gi.finished).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// GiveMoney
// ---------------------------------------------------------------------------
describe('GiveMoney', () => {
	it('should have type GiveMoney and store qty', () => {
		const gm = new GiveMoney(500);
		expect(gm.type).toBe('GiveMoney');
		expect(gm.qty).toBe(500);
	});

	it('should add money to bag and finish immediately', () => {
		const gm = new GiveMoney(250);
		const onEnd = vi.fn();

		const mockContext = {
			player: { bag: { money: 100 } }
		} as unknown as GameContext;

		gm.play(mockContext, onEnd);

		expect(mockContext.player.bag.money).toBe(350);
		expect(gm.finished).toBe(true);
		expect(onEnd).toHaveBeenCalledOnce();
	});
});

// ---------------------------------------------------------------------------
// StartBattle
// ---------------------------------------------------------------------------
describe('StartBattle', () => {
	it('should have type StartBattle and default to SINGLE', () => {
		const sb = new StartBattle(1);
		expect(sb.type).toBe('StartBattle');
		expect(sb.npcId).toBe(1);
		expect(sb.battleType).toBe(BattleType.SINGLE);
	});

	it('should call context.startBattle when NPC is found', () => {
		const sb = new StartBattle(5, BattleType.SINGLE);
		const onEnd = vi.fn();
		const npc = { id: 5 };
		const startBattle = vi.fn();

		const mockContext = {
			map: { npcs: [npc] },
			startBattle
		} as unknown as GameContext;

		sb.play(mockContext, onEnd);

		expect(startBattle).toHaveBeenCalledOnce();
		expect(startBattle.mock.calls[0][0]).toBe(npc);
		expect(startBattle.mock.calls[0][1]).toBe(BattleType.SINGLE);

		// Simulate battle end callback
		const battleEndCb = startBattle.mock.calls[0][2];
		battleEndCb();
		expect(sb.finished).toBe(true);
		expect(onEnd).toHaveBeenCalledOnce();
	});

	it('should finish immediately when NPC is not found', () => {
		const sb = new StartBattle(99);
		const onEnd = vi.fn();

		const mockContext = {
			map: { npcs: [{ id: 1 }] }
		} as unknown as GameContext;

		sb.play(mockContext, onEnd);

		expect(sb.finished).toBe(true);
		expect(onEnd).toHaveBeenCalledOnce();
	});

	it('should finish immediately when map has no npcs', () => {
		const sb = new StartBattle(1);
		const onEnd = vi.fn();

		const mockContext = {
			map: { npcs: [] }
		} as unknown as GameContext;

		sb.play(mockContext, onEnd);

		expect(sb.finished).toBe(true);
		expect(onEnd).toHaveBeenCalledOnce();
	});
});

// ---------------------------------------------------------------------------
// CustomScriptable
// ---------------------------------------------------------------------------
describe('CustomScriptable', () => {
	it('should have type CustomScriptable', () => {
		const cs = new CustomScriptable(() => {});
		expect(cs.type).toBe('CustomScriptable');
	});

	it('should execute action and finish immediately', () => {
		const action = vi.fn();
		const cs = new CustomScriptable(action);
		const onEnd = vi.fn();
		const mockContext = { some: 'context' } as unknown as GameContext;

		cs.play(mockContext, onEnd);

		expect(action).toHaveBeenCalledWith(mockContext);
		expect(cs.finished).toBe(true);
		expect(onEnd).toHaveBeenCalledOnce();
	});
});

// ---------------------------------------------------------------------------
// MoveTo
// ---------------------------------------------------------------------------
describe('MoveTo', () => {
	it('should have type MoveTo and store npcId/position', () => {
		const pos = new Position(5, 10);
		const mt = new MoveTo(3, pos);
		expect(mt.type).toBe('MoveTo');
		expect(mt.npcId).toBe(3);
		expect(mt.position).toBe(pos);
	});

	it('should finish immediately when NPC is not found', () => {
		const mt = new MoveTo(99, new Position(1, 1));
		const onEnd = vi.fn();

		const mockContext = {
			map: { npcs: [] }
		} as unknown as GameContext;

		mt.play(mockContext, onEnd);

		expect(mt.finished).toBe(true);
		expect(onEnd).toHaveBeenCalledOnce();
	});

	it('should set NPC moving and direction when move is allowed', () => {
		const targetPos = new Position(5, 3);
		const mt = new MoveTo(1, targetPos);
		const onEnd = vi.fn();
		const setFuturePosition = vi.fn();

		const npc = {
			id: 1,
			moving: false,
			direction: 'down',
			position: {
				positionOnMap: { x: 3, y: 3 },
				targetPosition: { x: 3, y: 3 },
				setFuturePosition
			}
		};

		const mockContext = {
			map: {
				npcs: [npc],
				hasBoundaryAt: vi.fn(() => false),
				npcAt: vi.fn(() => false)
			},
			player: {
				position: { positionOnMap: { x: 0, y: 0 } }
			},
			followerAt: vi.fn(() => false)
		} as unknown as GameContext;

		mt.play(mockContext, onEnd);

		expect(npc.moving).toBe(true);
		expect(npc.direction).toBe('right'); // x: 3 < 5 => right
		expect(setFuturePosition).toHaveBeenCalledWith(targetPos.x, targetPos.y, expect.any(Function));
	});

	it('should determine NPC direction correctly based on target', () => {
		const scenarios = [
			{ npcX: 5, npcY: 3, targetX: 3, targetY: 3, expected: 'left' },
			{ npcX: 3, npcY: 3, targetX: 5, targetY: 3, expected: 'right' },
			{ npcX: 3, npcY: 5, targetX: 3, targetY: 3, expected: 'up' },
			{ npcX: 3, npcY: 3, targetX: 3, targetY: 5, expected: 'down' }
		];

		for (const { npcX, npcY, targetX, targetY, expected } of scenarios) {
			const mt = new MoveTo(1, new Position(targetX, targetY));
			const setFuturePosition = vi.fn();

			const npc = {
				id: 1,
				moving: false,
				direction: 'down',
				position: {
					positionOnMap: { x: npcX, y: npcY },
					targetPosition: { x: npcX, y: npcY },
					setFuturePosition
				}
			};

			const mockContext = {
				map: {
					npcs: [npc],
					hasBoundaryAt: vi.fn(() => false),
					npcAt: vi.fn(() => false)
				},
				player: {
					position: { positionOnMap: { x: 0, y: 0 } }
				},
				followerAt: vi.fn(() => false)
			} as unknown as GameContext;

			mt.play(mockContext, vi.fn());
			expect(npc.direction).toBe(expected);
		}
	});

	it('should finish NPC movement via setFuturePosition callback', () => {
		const mt = new MoveTo(1, new Position(5, 3));
		const onEnd = vi.fn();
		const setFuturePosition = vi.fn();

		const npc = {
			id: 1,
			moving: false,
			direction: 'down',
			position: {
				positionOnMap: { x: 3, y: 3 },
				targetPosition: { x: 3, y: 3 },
				setFuturePosition
			}
		};

		const mockContext = {
			map: {
				npcs: [npc],
				hasBoundaryAt: vi.fn(() => false),
				npcAt: vi.fn(() => false)
			},
			player: {
				position: { positionOnMap: { x: 0, y: 0 } }
			},
			followerAt: vi.fn(() => false)
		} as unknown as GameContext;

		mt.play(mockContext, onEnd);

		// Invoke the callback passed to setFuturePosition
		const cb = setFuturePosition.mock.calls[0][2];
		cb();

		expect(npc.moving).toBe(false);
		expect(mt.finished).toBe(true);
		expect(onEnd).toHaveBeenCalledOnce();
	});

	it('should use waitUntilAllowed with setInterval when move is blocked', () => {
		const mt = new MoveTo(1, new Position(5, 3));
		const onEnd = vi.fn();
		const setFuturePosition = vi.fn();

		const npc = {
			id: 1,
			moving: false,
			direction: 'down',
			position: {
				positionOnMap: { x: 3, y: 3 },
				targetPosition: { x: 3, y: 3 },
				setFuturePosition
			}
		};

		// hasBoundaryAt returns true => move blocked
		const hasBoundaryAt = vi.fn(() => true);
		const checkForInSightNpc = vi.fn(() => false);

		const mockContext = {
			map: {
				npcs: [npc],
				hasBoundaryAt,
				npcAt: vi.fn(() => false)
			},
			player: {
				position: { positionOnMap: { x: 0, y: 0 } }
			},
			followerAt: vi.fn(() => false),
			checkForInSightNpc,
			playScript: vi.fn()
		} as unknown as GameContext;

		mt.play(mockContext, onEnd);

		// Move was not allowed, so setFuturePosition should not have been called
		expect(setFuturePosition).not.toHaveBeenCalled();

		// Now unblock the boundary
		hasBoundaryAt.mockReturnValue(false);

		// Advance timer to trigger the interval check (200ms interval)
		vi.advanceTimersByTime(200);

		// Now the waitUntilAllowed retry should have found it allowed
		// and set targetPosition, leading to waitMvtEnds
		expect(npc.position.targetPosition.x).toBe(5);
		expect(npc.position.targetPosition.y).toBe(3);
	});

	it('should cancel via waitUntilAllowed when canceled flag is set', () => {
		const mt = new MoveTo(1, new Position(5, 3));
		const onEnd = vi.fn();

		const npc = {
			id: 1,
			moving: false,
			direction: 'down',
			position: {
				positionOnMap: { x: 3, y: 3 },
				targetPosition: { x: 3, y: 3 },
				setFuturePosition: vi.fn()
			}
		};

		const mockContext = {
			map: {
				npcs: [npc],
				hasBoundaryAt: vi.fn(() => true),
				npcAt: vi.fn(() => false)
			},
			player: {
				position: { positionOnMap: { x: 0, y: 0 } }
			},
			followerAt: vi.fn(() => false),
			checkForInSightNpc: vi.fn(() => false),
			playScript: vi.fn()
		} as unknown as GameContext;

		mt.play(mockContext, onEnd);

		// Set canceled before interval fires
		mt.canceled = true;

		vi.advanceTimersByTime(200);

		expect(onEnd).toHaveBeenCalledOnce();
	});
});

// ---------------------------------------------------------------------------
// MoveToPlayer
// ---------------------------------------------------------------------------
describe('MoveToPlayer', () => {
	it('should have type MoveToPlayer and store npcId', () => {
		const mtp = new MoveToPlayer(7);
		expect(mtp.type).toBe('MoveToPlayer');
		expect(mtp.npcId).toBe(7);
	});

	it('should finish immediately when NPC is not found', () => {
		const mtp = new MoveToPlayer(99);
		const onEnd = vi.fn();

		const mockContext = {
			map: { npcs: [] },
			player: { position: { positionOnMap: { x: 5, y: 5 } } }
		} as unknown as GameContext;

		mtp.play(mockContext, onEnd);

		expect(mtp.finished).toBe(true);
		expect(onEnd).toHaveBeenCalledOnce();
	});

	it('should set NPC direction toward player and call setFuturePosition', () => {
		const mtp = new MoveToPlayer(1);
		const onEnd = vi.fn();
		const setFuturePosition = vi.fn();

		const npc = {
			id: 1,
			moving: false,
			direction: 'down',
			position: {
				positionOnMap: { x: 3, y: 5 },
				setFuturePosition
			}
		};

		const mockContext = {
			map: { npcs: [npc] },
			player: {
				position: { positionOnMap: { x: 7, y: 5 } }
			}
		} as unknown as GameContext;

		mtp.play(mockContext, onEnd);

		expect(npc.moving).toBe(true);
		expect(npc.direction).toBe('right'); // 3 < 7 => right
		// Should target one tile to the left of the player (x-1)
		expect(setFuturePosition).toHaveBeenCalledWith(6, 5, expect.any(Function));
	});

	it('should calculate correct adjacent position for each direction', () => {
		const scenarios = [
			// NPC above player => direction 'down', target y+1 from player
			{
				npcPos: { x: 5, y: 3 },
				playerPos: { x: 5, y: 7 },
				expectDir: 'down',
				expectX: 5,
				expectY: 6
			},
			// NPC below player => direction 'up', target y-1 from player
			{
				npcPos: { x: 5, y: 9 },
				playerPos: { x: 5, y: 5 },
				expectDir: 'up',
				expectX: 5,
				expectY: 6
			},
			// NPC left of player => direction 'right', target x-1 from player
			{
				npcPos: { x: 2, y: 5 },
				playerPos: { x: 6, y: 5 },
				expectDir: 'right',
				expectX: 5,
				expectY: 5
			},
			// NPC right of player => direction 'left', target x+1 from player
			{
				npcPos: { x: 8, y: 5 },
				playerPos: { x: 4, y: 5 },
				expectDir: 'left',
				expectX: 5,
				expectY: 5
			}
		];

		for (const { npcPos, playerPos, expectDir, expectX, expectY } of scenarios) {
			const mtp = new MoveToPlayer(1);
			const setFuturePosition = vi.fn();

			const npc = {
				id: 1,
				moving: false,
				direction: 'down',
				position: {
					positionOnMap: npcPos,
					setFuturePosition
				}
			};

			const mockContext = {
				map: { npcs: [npc] },
				player: {
					position: { positionOnMap: playerPos }
				}
			} as unknown as GameContext;

			mtp.play(mockContext, vi.fn());

			expect(npc.direction).toBe(expectDir);
			expect(setFuturePosition).toHaveBeenCalledWith(expectX, expectY, expect.any(Function));
		}
	});

	it('should finish NPC movement via setFuturePosition callback', () => {
		const mtp = new MoveToPlayer(1);
		const onEnd = vi.fn();
		const setFuturePosition = vi.fn();

		const npc = {
			id: 1,
			moving: true,
			direction: 'down',
			position: {
				positionOnMap: { x: 3, y: 5 },
				setFuturePosition
			}
		};

		const mockContext = {
			map: { npcs: [npc] },
			player: {
				position: { positionOnMap: { x: 5, y: 5 } }
			}
		} as unknown as GameContext;

		mtp.play(mockContext, onEnd);

		// Invoke the callback
		const cb = setFuturePosition.mock.calls[0][2];
		cb();

		expect(npc.moving).toBe(false);
		expect(mtp.finished).toBe(true);
		expect(onEnd).toHaveBeenCalledOnce();
	});
});

// ---------------------------------------------------------------------------
// Script (runner)
// ---------------------------------------------------------------------------
describe('Script', () => {
	it('should initialize with trigger type, actions, and stepPosition', () => {
		const pos = new Position(3, 4);
		const actions = [new GiveMoney(100)];
		const script = new Script('onInteract', actions, pos);

		expect(script.triggerType).toBe('onInteract');
		expect(script.actions).toHaveLength(1);
		expect(script.stepPosition).toBe(pos);
		expect(script.replayable).toBe(false);
		expect(script.played).toBe(false);
	});

	it('should support replayable flag', () => {
		const script = new Script('onEnter', [], undefined, true);
		expect(script.replayable).toBe(true);
	});

	it('interrupt should set canceled on current action and stop playing', () => {
		const action = new GiveMoney(100);
		const script = new Script('onInteract', [action]);

		script.currentAction = action;
		script.playing = true;

		const result = script.interrupt();

		expect(action.canceled).toBe(true);
		expect(script.playing).toBe(false);
		expect(result).toBe(script);
	});

	it('setActionsPrototype should reconstruct action instances', () => {
		const origAction = new GiveMoney(500);
		const script = new Script('onInteract', [origAction]);

		// setActionsPrototype is called in constructor, so actions should be reconstructed
		expect(script.actions[0]).toBeInstanceOf(GiveMoney);
		expect((script.actions[0] as GiveMoney).qty).toBe(500);
	});
});

// ---------------------------------------------------------------------------
// Scriptable base class
// ---------------------------------------------------------------------------
describe('Scriptable base properties', () => {
	it('should have correct defaults on subclass instances', () => {
		const scriptables = [
			new StepBack(),
			new OpenShop({}),
			new HealAll(),
			new GiveItem(1),
			new GiveMoney(0),
			new CustomScriptable(() => {})
		];

		for (const s of scriptables) {
			expect(s.finished).toBe(false);
			expect(s.canceled).toBe(false);
			expect(s.conditionIndex).toBe(-1);
			expect(s.selectedOption).toBe(-1);
		}
	});
});
