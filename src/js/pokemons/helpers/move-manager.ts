import { MoveInstance } from '../pokedex';
import type { Move, PokedexEntry } from '../pokedex';

export interface MoveOwner {
	moves: MoveInstance[];
	level: number;
}

export class MoveManager {
	private owner: MoveOwner;

	constructor(owner: MoveOwner) {
		this.owner = owner;
	}

	selectMove(iaLvl: 'Random' | 'Easy', target?: { types: string[] }): MoveInstance {
		const random = Math.floor(Math.random() * this.owner.moves.length);
		const move = this.owner.moves[random];
		if (iaLvl === 'Easy' && !!target) {
			const matchTargetTypes =
				target?.types.length === 2
					? this.owner.moves.find((move: Move) => move.type === target.types[0] && move.power > 0)
					: this.owner.moves.find(
							(move: Move) =>
								(move.type === target.types[0] || move.type === target.types[1]) && move.power > 0
						);
			if (matchTargetTypes && matchTargetTypes.power > 0) {
				return move;
			}
		}

		// TODO hard IA should include switching, using items, setup before attacking...
		return move;
	}

	selectLatestMoves(pokedexEntry: PokedexEntry): MoveInstance[] {
		// get 4 last moves based on current level
		return pokedexEntry.moves
			.filter((move) => move.level <= this.owner.level && move.method === 1)
			.slice(-4)
			.map(
				(move) =>
					new MoveInstance(
						move.id,
						move.name,
						move.type,
						move.category,
						move.power,
						move.accuracy,
						move.pp,
						move.priority,
						move.target,
						move.effect,
						move.effectChance,
						move.description,
						move.level
					)
			);
	}
}
