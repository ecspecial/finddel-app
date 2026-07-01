const eslintPluginPrettier = require('eslint-plugin-prettier')
const typescriptEslint = require('@typescript-eslint/eslint-plugin')
const typescriptParser = require('@typescript-eslint/parser')
const { readFileSync } = require('node:fs')

const prettierConfig = JSON.parse(readFileSync('./.prettierrc', 'utf8'))

/** @type {import("eslint").Linter.ConfigOverride[]} */
module.exports = [
	{
		files: ['*.ts', '*.tsx', 'src/**/*.ts', 'src/**/*.tsx'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				project: './tsconfig.json',
				sourceType: 'module',
			},
		},
		plugins: {
			'@typescript-eslint': typescriptEslint,
			prettier: eslintPluginPrettier,
		},
		rules: {
			...typescriptEslint.configs.recommended.rules,
			'prettier/prettier': ['error', prettierConfig],
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
	{
		ignores: [
			'dist/**',
			'node_modules/**',
			'android/**',
			'ios/**',
			'.expo/**',
			'scripts/**',
			'*.js',
			'*.jsx',
			'*.mjs',
			'*.cjs',
		],
	},
]
