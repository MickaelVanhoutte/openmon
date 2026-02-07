import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: StealthRock }])
export class StealthRock implements Effect {
	move_effect_id: number = 267;
	abr: string = 'SRK';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_SWITCH;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(this, 'Pointed stones float in the air around the opposing team!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		// Damage based on type effectiveness to Rock
		const baseDamage = Math.floor(target.stats.hp / 8);
		target.removeHp(baseDamage);
		return new EffectForTurn(true, `${target.name} was hurt by the pointed stones!`);
	}
}
