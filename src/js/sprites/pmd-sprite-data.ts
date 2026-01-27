import { getAnimationData, type PMDAnimDataFile, type PMDAnimationData } from './pmd-anim-data';

export const PMD_DIRECTION_MAP: Record<string, number> = {
	down: 0,
	right: 2,
	up: 4,
	left: 6
};

export const PMD_DIRECTION_COUNT = 8;

export interface PMDSpriteInfo {
	frameWidth: number;
	frameHeight: number;
	frameCount: number;
	durations: number[];
	loaded: boolean;
}

export function inferPMDSpriteInfo(img: HTMLImageElement): PMDSpriteInfo {
	const frameHeight = Math.floor(img.height / PMD_DIRECTION_COUNT);
	const frameWidth = frameHeight;
	const frameCount = Math.floor(img.width / frameWidth);

	return {
		frameWidth,
		frameHeight,
		frameCount,
		durations: Array(frameCount).fill(8),
		loaded: true
	};
}

export function getPMDSpriteInfoFromAnimData(
	animDataFile: PMDAnimDataFile | null,
	animationName: 'Walk' | 'Idle',
	fallbackImage?: HTMLImageElement
): PMDSpriteInfo {
	const animData: PMDAnimationData | null = getAnimationData(animDataFile, animationName);

	if (animData) {
		return {
			frameWidth: animData.frameWidth,
			frameHeight: animData.frameHeight,
			frameCount: animData.frameCount,
			durations: animData.durations,
			loaded: true
		};
	}

	if (fallbackImage) {
		return inferPMDSpriteInfo(fallbackImage);
	}

	return {
		frameWidth: 32,
		frameHeight: 40,
		frameCount: 4,
		durations: [8, 10, 8, 10],
		loaded: false
	};
}

export function getPMDSpritePath(pokemonId: number, animation: 'Walk' | 'Idle'): string {
	const paddedId = pokemonId.toString().padStart(4, '0');
	return `src/assets/monsters/pmd/${paddedId}/${animation}-Anim.png`;
}

export function getOldSpritePath(pokemonId: number): string {
	return `src/assets/monsters/walking/${pokemonId}.png`;
}
