<p align="center">
  <img src="https://github.com/MickaelVanhoutte/openmon/assets/51904030/b32affff-a16d-49ee-817a-eff2c7d5e693" alt="banner-game-capture">
</p>

# OpenMon

A fan-made, web-based Pokemon game in 2.5D, built entirely on the client side with no backend. The overworld is rendered in 3D using Three.js/Threlte while battles and menus use a 2D sprite-based approach. This project is for educational purposes only.

**[Play OpenMon](https://mickaelvanhoutte.github.io/openmon/)**

## Features

- **2.5D Overworld** -- 3D tile-based world with billboard sprites, dynamic camera, and weather particles
- **Turn-based Battles** -- type effectiveness, abilities (150+), held items, status conditions, weather, terrain, and entry hazards
- **Pokedex** -- viewed/caught tracking across 600+ Pokemon species
- **Dungeon Mode** -- procedurally generated floors with seeded RNG, biome-based encounters, boss battles, and meta progression
- **Item System** -- bag inventory, held items with battle effects, Pokeball catching
- **Pokemon Storage** -- PC box system with drag-and-drop management
- **Quest & Script Engine** -- NPC dialogues, quests with objectives, and map-triggered events
- **Evolution & Experience** -- leveling, nature system, IVs/EVs, and evolution chains
- **Pokemon Followers** -- a Pokemon from your party follows you in the overworld
- **Save/Load** -- multiple save slots persisted to localStorage
- **PWA Support** -- installable as a Progressive Web App for offline play
- **Admin Panel** -- developer tools for testing Pokemon, animations, and evolution

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | [Svelte 5](https://svelte.dev/) (runes syntax) |
| Language | TypeScript (strict mode) |
| Build Tool | Vite 7 |
| 3D Rendering | [Three.js](https://threejs.org/) + [Threlte](https://threlte.xyz/) |
| Animations | [GSAP](https://gsap.com/) |
| Audio | [Howler.js](https://howlerjs.com/) |
| Styling | SCSS + [Chota CSS](https://jenil.github.io/chota/) |
| DI | [tsyringe](https://github.com/microsoft/tsyringe) |
| Grid System | [honeycomb-grid](https://abbekeultjes.nl/honeycomb/) |
| Charts | [Chart.js](https://www.chartjs.org/) |
| Testing | [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) |
| Linting | ESLint 9 + Prettier |

## Directory Structure

```
src/
├── App.svelte          # Main router
├── main.ts             # Entry point
├── app.scss            # Global styles
├── js/                 # Game logic & models
│   ├── __tests__/      # Unit tests (100+)
│   ├── battle/         # Battle system (abilities, actions, animations, items)
│   ├── characters/     # Player, NPC, follower models
│   ├── commands/       # Input controls, joystick
│   ├── context/        # Game/Battle/Overworld contexts + managers
│   ├── dungeon/        # Dungeon system (procedural generation, biomes)
│   ├── items/          # Item definitions and bag
│   ├── lighting/       # Biome lighting configuration
│   ├── mapping/        # Maps, collisions, Threlte map conversion
│   ├── pokemons/       # Pokedex, moves, effects, experience
│   ├── scripting/      # Scripts, quests, notifications
│   └── sprites/        # Sprite management
├── lib/                # Svelte UI components (70+)
│   ├── admin/          # Admin panel (dev tools)
│   ├── battle/         # Battle screen and action bar
│   ├── common/         # Shared components (Modal, DialogView, etc.)
│   ├── debug/          # Debug/test pages
│   ├── menus/          # Game menus (Pokedex, Bag, Pokemon list, Boxes)
│   ├── saves/          # Save/Load components
│   ├── world/          # Overworld controls and HUD
│   └── world3d/        # 3D world rendering (Threlte/Three.js)
└── assets/             # Images, audio, JSON data
```

## Getting Started

### Prerequisites

[Node.js](https://nodejs.org/) (LTS recommended)

### Run Locally

```bash
npm install
npm run dev
```

This starts a dev server at http://localhost:5173/

### Build

```bash
npm run build
```

Creates a `dist` folder with production files. The output is also copied to `docs/` for GitHub Pages deployment.

### Test

```bash
npm run test:run    # Run unit tests once
npm run test        # Run tests in watch mode
npm run test:e2e    # Run Playwright end-to-end tests
```

### Deploy

Pushing to `master` automatically deploys to [GitHub Pages](https://mickaelvanhoutte.github.io/openmon/).

## Credits

All resources (images, sounds, names) are owned by Nintendo and The Pokemon Company. This project makes no commercial claims.

- Pokemon data from [PokeAPI](https://pokeapi.co/) (downloaded CSVs, exported to JSON)
- Formulas and mechanics from [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Main_Page) and [Pokepedia](https://www.pokepedia.fr/)

## Contributing

Contributions are welcome. Feel free to open an issue or pull request.

Please follow the coding standards described in [AGENTS.md](AGENTS.md), which covers code style (Prettier config), naming conventions, Svelte 5 patterns, and directory organization.

## License

MIT
