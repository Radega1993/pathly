const fs = require('fs');
const path = require('path');

console.log('🧹 Verificando que todos los logs de test han sido eliminados...\n');

const gridPath = path.join(__dirname, '..', 'components', 'Grid.tsx');
const gridContent = fs.readFileSync(gridPath, 'utf8');

// Verificar que no hay logs de test
const testLogs = [
    'console.log',
    '🎯',
    '🖱️',
    '🔍'
];

const foundLogs = [];

testLogs.forEach(log => {
    if (gridContent.includes(log)) {
        foundLogs.push(log);
    }
});

if (foundLogs.length === 0) {
    console.log('✅ Todos los logs de test han sido eliminados correctamente');
    console.log('✅ El código está limpio y listo para producción');
} else {
    console.log('❌ Se encontraron logs de test que deben ser eliminados:');
    foundLogs.forEach(log => {
        console.log(`   - ${log}`);
    });
}

console.log('\n📊 Estadísticas del archivo:');
console.log(`   - Líneas totales: ${gridContent.split('\n').length}`);
console.log(`   - Tamaño: ${(gridContent.length / 1024).toFixed(2)} KB`);

// Verificar que las funcionalidades principales están intactas
const requiredFeatures = [
    'PanResponder',
    'processDrag',
    'addCellToPath',
    'isCellValidNext',
    'handleCellPress',
    'handleCellLongPress'
];

console.log('\n🔍 Verificando funcionalidades principales:');
requiredFeatures.forEach(feature => {
    if (gridContent.includes(feature)) {
        console.log(`   ✅ ${feature} - Presente`);
    } else {
        console.log(`   ❌ ${feature} - Faltante`);
    }
}); 