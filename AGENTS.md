# AGENTS.md - OpenMon Codebase Guidelines

Guidelines for AI coding agents working in this Pokemon web game codebase.

## Project Overview

| Technology  | Details              |
|-------------|----------------------|
| Framework   | Svelte 4.2.8         |
| Language    | TypeScript 5.x       |
| Build Tool  | Vite 5.0.8           |
| Styling     | SCSS + Chota CSS     |
| Audio       | Howler.js            |
| DI          | tsyringe             |
| Animations  | GSAP, AnimeJS        |

## Build/Lint/Test Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server at http://localhost:5173/
npm run build        # Production build + GitHub Pages prep
npm run preview      # Preview production build
npm run check        # Run svelte-check for TypeScript validation
npx eslint src/      # ESLint (no dedicated script)
npm run graph        # Generate dependency graph
```

**Testing:** No tests configured. If adding tests, use Vitest.

## Code Style (Prettier)

- **Indentation:** Tabs (not spaces)
- **Quotes:** Single quotes
- **Trailing commas:** None
- **Print width:** 100 characters

## TypeScript Configuration

- Target/Module: ESNext
- **Experimental decorators enabled** (required for tsyringe)
- **Decorator metadata emission enabled**
- Allows and checks JavaScript files

## Import Organization

```typescript
// 1. Third-party
import "@abraham/reflection";
import { writable, type Writable } from "svelte/store";
import { container } from "tsyringe";

// 2. Internal models
import { PokemonInstance, Move } from "../pokemons/pokedex";
import type { Character } from "../characters/characters-model";

// 3. Assets
import pokedexJson from "../../assets/data/final/beta/pokedex-animatedV3.json";
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

## Svelte Component Structure

```svelte
<script lang="ts">
    import { onMount } from 'svelte';
    import { SomeClass } from '../../js/path/to/file';

    export let propName: PropType;
    let localState: StateType;

    someStore.subscribe((value) => { /* Handle */ });

    function handleEvent() { /* Implementation */ }
</script>

<div class="component-class"><!-- Template --></div>

<style>
    .component-class { /* Scoped styles */ }
</style>
```

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

```typescript
findById(id: number): PokedexSearchResult {
    if (id === undefined || id === null || id < 1) {
        return new PokedexSearchResult(new UnknownMonster());
    }
    let entry = this.entries.find((entry) => entry.id === id);
    return entry?.id ? new PokedexSearchResult(entry) : new PokedexSearchResult(new UnknownMonster());
}
```

## State Management

Use Svelte writable stores:
```typescript
import { writable, type Writable } from "svelte/store";
battleContext: Writable<BattleContext | undefined> = writable(undefined);
```

## Directory Structure

```
src/
├── App.svelte          # Main router
├── main.ts             # Entry point
├── app.scss            # Global styles
├── js/                 # Game logic & models
│   ├── battle/         # Battle system
│   ├── characters/     # Player, NPC, follower
│   ├── context/        # Game/Battle/Overworld contexts
│   ├── items/          # Item system
│   ├── mapping/        # Maps and collisions
│   ├── pokemons/       # Pokedex, moves, experience
│   └── scripting/      # Scripts, quests
├── lib/                # Svelte UI components
│   ├── battle/         # Battle screen
│   ├── common/         # Shared components
│   ├── menus/          # Game menus
│   └── world/          # Overworld components
└── assets/             # Images, audio, JSON data
```

## Key Patterns

### Dependency Injection
```typescript
import "@abraham/reflection";
import { container } from "tsyringe";
const instance = container.resolve(SomeClass);
```

### Context Pattern
- `GameContext` - Overall game state (src/js/context/gameContext.ts)
- `BattleContext` - Battle-specific state (src/js/context/battleContext.ts)
- `OverworldContext` - Map/world state (src/js/context/overworldContext.ts)

### Debug Mode
Set `DEBUG = true` in `src/js/env.ts` to skip intro sequences.

## ESLint Configuration

Extends: `eslint:recommended`, `plugin:@typescript-eslint/recommended`, `plugin:svelte/recommended`, `prettier`

Svelte files use `svelte-eslint-parser` with TypeScript parser.
