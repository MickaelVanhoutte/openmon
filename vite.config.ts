import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { esbuildDecorators } from '@anatine/esbuild-decorators';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

const noAttr = () => {
	return {
		name: 'no-attribute',
		transformIndexHtml(html: string) {
			return html.replace(/crossorigin/g, '');
		}
	};
};

// https://vitejs.dev/config/
export default defineConfig({
	base: './',
	resolve: {
		alias: {
			$lib: path.resolve(__dirname, './src/lib'),
			$js: path.resolve(__dirname, './src/js')
		}
	},
	build: {
		// Three.js with WebGLRenderer + InstancedMesh + MeshStandardMaterial is ~700 kB
		// minified — this is unavoidable for a 3D engine and gzips to ~185 kB on the wire.
		chunkSizeWarningLimit: 800,
		modulePreload: false,
		rollupOptions: {
			output: {
				// Use a function-based manualChunks so Rollup can still tree-shake
				// individual modules while grouping related packages together.
				manualChunks(id) {
					// Three.js — group all internal three/ modules into one chunk.
					// Using a function (rather than listing 'three' as an entry point)
					// lets Rollup tree-shake unused exports from three.js itself.
					if (id.includes('node_modules/three/')) return 'threejs';
					// postprocessing depends on three; keep it in its own chunk
					if (id.includes('node_modules/postprocessing/')) return 'postprocessing';
					if (id.includes('node_modules/@threlte/')) return 'threlte';
					if (id.includes('node_modules/gsap/')) return 'gsap';
					if (id.includes('node_modules/chart.js/') || id.includes('node_modules/chartjs')) return 'chartjs';
					if (id.includes('node_modules/@svgdotjs/') || id.includes('node_modules/honeycomb-grid/')) return 'mastery';
					if (
						id.includes('node_modules/@abraham/') ||
						id.includes('node_modules/howler/') ||
						id.includes('node_modules/tsyringe/')
					) return 'vendor';
				}
			},

			input: ['src/main.ts', 'src/app.scss', 'index.html']
		}
	},
	plugins: [
		VitePWA({
			registerType: 'autoUpdate',
			workbox: {
				maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
				// Force SW to take control immediately
				skipWaiting: true,
				clientsClaim: true,
				// Don't precache everything - use network-first for HTML
				navigateFallback: 'index.html',
				navigateFallbackDenylist: [/^\/api/],
				// Use network-first for assets to always get latest
				runtimeCaching: [
					{
						urlPattern: /\.(?:js|css)$/,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'static-resources',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24 // 24 hours fallback only
							}
						}
					},
					{
						urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
						handler: 'CacheFirst',
						options: {
							cacheName: 'images',
							expiration: {
								maxEntries: 500,
								maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
							}
						}
					},
					{
						urlPattern: /\.(?:json)$/,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'data',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24 // 24 hours fallback only
							}
						}
					},
					{
						// PMD AnimData XML files — cache-first since sprite metadata never changes
						urlPattern: /\.xml$/,
						handler: 'CacheFirst',
						options: {
							cacheName: 'anim-data',
							expiration: {
								maxEntries: 2000,
								maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
							}
						}
					}
				]
			},
			manifest: {
				name: 'Pokemon Unison',
				short_name: 'Unison',
				description: 'Pokemon Unison, fan made in svelte',
				theme_color: '#000000',
				background_color: '#000000',
				orientation: 'landscape',
				icons: [
					{
						src: 'openmon.png',
						sizes: '360x360',
						type: 'image/png'
					}
				]
			}
		}),
		esbuildDecorators({
			tsconfig: './tsconfig.json'
		}),
		svelte({
			emitCss: true,
			inspector: false
		})
	]
});
