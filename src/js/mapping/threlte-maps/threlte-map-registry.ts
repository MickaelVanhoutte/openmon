import type { ThrelteMapData } from './types';
import { demoTown } from './demo-town';
import { demoRoute } from './demo-route';

export const threlteMapRegistry: Map<number, ThrelteMapData> = new Map([
	[demoTown.mapId, demoTown],
	[demoRoute.mapId, demoRoute]
]);

export function getThrelteMap(mapId: number): ThrelteMapData | undefined {
	return threlteMapRegistry.get(mapId);
}
