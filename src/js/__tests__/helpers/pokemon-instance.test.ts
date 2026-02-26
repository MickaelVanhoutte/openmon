import { describe, it, expect } from 'vitest';
import {
	PokemonInstance,
	PokedexEntry,
	Stats,
	Nature,
	Move,
	MoveInstance,
	Evolution,
	MoveEffect,
	PokedexSearchResult
} from '../../pokemons/pokedex';

function createEntry(overrides: Partial<PokedexEntry> = {}): PokedexEntry {
	const moves: Move[] = [
		new Move(1, 'Tackle', 'normal', 'physical', 40, 100, 35, 0, 'selected-pokemon', { id: 1 } as MoveEffect, 0, 'A basic attack', 1, 1),
		new Move(2, 'Growl', 'normal', 'no-damage', 0, 100, 40, 0, 'all-opponents', { id: 1 } as MoveEffect, 0, 'Lowers attack', 5, 1),
		new Move(3, 'Vine Whip', 'grass', 'physical', 45, 100, 25, 0, 'selected-pokemon', { id: 1 } as MoveEffect, 0, 'A grass attack', 10, 1),
		new Move(4, 'Razor Leaf', 'grass', 'physical', 55, 95, 25, 0, 'all-opponents', { id: 1 } as MoveEffect, 0, 'Razor sharp leaves', 20, 1)
	];

	return new PokedexEntry(
		overrides.id ?? 1,
		overrides.regionalId ?? 1,
		overrides.name ?? 'Bulbasaur',
		overrides.types ?? ['grass', 'poison'],
		overrides.abilities ?? ['overgrow'],
		overrides.moves ?? moves,
		overrides.stats ?? new Stats(45, 49, 49, 65, 65, 45),
		overrides.height ?? 7,
		overrides.weight ?? 69,
		overrides.description ?? 'A seed Pokemon',
		overrides.isLegendary ?? false,
		overrides.captureRate ?? 45,
		overrides.growthRateId ?? 4,
		overrides.baseXp ?? 64,
		overrides.percentageMale ?? 87.5,
		overrides.evolution ?? [new Evolution(2, 16, 'level')],
		overrides.sprites,
		overrides.viewed ?? false,
		overrides.caught ?? false
	);
}

function createInstance(level = 50, entry?: PokedexEntry): PokemonInstance {
	const e = entry ?? createEntry();
	const nature = new Nature(1, 'hardy', 'attack', 'attack');
	return new PokemonInstance(e, level, nature, false, new Stats(15, 15, 15, 15, 15, 15));
}

