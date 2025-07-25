const fs = require('fs');
const path = require('path');

console.log('🔧 Verificando fixes del path en Grid.tsx...\n');

const gridPath = path.join(__dirname, '..', 'components', 'Grid.tsx');
const gridContent = fs.readFileSync(gridPath, 'utf8');

// Verificar que los fixes están implementados
const checks = [
    {
        name: 'isCellValidNext usa pathRef.current.length',
        check: gridContent.includes('pathRef.current.length, \'celdas\'')
    },
    {
        name: 'isCellValidNext verifica pathRef.current.length === 0',
        check: gridContent.includes('if (pathRef.current.length === 0)')
    },
    {
        name: 'isCellValidNext usa pathRef.current para lastCell',
        check: gridContent.includes('const lastCell = pathRef.current[pathRef.current.length - 1]')
    },
    {
        name: 'isCellValidNext usa pathRef.current para findIndex',
        check: gridContent.includes('pathRef.current.findIndex(pathCell =>')
    },
    {
        name: 'isCellValidNext usa pathRef.current para filter',
        check: gridContent.includes('pathRef.current.filter(c => c.value !== null)')
    },
    {
        name: 'addCellToPath usa pathRef.current para slice',
        check: gridContent.includes('pathRef.current.slice(0, cellIndex + 1)')
    },
    {
        name: 'addCellToPath usa pathRef.current para spread',
        check: gridContent.includes('[...pathRef.current, cell]')
    }
];

let allPassed = true;

checks.forEach(check => {
    const status = check.check ? '✅' : '❌';
    console.log(`${status} ${check.name}`);
    if (!check.check) {
        allPassed = false;
    }
});

console.log('\n' + (allPassed ? '🎉 Todos los fixes están implementados correctamente!' : '⚠️ Algunos fixes faltan')); 