import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		rollupOptions: {
			output: {
				entryFileNames: "explorer.js",
			},
			input: "src/App.svelte",
		},
	},

	plugins: [
		svelte({
			preprocess: sveltePreprocess(),
			emitCss: false,
			compilerOptions: {
				customElement: true,
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
