import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Spikes }])
export class Spikes implements Effect {
	move_effect_id: number = 113;
	abr: string = 'SPK';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_SWITCH;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], _user?: PokemonInstance): EffectResult {
		return new EffectResult(this, 'Spikes were scattered on the ground around the opposing team!');
	}

	playEffect(target: PokemonInstance, _user?: PokemonInstance): EffectForTurn {
		if (!target.hasType('Flying')) {
			const baseDamage = Math.floor(target.stats.hp / 8);
			target.removeHp(baseDamage);
			return new EffectForTurn(true, `${target.name} was hurt by the spikes!`);
		}
		return new EffectForTurn();
	}
}
