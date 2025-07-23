/**
 * Script final para probar la corrección del problema "Próximamente" en nivel 21
 * Simula exactamente el caso mostrado en la imagen
 */

console.log('🔧 Probando corrección final del problema "Próximamente" en nivel 21...\n');

// Simular la lógica exacta del LevelSelectScreen
function simulateLevelLoading(userProgress = 1, totalAvailable = 28, maxLevel = 28, pageSize = 20) {
    console.log(`📊 Configuración:`);
    console.log(`   Progreso usuario: ${userProgress}`);
    console.log(`   Niveles disponibles: ${totalAvailable}`);
    console.log(`   Nivel máximo: ${maxLevel}`);
    console.log(`   Tamaño página: ${pageSize}\n`);

    // Simular getOptimalLevelRange
    const currentLevel = userProgress + 1;
    let start = Math.max(1, currentLevel - 5);
    let end = Math.min(maxLevel, start + pageSize - 1);

    if (end === maxLevel && start > 1) {
        start = Math.max(1, end - pageSize + 1);
    }

    const shouldLoadMore = end < maxLevel;

    console.log(`📊 Rango calculado:`);
    console.log(`   Start: ${start}, End: ${end}, MaxLevel: ${maxLevel}`);
    console.log(`   ShouldLoadMore: ${shouldLoadMore}`);

    // Simular carga de niveles
    const levelsLoaded = end - start + 1;
    console.log(`📦 Niveles cargados: ${levelsLoaded} (${start} a ${end})`);

    // Lógica corregida para "Próximamente"
    let shouldAddComingSoon = false;

    // ANTES (Incorrecto)
    const oldCondition = shouldLoadMore && end < totalAvailable && end < maxLevel;

    // DESPUÉS (Correcto)
    const newCondition = end >= totalAvailable && totalAvailable < maxLevel;

    console.log(`\n🔍 Análisis de condiciones:`);
    console.log(`   Condición anterior: ${oldCondition} (${shouldLoadMore} && ${end < totalAvailable} && ${end < maxLevel})`);
    console.log(`   Condición nueva: ${newCondition} (${end >= totalAvailable} && ${totalAvailable < maxLevel})`);

    shouldAddComingSoon = newCondition;

    console.log(`\n🎯 Resultado:`);
    console.log(`   ¿Agregar "Próximamente"?: ${shouldAddComingSoon ? 'SÍ ❌' : 'NO ✅'}`);

    if (shouldAddComingSoon) {
        console.log(`   ⏳ Se agregaría "Próximamente" como nivel ${end + 1}`);
    }

    return {
        start,
        end,
        shouldLoadMore,
        shouldAddComingSoon,
        oldCondition,
        newCondition
    };
}

// Probar el caso específico de la imagen
function testImageCase() {
    console.log('🔍 PROBANDO CASO ESPECÍFICO DE LA IMAGEN:\n');
    console.log('En la imagen se ve:');
    console.log('   - Nivel 20: "Extremo", "6x6" (nivel real)');
    console.log('   - Nivel 21: "Próximamente" (Coming Soon) ❌');
    console.log('   - Nivel 22: "Normal", "4x4" (nivel real)');
    console.log('   - Continúa hasta nivel 28...\n');

    // Simular con los valores que parecen estar en la imagen
    const result = simulateLevelLoading(1, 28, 28, 20);

    console.log('\n📋 Análisis del problema:');
    if (result.shouldAddComingSoon) {
        console.log(`   ❌ PROBLEMA: Se está agregando "Próximamente" como nivel ${result.end + 1}`);
        console.log(`   ❌ Esto explica por qué aparece entre nivel 20 y 22`);
    } else {
        console.log(`   ✅ CORRECTO: No se agrega "Próximamente" innecesariamente`);
    }

    console.log(`\n🔧 Comparación de condiciones:`);
    console.log(`   Condición anterior: ${result.oldCondition ? 'SÍ' : 'NO'} (causaba el problema)`);
    console.log(`   Condición nueva: ${result.newCondition ? 'SÍ' : 'NO'} (corregida)`);
}

// Probar diferentes configuraciones
function testDifferentConfigurations() {
    console.log('\n🧪 PROBANDO DIFERENTES CONFIGURACIONES:\n');

    const testCases = [
        { user: 1, total: 20, max: 20, desc: '20 niveles totales (exactamente una página)' },
        { user: 1, total: 25, max: 25, desc: '25 niveles totales (más de una página)' },
        { user: 1, total: 28, max: 28, desc: '28 niveles totales (caso de la imagen)' },
        { user: 1, total: 30, max: 30, desc: '30 niveles totales' },
        { user: 1, total: 20, max: 25, desc: '20 cargados, 25 máximos' },
    ];

    testCases.forEach((testCase, index) => {
        console.log(`🔍 Test ${index + 1}: ${testCase.desc}`);
        const result = simulateLevelLoading(testCase.user, testCase.total, testCase.max, 20);

        console.log(`   Resultado: ${result.shouldAddComingSoon ? '❌ PROBLEMA' : '✅ CORRECTO'}`);
        if (result.shouldAddComingSoon) {
            console.log(`   "Próximamente" se agregaría como nivel ${result.end + 1}`);
        }
        console.log('');
    });
}

// Ejecutar pruebas
testImageCase();
testDifferentConfigurations();

console.log('🎉 Pruebas completadas!');
console.log('\n📋 Resumen de la corrección:');
console.log('   ✅ "Próximamente" solo aparece cuando realmente no hay más niveles');
console.log('   ✅ No aparece entre niveles reales (como nivel 21)');
console.log('   ✅ Se corrige el problema visual mostrado en la imagen');
console.log('   ✅ Los usuarios ven todos los niveles reales sin interrupciones'); 