export class ExplorationTracker {
	private width: number;
	private height: number;
	readonly fogRadius: number;
	private visited: Set<number>;

	constructor(width: number, height: number, fogRadius: number = 5) {
		this.width = width;
		this.height = height;
		this.fogRadius = fogRadius;
		this.visited = new Set();
	}

	markVisited(x: number, y: number): void {
		if (this.isInBounds(x, y)) {
			const index = this.toFlatIndex(x, y);
			this.visited.add(index);
		}
	}

	isVisited(x: number, y: number): boolean {
		if (!this.isInBounds(x, y)) {
			return false;
		}
		const index = this.toFlatIndex(x, y);
		return this.visited.has(index);
	}

	isVisible(x: number, y: number, playerX: number, playerY: number): boolean {
		const distance = Math.sqrt((x - playerX) ** 2 + (y - playerY) ** 2);
		return distance <= this.fogRadius;
	}

	getVisibleTiles(playerX: number, playerY: number): Set<number> {
		const visible = new Set<number>();
		const radiusSquared = this.fogRadius * this.fogRadius;

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const distanceSquared = (x - playerX) ** 2 + (y - playerY) ** 2;
				if (distanceSquared <= radiusSquared) {
					const index = this.toFlatIndex(x, y);
					visible.add(index);
				}
			}
		}

		return visible;
	}

	updatePlayerPosition(x: number, y: number): void {
		const visibleTiles = this.getVisibleTiles(x, y);
		for (const index of visibleTiles) {
			this.visited.add(index);
		}
	}

	reset(): void {
		this.visited.clear();
	}

	/** Serialize visited set to a flat number array for saving. */
	exportVisited(): number[] {
		return Array.from(this.visited);
	}

	/** Restore visited set from a saved flat number array. */
	importVisited(indices: number[]): void {
		this.visited = new Set(indices);
	}

	private isInBounds(x: number, y: number): boolean {
		return x >= 0 && x < this.width && y >= 0 && y < this.height;
	}

	private toFlatIndex(x: number, y: number): number {
		return y * this.width + x;
	}
}
