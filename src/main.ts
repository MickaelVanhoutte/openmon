import '@abraham/reflection';
import './app.scss';
import { mount } from 'svelte';
import App from './App.svelte';
import { preloadCriticalAssets } from './js/preload';

// Warm up critical assets in the background (battle FX, etc.)
preloadCriticalAssets();

const app = mount(App, {
	target: document.getElementById('app')!
});

export default app;
