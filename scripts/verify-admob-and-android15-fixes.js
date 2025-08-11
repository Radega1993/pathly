#!/usr/bin/env node

/**
 * Script para verificar las correcciones de AdMob y Android 15
 * Ejecutar: node scripts/verify-admob-and-android15-fixes.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando correcciones de AdMob y Android 15...\n');

// Verificar app-ads.txt
const appAdsPath = path.join(__dirname, '..', 'app-ads.txt');
if (fs.existsSync(appAdsPath)) {
    const content = fs.readFileSync(appAdsPath, 'utf8').trim();
    if (content === 'google.com, pub-4553067801626383, DIRECT, f08c47fec0942fa0') {
        console.log('✅ app-ads.txt creado correctamente');
        console.log('📝 IMPORTANTE: Sube este archivo a tu dominio web (ej: tu-dominio.com/app-ads.txt)');
    } else {
        console.log('❌ app-ads.txt tiene contenido incorrecto');
    }
} else {
    console.log('❌ app-ads.txt no encontrado');
}

// Verificar AndroidManifest.xml
const manifestPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');

    // Verificar que se removió screenOrientation="portrait"
    if (!manifestContent.includes('android:screenOrientation="portrait"')) {
        console.log('✅ Restricción de orientación removida del AndroidManifest.xml');
    } else {
        console.log('❌ Restricción de orientación aún presente en AndroidManifest.xml');
    }

    // Verificar soporte para pantallas grandes
    if (manifestContent.includes('<supports-screens')) {
        console.log('✅ Soporte para pantallas grandes agregado');
    } else {
        console.log('❌ Soporte para pantallas grandes no encontrado');
    }
} else {
    console.log('❌ AndroidManifest.xml no encontrado');
}

// Verificar MainActivity.kt
const mainActivityPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'java', 'com', 'pathly', 'game', 'MainActivity.kt');
if (fs.existsSync(mainActivityPath)) {
    const activityContent = fs.readFileSync(mainActivityPath, 'utf8');

    if (activityContent.includes('WindowCompat.setDecorFitsSystemWindows')) {
        console.log('✅ Edge-to-edge moderno implementado en MainActivity.kt');
    } else {
        console.log('❌ Edge-to-edge moderno no implementado en MainActivity.kt');
    }

    if (activityContent.includes('WindowInsetsCompat')) {
        console.log('✅ APIs modernas de insets implementadas');
    } else {
        console.log('❌ APIs modernas de insets no implementadas');
    }
} else {
    console.log('❌ MainActivity.kt no encontrado');
}

// Verificar app.config.js
const appConfigPath = path.join(__dirname, '..', 'app.config.js');
if (fs.existsSync(appConfigPath)) {
    const configContent = fs.readFileSync(appConfigPath, 'utf8');

    if (configContent.includes('orientation: "default"')) {
        console.log('✅ Orientación configurada como "default" en app.config.js');
    } else {
        console.log('❌ Orientación no configurada como "default" en app.config.js');
    }
} else {
    console.log('❌ app.config.js no encontrado');
}

console.log('\n📋 Resumen de acciones necesarias:');
console.log('1. Sube el archivo app-ads.txt a tu dominio web');
console.log('2. Compila y prueba la app en diferentes orientaciones');
console.log('3. Verifica que los anuncios funcionen correctamente');
console.log('4. Sube una nueva versión a Google Play Store');

console.log('\n🚀 Para compilar y probar:');
console.log('npx expo run:android --variant release');
console.log('npx expo run:ios --variant release'); 