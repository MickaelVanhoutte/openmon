export interface EffectDefinition {
	path: string;
	frames: number;
	frameWidth: number;
	frameHeight: number;
	fps?: number;
}

export const EFFECT_MANIFEST: Record<string, EffectDefinition> = {
	impact: {
		path: '/assets/battle/fx/impact-sprite.png',
		frames: 4,
		frameWidth: 192,
		frameHeight: 192
	},
	fire: {
		path: '/assets/battle/fx/fire-sprite.png',
		frames: 8,
		frameWidth: 192,
		frameHeight: 192
	},
	thunder: {
		path: '/assets/battle/fx/thunder-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	slash: {
		path: '/assets/battle/fx/slash-sprite.png',
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	water: {
		path: '/assets/battle/fx/water-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	ice: {
		path: '/assets/battle/fx/ice-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	fist: {
		path: '/assets/battle/fx/fist-sprite.png',
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	foot: {
		path: '/assets/battle/fx/foot-sprite.png',
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	claws: {
		path: '/assets/battle/fx/claws-sprite.png',
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	crunch: {
		path: '/assets/battle/fx/crunch-sprite.png',
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	heal: {
		path: '/assets/battle/fx/heal-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	buff: {
		path: '/assets/battle/fx/buff-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	debuff: {
		path: '/assets/battle/fx/debuff-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	psychic: {
		path: '/assets/battle/fx/psychic-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	rock: {
		path: '/assets/battle/fx/rock-sprite.png',
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	leaf: {
		path: '/assets/battle/fx/leaf-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	poison: {
		path: '/assets/battle/fx/poison-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	wind: {
		path: '/assets/battle/fx/wind-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	}
};

export function getEffectDefinition(effectName: string): EffectDefinition | undefined {
	return EFFECT_MANIFEST[effectName];
}
