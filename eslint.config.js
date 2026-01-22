import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
	js.configs.recommended,
	...tseslint.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser
			}
		}
	},
	{
		rules: {
			// TypeScript strict rules
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/no-non-null-assertion': 'warn',

			// Svelte rules
			'svelte/no-at-html-tags': 'warn',
			'svelte/valid-compile': 'error',

			// General code quality
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'no-debugger': 'error',
			eqeqeq: ['error', 'always'],
			curly: ['error', 'all'],
			'prefer-const': 'error',
			'no-var': 'error'
		}
	},
	{
		ignores: [
			'dist/**',
			'docs/**',
			'node_modules/**',
			'.svelte-kit/**',
			'*.config.js',
			'*.config.ts',
			'vite.config.ts',
			'src/assets/data/raw/**',
			'src/assets/data/final/**/*.js'
		]
	}
);
