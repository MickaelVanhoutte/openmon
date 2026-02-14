import type { ThrelteMapData } from './types';
import { clearConverterCache } from './openmap-converter';

export const threlteMapRegistry: Map<number, ThrelteMapData> = new Map();

export function getThrelteMap(mapId: number): ThrelteMapData | undefined {
	return threlteMapRegistry.get(mapId);
}

export function registerThrelteMap(mapId: number, data: ThrelteMapData): void {
	threlteMapRegistry.set(mapId, data);
}

export function clearThrelteMapCache(mapId: number): void {
	threlteMapRegistry.delete(mapId);
	clearConverterCache(mapId);
}
