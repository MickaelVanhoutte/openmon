import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: MirrorCoat }])
export class MirrorCoat implements Effect {
	move_effect_id: number = 145;
	abr: string = 'MRC';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user || !target[0]) {
			return new EffectResult();
		}

		const lastDamageTaken = user.lastDamageTaken || 0;
		if (lastDamageTaken <= 0) {
			return new EffectResult(undefined, 'But it failed!');
		}

		this.damages = lastDamageTaken * 2;
		target[0].removeHp(this.damages);
		return new EffectResult(undefined, `${target[0].name} took ${this.damages} damage!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
