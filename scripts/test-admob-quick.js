#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 AdMob Quick Test - Pathly Game');
console.log('==================================\n');

// Verificar configuración actual
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    let currentConfig = {};
    lines.forEach(line => {
        if (line.startsWith('ADMOB_')) {
            const [key, value] = line.split('=');
            currentConfig[key] = value;
        }
    });

    console.log('📋 Configuración actual:');
    console.log(`   App ID: ${currentConfig['ADMOB_ANDROID_APP_ID']}`);
    console.log(`   Interstitial: ${currentConfig['ADMOB_INTERSTITIAL_ID']}`);
    console.log(`   Rewarded: ${currentConfig['ADMOB_REWARDED_ID']}`);
    console.log(`   Debug Mode: ${currentConfig['ADMOB_DEBUG_MODE']}`);

    // Detectar si son IDs de test o producción
    const isTest = currentConfig['ADMOB_ANDROID_APP_ID']?.includes('3940256099942544');
    console.log(`   Modo: ${isTest ? 'TEST' : 'PRODUCCIÓN'}`);
}

console.log('\n📱 Instrucciones de prueba:');
console.log('   1. Ejecuta: npx expo run:android');
console.log('   2. En la app, prueba una pista (segunda pista del nivel)');
console.log('   3. Completa 3 niveles para probar anuncio intersticial');
console.log('   4. Verifica los logs en la terminal');

console.log('\n🔍 Logs a buscar:');
console.log('   ✅ Interstitial ad loaded');
console.log('   ✅ Rewarded ad loaded successfully');
console.log('   ✅ Rewarded ad loaded event fired');

console.log('\n❌ Si ves errores:');
console.log('   - "Rewarded ad failed to load" → Problema de configuración');
console.log('   - "Load timeout" → Problema de red o configuración');
console.log('   - "Ad unit doesn\'t match format" → ID incorrecto');

console.log('\n✅ Listo para probar!'); 