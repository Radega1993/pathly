const fs = require('fs');
const path = require('path');

console.log('🎮 Verificando renderizado del Grid...\n');

// Verificar que el archivo Grid.tsx existe
const gridPath = path.join(__dirname, '..', 'components', 'Grid.tsx');
if (!fs.existsSync(gridPath)) {
    console.error('❌ No se encontró el archivo Grid.tsx');
    process.exit(1);
}

// Leer el contenido del archivo
const gridContent = fs.readFileSync(gridPath, 'utf8');

console.log('🔍 Verificando estructura del componente:');

const structureChecks = [
    {
        name: 'Grid ref definido',
        result: gridContent.includes('const gridRef = useRef<View>(null)')
    },
    {
        name: 'Cell positions ref definido',
        result: gridContent.includes('cellPositionsRef = useRef<Map<string, { x: number; y: number; width: number; height: number }>>(new Map())')
    },
    {
        name: 'calculateCellPositions definida',
        result: gridContent.includes('const calculateCellPositions = () =>')
    },
    {
        name: 'useEffect para calcular posiciones',
        result: gridContent.includes('useEffect(() => {\n        calculateCellPositions();\n    }, [grid])')
    },
    {
        name: 'Grid renderizado con ref',
        result: gridContent.includes('<View\n                ref={gridRef}\n                style={styles.grid}\n                {...panResponder.panHandlers}')
    },
    {
        name: 'Celdas renderizadas como View',
        result: gridContent.includes('<View\n                                key={`${rowIndex}-${colIndex}`}\n                                style={[dynamicStyles.cell, ...getCellStyle(cell)]}')
    }
];

let allPassed = true;
structureChecks.forEach(check => {
    const status = check.result ? '✅' : '❌';
    console.log(`  ${status} ${check.name}`);
    if (!check.result) allPassed = false;
});

console.log('\n🎯 Verificando logs de debug:');

const logChecks = [
    {
        name: 'Logs en calculateCellPositions',
        result: gridContent.includes('console.log(\'🎯 calculateCellPositions: Starting calculation\')')
    },
    {
        name: 'Logs en findCellAtPosition',
        result: gridContent.includes('console.log(\'🎯 findCellAtPosition: Looking for position')
    },
    {
        name: 'Logs en processDragMove',
        result: gridContent.includes('console.log(\'🎯 processDragMove: Called with')
    },
    {
        name: 'Logs en PanResponder',
        result: gridContent.includes('console.log(\'🎯 PanResponder: onStartShouldSetPanResponder')
    }
];

logChecks.forEach(check => {
    const status = check.result ? '✅' : '❌';
    console.log(`  ${status} ${check.name}`);
    if (!check.result) allPassed = false;
});

console.log('\n📊 Resumen:');

if (allPassed) {
    console.log('🎉 ¡El componente Grid está configurado correctamente!');
    console.log('\n✅ Estructura verificada:');
    console.log('   • Referencias definidas correctamente');
    console.log('   • Cálculo de posiciones implementado');
    console.log('   • useEffect configurado');
    console.log('   • Grid renderizado con ref y panHandlers');
    console.log('   • Celdas renderizadas como View');
    console.log('   • Logs de debug agregados');

    console.log('\n🚀 Para diagnosticar:');
    console.log('   1. Ejecuta la app y observa los logs');
    console.log('   2. Verifica que calculateCellPositions se ejecute');
    console.log('   3. Verifica que findCellAtPosition encuentre celdas');
    console.log('   4. Verifica que PanResponder capture eventos');
    console.log('   5. Verifica que processDragMove se ejecute');

} else {
    console.log('❌ Hay problemas en la estructura del componente');
    console.log('\n🔧 Revisa:');
    console.log('   • Que las referencias estén definidas');
    console.log('   • Que calculateCellPositions esté implementada');
    console.log('   • Que useEffect esté configurado');
    console.log('   • Que el grid se renderice con ref y panHandlers');
    console.log('   • Que los logs estén agregados');
}

console.log('\n🧪 Verificación completada.'); 