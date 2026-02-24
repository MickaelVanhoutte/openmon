import '@abraham/reflection';
// Vendor CSS — imported here so Vite handles them directly (avoids Sass @import deprecation)
import 'chota/src/chota.css';
import '@sjmc11/tourguidejs/dist/css/tour.min.css';
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
