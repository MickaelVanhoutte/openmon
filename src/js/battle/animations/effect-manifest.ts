import impactUrl from '../../../assets/battle/fx/impact-sprite.png';
import fireUrl from '../../../assets/battle/fx/fire-sprite.png';
import thunderUrl from '../../../assets/battle/fx/thunder-sprite.png';
import slashUrl from '../../../assets/battle/fx/slash-sprite.png';
import waterUrl from '../../../assets/battle/fx/water-sprite.png';
import iceUrl from '../../../assets/battle/fx/ice-sprite.png';
import fistUrl from '../../../assets/battle/fx/fist-sprite.png';
import footUrl from '../../../assets/battle/fx/foot-sprite.png';
import clawsUrl from '../../../assets/battle/fx/claws-sprite.png';
import crunchUrl from '../../../assets/battle/fx/crunch-sprite.png';
import healUrl from '../../../assets/battle/fx/heal-sprite.png';
import buffUrl from '../../../assets/battle/fx/buff-sprite.png';
import debuffUrl from '../../../assets/battle/fx/debuff-sprite.png';
import rockUrl from '../../../assets/battle/fx/rock-sprite.png';
import leafUrl from '../../../assets/battle/fx/leaf-sprite.png';
import poisonUrl from '../../../assets/battle/fx/poison-sprite.png';
import windUrl from '../../../assets/battle/fx/wind-sprite.png';
import shadowballUrl from '../../../assets/battle/fx/shadowball-sprite.png';
import lightballUrl from '../../../assets/battle/fx/lightball-sprite.png';
import drainUrl from '../../../assets/battle/fx/drain-sprite.png';

export interface EffectDefinition {
	path: string;
	frames: number;
	frameWidth: number;
	frameHeight: number;
	fps?: number;
}

export const EFFECT_MANIFEST: Record<string, EffectDefinition> = {
	impact: {
		path: impactUrl,
		frames: 4,
		frameWidth: 192,
		frameHeight: 192
	},
	fire: {
		path: fireUrl,
		frames: 8,
		frameWidth: 192,
		frameHeight: 192
	},
	thunder: {
		path: thunderUrl,
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	slash: {
		path: slashUrl,
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	water: {
		path: waterUrl,
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	ice: {
		path: iceUrl,
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	fist: {
		path: fistUrl,
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	foot: {
		path: footUrl,
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	claws: {
		path: clawsUrl,
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	crunch: {
		path: crunchUrl,
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	heal: {
		path: healUrl,
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	buff: {
		path: buffUrl,
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	debuff: {
		path: debuffUrl,
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	psychic: {
		path: debuffUrl,
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	rock: {
		path: rockUrl,
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	leaf: {
		path: leafUrl,
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	poison: {
		path: poisonUrl,
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	wind: {
		path: windUrl,
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	shadowball: {
		path: shadowballUrl,
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	lightball: {
		path: lightballUrl,
		frames: 8,
		frameWidth: 192,
		frameHeight: 192
	},
	drain: {
		path: drainUrl,
		frames: 8,
		frameWidth: 192,
		frameHeight: 192
	}
};

export function getEffectDefinition(effectName: string): EffectDefinition | undefined {
	return EFFECT_MANIFEST[effectName];
}
