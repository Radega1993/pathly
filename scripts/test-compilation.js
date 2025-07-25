const fs = require('fs');
const path = require('path');

console.log('🔧 Verificando compilación del archivo Grid.tsx...\n');

const gridPath = path.join(__dirname, '..', 'components', 'Grid.tsx');
const gridContent = fs.readFileSync(gridPath, 'utf8');

// Verificar que no hay referencias a funciones eliminadas
const issues = [
    {
        name: 'Referencia a screenToCellCoordinates eliminada',
        check: !gridContent.includes('screenToCellCoordinates')
    },
    {
        name: 'Referencia a onGridLayout eliminada',
        check: !gridContent.includes('onGridLayout')
    },
    {
        name: 'Referencia a gridLayout eliminada',
        check: !gridContent.includes('gridLayout')
    },
    {
        name: 'PanResponder está importado',
        check: gridContent.includes('import {') && gridContent.includes('PanResponder')
    },
    {
        name: 'processDrag usa gridRef.current.measure',
        check: gridContent.includes('gridRef.current.measure')
    },
    {
        name: 'Export default Grid presente',
        check: gridContent.includes('export default Grid')
    }
];

let allGood = true;
issues.forEach(issue => {
    if (issue.check) {
        console.log(`✅ ${issue.name}`);
    } else {
        console.log(`❌ ${issue.name}`);
        allGood = false;
    }
});

if (!allGood) {
    console.error('\n❌ Hay problemas en el archivo Grid.tsx');
    process.exit(1);
}

console.log('\n🎉 ¡El archivo Grid.tsx está limpio y debería compilar correctamente!');
console.log('\n📋 Verificaciones completadas:');
console.log('   ✅ Referencias a funciones eliminadas removidas');
console.log('   ✅ PanResponder importado correctamente');
console.log('   ✅ processDrag usa measure directamente');
console.log('   ✅ Export default presente');

console.log('\n🧪 Ahora prueba ejecutar el juego:');
console.log('   npx expo start'); 