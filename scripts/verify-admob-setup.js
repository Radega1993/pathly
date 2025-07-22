#!/usr/bin/env node

/**
 * 🧪 Script de Verificación de Configuración de AdMob
 * 
 * Este script verifica que la configuración de AdMob esté correctamente implementada
 * y que las variables de entorno se estén cargando correctamente.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de AdMob...\n');

// Función para verificar archivo .env
function checkEnvFile() {
    const envPath = '.env';
    if (!fs.existsSync(envPath)) {
        console.log('❌ Archivo .env no encontrado');
        return false;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const requiredVars = [
        'ADMOB_ANDROID_APP_ID',
        'ADMOB_INTERSTITIAL_ID',
        'ADMOB_REWARDED_ID'
    ];

    const missingVars = requiredVars.filter(varName => !envContent.includes(varName));

    if (missingVars.length > 0) {
        console.log(`❌ Variables faltantes en .env: ${missingVars.join(', ')}`);
        return false;
    }

    console.log('✅ Archivo .env encontrado y configurado correctamente');
    return true;
}

// Función para verificar babel.config.js
function checkBabelConfig() {
    const babelPath = 'babel.config.js';
    if (!fs.existsSync(babelPath)) {
        console.log('❌ babel.config.js no encontrado');
        return false;
    }

    const babelContent = fs.readFileSync(babelPath, 'utf8');
    const requiredConfig = [
        'react-native-dotenv',
        '@env',
        '.env'
    ];

    const missingConfig = requiredConfig.filter(config => !babelContent.includes(config));

    if (missingConfig.length > 0) {
        console.log(`❌ Configuración faltante en babel.config.js: ${missingConfig.join(', ')}`);
        return false;
    }

    console.log('✅ babel.config.js configurado correctamente');
    return true;
}

// Función para verificar app.json
function checkAppJson() {
    const appJsonPath = 'app.json';
    if (!fs.existsSync(appJsonPath)) {
        console.log('❌ app.json no encontrado');
        return false;
    }

    const appJsonContent = fs.readFileSync(appJsonPath, 'utf8');
    const requiredConfig = [
        'expo-ads-admob',
        'ca-app-pub-4553067801626383~6760188699'
    ];

    const missingConfig = requiredConfig.filter(config => !appJsonContent.includes(config));

    if (missingConfig.length > 0) {
        console.log(`❌ Configuración faltante en app.json: ${missingConfig.join(', ')}`);
        return false;
    }

    console.log('✅ app.json configurado correctamente');
    return true;
}

// Función para verificar services/ads.ts
function checkAdsService() {
    const adsPath = 'services/ads.ts';
    if (!fs.existsSync(adsPath)) {
        console.log('❌ services/ads.ts no encontrado');
        return false;
    }

    const adsContent = fs.readFileSync(adsPath, 'utf8');
    const requiredImports = [
        '@env',
        'ADMOB_ANDROID_APP_ID',
        'ADMOB_INTERSTITIAL_ID',
        'ADMOB_REWARDED_ID'
    ];

    const missingImports = requiredImports.filter(importName => !adsContent.includes(importName));

    if (missingImports.length > 0) {
        console.log(`❌ Imports faltantes en services/ads.ts: ${missingImports.join(', ')}`);
        return false;
    }

    console.log('✅ services/ads.ts configurado correctamente');
    return true;
}

// Función para verificar dependencias
function checkDependencies() {
    const packageJsonPath = 'package.json';
    if (!fs.existsSync(packageJsonPath)) {
        console.log('❌ package.json no encontrado');
        return false;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const requiredDeps = [
        'expo-ads-admob',
        'react-native-dotenv'
    ];

    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

    if (missingDeps.length > 0) {
        console.log(`❌ Dependencias faltantes: ${missingDeps.join(', ')}`);
        return false;
    }

    console.log('✅ Dependencias instaladas correctamente');
    return true;
}

// Función para verificar tipos
function checkTypes() {
    const typesPath = 'types/env.d.ts';
    if (!fs.existsSync(typesPath)) {
        console.log('❌ types/env.d.ts no encontrado');
        return false;
    }

    const typesContent = fs.readFileSync(typesPath, 'utf8');
    const requiredTypes = [
        'ADMOB_ANDROID_APP_ID',
        'ADMOB_INTERSTITIAL_ID',
        'ADMOB_REWARDED_ID'
    ];

    const missingTypes = requiredTypes.filter(typeName => !typesContent.includes(typeName));

    if (missingTypes.length > 0) {
        console.log(`❌ Tipos faltantes en types/env.d.ts: ${missingTypes.join(', ')}`);
        return false;
    }

    console.log('✅ Tipos configurados correctamente');
    return true;
}

// Ejecutar verificaciones
console.log('📁 Verificando archivos de configuración:');
const checks = [
    checkEnvFile(),
    checkBabelConfig(),
    checkAppJson(),
    checkAdsService(),
    checkDependencies(),
    checkTypes()
];

// Resumen
console.log('\n📊 Resumen de verificación:');
const passedChecks = checks.filter(Boolean).length;
const totalChecks = checks.length;

console.log(`✅ Verificaciones pasadas: ${passedChecks}/${totalChecks}`);

if (passedChecks === totalChecks) {
    console.log('\n🎉 ¡CONFIGURACIÓN COMPLETA!');
    console.log('La configuración de AdMob está correctamente implementada.');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Reiniciar el servidor de desarrollo (Ctrl+C, luego npm start)');
    console.log('2. Verificar logs en la consola');
    console.log('3. Probar anuncios en dispositivo/emulador');
    console.log('4. Completar 4 niveles para ver anuncio intersticial');
    console.log('5. Usar pistas adicionales para ver anuncios recompensados');
} else {
    console.log('\n⚠️  CONFIGURACIÓN INCOMPLETA');
    console.log('Revisa los elementos marcados con ❌');
}

console.log('\n📝 Para más detalles, consulta: ADMOB_FINAL_SETUP.md'); 