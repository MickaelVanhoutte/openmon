import { type AnimationEngine } from './animation-engine';

export type WeatherType = 'rain' | 'sun' | 'sandstorm' | 'hail' | 'snow' | 'none';
export type TerrainType = 'electric' | 'grassy' | 'psychic' | 'misty' | 'none';

export interface FieldState {
	weather: WeatherType;
	terrain: TerrainType;
	playerHazards: string[];
	opponentHazards: string[];
}

export async function animateWeather(
	engine: AnimationEngine,
	weather: WeatherType,
	container: HTMLElement
): Promise<void> {
	if (weather === 'none') {
		return;
	}

	const overlay = document.createElement('div');
	overlay.className = `weather-overlay weather-${weather}`;
	overlay.style.cssText = `
		position: absolute;
		inset: 0;
		pointer-events: none;
		opacity: 0;
		z-index: 50;
	`;

	container.appendChild(overlay);

	await engine.wait(100);
}

export async function animateTerrain(
	engine: AnimationEngine,
	terrain: TerrainType,
	container: HTMLElement
): Promise<void> {
	if (terrain === 'none') {
		return;
	}

	const overlay = document.createElement('div');
	overlay.className = `terrain-overlay terrain-${terrain}`;
	overlay.style.cssText = `
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 30%;
		pointer-events: none;
		opacity: 0;
		z-index: 45;
	`;

	container.appendChild(overlay);

	await engine.wait(100);
}

export async function animateEntryHazard(
	engine: AnimationEngine,
	_hazardType?: string,
	_side?: 'player' | 'opponent'
): Promise<void> {
	await engine.wait(50);
}

export async function animateMegaEvolution(
	engine: AnimationEngine,
	pokemonElement: HTMLElement
): Promise<void> {
	await engine.backgroundFlash('#ff00ff', 500, 0.3);
	await engine.shake(pokemonElement, 5, 300);
}

export async function animateDynamax(
	engine: AnimationEngine,
	pokemonElement: HTMLElement
): Promise<void> {
	await engine.backgroundFlash('#ff0066', 600, 0.4);
	await engine.shake(pokemonElement, 8, 400);
}
