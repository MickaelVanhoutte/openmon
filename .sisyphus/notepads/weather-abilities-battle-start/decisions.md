# Decisions - Weather Abilities Battle Start Fix

## Architectural Decisions

### Why executeActionSequential() instead of modifying executeAction()

- `executeAction()` uses `.then()` chaining intentionally for UI recursion during battle flow
- Mid-battle actions rely on this pattern
- Creating a separate method avoids breaking existing functionality
- Sequential method specifically for battle initialization use case

## 2026-02-06 Implementation Decision

### Decision: Separate Method vs Modifying executeAction
**Chose**: Create new `executeActionSequential()` method
**Reason**: The `.then()` chaining in `executeAction()` is intentional for UI recursion during normal gameplay. Modifying it would break the battle flow. A separate method for the specific use case (initial abilities) is cleaner.

### Decision: prepareNewTurn Location  
**Chose**: Call `prepareNewTurn()` after the while loop in `processInitialAbilityActions()`
**Reason**: This ensures all initial ability actions complete before asking "What should X do?"
