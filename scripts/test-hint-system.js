// Script para probar el sistema de pistas completo
// Simula exactamente lo que pasa en el juego

console.log('🧪 PRUEBA DEL SISTEMA DE PISTAS');
console.log('================================');

// Simular datos del nivel
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

// Función para encontrar el último índice correcto
function findLastCorrectIndex(path, solution) {
    if (!solution || path.length === 0) return -1;

    let lastCorrectIndex = -1;

    console.log('🔍 COMPARANDO CAMINOS:');
    console.log('   Solución:', solution.map((cell, index) => `${index}: (${cell.x},${cell.y})`));
    console.log('   Camino actual:', path.map((cell, index) => `${index}: (${cell.x},${cell.y})`));

    for (let i = 0; i < Math.min(path.length, solution.length); i++) {
        const pathCell = path[i];
        const solutionCell = solution[i];

        console.log(`   Paso ${i}: Comparando (${pathCell.x},${pathCell.y}) vs (${solutionCell.x},${solutionCell.y}) - ¿Iguales?: ${pathCell.x === solutionCell.x && pathCell.y === solutionCell.y}`);

        if (pathCell.x === solutionCell.x && pathCell.y === solutionCell.y) {
            lastCorrectIndex = i;
        } else {
            console.log(`   ❌ Error encontrado en paso ${i}`);
            break;
        }
    }

    console.log(`🔍 Último índice correcto: ${lastCorrectIndex} de ${path.length - 1}`);
    return lastCorrectIndex;
}

// Función para obtener la celda sugerida
function getSuggestedCell(path, solution, grid) {
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
    const lastCorrectIndex = findLastCorrectIndex(path, solution);

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
        console.log(`🔍 PISTA: Buscando celda en grid[${nextSolutionCell.y}][${nextSolutionCell.x}]`);

        // Verificar que las coordenadas estén dentro del grid
        if (nextSolutionCell.y >= 0 && nextSolutionCell.y < grid.length &&
            nextSolutionCell.x >= 0 && nextSolutionCell.x < grid[0].length) {
            const nextCell = grid[nextSolutionCell.y][nextSolutionCell.x];
            console.log(`🔍 PISTA: Iluminando siguiente celda de la solución (${nextSolutionCell.x}, ${nextSolutionCell.y})`);
            return nextCell;
        } else {
            console.warn(`⚠️ Coordenadas fuera del grid: (${nextSolutionCell.x}, ${nextSolutionCell.y})`);
            return null;
        }
    }

    return null; // Ya completó el camino
}

// Función para generar pista
function getHint(path, solution) {
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
    const lastCorrectIndex = findLastCorrectIndex(path, solution);

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

// Probar diferentes escenarios
console.log('\n🎯 ESCENARIO 1: Sin camino');
console.log('----------------------------');
let path1 = [];
let hint1 = getHint(path1, mockSolution);
let suggestedCell1 = getSuggestedCell(path1, mockSolution, mockGrid);
console.log('Mensaje:', hint1);
console.log('Celda sugerida:', suggestedCell1 ? `(${suggestedCell1.x}, ${suggestedCell1.y})` : 'null');

console.log('\n🎯 ESCENARIO 2: Camino correcto (3 pasos)');
console.log('-------------------------------------------');
let path2 = [
    { value: 1, x: 1, y: 1 },
    { value: null, x: 1, y: 2 },
    { value: null, x: 1, y: 3 }
];
let hint2 = getHint(path2, mockSolution);
let suggestedCell2 = getSuggestedCell(path2, mockSolution, mockGrid);
console.log('Mensaje:', hint2);
console.log('Celda sugerida:', suggestedCell2 ? `(${suggestedCell2.x}, ${suggestedCell2.y})` : 'null');

console.log('\n🎯 ESCENARIO 3: Camino con error');
console.log('----------------------------------');
let path3 = [
    { value: 1, x: 1, y: 1 },
    { value: null, x: 1, y: 2 },
    { value: null, x: 2, y: 2 }  // Error: debería ser (1, 3)
];
let hint3 = getHint(path3, mockSolution);
let suggestedCell3 = getSuggestedCell(path3, mockSolution, mockGrid);
console.log('Mensaje:', hint3);
console.log('Celda sugerida:', suggestedCell3 ? `(${suggestedCell3.x}, ${suggestedCell3.y})` : 'null');

console.log('\n✅ Prueba del sistema de pistas completada'); 