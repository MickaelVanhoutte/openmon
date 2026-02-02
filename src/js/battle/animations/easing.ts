import gsap from 'gsap';

export type EasingType =
	| 'linear'
	| 'ballistic'
	| 'ballisticUp'
	| 'ballisticDown'
	| 'quadUp'
	| 'quadDown'
	| 'swing';

export const easingFunctions = {
	ballistic: (x: number): number => 1 - Math.pow(2 * x - 1, 2),

	ballisticUp: (x: number): number => -3 * x * x + 4 * x,

	ballisticDown: (x: number): number => x * x,

	quadUp: (x: number): number => 1 - Math.pow(1 - x, 2),

	quadDown: (x: number): number => x * x,

	swing: (x: number): number => 0.5 - Math.cos(x * Math.PI) / 2
};

export function registerCustomEasings(): void {
	Object.entries(easingFunctions).forEach(([name, fn]) => {
		gsap.registerEase(name, fn);
	});
}

export function getEasing(type: EasingType): (x: number) => number {
	if (type === 'linear') {return (x) => x;}
	return easingFunctions[type as keyof typeof easingFunctions] || ((x) => x);
}
