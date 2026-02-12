import { Position } from '../mapping/positions';
import { OverworldItem } from '../items/overworldItem';
import { SeededRNG } from './prng';
import { Script, GiveItem, CustomScriptable } from '../scripting/scripts';
import { dungeonContext } from './dungeon-context';
import { get } from 'svelte/store';

const TIER_1_ITEMS = [4, 17]; // poke-ball, potion
const TIER_2_ITEMS = [3, 26]; // great-ball, super-potion
const TIER_3_ITEMS = [2, 25, 28]; // ultra-ball, hyper-potion, revive

export function placeItems(
	itemPositions: Position[],
	floorNumber: number,
	rng: SeededRNG
): OverworldItem[] {
	const items: OverworldItem[] = [];
	const shuffledPositions = rng.shuffle(itemPositions);

	const itemPool = getPoolForFloor(floorNumber);

	for (let i = 0; i < shuffledPositions.length; i++) {
		const itemId = rng.pick(itemPool);
		const position = shuffledPositions[i];
		const itemKey = `${floorNumber}-${i}`;

		const dc = get(dungeonContext);
		const isPicked = dc?.pickedItems.has(itemKey) ?? false;

		const item = new OverworldItem(
			'Item',
			true,
			position,
			'src/assets/menus/pokeball.png',
			undefined,
			[
				new Script('onInteract', [
					new GiveItem(itemId, 1),
					new CustomScriptable(() => {
						const currentDc = get(dungeonContext);
						if (currentDc) {
							currentDc.pickedItems.add(itemKey);
						}
					})
				])
			]
		);
		item.id = itemId;
		item.pickedUp = isPicked;
		items.push(item);
	}

	return items;
}

function getPoolForFloor(floorNumber: number): number[] {
	if (floorNumber <= 10) {
		return TIER_1_ITEMS;
	} else if (floorNumber <= 25) {
		return TIER_2_ITEMS;
	} else {
		return TIER_3_ITEMS;
	}
}
