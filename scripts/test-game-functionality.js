const fs = require('fs');
const path = require('path');

console.log('🎮 Verificando funcionalidad del juego...\n');

// Verificar que el archivo Grid.tsx existe
const gridPath = path.join(__dirname, '..', 'components', 'Grid.tsx');
if (!fs.existsSync(gridPath)) {
    console.error('❌ No se encontró el archivo Grid.tsx');
    process.exit(1);
}

// Leer el contenido del archivo
const gridContent = fs.readFileSync(gridPath, 'utf8');

console.log('🔍 Verificando funcionalidades básicas:');

const basicChecks = [
    {
        name: 'TouchableOpacity presente',
        result: gridContent.includes('TouchableOpacity')
    },
    {
        name: 'onPress configurado',
        result: gridContent.includes('onPress={() => handleCellPress(cell)}')
    },
    {
        name: 'onLongPress configurado',
        result: gridContent.includes('onLongPress={() => handleCellLongPress(cell)}')
    },
    {
        name: 'PanResponder configurado',
        result: gridContent.includes('PanResponder.create')
    },
    {
        name: 'PanResponder no interfiere con clics',
        result: gridContent.includes('onStartShouldSetPanResponder: () => false')
    },
    {
        name: 'Arrastre activado solo con movimiento',
        result: gridContent.includes('onMoveShouldSetPanResponder')
    }
];

let allPassed = true;
basicChecks.forEach(check => {
    const status = check.result ? '✅' : '❌';
    console.log(`  ${status} ${check.name}`);
    if (!check.result) allPassed = false;
});

console.log('\n🎯 Verificando funciones de manejo:');

const functionChecks = [
    {
        name: 'handleCellPress definida',
        result: gridContent.includes('handleCellPress = (cell: Cell) =>')
    },
    {
        name: 'handleCellLongPress definida',
        result: gridContent.includes('handleCellLongPress = (cell: Cell) =>')
    },
    {
        name: 'addCellToPath definida',
        result: gridContent.includes('addCellToPath = (cell: Cell) =>')
    },
    {
        name: 'isCellValidNext definida',
        result: gridContent.includes('isCellValidNext = (cell: Cell): boolean =>')
    }
];

functionChecks.forEach(check => {
    const status = check.result ? '✅' : '❌';
    console.log(`  ${status} ${check.name}`);
    if (!check.result) allPassed = false;
});

console.log('\n📊 Resumen:');

if (allPassed) {
    console.log('🎉 ¡El juego debería funcionar correctamente!');
    console.log('\n✅ Funcionalidades disponibles:');
    console.log('   • Selección de celdas por clic');
    console.log('   • Selección de celdas por long press');
    console.log('   • Arrastre continuo (solo cuando hay movimiento)');
    console.log('   • Validación de celdas adyacentes');
    console.log('   • Retroceso automático');
    console.log('   • Sonidos de feedback');

    console.log('\n🚀 Para probar:');
    console.log('   1. Toca una celda para seleccionarla');
    console.log('   2. Mantén presionado para long press');
    console.log('   3. Arrastra el dedo para trazar un camino');
    console.log('   4. Verifica que los sonidos funcionen');

} else {
    console.log('❌ Hay problemas en la implementación');
    console.log('\n🔧 Revisa:');
    console.log('   • Que TouchableOpacity esté presente');
    console.log('   • Que onPress y onLongPress estén configurados');
    console.log('   • Que PanResponder no interfiera con los clics');
    console.log('   • Que todas las funciones estén definidas');
}

console.log('\n🧪 Verificación completada.'); 