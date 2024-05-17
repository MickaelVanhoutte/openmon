import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from "svelte-preprocess";
import {esbuildDecorators} from "@anatine/esbuild-decorators";
import typescript from '@rollup/plugin-typescript';
import { VitePWA } from 'vite-plugin-pwa'

const noAttr = () => {
  return {
    name: "no-attribute",
    transformIndexHtml(html: string) {
      return html.replace(/crossorigin/g, "");
    }
}
}

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  build: {
    modulePreload: false,
		rollupOptions: {
			output: {
				entryFileNames: "openmon.js",
        		assetFileNames: "openmon.[ext]",
			},

			input:[ "src/main.ts", "src/app.scss", "index.html"],
		},
	},
  plugins: [
	VitePWA({ registerType: 'autoUpdate' }),
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
				accessors: true,
			},
		}),
		
    
  ],
})
