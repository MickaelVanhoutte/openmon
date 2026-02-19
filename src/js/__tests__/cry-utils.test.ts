import { describe, it, expect } from 'vitest';
import { normalizePokemonNameForCry, getCryPath } from '../pokemons/cry-utils';

describe('normalizePokemonNameForCry', () => {
	it('lowercases simple names', () => {
		expect(normalizePokemonNameForCry('Pikachu')).toBe('pikachu');
	});

	it('lowercases Bulbasaur', () => {
		expect(normalizePokemonNameForCry('Bulbasaur')).toBe('bulbasaur');
	});

	it('handles Mr. Mime', () => {
		expect(normalizePokemonNameForCry('Mr. Mime')).toBe('mrmime');
	});

	it('handles Nidoran female', () => {
		expect(normalizePokemonNameForCry('Nidoran♀')).toBe('nidoranf');
	});

	it('handles Nidoran male', () => {
		expect(normalizePokemonNameForCry('Nidoran♂')).toBe('nidoranm');
	});

	it("handles Farfetch'd", () => {
		expect(normalizePokemonNameForCry("Farfetch'd")).toBe('farfetchd');
	});

	it('handles Ho-Oh', () => {
		expect(normalizePokemonNameForCry('Ho-Oh')).toBe('hooh');
	});

	it('handles Porygon-Z', () => {
		expect(normalizePokemonNameForCry('Porygon-Z')).toBe('porygonz');
	});

	it('handles Mega Charizard X', () => {
		expect(normalizePokemonNameForCry('Mega Charizard X')).toBe('charizardmegax');
	});

	it('handles Mega Charizard Y', () => {
		expect(normalizePokemonNameForCry('Mega Charizard Y')).toBe('charizardmegay');
	});

	it('handles Mega without variant', () => {
		expect(normalizePokemonNameForCry('Mega Mewtwo')).toBe('mewtwomega');
	});

	it('handles Alolan Vulpix', () => {
		expect(normalizePokemonNameForCry('Alolan Vulpix')).toBe('vulpixalola');
	});

	it('handles Galarian Ponyta', () => {
		expect(normalizePokemonNameForCry('Galarian Ponyta')).toBe('ponytagalar');
	});

	it('handles Type: Null', () => {
		expect(normalizePokemonNameForCry('Type: Null')).toBe('typenull');
	});

	it('strips hyphens from regular hyphenated names', () => {
		expect(normalizePokemonNameForCry('Kommo-o')).toBe('kommoo');
	});
});

describe('getCryPath', () => {
	it('returns correct path for Pikachu', () => {
		expect(getCryPath('Pikachu')).toBe('src/assets/audio/cries/pikachu.mp3');
	});

	it('returns correct path for Mr. Mime', () => {
		expect(getCryPath('Mr. Mime')).toBe('src/assets/audio/cries/mrmime.mp3');
	});
});
