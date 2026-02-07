import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Sandstorm }])
export class Sandstorm implements Effect {
	move_effect_id: number = 116;
	abr: string = 'SND';
	duration: number = 5;
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		const duration = user?.hasItem('Smooth Rock') ? 8 : 5;
		const effect = new Sandstorm();
		effect.duration = duration;
		return new EffectResult(effect, 'A sandstorm kicked up!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true, 'The sandstorm subsided.');
		}
		// Damage non-Rock/Ground/Steel types
		if (!target.hasType('Rock') && !target.hasType('Ground') && !target.hasType('Steel')) {
			const damage = Math.floor(target.stats.hp / 16);
			target.removeHp(damage);
			return new EffectForTurn(true, `${target.name} is buffeted by the sandstorm!`);
		}
		return new EffectForTurn(true);
	}
}