describe('PokemonInstance', () => {
	describe('constructor', () => {
		it('creates instance with correct id and level', () => {
			const inst = createInstance(30);
			expect(inst.id).toBe(1);
			expect(inst.level).toBe(30);
		});

		it('delegates PokedexEntry fields via getters', () => {
			const entry = createEntry({ name: 'Bulbasaur', types: ['grass', 'poison'] });
			const inst = createInstance(50, entry);
			expect(inst.name).toBe('Bulbasaur');
			expect(inst.types).toEqual(['grass', 'poison']);
			expect(inst.isLegendary).toBe(false);
			expect(inst.baseXp).toBe(64);
			expect(inst.captureRate).toBe(45);
		});

		it('computes current stats from base stats', () => {
			const inst = createInstance(50);
			expect(inst.currentStats.hp).toBeGreaterThan(0);
			expect(inst.currentStats.attack).toBeGreaterThan(0);
			expect(inst.currentHp).toBe(inst.currentStats.hp);
		});

		it('selects latest moves from entry', () => {
			const inst = createInstance(50);
			expect(inst.moves.length).toBeGreaterThan(0);
			expect(inst.moves.length).toBeLessThanOrEqual(4);
			expect(inst.moves.every((m) => m instanceof MoveInstance)).toBe(true);
		});
	});

	describe('removeHp', () => {
		it('reduces current HP', () => {
			const inst = createInstance();
			const initialHp = inst.currentHp;
			inst.removeHp(10);
			expect(inst.currentHp).toBe(initialHp - 10);
		});

		it('clamps HP to 0 and sets fainted', () => {
			const inst = createInstance();
			inst.removeHp(9999);
			expect(inst.currentHp).toBe(0);
			expect(inst.fainted).toBe(true);
		});

		it('handles NaN gracefully', () => {
			const inst = createInstance();
			inst.currentHp = NaN;
			inst.removeHp(0);
			expect(inst.currentHp).toBe(0);
			expect(inst.fainted).toBe(true);
		});
	});

	describe('heal', () => {
		it('restores HP', () => {
			const inst = createInstance();
			const maxHp = inst.currentStats.hp;
			inst.currentHp = 10;
			inst.heal(20);
			expect(inst.currentHp).toBe(30);
		});

		it('caps at max HP', () => {
			const inst = createInstance();
			const maxHp = inst.currentStats.hp;
			inst.currentHp = maxHp - 5;
			inst.heal(100);
			expect(inst.currentHp).toBe(maxHp);
		});
	});

	describe('fullHeal', () => {
		it('restores HP to max', () => {
			const inst = createInstance();
			inst.currentHp = 1;
			inst.fainted = true;
			inst.fullHeal();
			expect(inst.currentHp).toBe(inst.currentStats.hp);
			expect(inst.fainted).toBe(false);
		});
	});

	describe('revive', () => {
		it('sets fainted to false and restores given HP', () => {
			const inst = createInstance();
			inst.fainted = true;
			inst.currentHp = 0;
			inst.revive(50);
			expect(inst.fainted).toBe(false);
			expect(inst.currentHp).toBe(50);
		});
	});

	describe('setHp', () => {
		it('sets HP directly', () => {
			const inst = createInstance();
			inst.setHp(42);
			expect(inst.currentHp).toBe(42);
		});

		it('caps at max HP', () => {
			const inst = createInstance();
			inst.setHp(99999);
			expect(inst.currentHp).toBe(inst.currentStats.hp);
		});

		it('sets fainted at 0', () => {
			const inst = createInstance();
			inst.setHp(0);
			expect(inst.currentHp).toBe(0);
			expect(inst.fainted).toBe(true);
		});
	});

	describe('hasType', () => {
		it('returns true for matching type', () => {
			const inst = createInstance();
			expect(inst.hasType('grass')).toBe(true);
		});

		it('returns false for non-matching type', () => {
			const inst = createInstance();
			expect(inst.hasType('fire')).toBe(false);
		});
	});

	describe('hasItem', () => {
		it('returns true when holding matching item', () => {
			const inst = createInstance();
			inst.heldItem = { name: 'leftovers' } as any;
			expect(inst.hasItem('leftovers')).toBe(true);
		});

		it('returns false when no item', () => {
			const inst = createInstance();
			expect(inst.hasItem('leftovers')).toBe(false);
		});
	});

	describe('consumeHeldItem', () => {
		it('removes the held item', () => {
			const inst = createInstance();
			inst.heldItem = { name: 'berry' } as any;
			inst.consumeHeldItem();
			expect(inst.heldItem).toBeUndefined();
		});
	});

	describe('getSprite', () => {
		it('returns front sprite path', () => {
			const entry = createEntry({ name: 'Bulbasaur' });
			const inst = createInstance(50, entry);
			const path = inst.getSprite();
			expect(path).toContain('showdown/ani/');
			expect(path).toContain('bulbasaur');
			expect(path).toContain('.gif');
		});

		it('returns back sprite path', () => {
			const entry = createEntry({ name: 'Bulbasaur' });
			const inst = createInstance(50, entry);
			const path = inst.getSprite(true);
			expect(path).toContain('ani-back/');
		});

		it('returns shiny sprite path', () => {
			const entry = createEntry({ name: 'Bulbasaur' });
			const inst = createInstance(50, entry);
			inst.isShiny = true;
			const path = inst.getSprite();
			expect(path).toContain('ani-shiny/');
		});
	});

	describe('totalEvs', () => {
		it('sums all EV stats', () => {
			const inst = createInstance();
			inst.evs = new Stats(10, 20, 30, 40, 50, 60);
			expect(inst.totalEvs).toBe(210);
		});
	});

	describe('toJSON', () => {
		it('serializes instance fields without entry data', () => {
			const inst = createInstance(30);
			const json = inst.toJSON();
			expect(json.id).toBe(1);
			expect(json.level).toBe(30);
			expect(json.currentHp).toBeGreaterThan(0);
			expect(json.moves).toBeDefined();
			expect(json.ivs).toBeDefined();
			expect(json.evs).toBeDefined();
			expect(json.nature).toBeDefined();
			// Should not include entry data
			expect((json as any).entry).toBeUndefined();
			expect((json as any).name).toBeUndefined();
			expect((json as any).types).toBeUndefined();
		});
	});

	describe('evolve', () => {
		it('returns evolved instance with same stats', () => {
			const entry1 = createEntry({ id: 1, name: 'Bulbasaur' });
			const entry2 = createEntry({ id: 2, name: 'Ivysaur', evolution: [] });
			const inst = createInstance(16, entry1);
			const searchResult = new PokedexSearchResult(entry2);
			const evolved = inst.evolve(searchResult);
			expect(evolved.id).toBe(2);
			expect(evolved.level).toBe(16);
			expect(evolved.name).toBe('Ivysaur');
		});

		it('returns self when search result not found', () => {
			const entry = createEntry();
			const inst = createInstance(16, entry);
			const searchResult = { found: false, result: undefined } as any;
			const result = inst.evolve(searchResult);
			expect(result).toBe(inst);
		});
	});

	describe('changeBattleStats / resetBattleStats', () => {
		it('changes and resets battle stat stages', () => {
			const inst = createInstance();
			inst.changeBattleStats('attack', 2);
			expect(inst.statsChanges.attack).toBe(2);
			inst.resetBattleStats();
			expect(inst.statsChanges.attack).toBe(0);
		});
	});

	describe('battleStats', () => {
		it('computes battle stats based on stage changes', () => {
			const inst = createInstance();
			const base = inst.battleStats.attack;
			inst.changeBattleStats('attack', 2);
			const boosted = inst.battleStats.attack;
			expect(boosted).toBeGreaterThan(base);
		});
	});
});

