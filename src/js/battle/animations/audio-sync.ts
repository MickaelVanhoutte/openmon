export interface AudioCue {
	soundId: string;
	offset: number;
	volume?: number;
}

export interface MoveAudioConfig {
	impact?: AudioCue;
	charge?: AudioCue;
	ambient?: AudioCue;
}

export const MOVE_AUDIO_MAP: Record<string, MoveAudioConfig> = {
	tackle: {
		impact: { soundId: 'hit-normal', offset: 300 }
	},
	thunderbolt: {
		charge: { soundId: 'electric-charge', offset: 0 },
		impact: { soundId: 'hit-electric', offset: 200 }
	},
	flamethrower: {
		charge: { soundId: 'fire-charge', offset: 0 },
		impact: { soundId: 'hit-fire', offset: 400 }
	},
	'swords-dance': {
		ambient: { soundId: 'stat-up', offset: 0 }
	}
};

export function getMoveAudio(moveName: string): MoveAudioConfig | undefined {
	return MOVE_AUDIO_MAP[moveName.toLowerCase()];
}

export async function playMoveSound(
	moveName: string,
	cueType: 'impact' | 'charge' | 'ambient',
	playFn: (soundId: string, volume: number) => void
): Promise<void> {
	const config = getMoveAudio(moveName);
	if (!config) {
		return;
	}

	const cue = config[cueType];
	if (!cue) {
		return;
	}

	if (cue.offset > 0) {
		await new Promise((resolve) => setTimeout(resolve, cue.offset));
	}

	playFn(cue.soundId, cue.volume ?? 1.0);
}
