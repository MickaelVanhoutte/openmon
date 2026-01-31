import { Position } from '../../mapping/positions';

export type Direction = 'up' | 'down' | 'left' | 'right';

export function getPositionInDirection(position: Position, direction: Direction): Position {
	const newPos = new Position(position.x, position.y);
	switch (direction) {
		case 'up':
			newPos.y -= 1;
			break;
		case 'down':
			newPos.y += 1;
			break;
		case 'left':
			newPos.x -= 1;
			break;
		case 'right':
			newPos.x += 1;
			break;
	}
	return newPos;
}

export function getPositionBehind(position: Position, direction: Direction): Position {
	switch (direction) {
		case 'up':
			return new Position(position.x, position.y + 1);
		case 'down':
			return new Position(position.x, position.y - 1);
		case 'left':
			return new Position(position.x + 1, position.y);
		case 'right':
			return new Position(position.x - 1, position.y);
	}
}

export function isPositionEqual(a: Position, b: Position): boolean {
	return a.x === b.x && a.y === b.y;
}

export function getPositionsInFront(
	position: Position,
	direction: Direction,
	range: number = 3
): Position[] {
	const positions: Position[] = [];
	for (let i = 1; i <= range; i++) {
		const pos = new Position(position.x, position.y);
		switch (direction) {
			case 'up':
				pos.y -= i;
				break;
			case 'down':
				pos.y += i;
				break;
			case 'left':
				pos.x -= i;
				break;
			case 'right':
				pos.x += i;
				break;
		}
		positions.push(pos);
	}
	return positions;
}

export function isOutsideArea(
	position: Position,
	area: { start: Position; end: Position }
): boolean {
	return (
		position.x < area.start.x ||
		position.x > area.end.x ||
		position.y < area.start.y ||
		position.y > area.end.y
	);
}

export function calculateFuturePosition(
	currentX: number,
	currentY: number,
	direction: Direction
): { x: number; y: number } {
	let futureX = currentX;
	let futureY = currentY;

	switch (direction) {
		case 'up':
			futureY -= 1;
			break;
		case 'down':
			futureY += 1;
			break;
		case 'left':
			futureX -= 1;
			break;
		case 'right':
			futureX += 1;
			break;
	}

	return { x: futureX, y: futureY };
}

export function isValidMovement(
	currentX: number,
	currentY: number,
	futureX: number,
	futureY: number
): boolean {
	return Math.abs(futureX - currentX) <= 1 && Math.abs(futureY - currentY) <= 1;
}
