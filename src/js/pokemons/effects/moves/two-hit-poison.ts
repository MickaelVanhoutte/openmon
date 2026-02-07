import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: TwoHitPoison }])
export class TwoHitPoison implements Effect {
	move_effect_id: number = 78;
	abr: string = 'THP';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// The actual two-hit and poison chance logic is handled in the battle system
		// This is just the effect definition
		return new EffectResult(
			undefined,
			'Hit twice! The chance to poison is handled in the battle system!'
		);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
