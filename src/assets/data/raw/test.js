function findGrassChunks(grid, minWidth, maxWidth, minHeight, maxHeight) {
    const rows = grid.length;
    const cols = grid[0].length;
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const chunks = [];

    function isInsideGrid(row, col) {
        return row >= 0 && row < rows && col >= 0 && col < cols;
    }

    function dfs(row, col) {
        const stack = [[row, col]];
        const chunk = [];

        while (stack.length) {
            const [r, c] = stack.pop();

            if (!isInsideGrid(r, c) || visited[r][c] || grid[r][c] !== 'grass') {
                continue;
            }

            visited[r][c] = true;
            chunk.push([r, c]);

            stack.push([r - 1, c]); // Up
            stack.push([r + 1, c]); // Down
            stack.push([r, c - 1]); // Left
            stack.push([r, c + 1]); // Right
        }

        return chunk;
    }

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (!visited[i][j] && grid[i][j] === 'grass') {
                const chunk = dfs(i, j);

                // Check if chunk meets size requirements
                const chunkWidth = Math.max(...chunk.map(coord => coord[1])) - Math.min(...chunk.map(coord => coord[1])) + 1;
                const chunkHeight = Math.max(...chunk.map(coord => coord[0])) - Math.min(...chunk.map(coord => coord[0])) + 1;
                
                if (
                    chunk.length >= minWidth &&
                    chunk.length <= maxWidth &&
                    chunkHeight >= minHeight &&
                    chunkHeight <= maxHeight
                ) {
                    chunks.push(chunk);
                }
            }
        }
    }

    return chunks;
}

// Example usage:
const grid = [
    ['grass', 'grass', 'water', 'grass', 'ground'],
    ['water', 'grass', 'grass', 'grass', 'grass'],
    ['ground', 'ground', 'grass', 'grass', 'ground'],
    ['grass', 'grass', 'grass', 'ground', 'ground']
];

const minWidth = 2;
const maxWidth = 10;
const minHeight = 2;
const maxHeight = 10;

const chunks = findGrassChunks(grid, minWidth, maxWidth, minHeight, maxHeight);
console.log(chunks);