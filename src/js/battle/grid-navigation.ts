export type GridDirection = 'up' | 'down' | 'left' | 'right';

export function navigateActionGrid(
	currentIdx: number,
	direction: GridDirection,
	cols: number = 2,
	total: number = 4
): number {
	const row = Math.floor(currentIdx / cols);
	const col = currentIdx % cols;
	const maxRow = Math.ceil(total / cols) - 1;
	const maxCol = cols - 1;

	let newRow = row;
	let newCol = col;

	switch (direction) {
		case 'up':
			newRow = Math.max(0, row - 1);
			break;
		case 'down':
			newRow = Math.min(maxRow, row + 1);
			break;
		case 'left':
			newCol = Math.max(0, col - 1);
			break;
		case 'right':
			newCol = Math.min(maxCol, col + 1);
			break;
	}

	const newIdx = newRow * cols + newCol;
	return newIdx < total ? newIdx : currentIdx;
}
