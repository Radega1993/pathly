#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 AdMob Debug Script - Pathly Game');
console.log('=====================================\n');

// 1. Verificar archivo .env
console.log('1. Verificando archivo .env...');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    const admobVars = {
        'ADMOB_ANDROID_APP_ID': null,
        'ADMOB_INTERSTITIAL_ID': null,
        'ADMOB_REWARDED_ID': null,
        'ADMOB_DEBUG_MODE': null
    };

    lines.forEach(line => {
        const [key, value] = line.split('=');
        if (admobVars.hasOwnProperty(key)) {
            admobVars[key] = value;
        }
    });

    console.log('✅ Archivo .env encontrado');
    console.log('   ADMOB_ANDROID_APP_ID:', admobVars['ADMOB_ANDROID_APP_ID']);
    console.log('   ADMOB_INTERSTITIAL_ID:', admobVars['ADMOB_INTERSTITIAL_ID']);
    console.log('   ADMOB_REWARDED_ID:', admobVars['ADMOB_REWARDED_ID']);
    console.log('   ADMOB_DEBUG_MODE:', admobVars['ADMOB_DEBUG_MODE']);
} else {
    console.log('❌ Archivo .env no encontrado');
}

// 2. Verificar app.config.js
console.log('\n2. Verificando app.config.js...');
const configPath = path.join(__dirname, '..', 'app.config.js');
if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, 'utf8');

    if (configContent.includes('ADMOB_ANDROID_APP_ID')) {
        console.log('✅ app.config.js incluye variables de AdMob');
    } else {
        console.log('❌ app.config.js no incluye variables de AdMob');
    }

    if (configContent.includes('react-native-google-mobile-ads')) {
        console.log('✅ Plugin react-native-google-mobile-ads configurado');
    } else {
        console.log('❌ Plugin react-native-google-mobile-ads no configurado');
    }
} else {
    console.log('❌ app.config.js no encontrado');
}

// 3. Verificar AndroidManifest.xml
console.log('\n3. Verificando AndroidManifest.xml...');
const manifestPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');

    if (manifestContent.includes('com.google.android.gms.ads.APPLICATION_ID')) {
        console.log('✅ AdMob App ID configurado en AndroidManifest.xml');
    } else {
        console.log('❌ AdMob App ID no configurado en AndroidManifest.xml');
    }

    if (manifestContent.includes('com.google.android.gms.permission.AD_ID')) {
        console.log('✅ Permisos de AdMob configurados');
    } else {
        console.log('❌ Permisos de AdMob no configurados');
    }
} else {
    console.log('❌ AndroidManifest.xml no encontrado');
}

// 4. Verificar build.gradle
console.log('\n4. Verificando build.gradle...');
const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');
if (fs.existsSync(buildGradlePath)) {
    const buildContent = fs.readFileSync(buildGradlePath, 'utf8');

    if (buildContent.includes('play-services-ads')) {
        console.log('✅ Dependencia play-services-ads configurada');
    } else {
        console.log('❌ Dependencia play-services-ads no configurada');
    }
} else {
    console.log('❌ build.gradle no encontrado');
}

// 5. Verificar services/ads.ts
console.log('\n5. Verificando services/ads.ts...');
const adsPath = path.join(__dirname, '..', 'services', 'ads.ts');
if (fs.existsSync(adsPath)) {
    const adsContent = fs.readFileSync(adsPath, 'utf8');

    if (adsContent.includes('react-native-google-mobile-ads')) {
        console.log('✅ Importación de react-native-google-mobile-ads correcta');
    } else {
        console.log('❌ Importación de react-native-google-mobile-ads incorrecta');
    }

    if (adsContent.includes('process.env.ADMOB_REWARDED_ID')) {
        console.log('✅ Variable ADMOB_REWARDED_ID configurada');
    } else {
        console.log('❌ Variable ADMOB_REWARDED_ID no configurada');
    }

    if (adsContent.includes('loadRewardedAd')) {
        console.log('✅ Función loadRewardedAd implementada');
    } else {
        console.log('❌ Función loadRewardedAd no implementada');
    }
} else {
    console.log('❌ services/ads.ts no encontrado');
}

// 6. Análisis del problema
console.log('\n6. Análisis del problema...');
console.log('📊 Según los logs proporcionados:');
console.log('   ✅ react-native-google-mobile-ads loaded successfully');
console.log('   ✅ AdMob configuration loaded');
console.log('   ✅ Interstitial ad loaded');
console.log('   ❌ Rewarded ad failed to load');
console.log('');
console.log('🔍 Posibles causas:');
console.log('   1. El anuncio recompensado aún no está activo en AdMob');
console.log('   2. Problema de configuración específico para rewarded ads');
console.log('   3. Timeout en la carga del anuncio');
console.log('   4. Problema con el ID del anuncio recompensado');

// 7. Recomendaciones
console.log('\n7. Recomendaciones para solucionar:');
console.log('   🔧 1. Verificar en Google AdMob Console que el anuncio recompensado esté activo');
console.log('   🔧 2. Aumentar el timeout de carga de anuncios');
console.log('   🔧 3. Agregar más logs de debug en la función loadRewardedAd');
console.log('   🔧 4. Verificar que el ID del anuncio recompensado sea correcto');
console.log('   🔧 5. Probar con un anuncio de test temporalmente');

console.log('\n✅ Diagnóstico completado'); 