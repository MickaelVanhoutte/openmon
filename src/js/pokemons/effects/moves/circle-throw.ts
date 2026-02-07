import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: CircleThrow }])
export class CircleThrow implements Effect {
	move_effect_id: number = 314;
	abr: string = 'CTR';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Force switch is handled by battle system
		return new EffectResult(undefined, `${target[0]?.name} was forced to switch out!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
