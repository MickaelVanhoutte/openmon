import { writable } from 'svelte/store';

export interface PopupData {
	pokemonName: string;
	abilityName: string;
	id: number;
}

function createAbilityPopupStore() {
	const { subscribe, update } = writable<PopupData[]>([]);
	let nextId = 0;

	return {
		subscribe,
		showPopup: (pokemonName: string, abilityName: string) => {
			const popup: PopupData = { pokemonName, abilityName, id: nextId++ };
			update((queue) => [...queue, popup]);

			setTimeout(() => {
				update((queue) => queue.filter((p) => p.id !== popup.id));
			}, 1500);
		},
		clear: () => {
			update(() => []);
		}
	};
}

export const abilityPopupStore = createAbilityPopupStore();
