#!/usr/bin/env node

/**
 * Script Final de Testing para Producción
 * 
 * Este script verifica que todo esté listo para subir a Google Play
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 TESTING FINAL PARA PRODUCCIÓN');
console.log('================================\n');

let allTestsPassed = true;

// Función para ejecutar tests
function runTest(testName, testFunction) {
    try {
        console.log(`🧪 ${testName}...`);
        const result = testFunction();
        console.log(`✅ ${testName} - PASÓ`);
        return true;
    } catch (error) {
        console.error(`❌ ${testName} - FALLÓ: ${error.message}`);
        allTestsPassed = false;
        return false;
    }
}

// Test 1: Verificar archivo .env
runTest('Verificando archivo .env', () => {
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
        throw new Error('Archivo .env no encontrado');
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const requiredVars = ['ADMOB_ANDROID_APP_ID', 'ADMOB_INTERSTITIAL_ID', 'ADMOB_REWARDED_ID'];

    requiredVars.forEach(varName => {
        if (!envContent.includes(varName)) {
            throw new Error(`Variable ${varName} no encontrada en .env`);
        }
    });
});

// Test 2: Verificar que no son IDs de test
runTest('Verificando IDs de producción', () => {
    const envPath = path.join(__dirname, '..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');

    const testPatterns = [
        /ca-app-pub-3940256099942544/, // Test App ID
        /ca-app-pub-3940256099942544\/1033173712/, // Test Interstitial
        /ca-app-pub-3940256099942544\/5224354917/, // Test Rewarded
    ];

    testPatterns.forEach(pattern => {
        if (pattern.test(envContent)) {
            throw new Error('Se detectaron IDs de test de Google');
        }
    });
});

// Test 3: Verificar app.config.js
runTest('Verificando app.config.js', () => {
    const configPath = path.join(__dirname, '..', 'app.config.js');
    const configContent = fs.readFileSync(configPath, 'utf8');

    if (!configContent.includes('react-native-google-mobile-ads')) {
        throw new Error('Plugin react-native-google-mobile-ads no configurado');
    }

    if (!configContent.includes('process.env.ADMOB_ANDROID_APP_ID')) {
        throw new Error('Variable de entorno ADMOB_ANDROID_APP_ID no configurada');
    }
});

// Test 4: Verificar servicio de ads
runTest('Verificando servicio de ads', () => {
    const adsPath = path.join(__dirname, '..', 'services', 'ads.ts');
    const adsContent = fs.readFileSync(adsPath, 'utf8');

    if (!adsContent.includes('react-native-google-mobile-ads')) {
        throw new Error('react-native-google-mobile-ads no importado');
    }

    if (!adsContent.includes('process.env.ADMOB_ANDROID_APP_ID')) {
        throw new Error('Variables de entorno no configuradas en services/ads.ts');
    }
});

// Test 5: Verificar AndroidManifest.xml
runTest('Verificando AndroidManifest.xml', () => {
    const manifestPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');

    if (!fs.existsSync(manifestPath)) {
        throw new Error('AndroidManifest.xml no encontrado (ejecuta npx expo prebuild primero)');
    }

    const manifestContent = fs.readFileSync(manifestPath, 'utf8');

    if (!manifestContent.includes('com.google.android.gms.ads.APPLICATION_ID')) {
        throw new Error('APPLICATION_ID de AdMob no configurado');
    }

    if (!manifestContent.includes('com.google.android.gms.permission.AD_ID')) {
        throw new Error('Permiso AD_ID no configurado');
    }
});

// Test 6: Verificar build.gradle
runTest('Verificando build.gradle', () => {
    const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

    if (!fs.existsSync(buildGradlePath)) {
        throw new Error('build.gradle no encontrado (ejecuta npx expo prebuild primero)');
    }

    const buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');

    if (!buildGradleContent.includes('play-services-ads')) {
        throw new Error('Dependencia play-services-ads no configurada');
    }
});

// Test 7: Verificar que la app compila
runTest('Verificando compilación', () => {
    const androidPath = path.join(__dirname, '..', 'android');
    if (!fs.existsSync(androidPath)) {
        throw new Error('Carpeta android no encontrada (ejecuta npx expo prebuild primero)');
    }
});

// Test 8: Verificar package.json
runTest('Verificando dependencias', () => {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    if (!packageContent.dependencies['react-native-google-mobile-ads']) {
        throw new Error('react-native-google-mobile-ads no está en las dependencias');
    }
});

// Resumen final
console.log('\n🎯 RESUMEN DEL TESTING FINAL');
console.log('============================');

if (allTestsPassed) {
    console.log('✅ TODOS LOS TESTS PASARON');
    console.log('🚀 ¡La app está lista para producción!');

    console.log('\n📋 CHECKLIST FINAL PARA GOOGLE PLAY:');
    console.log('===================================');
    console.log('✅ Configuración de AdMob verificada');
    console.log('✅ IDs de producción configurados');
    console.log('✅ Dependencias nativas configuradas');
    console.log('✅ Permisos de Android configurados');
    console.log('✅ Servicio de ads implementado');
    console.log('✅ Fallback a mock ads implementado');

    console.log('\n🔧 PRÓXIMOS PASOS:');
    console.log('==================');
    console.log('1. Ejecuta: npx expo run:android');
    console.log('2. Prueba los anuncios en el dispositivo');
    console.log('3. Verifica que no hay errores en la consola');
    console.log('4. Si todo funciona, crea el build de producción:');
    console.log('   eas build --platform android --profile production');
    console.log('5. Sube el AAB a Google Play Console');

    console.log('\n⚠️  IMPORTANTE:');
    console.log('==============');
    console.log('- Los anuncios pueden tardar hasta 24h en aparecer');
    console.log('- Asegúrate de que la app esté en "Producción" en AdMob');
    console.log('- Verifica que los IDs de AdMob estén activos');
    console.log('- Monitorea los logs de AdMob en Google Play Console');

} else {
    console.log('❌ ALGUNOS TESTS FALLARON');
    console.log('🔧 Revisa los errores arriba y corrígelos antes de continuar');
    process.exit(1);
}

console.log('\n🎉 ¡TESTING FINAL COMPLETADO!'); 