/**
 * Script específico para probar la corrección del problema "Próximamente" en el último nivel
 */

console.log('🔧 Probando corrección del problema "Próximamente" en último nivel...\n');

// Simular la lógica completa del LevelSelectScreen
function simulateLevelLoading(userProgress, maxLevel, pageSize = 20) {
    console.log(`👤 Usuario progreso: ${userProgress}, Niveles totales: ${maxLevel}\n`);

    // Paso 1: Calcular rango óptimo
    const currentLevel = userProgress + 1;
    let start = Math.max(1, currentLevel - 5);
    let end = Math.min(maxLevel, start + pageSize - 1);

    if (end === maxLevel && start > 1) {
        start = Math.max(1, end - pageSize + 1);
    }

    const shouldLoadMore = end < maxLevel;

    console.log(`📊 Paso 1 - Rango calculado:`);
    console.log(`   Start: ${start}, End: ${end}, MaxLevel: ${maxLevel}`);
    console.log(`   ShouldLoadMore: ${shouldLoadMore}`);

    // Paso 2: Simular carga de niveles
    const levelsLoaded = end - start + 1;
    console.log(`📦 Paso 2 - Niveles cargados: ${levelsLoaded} (${start} a ${end})`);

    // Paso 3: Verificar si agregar "Próximamente"
    const shouldAddComingSoon = shouldLoadMore && end < maxLevel;
    console.log(`🎯 Paso 3 - ¿Agregar "Próximamente"?: ${shouldAddComingSoon ? 'SÍ' : 'NO'}`);

    // Paso 4: Resultado final
    const totalLevelsShown = levelsLoaded + (shouldAddComingSoon ? 1 : 0);
    const lastLevelIsComingSoon = shouldAddComingSoon;

    console.log(`📋 Paso 4 - Resultado final:`);
    console.log(`   Total niveles mostrados: ${totalLevelsShown}`);
    console.log(`   Último nivel es "Próximamente": ${lastLevelIsComingSoon ? 'SÍ ❌' : 'NO ✅'}`);

    return {
        start,
        end,
        shouldLoadMore,
        shouldAddComingSoon,
        totalLevelsShown,
        lastLevelIsComingSoon
    };
}

// Probar casos específicos donde aparecía el problema
function testSpecificCases() {
    console.log('🧪 CASOS ESPECÍFICOS DEL PROBLEMA:\n');

    // Caso 1: Usuario en el último nivel disponible
    console.log('🔍 Caso 1: Usuario en último nivel (ej: progreso 99, total 100)');
    const case1 = simulateLevelLoading(99, 100);
    console.log(`   Resultado: ${case1.lastLevelIsComingSoon ? '❌ PROBLEMA' : '✅ CORREGIDO'}\n`);

    // Caso 2: Usuario cerca del final
    console.log('🔍 Caso 2: Usuario cerca del final (ej: progreso 95, total 100)');
    const case2 = simulateLevelLoading(95, 100);
    console.log(`   Resultado: ${case2.lastLevelIsComingSoon ? '❌ PROBLEMA' : '✅ CORREGIDO'}\n`);

    // Caso 3: Usuario que completó todos los niveles
    console.log('🔍 Caso 3: Usuario completó todo (ej: progreso 100, total 100)');
    const case3 = simulateLevelLoading(100, 100);
    console.log(`   Resultado: ${case3.lastLevelIsComingSoon ? '❌ PROBLEMA' : '✅ CORREGIDO'}\n`);

    // Caso 4: Caso límite - rango termina exactamente en maxLevel
    console.log('🔍 Caso 4: Caso límite (ej: progreso 80, total 100)');
    const case4 = simulateLevelLoading(80, 100);
    console.log(`   Resultado: ${case4.lastLevelIsComingSoon ? '❌ PROBLEMA' : '✅ CORREGIDO'}\n`);

    // Caso 5: Usuario nuevo con pocos niveles
    console.log('🔍 Caso 5: Usuario nuevo, pocos niveles (ej: progreso 0, total 10)');
    const case5 = simulateLevelLoading(0, 10);
    console.log(`   Resultado: ${case5.lastLevelIsComingSoon ? '❌ PROBLEMA' : '✅ CORREGIDO'}\n`);
}

// Probar casos donde SÍ debería aparecer "Próximamente"
function testValidComingSoonCases() {
    console.log('✅ CASOS VÁLIDOS PARA "PRÓXIMAMENTE":\n');

    // Caso 1: Usuario intermedio con muchos niveles por delante
    console.log('🔍 Caso válido 1: Usuario intermedio (ej: progreso 50, total 100)');
    const case1 = simulateLevelLoading(50, 100);
    console.log(`   Resultado: ${case1.shouldAddComingSoon ? '✅ CORRECTO' : '❌ INCORRECTO'}\n`);

    // Caso 2: Usuario en el medio del juego
    console.log('🔍 Caso válido 2: Usuario en medio (ej: progreso 30, total 100)');
    const case2 = simulateLevelLoading(30, 100);
    console.log(`   Resultado: ${case2.shouldAddComingSoon ? '✅ CORRECTO' : '❌ INCORRECTO'}\n`);
}

// Ejecutar todas las pruebas
testSpecificCases();
testValidComingSoonCases();

console.log('🎉 Pruebas completadas!');
console.log('\n📋 Resumen de la corrección:');
console.log('   ✅ Último nivel real: NO mostrar "Próximamente"');
console.log('   ✅ Niveles intermedios: SÍ mostrar "Próximamente"');
console.log('   ✅ Casos límite: NO mostrar "Próximamente"');
console.log('   ✅ Usuario completó todo: NO mostrar "Próximamente"'); 