import '@abraham/reflection';
import { singleton, injectAll } from 'tsyringe';
import type { PokemonInstance, MoveEffect } from '../../pokedex';
import { EffectResult, type Effect } from '../types';
import { UnknownEffect } from './unknown-effect';

// Effect IDs that are just basic damage with no secondary effects.
// These route to the RegularDamageEffect (id=1) instead of UnknownEffect.
// 379: petal-blizzard, boomburst -- "Inflicts regular damage."
const SIMPLE_DAMAGE_EFFECT_IDS: ReadonlySet<number> = new Set([379]);
const REGULAR_DAMAGE_EFFECT_ID = 1;

@singleton()
export class MoveEffectApplier {
	constructor(@injectAll('Effect') private moveEffects: Effect[]) {}

	public apply(moveEffect: MoveEffect, target: PokemonInstance[], user: PokemonInstance) {
		return (
			this.findEffect(moveEffect)?.apply(target, user) || new EffectResult(new UnknownEffect())
		);
	}

	public findEffect(moveEffect: MoveEffect) {
		const direct = this.moveEffects.find(
			(effect) => effect.move_effect_id === moveEffect.move_effect_id
		);
		if (direct) {
			return direct;
		}
		if (SIMPLE_DAMAGE_EFFECT_IDS.has(moveEffect.move_effect_id)) {
			return this.moveEffects.find((effect) => effect.move_effect_id === REGULAR_DAMAGE_EFFECT_ID);
		}
		return new UnknownEffect();
	}
}
