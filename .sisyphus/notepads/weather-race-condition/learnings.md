## Weather Ability Race Condition at Battle Start

- Found that `processInitialAbilityActions` in `BattleContext` uses `await this.executeAction(action)`, but `executeAction` returns `void`, causing the loop to drain the stack immediately without waiting for actions to complete.
- This causes multiple `executeAction` chains to run concurrently, overwriting `currentAction` and triggering `prepareNewTurn` prematurely.
- Created failing tests in `src/js/__tests__/context/initial-abilities.test.ts` to prove these issues.
