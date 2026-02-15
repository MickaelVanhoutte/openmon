export type LightingMood = 'day' | 'dawn' | 'dusk' | 'night' | 'night-glow';

export interface LightingConfig {
	directionalColor: number;
	directionalIntensity: number;
	directionalPosition: [number, number, number];
	ambientColor: number;
	ambientIntensity: number;
	hemisphereGroundColor: number;
	hemisphereSkyColor: number;
	hemisphereIntensity: number;
	playerLightColor: number;
	playerLightIntensity: number;
	playerLightDistance: number;
}

export const LIGHTING_PRESETS: Record<LightingMood, LightingConfig> = {
	dawn: {
		directionalColor: 0xffa07a,
		directionalIntensity: 0.8,
		directionalPosition: [8, 12, 8],
		ambientColor: 0xffffff,
		ambientIntensity: 0.25,
		hemisphereGroundColor: 0x362907,
		hemisphereSkyColor: 0xffd4a0,
		hemisphereIntensity: 0.3,
		playerLightColor: 0xffaa44,
		playerLightIntensity: 1.5,
		playerLightDistance: 8
	},
	day: {
		directionalColor: 0xffffff,
		directionalIntensity: 1.2,
		directionalPosition: [8, 12, 8],
		ambientColor: 0xffffff,
		ambientIntensity: 0.3,
		hemisphereGroundColor: 0x362907,
		hemisphereSkyColor: 0x87ceeb,
		hemisphereIntensity: 0.3,
		playerLightColor: 0xffaa44,
		playerLightIntensity: 0.3,
		playerLightDistance: 8
	},
	dusk: {
		directionalColor: 0xff6347,
		directionalIntensity: 0.7,
		directionalPosition: [8, 12, 8],
		ambientColor: 0xffffff,
		ambientIntensity: 0.2,
		hemisphereGroundColor: 0x1a0a00,
		hemisphereSkyColor: 0xff8c69,
		hemisphereIntensity: 0.25,
		playerLightColor: 0xffaa44,
		playerLightIntensity: 5.0,
		playerLightDistance: 8
	},
	night: {
		directionalColor: 0x4169e1,
		directionalIntensity: 0.5,
		directionalPosition: [8, 12, 8],
		ambientColor: 0xffffff,
		ambientIntensity: 0.1,
		hemisphereGroundColor: 0x0a0a1a,
		hemisphereSkyColor: 0x191970,
		hemisphereIntensity: 0.15,
		playerLightColor: 0xffaa44,
		playerLightIntensity: 45.0,
		playerLightDistance: 8
	},
	'night-glow': {
		directionalColor: 0x4169e1,
		directionalIntensity: 0.4,
		directionalPosition: [8, 12, 8],
		ambientColor: 0xff4500,
		ambientIntensity: 0.3,
		hemisphereGroundColor: 0x8b2500,
		hemisphereSkyColor: 0x1a0500,
		hemisphereIntensity: 0.2,
		playerLightColor: 0xff6622,
		playerLightIntensity: 30.0,
		playerLightDistance: 10
	}
};

export const BIOME_TO_MOOD: Record<string, LightingMood> = {
	'Grass Forest': 'day',
	'Cave Rock': 'dusk',
	'Water Swamp': 'dawn',
	'Fire Volcanic': 'night-glow',
	'Dark Haunted': 'night'
};

export function getLightingMood(biomeName?: string): LightingMood {
	if (!biomeName) {
		return 'day';
	}
	return BIOME_TO_MOOD[biomeName] ?? 'day';
}
