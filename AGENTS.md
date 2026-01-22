# AGENTS.md - OpenMon Codebase Guidelines

Guidelines for AI coding agents working in this Pokemon web game codebase.

## Project Overview

| Technology  | Details              |
|-------------|----------------------|
| Framework   | Svelte 5.48.0        |
| Language    | TypeScript 5.x (strict mode) |
| Build Tool  | Vite 7.x             |
| Styling     | SCSS + Chota CSS     |
| Audio       | Howler.js            |
| DI          | tsyringe             |
| Animations  | GSAP, AnimeJS        |
| Testing     | Vitest               |
| Linting     | ESLint 9 (flat config) |
| Formatting  | Prettier             |

## Build/Lint/Test Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server at http://localhost:5173/
npm run build        # Production build + GitHub Pages prep
npm run preview      # Preview production build
npm run check        # Run svelte-check for TypeScript validation
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run format:check # Check formatting
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run graph        # Generate dependency graph
```

## Code Style (Prettier)

- **Indentation:** Tabs (not spaces)
- **Quotes:** Single quotes
- **Trailing commas:** None
- **Print width:** 100 characters

## TypeScript Configuration

- **Strict mode enabled** (all strict checks active)
- Target/Module: ESNext
- **Experimental decorators enabled** (required for tsyringe)
- **Decorator metadata emission enabled**
- Path aliases: `$lib/*` → `./src/lib/*`, `$js/*` → `./src/js/*`

## Import Organization

```typescript
// 1. Third-party
import '@abraham/reflection';
import { writable, type Writable } from 'svelte/store';
import { container } from 'tsyringe';

// 2. Internal models
import { PokemonInstance, Move } from '../pokemons/pokedex';
import type { Character } from '../characters/characters-model';

// 3. Assets
import pokedexJson from '../../assets/data/final/beta/pokedex-animatedV3.json';
```

## Naming Conventions

| Element           | Convention        | Example                          |
|-------------------|-------------------|----------------------------------|
| Classes           | PascalCase        | `PokemonInstance`, `GameContext` |
| Interfaces/Types  | PascalCase        | `Character`, `Interactive`       |
| Functions/Methods | camelCase         | `startBattle()`, `findById()`    |
| Variables         | camelCase         | `battleContext`, `currentHp`     |
| Constants         | UPPER_SNAKE_CASE  | `NATURES`, `EXPERIENCE_CHART`    |
| Files (TS)        | kebab-case        | `battle-model.ts`                |
| Files (Svelte)    | PascalCase        | `Battle.svelte`                  |
| Enums             | PascalCase        | `BattleType`, `TurnPhase`        |
| Enum values       | UPPER_SNAKE_CASE  | `BattleType.SINGLE`              |

## Svelte 5 Component Structure (Runes)

**New components should use Svelte 5 runes syntax:**

```svelte
<script lang="ts">
    import { onMount } from 'svelte';
    import type { Snippet } from 'svelte';
    import { SomeClass } from '$js/path/to/file';

    interface Props {
        requiredProp: string;
        optionalProp?: number;
        children?: Snippet;
    }

    let { requiredProp, optionalProp = 10, children }: Props = $props();

    let localState = $state(0);
    let derivedValue = $derived(localState * 2);

    $effect(() => {
        console.log('State changed:', localState);
    });

    function handleEvent() {
        localState++;
    }
</script>

<button onclick={handleEvent}>Click me</button>

{#if children}
    {@render children()}
{/if}

<style>
    button { /* Scoped styles */ }
</style>
```

### Svelte 5 Migration Reference

| Svelte 4 | Svelte 5 |
|----------|----------|
| `let count = 0` | `let count = $state(0)` |
| `$: doubled = count * 2` | `let doubled = $derived(count * 2)` |
| `$: { console.log(count) }` | `$effect(() => { console.log(count) })` |
| `export let name` | `let { name } = $props()` |
| `on:click={handler}` | `onclick={handler}` |
| `createEventDispatcher()` | Callback props |
| `<slot />` | `{@render children?.()}` |
| `onMount/onDestroy` | Still fully supported |

## Class-Based Models

```typescript
export class PokedexEntry {
    public id: number;
    public name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

    get computed(): Type { /* Computed property */ }
    public methodName(): ReturnType { /* Implementation */ }
}
```

## Error Handling

- Use early returns for validation
- Return wrapper objects for search results (e.g., `PokedexSearchResult`)
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Use type guards to narrow `undefined` types

```typescript
findById(id: number): PokedexSearchResult {
    if (id === undefined || id === null || id < 1) {
        return new PokedexSearchResult(new UnknownMonster());
    }
    const entry = this.entries.find((entry) => entry.id === id);
    return entry?.id ? new PokedexSearchResult(entry) : new PokedexSearchResult(new UnknownMonster());
}
```

## State Management

Use Svelte writable stores for cross-component state:
```typescript
import { writable, type Writable } from 'svelte/store';
battleContext: Writable<BattleContext | undefined> = writable(undefined);
```

For component-local state, use `$state()` rune.

## Directory Structure

```
src/
├── App.svelte          # Main router
├── main.ts             # Entry point
├── app.scss            # Global styles
├── js/                 # Game logic & models
│   ├── __tests__/      # Unit tests
│   ├── battle/         # Battle system
│   ├── characters/     # Player, NPC, follower
│   ├── commands/       # Input controls, joystick
│   ├── context/        # Game/Battle/Overworld contexts
│   ├── items/          # Item system
│   ├── mapping/        # Maps and collisions
│   ├── pokemons/       # Pokedex, moves, effects, experience
│   │   └── effects/    # Effect type definitions
│   ├── scripting/      # Scripts, quests
│   └── sprites/        # Sprite management
├── lib/                # Svelte UI components
│   ├── battle/         # Battle screen
│   ├── common/         # Shared components (Modal, DialogView, etc.)
│   ├── menus/          # Game menus (Pokedex, Bag, Pokemon list)
│   ├── saves/          # Save/Load components
│   └── world/          # Overworld components
└── assets/             # Images, audio, JSON data
```

## Key Patterns

### Dependency Injection
```typescript
import '@abraham/reflection';
import { container } from 'tsyringe';
const instance = container.resolve(SomeClass);
```

### Context Pattern
- `GameContext` - Overall game state (src/js/context/gameContext.ts)
- `BattleContext` - Battle-specific state (src/js/context/battleContext.ts)
- `OverworldContext` - Map/world state (src/js/context/overworldContext.ts)

### Debug Mode
Set `DEBUG = true` in `src/js/env.ts` to skip intro sequences.

## ESLint Configuration

Uses ESLint 9 flat config (`eslint.config.js`):
- Extends: `@eslint/js`, `typescript-eslint`, `eslint-plugin-svelte`, `prettier`
- Key rules: `no-explicit-any` (warn), `eqeqeq` (error), `curly` (error), `prefer-const` (error)

## Testing

Tests use Vitest with jsdom environment:
```typescript
import { describe, it, expect } from 'vitest';

describe('Example', () => {
    it('should work', () => {
        expect(1 + 1).toBe(2);
    });
});
```

Place test files in `src/js/__tests__/` with `.test.ts` or `.spec.ts` extension.
