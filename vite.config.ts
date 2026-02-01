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
		modulePreload: false,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['@abraham/reflection', 'gsap', 'howler', 'tsyringe'],
					chartjs: ['chart.js'],
					mastery: ['@svgdotjs/svg.js', 'honeycomb-grid']
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
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'static-resources',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24 // 24 hours
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
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'data',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24 // 24 hours
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
			emitCss: false,
			inspector: false,
			compilerOptions: {
				accessors: true
			}
		})
	]
});
