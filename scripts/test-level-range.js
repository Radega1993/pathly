/**
 * Script para probar la lógica de rango de niveles
 * Verifica que no se muestre "Próximamente" en el último nivel
 */

console.log('🧪 Probando lógica de rango de niveles...\n');

// Simular la función getOptimalLevelRange
function getOptimalLevelRange(userProgress, maxLevel, pageSize = 20) {
    // Calcular el nivel actual del usuario (siguiente a completar)
    const currentLevel = userProgress + 1;

    // Determinar el rango óptimo
    let start = Math.max(1, currentLevel - 5); // 5 niveles antes del actual
    let end = Math.min(maxLevel, start + pageSize - 1);

    // Ajustar si estamos cerca del final
    if (end === maxLevel && start > 1) {
        start = Math.max(1, end - pageSize + 1);
    }

    // Solo mostrar "cargar más" si realmente hay más niveles después del rango actual
    const shouldLoadMore = end < maxLevel;

    console.log(`🎯 Rango óptimo: ${start}-${end}, maxLevel: ${maxLevel}, shouldLoadMore: ${shouldLoadMore}`);

    return { start, end, shouldLoadMore };
}

// Función para simular la lógica de agregar "Próximamente"
function shouldAddComingSoon(shouldLoadMore, end, totalAvailable) {
    return shouldLoadMore && end < totalAvailable;
}

// Probar diferentes escenarios
function testScenarios() {
    console.log('📊 Probando diferentes escenarios:\n');

    // Escenario 1: Usuario nuevo, pocos niveles disponibles
    console.log('🧪 Escenario 1: Usuario nuevo (0 completados), 10 niveles totales');
    const scenario1 = getOptimalLevelRange(0, 10, 20);
    const shouldAdd1 = shouldAddComingSoon(scenario1.shouldLoadMore, scenario1.end, 10);
    console.log(`   Rango: ${scenario1.start}-${scenario1.end}`);
    console.log(`   shouldLoadMore: ${scenario1.shouldLoadMore}`);
    console.log(`   ¿Agregar "Próximamente"?: ${shouldAdd1 ? 'SÍ ❌' : 'NO ✅'}\n`);

    // Escenario 2: Usuario intermedio, muchos niveles disponibles
    console.log('🧪 Escenario 2: Usuario intermedio (50 completados), 100 niveles totales');
    const scenario2 = getOptimalLevelRange(50, 100, 20);
    const shouldAdd2 = shouldAddComingSoon(scenario2.shouldLoadMore, scenario2.end, 100);
    console.log(`   Rango: ${scenario2.start}-${scenario2.end}`);
    console.log(`   shouldLoadMore: ${scenario2.shouldLoadMore}`);
    console.log(`   ¿Agregar "Próximamente"?: ${shouldAdd2 ? 'SÍ ✅' : 'NO ❌'}\n`);

    // Escenario 3: Usuario avanzado, cerca del final
    console.log('🧪 Escenario 3: Usuario avanzado (95 completados), 100 niveles totales');
    const scenario3 = getOptimalLevelRange(95, 100, 20);
    const shouldAdd3 = shouldAddComingSoon(scenario3.shouldLoadMore, scenario3.end, 100);
    console.log(`   Rango: ${scenario3.start}-${scenario3.end}`);
    console.log(`   shouldLoadMore: ${scenario3.shouldLoadMore}`);
    console.log(`   ¿Agregar "Próximamente"?: ${shouldAdd3 ? 'SÍ ❌' : 'NO ✅'}\n`);

    // Escenario 4: Usuario en el último nivel
    console.log('🧪 Escenario 4: Usuario en último nivel (99 completados), 100 niveles totales');
    const scenario4 = getOptimalLevelRange(99, 100, 20);
    const shouldAdd4 = shouldAddComingSoon(scenario4.shouldLoadMore, scenario4.end, 100);
    console.log(`   Rango: ${scenario4.start}-${scenario4.end}`);
    console.log(`   shouldLoadMore: ${scenario4.shouldLoadMore}`);
    console.log(`   ¿Agregar "Próximamente"?: ${shouldAdd4 ? 'SÍ ❌' : 'NO ✅'}\n`);

    // Escenario 5: Usuario que completó todos los niveles
    console.log('🧪 Escenario 5: Usuario completó todo (100 completados), 100 niveles totales');
    const scenario5 = getOptimalLevelRange(100, 100, 20);
    const shouldAdd5 = shouldAddComingSoon(scenario5.shouldLoadMore, scenario5.end, 100);
    console.log(`   Rango: ${scenario5.start}-${scenario5.end}`);
    console.log(`   shouldLoadMore: ${scenario5.shouldLoadMore}`);
    console.log(`   ¿Agregar "Próximamente"?: ${shouldAdd5 ? 'SÍ ❌' : 'NO ✅'}\n`);

    // Escenario 6: Caso límite - exactamente en el final
    console.log('🧪 Escenario 6: Caso límite - rango termina exactamente en maxLevel');
    const scenario6 = getOptimalLevelRange(80, 100, 20);
    const shouldAdd6 = shouldAddComingSoon(scenario6.shouldLoadMore, scenario6.end, 100);
    console.log(`   Rango: ${scenario6.start}-${scenario6.end}`);
    console.log(`   shouldLoadMore: ${scenario6.shouldLoadMore}`);
    console.log(`   ¿Agregar "Próximamente"?: ${shouldAdd6 ? 'SÍ ❌' : 'NO ✅'}\n`);
}

// Ejecutar pruebas
testScenarios();

console.log('🎉 Pruebas de rango de niveles completadas!');
console.log('\n📋 Resumen esperado:');
console.log('   ✅ Usuario nuevo: NO mostrar "Próximamente"');
console.log('   ✅ Usuario intermedio: SÍ mostrar "Próximamente"');
console.log('   ✅ Usuario avanzado: NO mostrar "Próximamente"');
console.log('   ✅ Usuario en último nivel: NO mostrar "Próximamente"');
console.log('   ✅ Usuario completó todo: NO mostrar "Próximamente"');
console.log('   ✅ Caso límite: NO mostrar "Próximamente"'); 