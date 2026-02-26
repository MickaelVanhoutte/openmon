/**
 * MapService - Handles map loading, transitions, and junction checks.
 * Extracted from GameContext to reduce its size.
 */
import type { GameContext } from '../gameContext';
import { OpenMap } from '../../mapping/maps';
import type { Jonction } from '../../mapping/collisions';
import type { Script } from '../../scripting/scripts';
import { Position } from '../../mapping/positions';
import { delay } from '../../utils/async-utils';

export class MapService {

	async loadMap(ctx: GameContext, map: OpenMap): Promise<void> {
		ctx.overWorldContext.changingMap = true;

		let onEnterScript: Script | undefined;
		if (map.scripts && map.scripts?.length > 0) {
			onEnterScript = map.scripts?.find((s) => s.triggerType === 'onEnter');
		}
		const npcOnEnter = map.npcs?.filter((npc) => npc.movingScript);

		ctx.map = map;
		ctx.overWorldContext.map = map;

		// Re-index scripts for the new map
		const allScripts = ctx.scriptRunner.collectAllScripts(map.scripts, map.npcs);
		ctx.scriptRunner.indexScripts(allScripts);

		await delay(1800);

		ctx.overWorldContext.changingMap = false;
		ctx.playMapSound();

		if (onEnterScript) {
			ctx.playScript(onEnterScript);
		}
		if (npcOnEnter?.length > 0) {
			ctx.scriptRunner.playMovements(npcOnEnter, ctx);
		}
	}

	async changeMap(ctx: GameContext, jonction: Jonction): Promise<void> {
		const isLegendaryPortal = jonction.mapIdx >= 9500 || (ctx.map?.mapId ?? 0) >= 9500;

		ctx.audioManager.fadeOutMapSound();
		ctx.scriptRunner.interruptCurrent();
		ctx.map?.npcs.forEach((npc) => npc.movingScript?.interrupt());
		ctx.scriptRunner.clear();

		const doTransition = () => {
			const map = OpenMap.fromInstance(ctx.MAPS[jonction.mapIdx], new Position(0, 0));
			ctx.player.position.setPosition(jonction.start || new Position(0, 0));
			this.loadMap(ctx, map);
		};

		if (isLegendaryPortal) {
			ctx.overWorldContext.setPaused(true, 'portal-animation');
			ctx.overWorldContext.portalAnimating = true;

			await delay(550);
			ctx.overWorldContext.changingMap = true;

			await delay(350);
			ctx.overWorldContext.portalAnimating = false;
			ctx.overWorldContext.setPaused(false, 'portal-animation');
			doTransition();
		} else {
			doTransition();
		}
	}

	checkForJunction(ctx: GameContext): void {
		if (ctx.map === undefined) {
			return;
		}
		const jonction = ctx.map.jonctionAt(ctx.player.position.positionOnMap);
		if (jonction !== undefined) {
			this.changeMap(ctx, jonction);
		}
	}
}
