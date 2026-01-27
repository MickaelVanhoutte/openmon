import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { esbuildDecorators } from '@anatine/esbuild-decorators';
import { VitePWA } from 'vite-plugin-pwa';

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
				maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5MB limit
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
