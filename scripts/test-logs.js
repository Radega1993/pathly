const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando logs de diagnóstico...\n');

const gridPath = path.join(__dirname, '..', 'components', 'Grid.tsx');
const gridContent = fs.readFileSync(gridPath, 'utf8');

// Verificar que se quitaron los logs de advertencia
if (gridContent.includes('⚠️ La solución no empieza en el número 1')) {
    console.error('❌ Log de advertencia no se quitó');
    process.exit(1);
}
console.log('✅ Log de advertencia quitado correctamente');

// Verificar logs de diagnóstico añadidos
const diagnosticLogs = [
    'console.log(\'🔍 Grid cargado con solución:\'',
    'console.log(`🖱️ Celda presionada:',
    'console.log(\'🎯 PanResponder: onStartShouldSetPanResponder\'',
    'console.log(\'🎯 processDrag: coordenadas pantalla:\'',
    'console.log(\'🎯 screenToCellCoordinates: coordenadas pantalla:\'',
    'console.log(\'🎯 onGridLayout: layout capturado:\'',
    'console.log(\'🎯 addCellToPath: añadiendo celda:\'',
    'console.log(\'🎯 isCellValidNext: verificando celda:\''
];

let allLogsPresent = true;
diagnosticLogs.forEach(log => {
    if (gridContent.includes(log)) {
        console.log(`✅ ${log.substring(0, 50)}...`);
    } else {
        console.log(`❌ ${log.substring(0, 50)}... - NO ENCONTRADO`);
        allLogsPresent = false;
    }
});

if (!allLogsPresent) {
    console.error('\n❌ Algunos logs de diagnóstico no están presentes');
    process.exit(1);
}

console.log('\n🎉 ¡Todos los logs de diagnóstico están implementados!');
console.log('\n📋 Logs añadidos:');
console.log('   ✅ Log de advertencia quitado');
console.log('   ✅ Logs de carga del grid');
console.log('   ✅ Logs de clics en celdas');
console.log('   ✅ Logs de PanResponder');
console.log('   ✅ Logs de processDrag');
console.log('   ✅ Logs de screenToCellCoordinates');
console.log('   ✅ Logs de onGridLayout');
console.log('   ✅ Logs de addCellToPath');
console.log('   ✅ Logs de isCellValidNext');

console.log('\n🧪 Ahora puedes probar el juego y ver los logs en la consola');
console.log('   para diagnosticar qué está pasando con los clics y el arrastre.'); 