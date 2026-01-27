export interface PMDAnimationData {
	name: string;
	frameWidth: number;
	frameHeight: number;
	durations: number[];
	frameCount: number;
}

export interface PMDAnimDataFile {
	shadowSize: number;
	animations: Map<string, PMDAnimationData>;
}

const animDataCache: Map<string, PMDAnimDataFile> = new Map();
const pendingLoads: Map<string, Promise<PMDAnimDataFile | null>> = new Map();

function parseAnimDataXml(xmlText: string): PMDAnimDataFile {
	const parser = new DOMParser();
	const doc = parser.parseFromString(xmlText, 'application/xml');

	const shadowSizeEl = doc.querySelector('ShadowSize');
	const shadowSize = shadowSizeEl ? parseInt(shadowSizeEl.textContent ?? '1', 10) : 1;

	const animations = new Map<string, PMDAnimationData>();
	const animElements = doc.querySelectorAll('Anim');

	animElements.forEach((animEl) => {
		const nameEl = animEl.querySelector('Name');
		const frameWidthEl = animEl.querySelector('FrameWidth');
		const frameHeightEl = animEl.querySelector('FrameHeight');
		const durationElements = animEl.querySelectorAll('Durations > Duration');

		if (!nameEl || !frameWidthEl || !frameHeightEl) {
			return;
		}

		const name = nameEl.textContent ?? '';
		const frameWidth = parseInt(frameWidthEl.textContent ?? '32', 10);
		const frameHeight = parseInt(frameHeightEl.textContent ?? '32', 10);
		const durations: number[] = [];

		durationElements.forEach((durEl) => {
			durations.push(parseInt(durEl.textContent ?? '8', 10));
		});

		animations.set(name, {
			name,
			frameWidth,
			frameHeight,
			durations,
			frameCount: durations.length
		});
	});

	return { shadowSize, animations };
}

export function getAnimDataPath(pokemonId: number): string {
	const paddedId = pokemonId.toString().padStart(4, '0');
	return `src/assets/monsters/pmd/${paddedId}/AnimData.xml`;
}

export async function loadAnimData(pokemonId: number): Promise<PMDAnimDataFile | null> {
	const path = getAnimDataPath(pokemonId);

	if (animDataCache.has(path)) {
		return animDataCache.get(path) ?? null;
	}

	if (pendingLoads.has(path)) {
		return pendingLoads.get(path) ?? null;
	}

	const loadPromise = (async () => {
		try {
			const response = await fetch(path);
			if (!response.ok) {
				return null;
			}
			const xmlText = await response.text();
			const animData = parseAnimDataXml(xmlText);
			animDataCache.set(path, animData);
			return animData;
		} catch {
			return null;
		} finally {
			pendingLoads.delete(path);
		}
	})();

	pendingLoads.set(path, loadPromise);
	return loadPromise;
}

export function getAnimationData(
	animDataFile: PMDAnimDataFile | null,
	animationName: 'Walk' | 'Idle'
): PMDAnimationData | null {
	if (!animDataFile) {
		return null;
	}
	return animDataFile.animations.get(animationName) ?? null;
}

export function getCachedAnimData(pokemonId: number): PMDAnimDataFile | null {
	const path = getAnimDataPath(pokemonId);
	return animDataCache.get(path) ?? null;
}
