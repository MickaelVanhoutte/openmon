import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";
import {esbuildDecorators} from "@anatine/esbuild-decorators";
import typescript from '@rollup/plugin-typescript';

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		rollupOptions: {
			output: {
				entryFileNames: "openmon.js",
			},
			input: "src/App.svelte",
		},
	},
	optimizeDeps: {
		esbuildOptions: {
			plugins: [
				esbuildDecorators({
					tsconfig: "./tsconfig.json",
				}),
			]
		}
	},
	plugins: [
		typescript(),
		esbuildDecorators({
				tsconfig: "./tsconfig.json",
			}
		),
		svelte({
			preprocess: sveltePreprocess(),
			emitCss: false,
			inspector: false,
			compilerOptions: {
				customElement: true,
				accessors: true,
			},
		}),

	],

	css: {
		preprocessorOptions: {
			scss: {
				additionalData: '@use "src/variables.scss" as *;',
			},
		},
	},
});
