import type { BattleContext } from '$js/context/battleContext';
import type { GameContext } from '$js/context/gameContext';
import type { MoveInstance, PokemonInstance } from '$js/pokemons/pokedex';
import { navigateActionGrid } from '$js/battle/grid-navigation';

export interface ActionBarKeyboardState {
	moveInfoModalOpen: boolean;
	battleSwitchOpened: boolean;
	changePokemon: boolean;
	combo: boolean;
	battleBagOpened: boolean;
	disabled: boolean;
	moveOpened: boolean;
	targetSelectOpened: boolean;
	selectedTargetIdx: number | undefined;
	possibleTargets: PokemonInstance[];
	selectedMoveIdx: number | undefined;
	selectedOptionIdx: number | undefined;
	showAdd: boolean;
	showInfoBack: boolean;
	moveInfoMove: MoveInstance | undefined;
}

export interface ActionBarKeyboardActions {
	launchMove: (idx: number, move: MoveInstance, targets?: PokemonInstance[]) => void;
	openBag: () => void;
	switchOpen: () => void;
	escape: () => void;
	handleMoveInfo: (idx: number) => void;
	getBattleCtx: () => BattleContext;
	getContext: () => GameContext;
	updateState: (updates: Partial<ActionBarKeyboardState>) => void;
}

export function createKeyboardListener(
	getState: () => ActionBarKeyboardState,
	actions: ActionBarKeyboardActions
): (event: KeyboardEvent) => void {
	return function listener(e: KeyboardEvent) {
		const state = getState();
		const battleCtx = actions.getBattleCtx();
		const context = actions.getContext();

		if (!battleCtx) {
			return;
		}

		if (state.moveInfoModalOpen) {
			if (e.key === 'i' || e.key === 'I') {
				e.preventDefault();
				actions.updateState({ moveInfoModalOpen: false });
			}
			return;
		}

		if (state.battleSwitchOpened || state.changePokemon || state.combo || state.battleBagOpened) {
			if (e.key === 'Escape') {
				actions.updateState({
					battleSwitchOpened: false,
					changePokemon: false,
					combo: false,
					battleBagOpened: false
				});
			} else {
				return;
			}
		}

		const currentPkmn = battleCtx.playerSide[battleCtx.actionIdx];

		if (
			!context.overWorldContext.menus.bagOpened &&
			!context.overWorldContext.menus.switchOpened &&
			!state.disabled
		) {
			if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
				e.preventDefault();
				if (state.moveOpened && state.targetSelectOpened) {
					if (e.key === 'ArrowUp') {
						if (state.selectedTargetIdx === undefined) {
							actions.updateState({ selectedTargetIdx: 0 });
						} else {
							actions.updateState({
								selectedTargetIdx:
									state.selectedTargetIdx === 0
										? state.possibleTargets.length - 1
										: state.selectedTargetIdx - 1
							});
						}
					} else {
						if (state.selectedTargetIdx === undefined) {
							actions.updateState({ selectedTargetIdx: 0 });
						} else {
							actions.updateState({
								selectedTargetIdx:
									state.selectedTargetIdx === state.possibleTargets.length - 1
										? 0
										: state.selectedTargetIdx + 1
							});
						}
					}
				} else if (state.moveOpened && currentPkmn) {
					const dir = e.key === 'ArrowUp' ? 'up' : 'down';
					const newIdx = navigateActionGrid(
						state.selectedMoveIdx ?? 0,
						dir,
						2,
						currentPkmn.moves.length
					);
					if (currentPkmn.moves[newIdx].pp > 0) {
						actions.updateState({ selectedMoveIdx: newIdx });
					}
				} else {
					if (state.selectedOptionIdx === undefined) {
						actions.updateState({ selectedOptionIdx: 0 });
					} else {
						const direction = e.key === 'ArrowUp' ? 'up' : 'down';
						actions.updateState({
							selectedOptionIdx: navigateActionGrid(state.selectedOptionIdx, direction, 2, 4)
						});
					}
				}
			} else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
				e.preventDefault();
				if (state.moveOpened && state.targetSelectOpened) {
					// Treat as ArrowUp/ArrowDown aliases for target selection
					if (e.key === 'ArrowLeft') {
						if (state.selectedTargetIdx === undefined) {
							actions.updateState({ selectedTargetIdx: 0 });
						} else {
							actions.updateState({
								selectedTargetIdx:
									state.selectedTargetIdx === 0
										? state.possibleTargets.length - 1
										: state.selectedTargetIdx - 1
							});
						}
					} else {
						if (state.selectedTargetIdx === undefined) {
							actions.updateState({ selectedTargetIdx: 0 });
						} else {
							actions.updateState({
								selectedTargetIdx:
									state.selectedTargetIdx === state.possibleTargets.length - 1
										? 0
										: state.selectedTargetIdx + 1
							});
						}
					}
				} else if (state.moveOpened && currentPkmn) {
					const dir = e.key === 'ArrowLeft' ? 'left' : 'right';
					const newIdx = navigateActionGrid(
						state.selectedMoveIdx ?? 0,
						dir,
						2,
						currentPkmn.moves.length
					);
					if (currentPkmn.moves[newIdx].pp > 0) {
						actions.updateState({ selectedMoveIdx: newIdx });
					}
				} else {
					if (state.selectedOptionIdx === undefined) {
						actions.updateState({ selectedOptionIdx: 0 });
					} else {
						const direction = e.key === 'ArrowLeft' ? 'left' : 'right';
						actions.updateState({
							selectedOptionIdx: navigateActionGrid(state.selectedOptionIdx, direction, 2, 4)
						});
					}
				}
			} else if (
				(e.key === 'Enter' || e.key === ' ') &&
				state.selectedMoveIdx !== undefined &&
				currentPkmn
			) {
				e.preventDefault();
				if (state.moveOpened && state.targetSelectOpened && state.selectedTargetIdx !== undefined) {
					actions.launchMove(state.selectedMoveIdx, currentPkmn.moves[state.selectedMoveIdx], [
						state.possibleTargets[state.selectedTargetIdx]
					]);
				} else if (state.moveOpened) {
					actions.launchMove(state.selectedMoveIdx, currentPkmn.moves[state.selectedMoveIdx]);
				} else {
					if (state.selectedOptionIdx === 0) {
						actions.updateState({
							moveOpened: true,
							showAdd: true,
							showInfoBack: true
						});
					} else if (state.selectedOptionIdx === 1) {
						actions.openBag();
					} else if (state.selectedOptionIdx === 2) {
						actions.switchOpen();
					} else if (state.selectedOptionIdx === 3) {
						actions.escape();
					}
				}
			} else if (e.key === 'Escape') {
				if (
					!state.moveOpened &&
					!state.showAdd &&
					!state.showInfoBack &&
					!state.targetSelectOpened &&
					(battleCtx.playerTurnActions?.length ?? 0) > 0
				) {
					battleCtx.cancelLastAction();
				} else {
					actions.updateState({
						targetSelectOpened: false,
						moveOpened: false,
						showAdd: false,
						showInfoBack: false
					});
				}
			} else if ((e.key === 'i' || e.key === 'I') && state.moveOpened) {
				e.preventDefault();
				const currentPkmn = battleCtx.playerSide[battleCtx.actionIdx];
				if (currentPkmn && state.selectedMoveIdx !== undefined) {
					actions.updateState({
						moveInfoMove: currentPkmn.moves[state.selectedMoveIdx],
						moveInfoModalOpen: true
					});
				}
			}
		}
	};
}
