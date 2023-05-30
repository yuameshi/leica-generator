import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
	root: __dirname,
	clearScreen: false,
	mode: process.env.NODE_ENV,
	plugins: [
		createHtmlPlugin({
			minify: true,
		}),
		legacy({
			targets: { ie: '11' },
		}),
	],
	base: './',
	build: {
		emptyOutDir: true,
		modulePreload: {
			polyfill: true,
		},
		cssCodeSplit: true,
	},
});
