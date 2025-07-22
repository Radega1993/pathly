// Script para probar las coordenadas del sistema de pistas
// Ejecutar con: node scripts/test-coordinates.js

// Simular datos de un nivel
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

// Simular camino del usuario
const mockPath = [
    { value: 1, x: 1, y: 1 },
    { value: null, x: 1, y: 2 },
    { value: null, x: 1, y: 3 }
];

console.log('🧪 PRUEBA DE COORDENADAS');
console.log('========================');

console.log('\n📋 Solución (formato x,y):');
mockSolution.forEach((cell, index) => {
    console.log(`   ${index}: (${cell.x}, ${cell.y})`);
});

console.log('\n🎯 Camino actual (formato x,y):');
mockPath.forEach((cell, index) => {
    console.log(`   ${index}: (${cell.x}, ${cell.y})`);
});

console.log('\n🔍 Comparación paso a paso:');
for (let i = 0; i < Math.min(mockPath.length, mockSolution.length); i++) {
    const pathCell = mockPath[i];
    const solutionCell = mockSolution[i];
    const isEqual = pathCell.x === solutionCell.x && pathCell.y === solutionCell.y;

    console.log(`   Paso ${i}: (${pathCell.x},${pathCell.y}) vs (${solutionCell.x},${solutionCell.y}) - ¿Iguales?: ${isEqual}`);
}

console.log('\n📊 Análisis:');
console.log(`   - Longitud de solución: ${mockSolution.length}`);
console.log(`   - Longitud de camino: ${mockPath.length}`);
console.log(`   - Último índice correcto: ${mockPath.length - 1}`);

console.log('\n🎯 Próxima celda sugerida:');
if (mockPath.length < mockSolution.length) {
    const nextSolutionCell = mockSolution[mockPath.length];
    console.log(`   Coordenadas: (${nextSolutionCell.x}, ${nextSolutionCell.y})`);
    console.log(`   Acceso al grid: grid[${nextSolutionCell.y}][${nextSolutionCell.x}]`);
}

console.log('\n✅ Prueba completada'); 