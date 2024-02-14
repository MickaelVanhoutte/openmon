# Introduction

OpenMon is an attempt to create a web pokemon game, solely for educational purpose. 
There is no backend, everything is done on the client side.

TLDR: [test OpenMon](https://mickaelvanhoutte.github.io/openmon/)

## Credits

Every resources (images, sounds, names) is owned by Nintendo and the Pokemon Company. I do not claim anything.
Data comes from [PokeAPI](https://pokeapi.co/) github (downloaded CSVs and exported to JSON to fit my needs).
Formulas and mechanics are from [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Main_Page) and [Pokepedia](https://www.pokepedia.fr/).


## Contributing

If you want to contribute, feel free to open an issue or a pull request. I will be happy to discuss and help you.
You can also create pull-requests, but please make sure to respect the code style and the architecture.

The front-end is made with [Svelte](https://svelte.dev/), which is a simple and efficient framework, each Svelte component consists of HTML, JS and CSS in the same file. 

Directory structure:
- `src` contains the source code
  - `App.svelte` is the main component serves the purpose of a router to display either player creation, save loading or world/battle.
  - `/lib/js` contains the game logic
  - `/lib/ui` contains UI elements and menus
  - `/lib/screens` contains the main components (world, battle, player creation, save loading)
  - `/assets` contains images, json data...

### Run locally

To run the project locally, you will need to have [Node.js](https://nodejs.org/en/) installed.
Then, you can run the following commands:

```bash
npm install
npm run dev
```
This will start a local server running on http://localhost:5173/

### Build 

To build the project, you can run the following command:

```bash
npm run build
```
This will create a `dist` folder with the built files. The openmon.js is copied to `docs` to be served on github pages.

### Deploy

Pushing to master will automatically deploy the project to [Github Pages](https://mickaelvanhoutte.github.io/openmon/).

