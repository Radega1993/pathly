import { Cell } from '../components/Grid';

/**
 * Valida si el camino trazado es una solución correcta para el puzzle Pathly
 * 
 * @param grid - Matriz bidimensional NxN con valores { x, y, value }
 * @param path - Secuencia de coordenadas [{x, y}, ...] correspondiente al camino tocado
 * @returns true si el camino es válido, false en caso contrario
 * 
 * Reglas de validación:
 * - El camino debe empezar en el número 1
 * - El camino debe conectar todos los números en orden (1→2→3→4)
 * - El camino debe ser continuo (celdas adyacentes)
 * - No se puede repetir ninguna celda en el camino
 * - El camino debe usar TODAS las celdas del grid
 * - El camino debe terminar en la celda del último número
 */
export function validatePath(grid: Cell[][], path: Cell[]): boolean {
    // Validar que el path no esté vacío
    if (path.length === 0) {
        return false;
    }

    // Verificar que no hay celdas repetidas
    const uniqueCells = new Set(path.map(cell => `${cell.x},${cell.y}`));
    if (uniqueCells.size !== path.length) {
        return false;
    }

    // Verificar que el camino empiece en el número 1
    const firstCell = path[0];
    if (firstCell.value !== 1) {
        return false;
    }

    // Obtener todos los números del grid
    const numberedCells = grid.flat().filter(cell => cell.value !== null && cell.value > 0);
    const maxNumber = Math.max(...numberedCells.map(cell => cell.value || 0));

    // Verificar que el camino termine en el último número
    const lastCell = path[path.length - 1];
    if (lastCell.value !== maxNumber) {
        return false;
    }

    // Verificar que todos los números estén en el orden correcto en el path
    const numberPositions: { [key: number]: number } = {};
    path.forEach((cell, index) => {
        if (cell.value !== null && cell.value > 0) {
            numberPositions[cell.value] = index;
        }
    });

    // Verificar que todos los números están en orden ascendente en el path
    for (let i = 1; i <= maxNumber; i++) {
        if (numberPositions[i] === undefined) {
            return false;
        }
        if (i > 1 && numberPositions[i] <= numberPositions[i - 1]) {
            return false;
        }
    }

    // Verificar que todas las celdas adyacentes en el path son realmente adyacentes
    for (let i = 0; i < path.length - 1; i++) {
        const currentCell = path[i];
        const nextCell = path[i + 1];

        const isAdjacent = (
            (Math.abs(currentCell.x - nextCell.x) === 1 && currentCell.y === nextCell.y) ||
            (Math.abs(currentCell.y - nextCell.y) === 1 && currentCell.x === nextCell.x)
        );

        if (!isAdjacent) {
            return false;
        }
    }

    // ARREGLADO: Verificar que el camino usa TODAS las celdas del grid
    const totalCells = grid.length * grid.length;
    if (path.length !== totalCells) {
        return false;
    }

    return true;
}

/**
 * Función auxiliar para crear un grid de prueba
 */
export function createTestGrid(size: number = 5): Cell[][] {
    const grid: Cell[][] = [];
    for (let y = 0; y < size; y++) {
        grid[y] = [];
        for (let x = 0; x < size; x++) {
            grid[y][x] = { x, y, value: null };
        }
    }
    return grid;
}

/**
 * Función auxiliar para colocar números en el grid
 */
export function placeNumbers(grid: Cell[][], positions: Array<{ x: number; y: number; value: number }>): void {
    positions.forEach(({ x, y, value }) => {
        if (grid[y] && grid[y][x]) {
            grid[y][x].value = value;
        }
    });
} 