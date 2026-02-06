# Learnings - Weather Abilities Battle Start Fix

## Conventions

- DO NOT modify `executeAction()` - the `.then()` chain is intentional for UI recursion
- DO NOT change `triggerInitialSwitchIn()` - it correctly pushes to stack
- Use `sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))` for async waiting
- Follow existing action execution pattern: set currentAction, call execute, handle timing

## Key Insights

## 2026-02-06 Fix Complete

### Pattern: Async Action Execution
When you need to await actions sequentially (like initial ability processing), create a separate `executeActionSequential()` method that returns `Promise<void>`. Don't modify the existing `executeAction()` which uses `.then()` chaining for UI recursion.

### Key Insight
`await someFunction()` does nothing if `someFunction()` returns `void`. The await is simply ignored and execution continues immediately.

### Test Pattern
Use `vi.useFakeTimers()` and `vi.advanceTimersByTimeAsync()` to test async timing behavior without real delays.
