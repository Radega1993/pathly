import { validatePath, createTestGrid, placeNumbers } from './validatePath';

/**
 * Ejemplos de uso de la función validatePath
 * 
 * Este archivo demuestra cómo usar la función validatePath con diferentes
 * configuraciones de grid y caminos para validar soluciones del juego Pathly.
 */

console.log('🎮 Pathly - Ejemplos de validación de caminos\n');

// Ejemplo 1: Camino válido
console.log('✅ Ejemplo 1: Camino válido');
const grid1 = createTestGrid(5);
placeNumbers(grid1, [
    { x: 1, y: 1, value: 1 },
    { x: 3, y: 1, value: 2 },
    { x: 1, y: 3, value: 3 },
    { x: 3, y: 3, value: 4 }
]);

const path1 = [
    { x: 1, y: 1 }, // 1
    { x: 3, y: 1 }, // 2
    { x: 1, y: 3 }, // 3
    { x: 3, y: 3 }  // 4
];

console.log('Grid configurado:', grid1.map(row => row.map(cell => cell.value || '.')));
console.log('Camino:', path1);
console.log('Resultado:', validatePath(grid1, path1)); // true
console.log();

// Ejemplo 2: Orden incorrecto
console.log('❌ Ejemplo 2: Orden incorrecto');
const grid2 = createTestGrid(5);
placeNumbers(grid2, [
    { x: 0, y: 0, value: 1 },
    { x: 4, y: 0, value: 2 },
    { x: 0, y: 4, value: 3 },
    { x: 4, y: 4, value: 4 }
]);

const path2 = [
    { x: 0, y: 0 }, // 1
    { x: 0, y: 4 }, // 3 (incorrecto - debería ser 2)
    { x: 4, y: 0 }, // 2 (incorrecto - debería ser 3)
    { x: 4, y: 4 }  // 4
];

console.log('Grid configurado:', grid2.map(row => row.map(cell => cell.value || '.')));
console.log('Camino:', path2);
console.log('Resultado:', validatePath(grid2, path2)); // false
console.log();

// Ejemplo 3: Celda repetida
console.log('❌ Ejemplo 3: Celda repetida');
const grid3 = createTestGrid(5);
placeNumbers(grid3, [
    { x: 2, y: 2, value: 1 },
    { x: 2, y: 3, value: 2 },
    { x: 3, y: 2, value: 3 },
    { x: 3, y: 3, value: 4 }
]);

const path3 = [
    { x: 2, y: 2 }, // 1
    { x: 2, y: 3 }, // 2
    { x: 2, y: 2 }, // 1 (repetido)
    { x: 3, y: 3 }  // 4
];

console.log('Grid configurado:', grid3.map(row => row.map(cell => cell.value || '.')));
console.log('Camino:', path3);
console.log('Resultado:', validatePath(grid3, path3)); // false
console.log();

// Ejemplo 4: Camino incompleto
console.log('❌ Ejemplo 4: Camino incompleto');
const grid4 = createTestGrid(5);
placeNumbers(grid4, [
    { x: 1, y: 1, value: 1 },
    { x: 3, y: 1, value: 2 },
    { x: 1, y: 3, value: 3 },
    { x: 3, y: 3, value: 4 }
]);

const path4 = [
    { x: 1, y: 1 }, // 1
    { x: 3, y: 1 }, // 2
    { x: 1, y: 3 }  // 3 (falta el 4)
];

console.log('Grid configurado:', grid4.map(row => row.map(cell => cell.value || '.')));
console.log('Camino:', path4);
console.log('Resultado:', validatePath(grid4, path4)); // false
console.log();

// Ejemplo 5: Incluye celda sin número
console.log('❌ Ejemplo 5: Incluye celda sin número');
const grid5 = createTestGrid(5);
placeNumbers(grid5, [
    { x: 1, y: 1, value: 1 },
    { x: 3, y: 1, value: 2 },
    { x: 1, y: 3, value: 3 },
    { x: 3, y: 3, value: 4 }
]);

const path5 = [
    { x: 1, y: 1 }, // 1
    { x: 3, y: 1 }, // 2
    { x: 2, y: 2 }, // Celda sin número
    { x: 3, y: 3 }  // 4
];

console.log('Grid configurado:', grid5.map(row => row.map(cell => cell.value || '.')));
console.log('Camino:', path5);
console.log('Resultado:', validatePath(grid5, path5)); // false
console.log();

// Función auxiliar para mostrar el grid de forma visual
function printGrid(grid: any[][]) {
    console.log('Grid visual:');
    grid.forEach((row, y) => {
        const rowStr = row.map((cell, x) => {
            if (cell.value !== null) {
                return ` ${cell.value} `;
            }
            return ' . ';
        }).join('|');
        console.log(`[${rowStr}]`);
    });
    console.log();
}

// Ejemplo visual
console.log('🎨 Ejemplo visual del grid:');
printGrid(grid1); 