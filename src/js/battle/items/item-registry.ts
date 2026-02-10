import type { HeldItemEffect } from '../../items/held-items-model';

function toKebabCase(str: string): string {
	if (!str) {
		return '';
	}
	return str
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '');
}

const itemEffectMap = new Map<string, HeldItemEffect>();

export function registerItem(name: string, effect: HeldItemEffect): void {
	if (!name) {
		return;
	}
	const key = toKebabCase(name);
	itemEffectMap.set(key, effect);
}

export function getItemEffect(name: string): HeldItemEffect | undefined {
	if (!name) {
		return undefined;
	}
	const key = toKebabCase(name);
	return itemEffectMap.get(key);
}

export function clearItemRegistry(): void {
	itemEffectMap.clear();
}
