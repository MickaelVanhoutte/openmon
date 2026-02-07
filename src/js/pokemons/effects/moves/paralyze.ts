import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Paralyze }])
export class Paralyze implements Effect {
	move_effect_id = 7;
	abr: string = 'PAR';
	duration: number = -1;
	when: EffectTiming = EffectTiming.START_TURN;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	constructor() {}

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(new Paralyze(), `${target[0].name} is paralyzed`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		const canPlay = Math.random() < 0.25;
		return new EffectForTurn(canPlay, canPlay ? undefined : `${target.name} is fully paralyzed`);
	}
}