describe('PokedexEntry', () => {
	describe('normalizedName', () => {
		it('normalizes special characters', () => {
			const entry = createEntry({ name: "Mr. Mime" });
			expect(entry.normalizedName).toBe('mrmime');
		});

		it('handles gender symbols', () => {
			// ♀ → -f, then - is stripped by the normalize chain
			const entryF = createEntry({ name: 'Nidoran♀' });
			expect(entryF.normalizedName).toBe('nidoranf');

			const entryM = createEntry({ name: 'Nidoran♂' });
			expect(entryM.normalizedName).toBe('nidoranm');
		});
	});

	describe('weaknesses', () => {
		it('returns weaknesses for single-type pokemon', () => {
			const entry = createEntry({ types: ['fire'] });
			expect(entry.weaknesses).toContain('water');
			expect(entry.weaknesses).toContain('rock');
		});

		it('returns weaknesses for dual-type pokemon', () => {
			const entry = createEntry({ types: ['grass', 'poison'] });
			const weaknesses = entry.weaknesses;
			expect(weaknesses.length).toBeGreaterThan(0);
		});
	});

	describe('instanciate', () => {
		it('creates a PokemonInstance with the given level', () => {
			const entry = createEntry();
			const inst = entry.instanciate(25);
			expect(inst).toBeInstanceOf(PokemonInstance);
			expect(inst.level).toBe(25);
			expect(inst.id).toBe(entry.id);
		});

		it('uses minimum IVs when specified', () => {
			const entry = createEntry();
			const inst = entry.instanciate(50, 20);
			expect(inst.ivs.hp).toBeGreaterThanOrEqual(20);
			expect(inst.ivs.attack).toBeGreaterThanOrEqual(20);
		});

		it('forces shiny when requested', () => {
			const entry = createEntry();
			const inst = entry.instanciate(50, 0, true);
			expect(inst.isShiny).toBe(true);
		});
	});

	describe('getSprite', () => {
		it('returns the sprite path', () => {
			const entry = createEntry({ name: 'Pikachu' });
			expect(entry.getSprite()).toBe('src/assets/monsters/showdown/ani/pikachu.gif');
		});
	});
});

describe('MoveInstance', () => {
	it('initializes currentPp from pp', () => {
		const mi = new MoveInstance(1, 'Tackle', 'normal', 'physical', 40, 100, 35, 0, 'selected-pokemon', { id: 1 } as MoveEffect, 0, '', 1);
		expect(mi.currentPp).toBe(35);
	});

	it('serializes to JSON with only id and currentPp', () => {
		const mi = new MoveInstance(1, 'Tackle', 'normal', 'physical', 40, 100, 35, 0, 'selected-pokemon', { id: 1 } as MoveEffect, 0, '', 1);
		mi.currentPp = 20;
		const json = mi.toJSON();
		expect(json).toEqual({ id: 1, currentPp: 20 });
	});
});

describe('Stats', () => {
	it('initializes with defaults of 0', () => {
		const s = new Stats();
		expect(s.hp).toBe(0);
		expect(s.attack).toBe(0);
		expect(s.speed).toBe(0);
	});

	it('computes total', () => {
		const s = new Stats(100, 50, 50, 80, 80, 90);
		expect(s.total).toBe(450);
	});
});
