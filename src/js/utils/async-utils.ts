/**
 * Promise-based delay, replacing raw setTimeout chains with await-friendly calls.
 */
export function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Polls a condition and resolves when it becomes true.
 * Replaces setInterval-based polling patterns.
 */
export function waitFor(condition: () => boolean, interval = 50): Promise<void> {
	return new Promise((resolve) => {
		if (condition()) {
			resolve();
			return;
		}
		const check = setInterval(() => {
			if (condition()) {
				clearInterval(check);
				resolve();
			}
		}, interval);
	});
}
