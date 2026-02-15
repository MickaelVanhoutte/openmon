import { describe, it, expect } from 'vitest';
import {
	getLightingMood,
	LIGHTING_PRESETS,
	BIOME_TO_MOOD,
	type LightingMood,
	type LightingConfig
} from '../../lighting/biome-lighting';

const ALL_MOODS: LightingMood[] = ['day', 'dawn', 'dusk', 'night', 'night-glow'];

const LIGHTING_CONFIG_KEYS: (keyof LightingConfig)[] = [
	'directionalColor',
	'directionalIntensity',
	'directionalPosition',
	'ambientColor',
	'ambientIntensity',
	'hemisphereGroundColor',
	'hemisphereSkyColor',
	'hemisphereIntensity',
	'playerLightColor',
	'playerLightIntensity',
	'playerLightDistance'
];

describe('getLightingMood', () => {
	it('returns correct mood for each biome', () => {
		expect(getLightingMood('Grass Forest')).toBe('day');
		expect(getLightingMood('Cave Rock')).toBe('dusk');
		expect(getLightingMood('Water Swamp')).toBe('dawn');
		expect(getLightingMood('Fire Volcanic')).toBe('night-glow');
		expect(getLightingMood('Dark Haunted')).toBe('night');
	});

	it('returns day for undefined biome', () => {
		expect(getLightingMood(undefined)).toBe('day');
	});

	it('returns day for unknown biome name', () => {
		expect(getLightingMood('Unknown Biome')).toBe('day');
		expect(getLightingMood('')).toBe('day');
	});
});

describe('BIOME_TO_MOOD', () => {
	it('all entries map to valid LightingMood values', () => {
		for (const [biome, mood] of Object.entries(BIOME_TO_MOOD)) {
			expect(ALL_MOODS).toContain(mood);
			expect(biome.length).toBeGreaterThan(0);
		}
	});

	it('all moods in mapping have corresponding LIGHTING_PRESETS entries', () => {
		const usedMoods = new Set(Object.values(BIOME_TO_MOOD));
		for (const mood of usedMoods) {
			expect(LIGHTING_PRESETS).toHaveProperty(mood);
		}
	});
});

describe('LIGHTING_PRESETS', () => {
	it('has entries for all moods', () => {
		for (const mood of ALL_MOODS) {
			expect(LIGHTING_PRESETS).toHaveProperty(mood);
		}
	});

	it('every preset has all required fields', () => {
		for (const mood of ALL_MOODS) {
			const preset = LIGHTING_PRESETS[mood];
			for (const key of LIGHTING_CONFIG_KEYS) {
				expect(preset).toHaveProperty(key);
			}
		}
	});

	it('directionalPosition is a 3-element tuple for every preset', () => {
		for (const mood of ALL_MOODS) {
			const pos = LIGHTING_PRESETS[mood].directionalPosition;
			expect(pos).toHaveLength(3);
			pos.forEach((v) => expect(typeof v).toBe('number'));
		}
	});

	it('intensity values are positive numbers', () => {
		for (const mood of ALL_MOODS) {
			const p = LIGHTING_PRESETS[mood];
			expect(p.directionalIntensity).toBeGreaterThan(0);
			expect(p.ambientIntensity).toBeGreaterThan(0);
			expect(p.hemisphereIntensity).toBeGreaterThan(0);
			expect(p.playerLightIntensity).toBeGreaterThan(0);
			expect(p.playerLightDistance).toBeGreaterThan(0);
		}
	});
});

describe('night-glow preset', () => {
	it('has warm ambient color distinct from regular night', () => {
		const nightGlow = LIGHTING_PRESETS['night-glow'];
		const night = LIGHTING_PRESETS['night'];

		expect(nightGlow.ambientColor).not.toBe(night.ambientColor);
	});

	it('has warm-toned ambient (red/orange channel dominant)', () => {
		const nightGlow = LIGHTING_PRESETS['night-glow'];
		const red = (nightGlow.ambientColor >> 16) & 0xff;
		const green = (nightGlow.ambientColor >> 8) & 0xff;
		const blue = nightGlow.ambientColor & 0xff;

		expect(red).toBeGreaterThan(green);
		expect(red).toBeGreaterThan(blue);
	});

	it('has warmer hemisphere ground color than regular night', () => {
		const nightGlow = LIGHTING_PRESETS['night-glow'];
		const night = LIGHTING_PRESETS['night'];

		const ngRed = (nightGlow.hemisphereGroundColor >> 16) & 0xff;
		const nRed = (night.hemisphereGroundColor >> 16) & 0xff;

		expect(ngRed).toBeGreaterThan(nRed);
	});

	it('has orange-tinted player light', () => {
		const nightGlow = LIGHTING_PRESETS['night-glow'];
		const day = LIGHTING_PRESETS['day'];

		expect(nightGlow.playerLightColor).not.toBe(day.playerLightColor);
	});
});
