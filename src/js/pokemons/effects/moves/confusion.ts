import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Confusion }])
export class Confusion implements Effect {
	move_effect_id: number = 13;
	abr: string = 'CNF';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Confusion lasts 2-5 turns
		const confusion = new Confusion();
		confusion.duration = Math.floor(Math.random() * 4) + 2;
		return new EffectResult(confusion, `${target[0].name} became confused!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;

		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			target.status = undefined;
			return new EffectForTurn(true, `${target.name} snapped out of confusion!`);
		}

		// 33% chance to hurt itself in confusion
		if (Math.random() < 0.33) {
			// Damage is calculated as if the Pokémon hit itself with a 40-power typeless physical move
			const damage = Math.floor(
				(target.currentStats.attack * 40) / target.currentStats.defense / 50 + 2
			);
			target.removeHp(damage);
			return new EffectForTurn(false, `${target.name} hurt itself in its confusion!`);
		}

		return new EffectForTurn(true, `${target.name} is confused!`);
	}
}
