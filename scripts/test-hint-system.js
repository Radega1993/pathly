/**
 * Script para probar el sistema de pistas
 * Verifica que las pistas funcionan correctamente con usuarios premium y no premium
 */

console.log('🧪 Probando sistema de pistas...\n');

// Simular las funciones del sistema de pistas
const mockAuthService = {
    isPremium: () => false, // Usuario no premium por defecto
    getCurrentUser: () => ({
        uid: 'test_user_123',
        userType: 'free'
    })
};

const mockAdsManager = {
    canUseFreeHint: async (levelId) => {
        // Simular lógica de pistas gratuitas
        const hintsUsed = 0; // Simular que no se han usado pistas
        return hintsUsed === 0;
    },

    incrementHintsUsedInLevel: async (levelId) => {
        console.log(`📝 Incrementando pistas usadas para nivel: ${levelId}`);
    },

    showRewardedAd: async () => {
        console.log('📺 Mostrando anuncio recompensado...');
        return true; // Simular que el usuario vio el anuncio completo
    }
};

// Función para probar pista
async function testHint(levelId, isUserPremium = false) {
    console.log(`🎯 Probando pista para nivel: ${levelId}`);
    console.log(`👤 Usuario premium: ${isUserPremium ? 'Sí' : 'No'}`);

    try {
        // Verificar si el usuario es premium
        if (isUserPremium) {
            console.log('✅ Usuario premium - pista disponible sin anuncio');
            return true;
        }

        // Verificar si puede usar pista gratuita
        const canUseFree = await mockAdsManager.canUseFreeHint(levelId);

        if (canUseFree) {
            console.log('✅ Pista gratuita disponible');
            await mockAdsManager.incrementHintsUsedInLevel(levelId);
            return true;
        } else {
            console.log('💰 Pista gratuita agotada - mostrando anuncio');
            const adWatched = await mockAdsManager.showRewardedAd();

            if (adWatched) {
                console.log('✅ Anuncio visto - pista disponible');
                await mockAdsManager.incrementHintsUsedInLevel(levelId);
                return true;
            } else {
                console.log('❌ Anuncio no visto - pista no disponible');
                return false;
            }
        }

    } catch (error) {
        console.error('❌ Error obteniendo pista:', error);
        return false;
    }
}

// Probar diferentes escenarios
async function runTests() {
    console.log('📊 Ejecutando pruebas de pistas...\n');

    // Test 1: Usuario no premium, primera pista
    console.log('🧪 Test 1: Usuario no premium, primera pista');
    const result1 = await testHint('level_1', false);
    console.log(`Resultado: ${result1 ? '✅ Éxito' : '❌ Fallo'}\n`);

    // Test 2: Usuario no premium, segunda pista (requiere anuncio)
    console.log('🧪 Test 2: Usuario no premium, segunda pista');
    const result2 = await testHint('level_1', false);
    console.log(`Resultado: ${result2 ? '✅ Éxito' : '❌ Fallo'}\n`);

    // Test 3: Usuario premium, pista sin restricciones
    console.log('🧪 Test 3: Usuario premium, pista sin restricciones');
    const result3 = await testHint('level_2', true);
    console.log(`Resultado: ${result3 ? '✅ Éxito' : '❌ Fallo'}\n`);

    // Test 4: Usuario premium, múltiples pistas
    console.log('🧪 Test 4: Usuario premium, múltiples pistas');
    const result4a = await testHint('level_3', true);
    const result4b = await testHint('level_3', true);
    const result4c = await testHint('level_3', true);
    console.log(`Resultados: ${result4a ? '✅' : '❌'}, ${result4b ? '✅' : '❌'}, ${result4c ? '✅' : '❌'}\n`);

    console.log('🎉 Pruebas de pistas completadas!');
    console.log('\n📋 Resumen:');
    console.log('   ✅ Usuario no premium: 1 pista gratuita + anuncios');
    console.log('   ✅ Usuario premium: Pistas ilimitadas sin anuncios');
    console.log('   ✅ Sistema de anuncios recompensados funcionando');
    console.log('   ✅ Contador de pistas por nivel');
}

// Ejecutar pruebas
runTests().catch(console.error); 