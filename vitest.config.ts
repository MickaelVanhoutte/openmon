import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST })],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom',
		setupFiles: ['src/js/__tests__/setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			reportOnFailure: true,
			include: ['src/js/**/*.ts', 'src/lib/**/*.ts'],
			exclude: [
				'node_modules/',
				'src/assets/',
				'dist/',
				'docs/',
				'e2e/**',
				'scripts/**',
				'**/*.config.ts',
				'**/*.config.js',
				'**/*.d.ts',
				'src/js/env.ts',
				'src/main.ts',
				'src/js/__tests__/**'
			],
			thresholds: {
				statements: 40,
				branches: 19,
				functions: 25,
				lines: 40
			}
		}
	},
	resolve: {
		alias: {
			$lib: '/src/lib',
			$js: '/src/js'
		}
	}
});
