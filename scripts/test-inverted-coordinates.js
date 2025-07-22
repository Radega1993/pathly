// Script para probar la inversión de coordenadas x,y
// Simula exactamente lo que pasa en el juego con coordenadas invertidas

console.log('🧪 PRUEBA DE COORDENADAS INVERTIDAS');
console.log('====================================');

// Simular datos del nivel (solución en formato x,y)
const mockSolution = [
    { "x": 1, "y": 1 },
    { "x": 1, "y": 2 },
    { "x": 1, "y": 3 },
    { "x": 0, "y": 3 },
    { "x": 0, "y": 2 },
    { "x": 0, "y": 1 },
    { "x": 0, "y": 0 },
    { "x": 1, "y": 0 },
    { "x": 2, "y": 0 },
    { "x": 2, "y": 1 },
    { "x": 2, "y": 2 },
    { "x": 2, "y": 3 },
    { "x": 3, "y": 3 },
    { "x": 3, "y": 2 },
    { "x": 3, "y": 1 },
    { "x": 3, "y": 0 }
];

// Simular camino del usuario (formato x,y)
const mockPath = [
    { value: 1, x: 1, y: 1 },
    { value: null, x: 1, y: 2 },
    { value: null, x: 1, y: 3 }
];

// Simular grid 4x4
const mockGrid = [
    [
        { value: null, x: 0, y: 0 },
        { value: null, x: 1, y: 0 },
        { value: null, x: 2, y: 0 },
        { value: null, x: 3, y: 0 }
    ],
    [
        { value: null, x: 0, y: 1 },
        { value: 1, x: 1, y: 1 },    // Número 1
        { value: null, x: 2, y: 1 },
        { value: null, x: 3, y: 1 }
    ],
    [
        { value: null, x: 0, y: 2 },
        { value: null, x: 1, y: 2 },
        { value: 3, x: 2, y: 2 },    // Número 3
        { value: null, x: 3, y: 2 }
    ],
    [
        { value: 4, x: 0, y: 3 },    // Número 4
        { value: null, x: 1, y: 3 },
        { value: null, x: 2, y: 3 },
        { value: null, x: 3, y: 3 }
    ]
];

// Función para encontrar el último índice correcto (CON INVERSIÓN)
function findLastCorrectIndexInverted(path, solution) {
    if (!solution || path.length === 0) return -1;

    let lastCorrectIndex = -1;

    console.log('🔍 COMPARANDO CAMINOS (INVERTIDO):');
    console.log('   Solución:', solution.map((cell, index) => `${index}: (${cell.x},${cell.y})`));
    console.log('   Camino actual:', path.map((cell, index) => `${index}: (${cell.x},${cell.y})`));

    for (let i = 0; i < Math.min(path.length, solution.length); i++) {
        const pathCell = path[i];
        const solutionCell = solution[i];

        // INVERTIR: Usar y del camino como x, y x del camino como y
        const pathX = pathCell.y; // Usar y como x
        const pathY = pathCell.x; // Usar x como y

        console.log(`   Paso ${i}: Comparando (${pathX},${pathY}) vs (${solutionCell.x},${solutionCell.y}) - ¿Iguales?: ${pathX === solutionCell.x && pathY === solutionCell.y}`);

        if (pathX === solutionCell.x && pathY === solutionCell.y) {
            lastCorrectIndex = i;
        } else {
            console.log(`   ❌ Error encontrado en paso ${i}`);
            break;
        }
    }

    console.log(`🔍 Último índice correcto: ${lastCorrectIndex} de ${path.length - 1}`);
    return lastCorrectIndex;
}

