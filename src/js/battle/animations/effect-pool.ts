import { EFFECT_MANIFEST, type EffectDefinition } from './effect-manifest';

export class EffectPool {
	private pools: Map<string, HTMLDivElement[]> = new Map();
	private active: Set<HTMLDivElement> = new Set();
	private maxPoolSize: number;

	constructor(maxPoolSize: number = 20) {
		this.maxPoolSize = maxPoolSize;
	}

	async preload(effectNames: string[]): Promise<void> {
		const promises = effectNames.map((name) => {
			const definition = EFFECT_MANIFEST[name];
			if (!definition) {
				return Promise.resolve();
			}

			return new Promise<void>((resolve) => {
				const img = new Image();
				img.onload = () => resolve();
				img.onerror = () => resolve();
				img.src = definition.path;
			});
		});

		await Promise.all(promises);
	}

	acquire(effectName: string): HTMLDivElement | null {
		const definition = EFFECT_MANIFEST[effectName];
		if (!definition) {
			return null;
		}

		const pool = this.pools.get(effectName) || [];

		let element = pool.pop();

		if (!element) {
			element = this.createElement(effectName, definition);
		}

		this.active.add(element);
		this.pools.set(effectName, pool);

		return element;
	}

	release(element: HTMLDivElement): void {
		if (!this.active.has(element)) {
			return;
		}

		this.active.delete(element);

		const effectName = element.dataset.effectName;
		if (!effectName) {
			return;
		}

		const pool = this.pools.get(effectName) || [];

		if (pool.length < this.maxPoolSize) {
			element.style.display = 'none';
			pool.push(element);
			this.pools.set(effectName, pool);
		} else {
			element.remove();
		}
	}

	clear(): void {
		this.pools.forEach((pool) => {
			pool.forEach((element) => element.remove());
		});
		this.pools.clear();

		this.active.forEach((element) => element.remove());
		this.active.clear();
	}

	getStats(): { pooled: number; active: number } {
		let pooled = 0;
		this.pools.forEach((pool) => {
			pooled += pool.length;
		});

		return {
			pooled,
			active: this.active.size
		};
	}

	private createElement(effectName: string, definition: EffectDefinition): HTMLDivElement {
		const element = document.createElement('div');
		element.dataset.effectName = effectName;
		element.style.cssText = `
			position: absolute;
			width: ${definition.frameWidth}px;
			height: ${definition.frameHeight}px;
			background-image: url(${definition.path});
			background-repeat: no-repeat;
			pointer-events: none;
		`;
		return element;
	}
}
