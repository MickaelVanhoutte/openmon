import '@abraham/reflection';
import { singleton, injectAll } from 'tsyringe';
import type { PokemonInstance, MoveEffect } from '../../pokedex';
import { EffectResult, type Effect } from '../types';
import { UnknownEffect } from './unknown-effect';

@singleton()
export class MoveEffectApplier {
	constructor(@injectAll('Effect') private moveEffects: Effect[]) {}

	public apply(moveEffect: MoveEffect, target: PokemonInstance[], user: PokemonInstance) {
		return (
			this.findEffect(moveEffect)?.apply(target, user) || new EffectResult(new UnknownEffect())
		);
	}

	public findEffect(moveEffect: MoveEffect) {
		return (
			this.moveEffects.find((effect) => effect.move_effect_id === moveEffect.move_effect_id) ||
			new UnknownEffect()
		);
	}
}