// Función para obtener la celda sugerida (CON INVERSIÓN)
function getSuggestedCellInverted(path, solution, grid) {
    if (!solution || solution.length === 0) {
        return null;
    }

    if (path.length === 0) {
        // Si no hay camino, sugerir el número 1
        const numberOneCell = grid.flat().find(cell => cell.value === 1);
        console.log('🔍 PISTA: Sin camino - sugiriendo número 1:', numberOneCell ? `(${numberOneCell.x}, ${numberOneCell.y})` : 'no encontrado');
        return numberOneCell;
    }

    // Comparar el camino actual con la solución
    const lastCorrectIndex = findLastCorrectIndexInverted(path, solution);

    if (lastCorrectIndex === -1) {
        // El camino es incorrecto desde el inicio, sugerir el número 1
        const numberOneCell = grid.flat().find(cell => cell.value === 1);
        console.log('🔍 PISTA: Camino incorrecto desde inicio - sugiriendo número 1:', numberOneCell ? `(${numberOneCell.x}, ${numberOneCell.y})` : 'no encontrado');
        return numberOneCell;
    }

    if (lastCorrectIndex < path.length - 1) {
        // Hay un error en el camino - iluminar la última celda correcta para que retroceda
        const lastCorrectCell = path[lastCorrectIndex];
        console.log(`🔍 PISTA: Error en camino - iluminando celda correcta para retroceder (${lastCorrectCell.x}, ${lastCorrectCell.y})`);
        return lastCorrectCell;
    }

    // El camino es correcto hasta ahora - iluminar la siguiente celda de la solución
    if (path.length < solution.length) {
        const nextSolutionCell = solution[path.length];

        // INVERTIR coordenadas para acceso al grid
        const gridY = nextSolutionCell.x; // Usar x de solución como y del grid
        const gridX = nextSolutionCell.y; // Usar y de solución como x del grid

        console.log(`🔍 PISTA: Buscando celda en grid[${gridY}][${gridX}] (invertido)`);

        // Verificar que las coordenadas estén dentro del grid
        if (gridY >= 0 && gridY < grid.length &&
            gridX >= 0 && gridX < grid[0].length) {
            const nextCell = grid[gridY][gridX];
            console.log(`🔍 PISTA: Iluminando siguiente celda de la solución (${nextSolutionCell.x}, ${nextSolutionCell.y}) -> grid[${gridY}][${gridX}]`);
            return nextCell;
        } else {
            console.warn(`⚠️ Coordenadas fuera del grid: grid[${gridY}][${gridX}]`);
            return null;
        }
    }

    return null; // Ya completó el camino
}

// Función para generar pista (CON INVERSIÓN)
function getHintInverted(path, solution) {
    if (!solution || solution.length === 0) {
        return "No hay solución disponible para este nivel";
    }

    if (path.length === 0) {
        return "Toca el número 1 para empezar el camino";
    }

    // Verificar si el camino empieza correctamente
    if (path[0].value !== 1) {
        return "El camino debe empezar en el número 1";
    }

    // Comparar el camino actual con la solución
    const lastCorrectIndex = findLastCorrectIndexInverted(path, solution);

    if (lastCorrectIndex === -1) {
        return "El camino es incorrecto desde el inicio. Empieza de nuevo desde el número 1";
    }

    if (lastCorrectIndex < path.length - 1) {
        // Hay un error en el camino - el usuario se equivocó
        return `El camino es correcto hasta el paso ${lastCorrectIndex + 1}. Retrocede hasta esa posición y prueba otra dirección`;
    }

    // El camino es correcto hasta ahora, sugerir la siguiente celda
    if (path.length < solution.length) {
        const nextSolutionCell = solution[path.length];
        console.log(`🔍 PISTA: Siguiente celda sugerida (${nextSolutionCell.x}, ${nextSolutionCell.y})`);
        return `Siguiente paso: Ve a la celda (${nextSolutionCell.x}, ${nextSolutionCell.y})`;
    }

    return "¡Camino completado! Has seguido la solución correcta";
}

// Probar diferentes escenarios CON INVERSIÓN
console.log('\n🎯 ESCENARIO 1: Sin camino (INVERTIDO)');
console.log('----------------------------------------');
let path1 = [];
let hint1 = getHintInverted(path1, mockSolution);
let suggestedCell1 = getSuggestedCellInverted(path1, mockSolution, mockGrid);
console.log('Mensaje:', hint1);
console.log('Celda sugerida:', suggestedCell1 ? `(${suggestedCell1.x}, ${suggestedCell1.y})` : 'null');

console.log('\n🎯 ESCENARIO 2: Camino correcto (3 pasos) - INVERTIDO');
console.log('------------------------------------------------------');
let path2 = [
    { value: 1, x: 1, y: 1 },
    { value: null, x: 1, y: 2 },
    { value: null, x: 1, y: 3 }
];
let hint2 = getHintInverted(path2, mockSolution);
let suggestedCell2 = getSuggestedCellInverted(path2, mockSolution, mockGrid);
console.log('Mensaje:', hint2);
console.log('Celda sugerida:', suggestedCell2 ? `(${suggestedCell2.x}, ${suggestedCell2.y})` : 'null');

console.log('\n🎯 ESCENARIO 3: Camino con error - INVERTIDO');
console.log('---------------------------------------------');
let path3 = [
    { value: 1, x: 1, y: 1 },
    { value: null, x: 1, y: 2 },
    { value: null, x: 2, y: 2 }  // Error: debería ser (1, 3)
];
let hint3 = getHintInverted(path3, mockSolution);
let suggestedCell3 = getSuggestedCellInverted(path3, mockSolution, mockGrid);
console.log('Mensaje:', hint3);
console.log('Celda sugerida:', suggestedCell3 ? `(${suggestedCell3.x}, ${suggestedCell3.y})` : 'null');

console.log('\n✅ Prueba de coordenadas invertidas completada'); 