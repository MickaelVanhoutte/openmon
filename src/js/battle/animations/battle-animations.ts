import { gsap } from 'gsap';
import type { Move } from '../../pokemons/pokedex';

type AnimationType = 'dash' | 'toTarget' | 'onTarget' | 'fromTarget' | 'self' | 'beam' | 'throw';

interface MoveAnimationConfig {
	type: AnimationType;
	sprite: string;
	frames: number;
	size?: number;
	scale?: number;
	repeat?: number;
	chain?: MoveAnimationConfig[];
}

const MOVE_ANIMATIONS: Record<string, MoveAnimationConfig> = {
	// Kicks
	stomp: { type: 'dash', sprite: 'foot-sprite', frames: 5 },
	'low-kick': { type: 'dash', sprite: 'foot-sprite', frames: 5 },
	'double-kick': { type: 'dash', sprite: 'foot-sprite', frames: 5 },
	'jump-kick': { type: 'dash', sprite: 'foot-sprite', frames: 5 },
	'mega-kick': { type: 'dash', sprite: 'foot-sprite', frames: 5 },
	'rolling-kick': { type: 'dash', sprite: 'foot-sprite', frames: 5 },
	'high-jump-kick': { type: 'dash', sprite: 'foot-sprite', frames: 5 },
	'triple-kick': { type: 'dash', sprite: 'foot-sprite', frames: 5 },
	'blaze-kick': { type: 'dash', sprite: 'foot-sprite', frames: 5 },
	'low-sweep': { type: 'dash', sprite: 'foot-sprite', frames: 5 },
	'darkest-lariat': { type: 'dash', sprite: 'foot-sprite', frames: 5 },
	'triple-axel': { type: 'dash', sprite: 'foot-sprite', frames: 5 },
	'thunderous-kick': { type: 'dash', sprite: 'foot-sprite', frames: 5 },
	'axe-kick': { type: 'dash', sprite: 'foot-sprite', frames: 5 },

	// Punches
	'comet-punch': { type: 'dash', sprite: 'fist-sprite', frames: 5 },
	'mega-punch': { type: 'dash', sprite: 'fist-sprite', frames: 5 },
	'fire-punch': { type: 'dash', sprite: 'fist-sprite', frames: 5 },
	'ice-punch': { type: 'dash', sprite: 'fist-sprite', frames: 5 },
	'thunder-punch': { type: 'dash', sprite: 'fist-sprite', frames: 5 },
	'dizzy-punch': { type: 'dash', sprite: 'fist-sprite', frames: 5 },
	'mach-punch': { type: 'dash', sprite: 'fist-sprite', frames: 5 },
	'dynamic-punch': { type: 'dash', sprite: 'fist-sprite', frames: 5 },
	'focus-punch': { type: 'dash', sprite: 'fist-sprite', frames: 5 },
	'bullet-punch': { type: 'dash', sprite: 'fist-sprite', frames: 5 },
	'shadow-punch': { type: 'dash', sprite: 'fist-sprite', frames: 5 },
	'sky-uppercut': { type: 'dash', sprite: 'fist-sprite', frames: 5 },
	'close-combat': { type: 'dash', sprite: 'fist-sprite', frames: 5 },
	'sucker-punch': { type: 'dash', sprite: 'fist-sprite', frames: 5 },
	'poison-jab': { type: 'dash', sprite: 'fist-sprite', frames: 5 },
	'power-up-punch': { type: 'dash', sprite: 'fist-sprite', frames: 5 },
	'plasma-fists': { type: 'dash', sprite: 'fist-sprite', frames: 5 },
	'force-palm': { type: 'dash', sprite: 'fist-sprite', frames: 5 },

	// Chops
	'karate-chop': { type: 'dash', sprite: 'chop-sprite', frames: 4 },
	'cross-chop': { type: 'dash', sprite: 'chop-sprite', frames: 4 },
	'rock-smash': { type: 'dash', sprite: 'chop-sprite', frames: 4 },
	'brick-break': { type: 'dash', sprite: 'chop-sprite', frames: 4 },
	'knock-off': { type: 'dash', sprite: 'chop-sprite', frames: 4 },
	'arm-thrust': { type: 'dash', sprite: 'chop-sprite', frames: 4 },
	'dual-chop': { type: 'dash', sprite: 'chop-sprite', frames: 4 },
	'throat-chop': { type: 'dash', sprite: 'chop-sprite', frames: 4 },
	'rage-fist': { type: 'dash', sprite: 'chop-sprite', frames: 4 },

	// Impact/Tackle moves
	pound: { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	tackle: { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	slam: { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	trash: { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	rage: { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	strength: { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'body-slam': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'heavy-slam': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'take-down': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	headbutt: { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'double-edge': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'quick-attack': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'extreme-speed': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	return: { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	facade: { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'poison-tail': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'aqua-tail': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'iron-tail': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'dragon-tail': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'volt-tackle': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'wood-hammer': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'hammer-arm': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'ice-hammer': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'dragon-rush': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'giga-impact': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'power-whip': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'dragon-hammer': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'brutal-swing': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'smack-down': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'flame-charge': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	acrobatics: { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'final-gambit': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	struggle: { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'struggle-bug': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'wild-charge': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'horn-attack': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'horn-drill': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'tail-slap': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'play-rough': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'body-press': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	revenge: { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	covet: { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'wing-attack': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	outrage: { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'bolt-strike': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'fusion-bolt': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'aura-wheel': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'pay-day': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	bide: { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'skull-bash': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'zen-headbutt': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	rollout: { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'head-smash': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'iron-head': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'aqua-jet': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	superpower: { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'steel-wing': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'beat-up': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'power-trip': { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'flare-blitz': { type: 'dash', sprite: 'impact-sprite', frames: 4 },

	// Double hit
	'double-slap': { type: 'dash', sprite: 'impact-sprite', frames: 4, repeat: 2 },
	'double-hit': { type: 'dash', sprite: 'impact-sprite', frames: 4, repeat: 2 },

	// Slashes
	scratch: { type: 'dash', sprite: 'slash-sprite', frames: 5 },
	cut: { type: 'dash', sprite: 'slash-sprite', frames: 5 },
	slash: { type: 'dash', sprite: 'slash-sprite', frames: 5 },
	'false-swipe': { type: 'dash', sprite: 'slash-sprite', frames: 5 },
	'fury-cutter': { type: 'dash', sprite: 'slash-sprite', frames: 5 },
	'night-slash': { type: 'dash', sprite: 'slash-sprite', frames: 5 },
	'x-scissor': { type: 'dash', sprite: 'slash-sprite', frames: 5 },
	'vice-grip': { type: 'dash', sprite: 'slash-sprite', frames: 5 },
	guillotine: { type: 'dash', sprite: 'slash-sprite', frames: 5 },
	'cross-poison': { type: 'dash', sprite: 'slash-sprite', frames: 5 },
	'psycho-cut': { type: 'dash', sprite: 'slash-sprite', frames: 5 },
	'fury-swipes': { type: 'dash', sprite: 'slash-sprite', frames: 5, repeat: 2 },

	// Claws
	'metal-claw': { type: 'dash', sprite: 'claws-sprite', frames: 8 },
	'shadow-claw': { type: 'dash', sprite: 'claws-sprite', frames: 8 },
	'dragon-claw': { type: 'dash', sprite: 'claws-sprite', frames: 8 },
	'crush-claw': { type: 'dash', sprite: 'claws-sprite', frames: 8 },
	'hone-claws': { type: 'dash', sprite: 'claws-sprite', frames: 8 },

	// Bites
	bite: { type: 'dash', sprite: 'crunch-sprite', frames: 6, scale: 0.6, repeat: 2 },
	crunch: { type: 'dash', sprite: 'crunch-sprite', frames: 6, scale: 0.6, repeat: 2 },
	'fire-fang': { type: 'dash', sprite: 'crunch-sprite', frames: 6, scale: 0.6, repeat: 2 },
	'ice-fang': { type: 'dash', sprite: 'crunch-sprite', frames: 6, scale: 0.6, repeat: 2 },
	'thunder-fang': { type: 'dash', sprite: 'crunch-sprite', frames: 6, scale: 0.6, repeat: 2 },
	'poison-fang': { type: 'dash', sprite: 'crunch-sprite', frames: 6, scale: 0.6, repeat: 2 },
	'bug-bite': { type: 'dash', sprite: 'crunch-sprite', frames: 6, scale: 0.6, repeat: 2 },
	'psychic-fang': { type: 'dash', sprite: 'crunch-sprite', frames: 6, scale: 0.6, repeat: 2 },
	'hyper-fang': { type: 'dash', sprite: 'crunch-sprite', frames: 6, scale: 0.6, repeat: 2 },
	'super-fang': { type: 'dash', sprite: 'crunch-sprite', frames: 6, scale: 0.6, repeat: 2 },

	// Electric - on target
	'thunder-shock': { type: 'onTarget', sprite: 'thunder-sprite', frames: 6 },
	thunderbolt: { type: 'onTarget', sprite: 'thunder-sprite', frames: 6 },
	thunder: { type: 'onTarget', sprite: 'thunder-sprite', frames: 6 },
	'electro-web': { type: 'onTarget', sprite: 'thunder-sprite', frames: 6 },
	nuzzle: { type: 'onTarget', sprite: 'thunder-sprite', frames: 6 },
	overdrive: { type: 'onTarget', sprite: 'thunder-sprite', frames: 6 },

	// Electric - projectile
	spark: { type: 'toTarget', sprite: 'thunderball-sprite', frames: 6 },
	'zap-cannon': { type: 'toTarget', sprite: 'thunderball-sprite', frames: 6 },
	'shock-wave': { type: 'toTarget', sprite: 'thunderball-sprite', frames: 6 },
	discharge: { type: 'toTarget', sprite: 'thunderball-sprite', frames: 6 },
	'charge-beam': { type: 'toTarget', sprite: 'thunderball-sprite', frames: 6 },
	'electro-ball': { type: 'toTarget', sprite: 'thunderball-sprite', frames: 6 },
	electrify: { type: 'toTarget', sprite: 'thunderball-sprite', frames: 6 },
	'eerie-impulse': { type: 'toTarget', sprite: 'thunderball-sprite', frames: 6 },
	'bolt-beak': { type: 'toTarget', sprite: 'thunderball-sprite', frames: 6 },

	// Fire
	ember: { type: 'toTarget', sprite: 'fire-sprite', frames: 8 },
	flamethrower: { type: 'toTarget', sprite: 'fire-sprite', frames: 8 },
	'flame-wheel': { type: 'toTarget', sprite: 'fire-sprite', frames: 8 },
	'v-create': { type: 'toTarget', sprite: 'fire-sprite', frames: 8 },
	'heat-wave': { type: 'toTarget', sprite: 'fire-sprite', frames: 8 },
	'lava-plume': { type: 'toTarget', sprite: 'fire-sprite', frames: 8 },
	'fire-blast': { type: 'toTarget', sprite: 'fire-sprite', frames: 8 },
	incinerate: { type: 'toTarget', sprite: 'fire-sprite', frames: 8 },
	'mystical-fire': { type: 'toTarget', sprite: 'fire-sprite', frames: 8 },
	'searing-shot': { type: 'toTarget', sprite: 'fire-sprite', frames: 8 },
	'fire-spin': { type: 'toTarget', sprite: 'fire-sprite', frames: 8 },
	inferno: { type: 'toTarget', sprite: 'fire-sprite', frames: 8 },
	'burn-up': { type: 'toTarget', sprite: 'fire-sprite', frames: 8 },
	overheat: { type: 'toTarget', sprite: 'fire-sprite', frames: 8 },
	'fiery-dance': { type: 'toTarget', sprite: 'fire-sprite', frames: 8 },

	// Ice
	'ice-beam': { type: 'onTarget', sprite: 'ice-sprite', frames: 6 },
	'hyper-beam': { type: 'onTarget', sprite: 'ice-sprite', frames: 6 },
	blizzard: { type: 'onTarget', sprite: 'ice-sprite', frames: 6 },
	'freeze-dry': { type: 'onTarget', sprite: 'ice-sprite', frames: 6 },

	// Wind
	'razor-wind': { type: 'onTarget', sprite: 'wind-sprite', frames: 8 },
	whirlwind: { type: 'onTarget', sprite: 'wind-sprite', frames: 8 },
	'sonic-boom': { type: 'onTarget', sprite: 'wind-sprite', frames: 8 },
	swift: { type: 'onTarget', sprite: 'wind-sprite', frames: 8 },
	twister: { type: 'onTarget', sprite: 'wind-sprite', frames: 8 },
	'aerial-ace': { type: 'onTarget', sprite: 'wind-sprite', frames: 8 },
	'air-slash': { type: 'onTarget', sprite: 'wind-sprite', frames: 8 },
	hurricane: { type: 'onTarget', sprite: 'wind-sprite', frames: 8 },
	'air-cutter': { type: 'onTarget', sprite: 'wind-sprite', frames: 8 },
	aeroblast: { type: 'onTarget', sprite: 'wind-sprite', frames: 8 },
	gust: { type: 'onTarget', sprite: 'wind-sprite', frames: 8 },

	// Energy balls
	'dazzling-gleam': { type: 'toTarget', sprite: 'lightball-sprite', frames: 8 },
	moonblast: { type: 'toTarget', sprite: 'lightball-sprite', frames: 8 },
	'vacuum-wave': { type: 'toTarget', sprite: 'lightball-sprite', frames: 8 },
	'aura-sphere': { type: 'toTarget', sprite: 'lightball-sprite', frames: 8 },
	'energy-ball': { type: 'toTarget', sprite: 'lightball-sprite', frames: 8 },
	'weather-ball': { type: 'toTarget', sprite: 'lightball-sprite', frames: 8 },
	'focus-blast': { type: 'toTarget', sprite: 'lightball-sprite', frames: 8 },
	'gyro-ball': { type: 'toTarget', sprite: 'lightball-sprite', frames: 8 },
	'bug-buzz': { type: 'toTarget', sprite: 'lightball-sprite', frames: 8 },

	// Shadow balls
	'shadow-ball': { type: 'toTarget', sprite: 'shadowball-sprite', frames: 8 },
	'dark-pulse': { type: 'toTarget', sprite: 'shadowball-sprite', frames: 8 },
	'foul-play': { type: 'toTarget', sprite: 'shadowball-sprite', frames: 8 },

	// Grass
	'leech-seed': { type: 'onTarget', sprite: 'vines-sprite', frames: 6 },
	'vine-whip': { type: 'onTarget', sprite: 'vines-sprite', frames: 6 },
	leafage: { type: 'toTarget', sprite: 'leaf-sprite', frames: 6 },
	'magical-leaf': { type: 'toTarget', sprite: 'leaf-sprite', frames: 6 },
	'leaf-blade': { type: 'toTarget', sprite: 'leaf-sprite', frames: 6 },
	'razor-leaf': { type: 'toTarget', sprite: 'leaf-sprite', frames: 6 },
	'leaf-storm': { type: 'toTarget', sprite: 'leaf-sprite', frames: 6 },
	'leaf-tornado': { type: 'toTarget', sprite: 'leaf-sprite', frames: 6 },

	// Poison
	venoshock: { type: 'toTarget', sprite: 'poison-sprite', frames: 9 },
	'sludge-wave': { type: 'toTarget', sprite: 'poison-sprite', frames: 9 },
	'sludge-bomb': { type: 'toTarget', sprite: 'poison-sprite', frames: 9 },
	acid: { type: 'toTarget', sprite: 'poison-sprite', frames: 9 },
	smog: { type: 'toTarget', sprite: 'poison-sprite', frames: 9 },
	'clear-smog': { type: 'toTarget', sprite: 'poison-sprite', frames: 9 },
	belch: { type: 'toTarget', sprite: 'poison-sprite', frames: 9 },
	'poison-powder': { type: 'toTarget', sprite: 'poison-sprite', frames: 9 },
	toxic: { type: 'onTarget', sprite: 'poison-sprite', frames: 9 },

	// Rock
	'rock-slide': { type: 'toTarget', sprite: 'rock-sprite', frames: 7 },
	'rock-throw': { type: 'toTarget', sprite: 'rock-sprite', frames: 7 },
	'stone-edge': { type: 'toTarget', sprite: 'rock-sprite', frames: 7 },
	'rock-tomb': { type: 'toTarget', sprite: 'rock-sprite', frames: 7 },
	'rock-blast': { type: 'toTarget', sprite: 'rock-sprite', frames: 7 },
	'ancient-power': { type: 'toTarget', sprite: 'rock-sprite', frames: 7 },
	'power-gem': { type: 'toTarget', sprite: 'rock-sprite', frames: 7 },

	// Water
	waterfall: { type: 'onTarget', sprite: 'water-sprite', frames: 8 },
	whirlpool: { type: 'onTarget', sprite: 'water-sprite', frames: 8 },
	'hydro-pump': { type: 'toTarget', sprite: 'water-sprite', frames: 8 },
	surf: { type: 'toTarget', sprite: 'water-sprite', frames: 8 },
	'water-gun': { type: 'toTarget', sprite: 'waterdrop-sprite', frames: 3 },
	bubble: { type: 'toTarget', sprite: 'waterdrop-sprite', frames: 3 },
	'bubble-beam': { type: 'toTarget', sprite: 'waterdrop-sprite', frames: 3 },

	// Beams
	'dragon-breath': { type: 'beam', sprite: 'beam', frames: 1 },
	'dragon-pulse': { type: 'beam', sprite: 'beam', frames: 1 },
	'solar-beam': { type: 'beam', sprite: 'beam', frames: 1 },
	'aurora-beam': { type: 'beam', sprite: 'beam', frames: 1 },
	'frost-breath': { type: 'beam', sprite: 'beam', frames: 1 },
	'laser-focus': { type: 'beam', sprite: 'beam', frames: 1 },
	psybeam: { type: 'beam', sprite: 'beam', frames: 1 },
	'flash-cannon': { type: 'beam', sprite: 'beam', frames: 1 },
	'tri-attack': { type: 'beam', sprite: 'beam', frames: 1 },
	psyshock: { type: 'beam', sprite: 'beam', frames: 1 },

	// Throws
	'pin-missile': { type: 'throw', sprite: 'sting', frames: 1 },
	'fell-stinger': { type: 'throw', sprite: 'sting', frames: 1 },
	megahorn: { type: 'throw', sprite: 'sting', frames: 1 },
	peck: { type: 'throw', sprite: 'sting', frames: 1 },
	'drill-peck': { type: 'throw', sprite: 'sting', frames: 1 },
	pluck: { type: 'throw', sprite: 'sting', frames: 1 },
	'drill-run': { type: 'throw', sprite: 'sting', frames: 1 },
	'fury-attack': { type: 'throw', sprite: 'sting', frames: 1 },
	'ice-shard': { type: 'throw', sprite: 'shard', frames: 1 },
	'icicle-spear': { type: 'throw', sprite: 'shard', frames: 1 },
	'icicle-crash': { type: 'throw', sprite: 'shard', frames: 1 },
	'poison-sting': { type: 'throw', sprite: 'shard', frames: 1 },

	// Heals
	recover: { type: 'self', sprite: 'heal-sprite', frames: 7 },
	moonlight: { type: 'self', sprite: 'heal-sprite', frames: 7 },
	synthesis: { type: 'self', sprite: 'heal-sprite', frames: 7 },
	'milk-drink': { type: 'self', sprite: 'heal-sprite', frames: 7 },
	'soft-boiled': { type: 'self', sprite: 'heal-sprite', frames: 7 },
	'slack-off': { type: 'self', sprite: 'heal-sprite', frames: 7 },
	roost: { type: 'self', sprite: 'heal-sprite', frames: 7 },
	'heal-order': { type: 'self', sprite: 'heal-sprite', frames: 7 },
	'morning-sun': { type: 'self', sprite: 'heal-sprite', frames: 7 },
	'heal-bell': { type: 'self', sprite: 'heal-sprite', frames: 7 },
	'heal-pulse': { type: 'toTarget', sprite: 'heal-sprite', frames: 7 },

	// Buffs
	'nasty-plot': { type: 'self', sprite: 'buff-sprite', frames: 6 },
	'dragon-dance': { type: 'self', sprite: 'buff-sprite', frames: 6 },
	'bulk-up': { type: 'self', sprite: 'buff-sprite', frames: 6 },
	'cotton-guard': { type: 'self', sprite: 'buff-sprite', frames: 6 },
	harden: { type: 'self', sprite: 'buff-sprite', frames: 6 },
	'focus-energy': { type: 'self', sprite: 'buff-sprite', frames: 6 },
	'double-team': { type: 'self', sprite: 'buff-sprite', frames: 6 },
	'defense-curl': { type: 'self', sprite: 'buff-sprite', frames: 6 },
	minimize: { type: 'self', sprite: 'buff-sprite', frames: 6 },
	stockpile: { type: 'self', sprite: 'buff-sprite', frames: 6 },
	growth: { type: 'self', sprite: 'buff-sprite', frames: 6 },
	howl: { type: 'self', sprite: 'buff-sprite', frames: 6 },
	'belly-drum': { type: 'self', sprite: 'buff-sprite', frames: 6 },
	'swords-dance': { type: 'self', sprite: 'buff-sprite', frames: 6 },
	conversion: { type: 'self', sprite: 'buff-sprite', frames: 6 },
	'conversion-2': { type: 'self', sprite: 'buff-sprite', frames: 6 },
	acupressure: { type: 'self', sprite: 'buff-sprite', frames: 6 },
	'work-up': { type: 'self', sprite: 'buff-sprite', frames: 6 },
	'acid-armor': { type: 'self', sprite: 'buff-sprite', frames: 6 },
	coil: { type: 'self', sprite: 'buff-sprite', frames: 6 },
	agility: { type: 'self', sprite: 'buff-sprite', frames: 6 },
	amnesia: { type: 'self', sprite: 'buff-sprite', frames: 6 },
	'calm-mind': { type: 'self', sprite: 'buff-sprite', frames: 6 },
	'iron-defense': { type: 'self', sprite: 'buff-sprite', frames: 6 },
	withdraw: { type: 'self', sprite: 'buff-sprite', frames: 6 },
	'quiver-dance': { type: 'self', sprite: 'buff-sprite', frames: 6 },
	swagger: { type: 'onTarget', sprite: 'buff-sprite', frames: 6 },

	// Debuffs
	'fake-tears': { type: 'onTarget', sprite: 'debuff-sprite', frames: 6 },
	'feather-dance': { type: 'onTarget', sprite: 'debuff-sprite', frames: 6 },
	'cotton-spore': { type: 'onTarget', sprite: 'debuff-sprite', frames: 6 },
	growl: { type: 'onTarget', sprite: 'debuff-sprite', frames: 6 },
	smokescreen: { type: 'onTarget', sprite: 'debuff-sprite', frames: 6 },
	'scary-face': { type: 'onTarget', sprite: 'debuff-sprite', frames: 6 },
	'tail-whip': { type: 'onTarget', sprite: 'debuff-sprite', frames: 6 },
	leer: { type: 'onTarget', sprite: 'debuff-sprite', frames: 6 },
	screech: { type: 'onTarget', sprite: 'debuff-sprite', frames: 6 },
	'sweet-scent': { type: 'onTarget', sprite: 'debuff-sprite', frames: 6 },
	'metal-sound': { type: 'onTarget', sprite: 'debuff-sprite', frames: 6 },

	// Psychic/Ghost
	psychic: { type: 'onTarget', sprite: 'psychic-sprite', frames: 6 },
	confusion: { type: 'onTarget', sprite: 'psychic-sprite', frames: 6 },
	extrasensory: { type: 'onTarget', sprite: 'psychic-sprite', frames: 6 },
	hypnosis: { type: 'onTarget', sprite: 'psychic-sprite', frames: 6 },
	'dream-eater': { type: 'onTarget', sprite: 'psychic-sprite', frames: 6 },
	'future-sight': { type: 'onTarget', sprite: 'psychic-sprite', frames: 6 },
	hex: { type: 'onTarget', sprite: 'psychic-sprite', frames: 6 },
	'night-shade': { type: 'onTarget', sprite: 'psychic-sprite', frames: 6 },
	'ominous-wind': { type: 'onTarget', sprite: 'psychic-sprite', frames: 6 },

	// Ground
	earthquake: { type: 'onTarget', sprite: 'rock-sprite', frames: 7 },
	magnitude: { type: 'onTarget', sprite: 'rock-sprite', frames: 7 },
	'earth-power': { type: 'onTarget', sprite: 'rock-sprite', frames: 7 },
	dig: { type: 'dash', sprite: 'impact-sprite', frames: 4 },
	'mud-slap': { type: 'toTarget', sprite: 'rock-sprite', frames: 7 },
	'mud-shot': { type: 'toTarget', sprite: 'rock-sprite', frames: 7 },
	bulldoze: { type: 'onTarget', sprite: 'rock-sprite', frames: 7 },

	// Steel
	'iron-claw': { type: 'dash', sprite: 'claws-sprite', frames: 8 },
	'steel-beam': { type: 'beam', sprite: 'beam', frames: 1 },
	'metal-burst': { type: 'toTarget', sprite: 'rock-sprite', frames: 7 },
	'mirror-shot': { type: 'toTarget', sprite: 'lightball-sprite', frames: 8 },
	'magnet-bomb': { type: 'toTarget', sprite: 'rock-sprite', frames: 7 },

	// Normal special
	'hyper-voice': { type: 'onTarget', sprite: 'wind-sprite', frames: 8 },
	uproar: { type: 'onTarget', sprite: 'wind-sprite', frames: 8 },
	round: { type: 'onTarget', sprite: 'wind-sprite', frames: 8 },
	'echoed-voice': { type: 'onTarget', sprite: 'wind-sprite', frames: 8 },
	boomburst: { type: 'onTarget', sprite: 'wind-sprite', frames: 8 }
};

const TYPE_HUE_ANGLES: Record<string, number> = {
	fire: -55,
	water: 155,
	grass: 45,
	bug: 60,
	dragon: 190,
	psychic: 220,
	ice: 115,
	electric: 40,
	poison: 280,
	ghost: 260,
	dark: 0,
	fairy: 300,
	fighting: 15,
	rock: 30,
	ground: 25,
	steel: 180,
	flying: 160,
	normal: 0
};

const TYPE_AFTER_EFFECTS: Record<string, string> = {
	water: 'water',
	fire: 'burn',
	electric: 'static',
	ice: 'ice',
	poison: 'poison',
	rock: 'rock',
	grass: 'grass'
};

function getTargetPosition(
	target: HTMLImageElement,
	source: 'ally' | 'opponent',
	spriteSize: number
): { x: number; y: number } {
	const rect = target.getBoundingClientRect();
	return {
		x: rect.left + rect.width / 2 - spriteSize / 2,
		y: rect.top + rect.height / 2 - spriteSize / 2
	};
}

function getInitiatorPosition(
	initiator: HTMLImageElement,
	source: 'ally' | 'opponent',
	spriteSize: number
): { x: number; y: number } {
	const rect = initiator.getBoundingClientRect();
	return {
		x: source === 'ally' ? rect.right - spriteSize / 2 : rect.left - spriteSize / 2,
		y: rect.top + rect.height / 2 - spriteSize / 2
	};
}

export function animateEntry(
	target: HTMLImageElement,
	source: 'ally' | 'opponent',
	idx: number = 0,
	partner: boolean = false,
	double: boolean = false
): gsap.core.Timeline {
	const screenWidth = window.innerWidth;
	const targetWidth = target.getBoundingClientRect().width;

	let finalX: number;
	if (source === 'ally') {
		const basePos = partner ? 0.18 : 0.25 + idx * 0.1 + (idx === 0 && double ? 0.1 : 0);
		finalX = screenWidth * basePos - targetWidth / 2 - idx * screenWidth * 0.2;
	} else {
		const basePos = partner ? 0.68 : 0.75 - idx * 0.12 - (idx === 0 && double ? 0.1 : 0);
		finalX = screenWidth * basePos - targetWidth / 2 + idx * screenWidth * 0.2;
	}

	return gsap
		.timeline()
		.fromTo(
			target,
			{
				left: source === 'ally' ? -targetWidth : screenWidth,
				filter: source === 'ally' ? 'brightness(5)' : 'brightness(0)'
			},
			{
				left: finalX,
				duration: 2
			}
		)
		.to(target, {
			filter: 'brightness(1)',
			duration: 1
		})
		.play();
}

export function animateFaint(target: HTMLImageElement): gsap.core.Timeline {
	return gsap
		.timeline()
		.to(target, {
			filter: 'brightness(0)',
			y: window.innerHeight,
			duration: 1,
			delay: 2
		})
		.play();
}

export function animateRun(
	target: HTMLImageElement,
	source: 'ally' | 'opponent'
): gsap.core.Timeline {
	return gsap
		.timeline()
		.to(target, {
			filter: 'brightness(5)',
			transform: 'scale(.1)',
			duration: 0.8,
			delay: 0.3
		})
		.to(target, {
			x: source === 'ally' ? -window.innerWidth / 2 : window.innerWidth / 2,
			duration: 1,
			delay: 0
		})
		.play();
}

export function animateMove(
	move: Move,
	source: 'ally' | 'opponent',
	target: HTMLImageElement,
	initiator: HTMLImageElement,
	scene: HTMLDivElement,
	spriteFx: HTMLDivElement,
	fx: HTMLImageElement[]
): gsap.core.Timeline | Promise<gsap.core.Timeline> {
	const initialPos = {
		bottom: initiator.style.bottom,
		left: initiator.getBoundingClientRect().left
	};

	const config = MOVE_ANIMATIONS[move.name];

	if (!config) {
		return gsap.timeline().play();
	}

	const spriteSize = config.size || 192;
	const scale = config.scale || 1;
	const repeat = config.repeat || 1;

	switch (config.type) {
		case 'dash':
			return animateSpriteDash(
				move,
				source,
				target,
				initiator,
				initialPos,
				scene,
				spriteFx,
				config.sprite,
				config.frames,
				spriteSize,
				scale,
				repeat
			);
		case 'toTarget':
			return animateSpriteToTarget(
				move,
				source,
				target,
				initiator,
				scene,
				spriteFx,
				config.sprite,
				config.frames,
				spriteSize
			);
		case 'onTarget':
			if (config.sprite === 'buff-sprite' && move.name !== 'swagger') {
				return animateSpriteOnTarget(
					move,
					source,
					initiator,
					initiator,
					scene,
					spriteFx,
					config.sprite,
					config.frames,
					spriteSize
				);
			}
			return animateSpriteOnTarget(
				move,
				source,
				target,
				initiator,
				scene,
				spriteFx,
				config.sprite,
				config.frames,
				spriteSize
			);
		case 'fromTarget':
			return animateSpriteFromTarget(
				move,
				source,
				target,
				initiator,
				scene,
				spriteFx,
				config.sprite,
				config.frames,
				spriteSize
			);
		case 'self':
			return animateSpriteSelf(
				move,
				source,
				target,
				initiator,
				scene,
				spriteFx,
				config.sprite,
				config.frames,
				spriteSize
			);
		case 'beam':
			return animateBeam(move, source, target, initiator, scene, spriteFx, spriteSize);
		case 'throw':
			return animateThrow(
				move,
				source,
				target,
				initiator,
				scene,
				spriteFx,
				config.sprite,
				repeat,
				spriteSize
			);
		default:
			return gsap.timeline().play();
	}
}

export function animateEffect(
	effect: 'burn' | 'paralysis' | 'poison' | 'freeze' | 'sleep' | 'confusion',
	target: HTMLImageElement,
	spriteFx: HTMLDivElement
): gsap.core.Timeline {
	const tl = gsap.timeline();
	const rect = target.getBoundingClientRect();

	switch (effect) {
		case 'burn':
			tl.to(target, { filter: 'sepia(1) saturate(3) hue-rotate(-20deg)', duration: 0.3 })
				.to(target, { filter: 'none', duration: 0.3 })
				.to(target, { filter: 'sepia(1) saturate(3) hue-rotate(-20deg)', duration: 0.3 })
				.to(target, { filter: 'none', duration: 0.3 });
			break;

		case 'paralysis':
			tl.to(target, { filter: 'brightness(2) saturate(0.5)', x: -5, duration: 0.05 })
				.to(target, { x: 5, duration: 0.05 })
				.to(target, { x: -5, duration: 0.05 })
				.to(target, { x: 5, duration: 0.05 })
				.to(target, { x: 0, filter: 'none', duration: 0.1 });
			break;

		case 'poison':
			tl.to(target, { filter: 'hue-rotate(80deg) saturate(1.5)', duration: 0.4 })
				.to(target, { filter: 'none', duration: 0.4 })
				.to(target, { filter: 'hue-rotate(80deg) saturate(1.5)', duration: 0.4 })
				.to(target, { filter: 'none', duration: 0.4 });
			break;

		case 'freeze':
			tl.to(target, {
				filter: 'brightness(1.5) saturate(0.3) hue-rotate(180deg)',
				duration: 0.5
			}).to(target, { filter: 'brightness(1.2) saturate(0.5) hue-rotate(180deg)', duration: 1 });
			break;

		case 'sleep':
			tl.set(spriteFx, {
				innerHTML: 'Z',
				fontSize: '48px',
				fontWeight: 'bold',
				color: 'white',
				textShadow: '2px 2px 4px black',
				left: rect.right,
				top: rect.top - 20,
				opacity: 1,
				visibility: 'visible'
			})
				.to(spriteFx, { top: rect.top - 60, opacity: 0, duration: 1 })
				.set(spriteFx, { visibility: 'hidden', innerHTML: '' });
			break;

		case 'confusion':
			tl.to(target, { rotation: -10, duration: 0.1 })
				.to(target, { rotation: 10, duration: 0.1 })
				.to(target, { rotation: -10, duration: 0.1 })
				.to(target, { rotation: 10, duration: 0.1 })
				.to(target, { rotation: 0, duration: 0.1 });
			break;
	}

	return tl.play();
}

function animateThrow(
	move: Move,
	source: 'ally' | 'opponent',
	target: HTMLImageElement,
	initiator: HTMLImageElement,
	scene: HTMLDivElement,
	spriteFx: HTMLDivElement,
	fxImage: string,
	repeat: number = 1,
	spriteSize: number = 192
): gsap.core.Timeline {
	const tl = gsap.timeline();
	const initPos = getInitiatorPosition(initiator, source, spriteSize);
	const targetPos = getTargetPosition(target, source, spriteSize);

	for (let i = 0; i < repeat; i++) {
		tl.set(spriteFx, {
			background: `url(src/assets/battle/fx/${fxImage}.png)`,
			left: initPos.x,
			top: initPos.y,
			opacity: 1,
			height: `${spriteSize}px`,
			width: `${spriteSize}px`,
			scale: source === 'ally' ? 1 : -1,
			visibility: 'visible',
			duration: 0.2
		})
			.to(spriteFx, {
				left: targetPos.x,
				top: targetPos.y,
				duration: Math.min(0.5, 1.5 / repeat),
				delay: 0
			})
			.set(target, { filter: 'invert(1)', duration: 0.2 })
			.set(target, { filter: 'invert(0)', delay: 0.1 });

		const afterEffect = TYPE_AFTER_EFFECTS[move.type];
		if (afterEffect) {
			tl.set(
				spriteFx,
				{
					background: `url(src/assets/battle/fx/elements/${afterEffect}.png)`,
					backgroundRepeat: 'no-repeat',
					backgroundPosition: '0 0',
					backgroundSize: 'cover',
					width: `${spriteSize}px`,
					height: `${spriteSize}px`,
					left: targetPos.x,
					top: targetPos.y,
					scale: 1,
					opacity: 1,
					visibility: 'visible',
					duration: 0.4
				},
				'element'
			);
		}

		tl.set(spriteFx, { opacity: 0, visibility: 'hidden', delay: 0.1 });
	}

	return tl.play();
}

function animateSpriteFromTarget(
	move: Move,
	source: 'ally' | 'opponent',
	target: HTMLImageElement,
	initiator: HTMLImageElement,
	scene: HTMLDivElement,
	spriteFx: HTMLDivElement,
	fxImage: string,
	spriteN: number,
	spriteSize: number = 192
): gsap.core.Timeline {
	const tl = gsap.timeline();
	const angle = TYPE_HUE_ANGLES[move.type] || 0;
	const targetPos = getTargetPosition(target, source, spriteSize);
	const initPos = getTargetPosition(initiator, source, spriteSize);

	tl.set(
		spriteFx,
		{
			background: `url(src/assets/battle/fx/${fxImage}.png)`,
			backgroundRepeat: 'no-repeat',
			backgroundPosition: '0 50%',
			backgroundSize: 'cover',
			width: `${spriteSize}px`,
			height: `${spriteSize}px`,
			left: targetPos.x,
			top: targetPos.y,
			filter: `hue-rotate(${angle}deg)`,
			opacity: 1,
			visibility: 'visible',
			scale: 1,
			duration: 0.1
		},
		'fx'
	);

	for (let i = 1; i < spriteN; i++) {
		const xPos = -i * spriteSize;
		tl.set(
			spriteFx,
			{ backgroundPosition: `${xPos}px 50%`, ease: 'steps(1)', duration: 1 / spriteN },
			`fx+=${0.1 + (1 / spriteN) * i}`
		);
	}

	tl.set(target, { filter: 'invert(1)', delay: 0.2, duration: 0.2 })
		.set(target, { filter: 'invert(0)', delay: 0.1 })
		.to(spriteFx, { left: initPos.x, top: initPos.y, ease: 'expo.in', duration: 0.5 })
		.set(spriteFx, { opacity: 0, visibility: 'hidden', delay: 0.1 });

	return tl.play();
}

function animateBeam(
	move: Move,
	source: 'ally' | 'opponent',
	target: HTMLImageElement,
	initiator: HTMLImageElement,
	scene: HTMLDivElement,
	spriteFx: HTMLDivElement,
	spriteSize: number = 192
): gsap.core.Timeline {
	const tl = gsap.timeline();
	const angle = TYPE_HUE_ANGLES[move.type] || 0;
	const initPos = getInitiatorPosition(initiator, source, spriteSize);

	tl.to(scene, { opacity: 0.3, duration: 1.4 }, 'fx')
		.set(
			spriteFx,
			{
				background: 'url(src/assets/battle/fx/beam.png)',
				left: initPos.x,
				top: initPos.y,
				opacity: 1,
				backgroundRepeat: 'no-repeat',
				backgroundSize: 'cover',
				backgroundPosition: 0,
				rotate: source === 'ally' ? -10 : 10,
				height: spriteSize,
				width: 20,
				filter: `hue-rotate(${angle}deg)`,
				scale: source === 'ally' ? 1 : -1,
				visibility: 'visible',
				duration: 0.2
			},
			'fx'
		)
		.to(
			spriteFx,
			{
				width: '80dvw',
				left: source === 'ally' ? initPos.x : `calc(${initPos.x}px - 80dvw)`,
				backgroundRepeat: 'no-repeat',
				backgroundSize: 'cover',
				backgroundPosition: 0,
				ease: 'bounce.in',
				duration: 0.9,
				delay: 0.1
			},
			'fx'
		)
		.set(target, { filter: 'invert(1)', duration: 0.2 })
		.set(target, { filter: 'invert(0)', delay: 0.1 })
		.set(spriteFx, { opacity: 0, visibility: 'hidden', delay: 0.1 })
		.set(scene, { opacity: 1 });

	return tl.play();
}

function animateSpriteSelf(
	move: Move,
	source: 'ally' | 'opponent',
	target: HTMLImageElement,
	initiator: HTMLImageElement,
	scene: HTMLDivElement,
	spriteFx: HTMLDivElement,
	fxImage: string,
	spriteN: number,
	spriteSize: number = 192
): gsap.core.Timeline {
	const tl = gsap.timeline();
	const angle = TYPE_HUE_ANGLES[move.type] || 0;
	const rect = initiator.getBoundingClientRect();

	tl.set(
		spriteFx,
		{
			background: `url(src/assets/battle/fx/${fxImage}.png)`,
			left: rect.left + rect.width / 2 - spriteSize / 2,
			top: rect.top - spriteSize / 3,
			opacity: 1,
			filter: `hue-rotate(${angle}deg)`,
			height: `${spriteSize}px`,
			width: `${spriteSize}px`,
			scale: 1,
			visibility: 'visible',
			duration: 0.1
		},
		'fx'
	).to(scene, { opacity: 0.4, duration: 1.4 }, 'fx');

	for (let i = 1; i < spriteN; i++) {
		const xPos = -i * spriteSize;
		tl.set(
			spriteFx,
			{ backgroundPosition: `${xPos}px 50%`, ease: 'steps(1)', duration: 1 / spriteN },
			`fx+=${0.1 + (1 / spriteN) * i}`
		);
	}

	tl.set(initiator, { filter: 'brightness(3)', duration: 0.2 })
		.set(initiator, { filter: 'brightness(1)', delay: 0.1 })
		.set(spriteFx, { opacity: 0, visibility: 'hidden', delay: 0.1 })
		.set(scene, { opacity: 0.85 });

	return tl.play();
}

function animateSpriteToTarget(
	move: Move,
	source: 'ally' | 'opponent',
	target: HTMLImageElement,
	initiator: HTMLImageElement,
	scene: HTMLDivElement,
	spriteFx: HTMLDivElement,
	fxImage: string,
	spriteN: number,
	spriteSize: number = 192,
	colorize: boolean = false
): gsap.core.Timeline {
	const tl = gsap.timeline();
	const angle = colorize ? TYPE_HUE_ANGLES[move.type] || 0 : 0;
	const initPos = getInitiatorPosition(initiator, source, spriteSize);
	const targetPos = getTargetPosition(target, source, spriteSize);

	tl.set(
		spriteFx,
		{
			background: `url(src/assets/battle/fx/${fxImage}.png)`,
			left: initPos.x,
			top: initPos.y,
			opacity: 1,
			filter: `hue-rotate(${angle}deg)`,
			height: `${spriteSize}px`,
			width: `${spriteSize}px`,
			scale: source === 'ally' ? 1 : -1,
			visibility: 'visible',
			duration: 0.1
		},
		'fx'
	)
		.to(scene, { opacity: 0.4, duration: 1.4 }, 'fx')
		.to(
			spriteFx,
			{ left: targetPos.x, top: targetPos.y, duration: 1.4, scale: 0.8, delay: 0 },
			'fx+=.1'
		);

	for (let i = 1; i < spriteN; i++) {
		const xPos = -i * spriteSize;
		tl.set(
			spriteFx,
			{ backgroundPosition: `${xPos}px 50%`, ease: 'steps(1)', duration: 1 / spriteN },
			`fx+=${0.1 + (1 / spriteN) * i}`
		);
	}

	tl.set(target, { filter: 'invert(1)', duration: 0.2 })
		.set(target, { filter: 'invert(0)', delay: 0.1 })
		.set(spriteFx, { opacity: 0, visibility: 'hidden', delay: 0.1 })
		.set(scene, { opacity: 0.85 });

	return tl.play();
}

function animateSpriteOnTarget(
	move: Move,
	source: 'ally' | 'opponent',
	target: HTMLImageElement,
	initiator: HTMLImageElement,
	scene: HTMLDivElement,
	spriteFx: HTMLDivElement,
	fxImage: string,
	spriteN: number,
	spriteSize: number = 192
): gsap.core.Timeline {
	const tl = gsap.timeline();
	const targetPos = getTargetPosition(target, source, spriteSize);

	tl.set(
		spriteFx,
		{
			background: `url(src/assets/battle/fx/${fxImage}.png)`,
			backgroundRepeat: 'no-repeat',
			backgroundPosition: '0 50%',
			backgroundSize: 'cover',
			width: `${spriteSize}px`,
			height: `${spriteSize}px`,
			left: targetPos.x,
			top: targetPos.y,
			opacity: 1,
			visibility: 'visible',
			scale: 1,
			duration: 0.2
		},
		'fx'
	);

	for (let i = 1; i < spriteN; i++) {
		const xPos = -i * spriteSize;
		tl.set(
			spriteFx,
			{ backgroundPosition: `${xPos}px 50%`, ease: 'steps(1)', duration: 1 / spriteN },
			`fx+=${0.1 + (1 / spriteN) * i}`
		);
	}

	tl.set(target, { filter: 'invert(1)', delay: 0.2, duration: 0.2 })
		.set(target, { filter: 'invert(0)', delay: 0.1 })
		.set(spriteFx, { opacity: 0, visibility: 'hidden', delay: 0.1 });

	return tl.play();
}

function animateSpriteDash(
	move: Move,
	source: 'ally' | 'opponent',
	target: HTMLImageElement,
	initiator: HTMLImageElement,
	initialPos: { bottom: string; left: number },
	scene: HTMLDivElement,
	spriteFx: HTMLDivElement,
	fxImage: string,
	spriteN: number,
	spriteSize: number,
	scale: number,
	repeat: number
): gsap.core.Timeline {
	const tl = gsap.timeline();
	const targetRect = target.getBoundingClientRect();
	const initiatorRect = initiator.getBoundingClientRect();
	const targetPos = getTargetPosition(target, source, spriteSize * scale);

	tl.to(initiator, {
		left:
			source === 'ally'
				? targetRect.left - initiatorRect.width * (2 / 3)
				: targetRect.right - initiatorRect.width * (2 / 3),
		bottom: targetRect.y,
		duration: 0.4
	}).set(
		spriteFx,
		{
			background: `url(src/assets/battle/fx/${fxImage}.png)`,
			backgroundRepeat: 'no-repeat',
			backgroundPosition: '0 50%',
			backgroundSize: 'cover',
			width: `${spriteSize}px`,
			height: `${spriteSize}px`,
			left: targetPos.x,
			top: targetPos.y,
			scale: scale,
			opacity: 1,
			visibility: 'visible',
			delay: 0.1,
			duration: 0.2
		},
		'fx'
	);

	for (let i = 0; i < repeat; i++) {
		for (let j = 1; j < spriteN; j++) {
			const xPos = -j * spriteSize;
			tl.to(spriteFx, {
				backgroundPosition: `${xPos}px 50%`,
				ease: 'steps(1)',
				duration: spriteN >= 6 ? 1.5 / (spriteN * repeat) : 0.2
			});
		}
	}

	tl.set(target, { filter: 'invert(1)', duration: 0.2 }).set(target, {
		filter: 'invert(0)',
		delay: 0.1
	});

	const afterEffect = TYPE_AFTER_EFFECTS[move.type];
	if (afterEffect) {
		tl.set(
			spriteFx,
			{
				background: `url(src/assets/battle/fx/elements/${afterEffect}.png)`,
				backgroundRepeat: 'no-repeat',
				backgroundPosition: '0 0',
				backgroundSize: 'cover',
				width: `${spriteSize}px`,
				height: `${spriteSize}px`,
				left: targetPos.x,
				top: targetPos.y,
				scale: 1,
				opacity: 1,
				visibility: 'visible',
				duration: 0.4
			},
			'element'
		);
	}

	tl.set(spriteFx, { opacity: 0, visibility: 'hidden' }, 'element+=.4').to(initiator, {
		left: initialPos.left,
		bottom: initialPos.bottom,
		duration: 0.3,
		delay: 0.1
	});

	return tl.play();
}
