import { getAnimationData, type PMDAnimDataFile, type PMDAnimationData } from './pmd-anim-data';

export const PMD_DIRECTION_MAP: Record<string, number> = {
	down: 0,
	right: 2,
	up: 4,
	left: 6
};

export const PMD_DIRECTION_COUNT = 8;

export interface PMDSpriteAnchor {
	bottomOffset: number;
	frameWidth: number;
	frameHeight: number;
}

export interface PMDSpriteAnchors {
	shadowSize: number;
	walk: PMDSpriteAnchor;
	idle: PMDSpriteAnchor | null;
}

// Lazy-loaded sprite anchor data (fetched at runtime to reduce bundle size)
let spriteAnchors: Record<number, PMDSpriteAnchors> | null = null;
let spriteAnchorsPromise: Promise<Record<number, PMDSpriteAnchors>> | null = null;

async function loadSpriteAnchors(): Promise<Record<number, PMDSpriteAnchors>> {
	if (spriteAnchors) {
		return spriteAnchors;
	}
	if (spriteAnchorsPromise) {
		return spriteAnchorsPromise;
	}

	spriteAnchorsPromise = fetch('./data/sprite-anchors.json')
		.then((res) => res.json())
		.then((data) => {
			spriteAnchors = data as Record<number, PMDSpriteAnchors>;
			return spriteAnchors;
		});

	return spriteAnchorsPromise;
}

// Pre-load sprite anchors on module init (non-blocking)
loadSpriteAnchors();

export function getSpriteAnchor(
	pokemonId: number,
	animation: 'Walk' | 'Idle'
): PMDSpriteAnchor | null {
	if (!spriteAnchors) {
		return null;
	}
	const anchors = spriteAnchors[pokemonId];
	if (!anchors) {
		return null;
	}

	if (animation === 'Walk') {
		return anchors.walk;
	}
	return anchors.idle;
}

export interface PMDSpriteInfo {
	frameWidth: number;
	frameHeight: number;
	frameCount: number;
	durations: number[];
	loaded: boolean;
	bottomOffset: number;
}

export function inferPMDSpriteInfo(img: HTMLImageElement, pokemonId?: number): PMDSpriteInfo {
	const frameHeight = Math.floor(img.height / PMD_DIRECTION_COUNT);
	const frameWidth = frameHeight;
	const frameCount = Math.floor(img.width / frameWidth);
	const anchor = pokemonId ? getSpriteAnchor(pokemonId, 'Walk') : null;

	return {
		frameWidth,
		frameHeight,
		frameCount,
		durations: Array(frameCount).fill(8),
		loaded: true,
		bottomOffset: anchor?.bottomOffset ?? 0
	};
}

export function getPMDSpriteInfoFromAnimData(
	animDataFile: PMDAnimDataFile | null,
	animationName: 'Walk' | 'Idle',
	pokemonId?: number,
	fallbackImage?: HTMLImageElement
): PMDSpriteInfo {
	const animData: PMDAnimationData | null = getAnimationData(animDataFile, animationName);
	const anchor = pokemonId ? getSpriteAnchor(pokemonId, animationName) : null;

	if (animData) {
		return {
			frameWidth: animData.frameWidth,
			frameHeight: animData.frameHeight,
			frameCount: animData.frameCount,
			durations: animData.durations,
			loaded: true,
			bottomOffset: anchor?.bottomOffset ?? 0
		};
	}

	if (fallbackImage) {
		return inferPMDSpriteInfo(fallbackImage, pokemonId);
	}

	return {
		frameWidth: 32,
		frameHeight: 40,
		frameCount: 4,
		durations: [8, 10, 8, 10],
		loaded: false,
		bottomOffset: 0
	};
}

export function getPMDSpritePath(
	pokemonId: number,
	animation: 'Walk' | 'Idle',
	isShiny: boolean = false
): string {
	const paddedId = pokemonId.toString().padStart(4, '0');
	const shinyPath = isShiny ? 'shiny/' : '';
	return `src/assets/monsters/pmd/${paddedId}/${shinyPath}${animation}-Anim.png`;
}
