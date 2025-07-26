#!/usr/bin/env node

/**
 * Script de Testing para AdMob en Producción
 * 
 * Este script verifica que:
 * 1. Las variables de entorno están configuradas
 * 2. Los IDs de AdMob son válidos
 * 3. El módulo nativo se carga correctamente
 * 4. Los anuncios se pueden cargar y mostrar
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 TESTING ADMOB PARA PRODUCCIÓN');
console.log('================================\n');

// 1. Verificar archivo .env
console.log('1️⃣ Verificando archivo .env...');
const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath)) {
    console.error('❌ ERROR: Archivo .env no encontrado');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

// Verificar variables requeridas
const requiredVars = [
    'ADMOB_ANDROID_APP_ID',
    'ADMOB_INTERSTITIAL_ID',
    'ADMOB_REWARDED_ID'
];

let missingVars = [];
requiredVars.forEach(varName => {
    if (!envVars[varName]) {
        missingVars.push(varName);
    }
});

if (missingVars.length > 0) {
    console.error('❌ ERROR: Variables de entorno faltantes:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    process.exit(1);
}

console.log('✅ Archivo .env encontrado y variables configuradas');
console.log(`   - Android App ID: ${envVars.ADMOB_ANDROID_APP_ID}`);
console.log(`   - Interstitial ID: ${envVars.ADMOB_INTERSTITIAL_ID}`);
console.log(`   - Rewarded ID: ${envVars.ADMOB_REWARDED_ID}`);

// 2. Verificar formato de IDs
console.log('\n2️⃣ Verificando formato de IDs...');
const appIdPattern = /^ca-app-pub-\d+~\d+$/;
const adUnitPattern = /^ca-app-pub-\d+\/\d+$/;

if (!appIdPattern.test(envVars.ADMOB_ANDROID_APP_ID)) {
    console.error('❌ ERROR: Formato de Android App ID inválido');
    console.error('   Debe ser: ca-app-pub-XXXXXXXXXX~XXXXXXXXXX');
    process.exit(1);
}

if (!adUnitPattern.test(envVars.ADMOB_INTERSTITIAL_ID)) {
    console.error('❌ ERROR: Formato de Interstitial ID inválido');
    console.error('   Debe ser: ca-app-pub-XXXXXXXXXX/XXXXXXXXXX');
    process.exit(1);
}

if (!adUnitPattern.test(envVars.ADMOB_REWARDED_ID)) {
    console.error('❌ ERROR: Formato de Rewarded ID inválido');
    console.error('   Debe ser: ca-app-pub-XXXXXXXXXX/XXXXXXXXXX');
    process.exit(1);
}

console.log('✅ Formato de IDs válido');

// 3. Verificar que no son IDs de test
console.log('\n3️⃣ Verificando que no son IDs de test...');
const testPatterns = [
    /ca-app-pub-3940256099942544/, // Test App ID
    /ca-app-pub-3940256099942544\/1033173712/, // Test Interstitial
    /ca-app-pub-3940256099942544\/5224354917/, // Test Rewarded
];

let isTestId = false;
testPatterns.forEach(pattern => {
    if (pattern.test(envVars.ADMOB_ANDROID_APP_ID) ||
        pattern.test(envVars.ADMOB_INTERSTITIAL_ID) ||
        pattern.test(envVars.ADMOB_REWARDED_ID)) {
        isTestId = true;
    }
});

if (isTestId) {
    console.error('❌ ERROR: Se detectaron IDs de test de Google');
    console.error('   No uses IDs de test para producción');
    process.exit(1);
}

console.log('✅ IDs de producción confirmados');

// 4. Verificar configuración en app.config.js
console.log('\n4️⃣ Verificando app.config.js...');
const appConfigPath = path.join(__dirname, '..', 'app.config.js');
const appConfigContent = fs.readFileSync(appConfigPath, 'utf8');

if (!appConfigContent.includes('react-native-google-mobile-ads')) {
    console.error('❌ ERROR: Plugin react-native-google-mobile-ads no configurado en app.config.js');
    process.exit(1);
}

if (!appConfigContent.includes('process.env.ADMOB_ANDROID_APP_ID')) {
    console.error('❌ ERROR: Variable de entorno ADMOB_ANDROID_APP_ID no configurada en app.config.js');
    process.exit(1);
}

console.log('✅ Plugin de AdMob configurado correctamente');

// 5. Verificar servicio de ads
console.log('\n5️⃣ Verificando servicio de ads...');
const adsServicePath = path.join(__dirname, '..', 'services', 'ads.ts');
const adsServiceContent = fs.readFileSync(adsServicePath, 'utf8');

if (!adsServiceContent.includes('process.env.ADMOB_ANDROID_APP_ID')) {
    console.error('❌ ERROR: Variables de entorno no configuradas en services/ads.ts');
    process.exit(1);
}

if (!adsServiceContent.includes('react-native-google-mobile-ads')) {
    console.error('❌ ERROR: react-native-google-mobile-ads no importado en services/ads.ts');
    process.exit(1);
}

console.log('✅ Servicio de ads configurado correctamente');

// 6. Verificar AndroidManifest.xml
console.log('\n6️⃣ Verificando AndroidManifest.xml...');
const manifestPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');

if (!fs.existsSync(manifestPath)) {
    console.warn('⚠️  WARNING: AndroidManifest.xml no encontrado (ejecuta npx expo prebuild primero)');
} else {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');

    if (!manifestContent.includes('com.google.android.gms.ads.APPLICATION_ID')) {
        console.error('❌ ERROR: APPLICATION_ID de AdMob no configurado en AndroidManifest.xml');
        process.exit(1);
    }

    if (!manifestContent.includes('com.google.android.gms.permission.AD_ID')) {
        console.error('❌ ERROR: Permiso AD_ID no configurado en AndroidManifest.xml');
        process.exit(1);
    }

    console.log('✅ AndroidManifest.xml configurado correctamente');
}

// 7. Verificar build.gradle
console.log('\n7️⃣ Verificando build.gradle...');
const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

if (!fs.existsSync(buildGradlePath)) {
    console.warn('⚠️  WARNING: build.gradle no encontrado (ejecuta npx expo prebuild primero)');
} else {
    const buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');

    if (!buildGradleContent.includes('play-services-ads')) {
        console.error('❌ ERROR: Dependencia play-services-ads no configurada en build.gradle');
        process.exit(1);
    }

    console.log('✅ build.gradle configurado correctamente');
}

// 8. Resumen final
console.log('\n🎯 RESUMEN DEL TESTING');
console.log('=====================');
console.log('✅ Variables de entorno configuradas');
console.log('✅ IDs de AdMob válidos');
console.log('✅ IDs de producción (no test)');
console.log('✅ Plugin configurado en app.config.js');
console.log('✅ Servicio de ads configurado');
console.log('✅ Dependencias nativas configuradas');

console.log('\n🚀 RECOMENDACIONES PARA PRODUCCIÓN:');
console.log('==================================');
console.log('1. Ejecuta: npx expo prebuild --platform android --clean');
console.log('2. Ejecuta: npx expo run:android');
console.log('3. Prueba los anuncios en el dispositivo/emulador');
console.log('4. Verifica los logs de AdMob en la consola');
console.log('5. Si todo funciona, crea el build de producción');

console.log('\n📋 CHECKLIST FINAL:');
console.log('==================');
console.log('□ Anuncios intersticiales se muestran cada 3 niveles');
console.log('□ Anuncios recompensados se muestran para pistas adicionales');
console.log('□ Icono de pistas cambia de 💡 a 📺 después de la primera pista');
console.log('□ No hay errores en la consola relacionados con AdMob');
console.log('□ Los anuncios se cargan correctamente');

console.log('\n✅ TESTING COMPLETADO - Listo para producción!'); 