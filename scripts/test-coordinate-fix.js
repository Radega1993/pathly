const fs = require('fs');
const path = require('path');

console.log('🔧 Verificando fix de coordenadas en Grid.tsx...\n');

const gridPath = path.join(__dirname, '..', 'components', 'Grid.tsx');
const gridContent = fs.readFileSync(gridPath, 'utf8');

// Verificar que el fix está implementado
const checks = [
    {
        name: 'cellMargin definido',
        check: gridContent.includes('const cellMargin = 1')
    },
    {
        name: 'gridPadding definido',
        check: gridContent.includes('const gridPadding = 4')
    },
    {
        name: 'adjustedX calculado',
        check: gridContent.includes('adjustedX = relativeX - gridPadding')
    },
    {
        name: 'adjustedY calculado',
        check: gridContent.includes('adjustedY = relativeY - gridPadding')
    },
    {
        name: 'cellX calculado con márgenes',
        check: gridContent.includes('cellX = Math.floor(adjustedX / (cellSize + cellMargin * 2))')
    },
    {
        name: 'cellY calculado con márgenes',
        check: gridContent.includes('cellY = Math.floor(adjustedY / (cellSize + cellMargin * 2))')
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
    console.error('\n❌ El fix de coordenadas no está completamente implementado');
    process.exit(1);
}

console.log('\n🎉 ¡El fix de coordenadas está implementado correctamente!');
console.log('\n📋 Cambios realizados:');
console.log('   ✅ Consideración de padding del grid (4px)');
console.log('   ✅ Consideración de márgenes entre celdas (1px cada lado)');
console.log('   ✅ Cálculo ajustado de coordenadas de celda');

console.log('\n🧪 Ahora prueba el arrastre:');
console.log('   1. Haz clic en el número 1 para iniciar el camino');
console.log('   2. Ahora arrastra el dedo - debería detectar las celdas correctamente');
console.log('   3. Los logs deberían mostrar coordenadas correctas (0,0), (0,1), etc.)');
console.log('   4. El camino debería seguir tu dedo sin problemas'); 