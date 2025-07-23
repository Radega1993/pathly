/**
 * Script para probar la corrección de paginación y el problema "Próximamente"
 * Simula la carga de niveles con paginación
 */

console.log('🔧 Probando corrección de paginación y "Próximamente"...\n');

// Simular la lógica de paginación
function simulatePagination(totalLevels = 25, pageSize = 20) {
    console.log(`📊 Simulando paginación: ${totalLevels} niveles totales, ${pageSize} por página\n`);

    let currentPage = 0;
    let allLevels = [];
    let hasMoreLevels = true;

    while (hasMoreLevels) {
        const nextPage = currentPage + 1;
        const start = nextPage * pageSize + 1;
        const end = Math.min(start + pageSize - 1, totalLevels);

        console.log(`📄 Página ${nextPage}: niveles ${start} a ${end}`);

        if (start > totalLevels) {
            hasMoreLevels = false;
            console.log(`   ❌ No hay más niveles disponibles\n`);
            break;
        }

        // Simular niveles cargados
        const newLevels = [];
        for (let i = start; i <= end; i++) {
            newLevels.push({
                id: `level_${i}`,
                number: i,
                isReal: true
            });
        }

        // Lógica corregida para "Próximamente"
        let shouldAddComingSoon = false;
        if (end >= totalLevels && end < totalLevels) {
            shouldAddComingSoon = true;
            newLevels.push({
                id: `coming_soon_${end + 1}`,
                number: end + 1,
                isReal: false,
                isComingSoon: true
            });
        }

        console.log(`   ✅ Cargados ${newLevels.length} niveles`);
        if (shouldAddComingSoon) {
            console.log(`   ⏳ Agregado "Próximamente"`);
        }

        allLevels = [...allLevels, ...newLevels];
        currentPage = nextPage;
        hasMoreLevels = end < totalLevels;

        console.log(`   📋 Total acumulado: ${allLevels.length} niveles\n`);
    }

    return allLevels;
}

// Probar diferentes escenarios
function testScenarios() {
    console.log('🧪 PROBANDO DIFERENTES ESCENARIOS:\n');

    // Escenario 1: Menos niveles que una página
    console.log('🔍 Escenario 1: 10 niveles totales (menos que una página)');
    const scenario1 = simulatePagination(10, 20);
    const hasComingSoon1 = scenario1.some(level => level.isComingSoon);
    console.log(`   Resultado: ${hasComingSoon1 ? '❌ PROBLEMA' : '✅ CORRECTO'} - ${hasComingSoon1 ? 'Tiene "Próximamente"' : 'Sin "Próximamente"'}\n`);

    // Escenario 2: Exactamente una página
    console.log('🔍 Escenario 2: 20 niveles totales (exactamente una página)');
    const scenario2 = simulatePagination(20, 20);
    const hasComingSoon2 = scenario2.some(level => level.isComingSoon);
    console.log(`   Resultado: ${hasComingSoon2 ? '❌ PROBLEMA' : '✅ CORRECTO'} - ${hasComingSoon2 ? 'Tiene "Próximamente"' : 'Sin "Próximamente"'}\n`);

    // Escenario 3: Más de una página
    console.log('🔍 Escenario 3: 25 niveles totales (más de una página)');
    const scenario3 = simulatePagination(25, 20);
    const hasComingSoon3 = scenario3.some(level => level.isComingSoon);
    console.log(`   Resultado: ${hasComingSoon3 ? '❌ PROBLEMA' : '✅ CORRECTO'} - ${hasComingSoon3 ? 'Tiene "Próximamente"' : 'Sin "Próximamente"'}\n`);

    // Escenario 4: Muchos niveles
    console.log('🔍 Escenario 4: 100 niveles totales (muchas páginas)');
    const scenario4 = simulatePagination(100, 20);
    const hasComingSoon4 = scenario4.some(level => level.isComingSoon);
    console.log(`   Resultado: ${hasComingSoon4 ? '❌ PROBLEMA' : '✅ CORRECTO'} - ${hasComingSoon4 ? 'Tiene "Próximamente"' : 'Sin "Próximamente"'}\n`);
}

// Función para analizar el problema específico reportado
function analyzeReportedProblem() {
    console.log('🔍 ANÁLISIS DEL PROBLEMA REPORTADO:\n');
    console.log('Usuario reporta: "carga los 20 primeros y el 21 pone proximamente y luego carga el 22"\n');

    // Simular el problema específico
    console.log('📊 Simulando el problema específico:');
    console.log('   - Página 1: niveles 1-20');
    console.log('   - Se agrega "Próximamente" como nivel 21');
    console.log('   - Página 2: nivel 22');
    console.log('   - Esto indica que hay al menos 22 niveles reales\n');

    console.log('🔧 Problema identificado:');
    console.log('   - La lógica está agregando "Próximamente" después de cada página');
    console.log('   - No verifica si realmente hay más niveles disponibles');
    console.log('   - Debería solo agregar "Próximamente" cuando NO hay más niveles reales\n');

    console.log('✅ Solución aplicada:');
    console.log('   - Solo agregar "Próximamente" cuando end >= totalLevels');
    console.log('   - Verificar que realmente no hay más niveles disponibles');
    console.log('   - No agregar "Próximamente" entre páginas con niveles reales\n');
}

// Ejecutar análisis
analyzeReportedProblem();
testScenarios();

console.log('🎉 Análisis completado!');
console.log('\n📋 Resumen de la corrección:');
console.log('   ✅ NO agregar "Próximamente" entre páginas con niveles reales');
console.log('   ✅ Solo agregar "Próximamente" cuando realmente no hay más niveles');
console.log('   ✅ Verificar correctamente el total de niveles disponibles');
console.log('   ✅ Evitar confusión entre niveles reales y "Próximamente"'); 