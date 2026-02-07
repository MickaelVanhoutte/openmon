import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Hail }])
export class Hail implements Effect {
	move_effect_id: number = 165;
	abr: string = 'HAL';
	duration: number = 5;
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		const duration = user?.hasItem('Icy Rock') ? 8 : 5;
		const effect = new Hail();
		effect.duration = duration;
		return new EffectResult(effect, 'It started to hail!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true, 'The hail stopped.');
		}
		// Damage non-Ice types
		if (!target.hasType('Ice')) {
			const damage = Math.floor(target.stats.hp / 16);
			target.removeHp(damage);
			return new EffectForTurn(true, `${target.name} is pelted by hail!`);
		}
		return new EffectForTurn(true);
	}
}
