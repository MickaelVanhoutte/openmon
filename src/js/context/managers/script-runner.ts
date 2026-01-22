import { Script } from "../../scripting/scripts";
import { NPC } from "../../characters/npc";
import type { GameContext } from "../gameContext";
import type { OverworldContext } from "../overworldContext";

/**
 * ScriptRunner - Manages script execution, triggers, and NPC movement scripts
 */
export class ScriptRunner {
	playingScript?: Script;
	scriptsByTrigger: Map<string, Script[]> = new Map<string, Script[]>();

	constructor() {}

	/**
	 * Index all scripts by their trigger type for quick lookup
	 */
	indexScripts(scripts: Script[]): void {
		scripts.forEach((script) => {
			if (this.scriptsByTrigger.has(script.triggerType)) {
				this.scriptsByTrigger.get(script.triggerType)?.push(script);
			} else {
				this.scriptsByTrigger.set(script.triggerType, [script]);
			}
		});
	}

	/**
	 * Collect all scripts from map and NPCs
	 */
	collectAllScripts(mapScripts: Script[], npcs: NPC[]): Script[] {
		return mapScripts
			.concat(npcs.map((npc) => npc.mainScript).filter((script) => script !== undefined) as Script[])
			.concat(npcs.map((npc) => npc.dialogScripts).flat().filter((script) => script !== undefined) as Script[])
			.concat(npcs.map((npc) => npc.movingScript).filter((script) => script !== undefined) as Script[]);
	}

	/**
	 * Play a script with optional previous script to resume after
	 */
	play(
		script: Script | undefined,
		gameContext: GameContext,
		overworldContext: OverworldContext,
		previous?: Script,
		onEnd?: () => void,
		pause: boolean = true
	): void {
		if (script && !this.playingScript) {
			script.onEnd = () => {
				this.playingScript = undefined;
				overworldContext.setPaused(false, 'script-end gameContext');
				if (previous) {
					if (onEnd) {
						previous.onEnd = onEnd;
					}
					previous?.resume(gameContext);
				} else {
					if (onEnd) {
						onEnd();
					}
				}
			};
			this.playingScript = script;
			overworldContext.setPaused(pause, 'script-start gameContext');
			script.start(gameContext);
		}
	}

	/**
	 * Start movement scripts for NPCs
	 */
	playMovements(npcs: (NPC | undefined)[], gameContext: GameContext): void {
		npcs.forEach((npc) => {
			npc?.movingScript?.start(gameContext, false);
		});
	}

	/**
	 * Get script by trigger type
	 */
	getByTrigger(triggerType: string): Script | undefined {
		return this.scriptsByTrigger.get(triggerType)?.at(0);
	}

	/**
	 * Interrupt current script
	 */
	interruptCurrent(): void {
		this.playingScript?.interrupt();
	}

	/**
	 * Clear all indexed scripts (for map changes)
	 */
	clear(): void {
		this.scriptsByTrigger.clear();
		this.playingScript = undefined;
	}

	isPlaying(): boolean {
		return !!this.playingScript;
	}
}
