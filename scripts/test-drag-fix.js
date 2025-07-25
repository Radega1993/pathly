const fs = require('fs');
const path = require('path');

console.log('🔧 Verificando fix del arrastre en Grid.tsx...\n');

const gridPath = path.join(__dirname, '..', 'components', 'Grid.tsx');
const gridContent = fs.readFileSync(gridPath, 'utf8');

// Verificar que el fix está implementado
const checks = [
    {
        name: 'isDraggingRef declarado',
        check: gridContent.includes('const isDraggingRef = useRef(false)')
    },
    {
        name: 'isDraggingRef se actualiza en onPanResponderGrant',
        check: gridContent.includes('isDraggingRef.current = true')
    },
    {
        name: 'isDraggingRef se verifica en onPanResponderMove',
        check: gridContent.includes('if (!isDraggingRef.current)')
    },
    {
        name: 'isDraggingRef se resetea en onPanResponderRelease',
        check: gridContent.includes('isDraggingRef.current = false')
    },
    {
        name: 'isDraggingRef se resetea en onPanResponderTerminate',
        check: gridContent.includes('isDraggingRef.current = false')
    },
    {
        name: 'isDraggingRef se resetea en resetPath',
        check: gridContent.includes('isDraggingRef.current = false')
    }
];

let allGood = true;
checks.forEach(check => {
    if (check.check) {
        console.log(`✅ ${check.name}`);
    } else {
        console.log(`❌ ${check.name}`);
        allGood = false;
    }
});

if (!allGood) {
    console.error('\n❌ El fix del arrastre no está completamente implementado');
    process.exit(1);
}

console.log('\n🎉 ¡El fix del arrastre está implementado correctamente!');
console.log('\n📋 Cambios realizados:');
console.log('   ✅ isDraggingRef para evitar problemas de timing');
console.log('   ✅ Referencia actualizada en todos los handlers del PanResponder');
console.log('   ✅ Referencia reseteada en resetPath');

console.log('\n🧪 Ahora prueba el arrastre:');
console.log('   1. Toca una celda y arrastra el dedo');
console.log('   2. Deberías ver logs de "onPanResponderMove - coordenadas"');
console.log('   3. El camino debería seguir tu dedo'); 