# Issues - Weather Abilities Battle Start Fix

## Known Gotchas

- Race condition: `await executeAction()` has no effect because `executeAction` returns void
- All actions fire simultaneously at battle start without proper sequencing
- Weather messages get overwritten by "What should X do?" from `prepareNewTurn()`
