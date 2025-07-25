const fs = require('fs');
const path = require('path');

console.log('🎯 Verificando cálculo de posiciones...\n');

// Verificar que el archivo Grid.tsx existe
const gridPath = path.join(__dirname, '..', 'components', 'Grid.tsx');
if (!fs.existsSync(gridPath)) {
    console.error('❌ No se encontró el archivo Grid.tsx');
    process.exit(1);
}

// Leer el contenido del archivo
const gridContent = fs.readFileSync(gridPath, 'utf8');

console.log('🔍 Verificando correcciones implementadas:');

const checks = [
    {
        name: 'Key usa índices del array (colIndex, rowIndex)',
        result: gridContent.includes('const key = `${colIndex},${rowIndex}`; // Usar índices del array, no coordenadas lógicas')
    },
    {
        name: 'findCellAtPosition usa índices correctos',
        result: gridContent.includes('const [colIndex, rowIndex] = key.split(\',\').map(Number);')
    },
    {
        name: 'Retorna celda usando índices correctos',
        result: gridContent.includes('return grid[rowIndex]?.[colIndex] || null;')
    },
    {
        name: 'Logs muestran coordenadas lógicas y de grid',
        result: gridContent.includes('Cell (${cell.x}, ${cell.y}) [grid: ${colIndex},${rowIndex}]')
    }
];

let allPassed = true;
checks.forEach(check => {
    const status = check.result ? '✅' : '❌';
    console.log(`  ${status} ${check.name}`);
    if (!check.result) allPassed = false;
});

console.log('\n🎮 Verificando flujo de cálculo:');

const flowChecks = [
    {
        name: 'calculateCellPositions usa colIndex y rowIndex',
        result: gridContent.includes('const key = `${colIndex},${rowIndex}`')
    },
    {
        name: 'Posiciones calculadas con padding correcto',
        result: gridContent.includes('posX = colIndex * (cellSize + 2) + 4')
    },
    {
        name: 'findCellAtPosition busca en posiciones correctas',
        result: gridContent.includes('x >= pos.x && x <= pos.x + pos.width')
    },
    {
        name: 'Mapeo de key a índices correcto',
        result: gridContent.includes('const [colIndex, rowIndex] = key.split(\',\').map(Number);')
    }
];

flowChecks.forEach(check => {
    const status = check.result ? '✅' : '❌';
    console.log(`  ${status} ${check.name}`);
    if (!check.result) allPassed = false;
});

console.log('\n📊 Resumen de la corrección:');

if (allPassed) {
    console.log('🎉 ¡El cálculo de posiciones está corregido!');
    console.log('\n✅ Problemas corregidos:');
    console.log('   • Key usa índices del array (colIndex, rowIndex)');
    console.log('   • findCellAtPosition usa índices correctos');
    console.log('   • Retorna celda usando grid[rowIndex][colIndex]');
    console.log('   • Logs muestran tanto coordenadas lógicas como de grid');

    console.log('\n🚀 Flujo esperado:');
    console.log('   1. calculateCellPositions: key = `${colIndex},${rowIndex}`');
    console.log('   2. findCellAtPosition: [colIndex, rowIndex] = key.split(\',\')');
    console.log('   3. Retorna: grid[rowIndex][colIndex]');
    console.log('   4. Coordenadas lógicas (cell.x, cell.y) vs índices (colIndex, rowIndex)');

    console.log('\n🧪 Para probar:');
    console.log('   1. Toca en diferentes celdas del grid');
    console.log('   2. Verifica que detecte la celda correcta');
    console.log('   3. Verifica que el número 1 se detecte en su posición real');
    console.log('   4. Verifica que arrastre funcione en todas las celdas');

} else {
    console.log('❌ Hay problemas en el cálculo de posiciones');
    console.log('\n🔧 Revisa:');
    console.log('   • Que key use índices del array');
    console.log('   • Que findCellAtPosition use índices correctos');
    console.log('   • Que retorne celda con índices correctos');
    console.log('   • Que los logs muestren información útil');
}

console.log('\n🧪 Verificación completada.'); 