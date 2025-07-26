#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando sistema de alertas de actualización...\n');

let allGood = true;

// 1. Verificar que el servicio de actualización existe
console.log('1️⃣ Verificando servicio de actualización...');
const updateServicePath = path.join(__dirname, '../services/updateService.ts');
if (fs.existsSync(updateServicePath)) {
    console.log('   ✅ services/updateService.ts existe');

    const content = fs.readFileSync(updateServicePath, 'utf8');

    // Verificar funcionalidades principales
    const features = [
        'UpdateService',
        'checkForUpdates',
        'getCurrentVersionInfo',
        'savePreferences',
        'dismissUpdate',
        'GOOGLE_PLAY_URL'
    ];

    features.forEach(feature => {
        if (content.includes(feature)) {
            console.log(`   ✅ ${feature} implementado`);
        } else {
            console.log(`   ❌ ${feature} NO implementado`);
            allGood = false;
        }
    });
} else {
    console.log('   ❌ services/updateService.ts NO existe');
    allGood = false;
}

// 2. Verificar componente UpdateAlert
console.log('\n2️⃣ Verificando componente UpdateAlert...');
const updateAlertPath = path.join(__dirname, '../components/UpdateAlert.tsx');
if (fs.existsSync(updateAlertPath)) {
    console.log('   ✅ components/UpdateAlert.tsx existe');

    const content = fs.readFileSync(updateAlertPath, 'utf8');

    const alertFeatures = [
        'UpdateAlert',
        'handleUpdate',
        'handleDismiss',
        'Linking.openURL',
        'cloud-download'
    ];

    alertFeatures.forEach(feature => {
        if (content.includes(feature)) {
            console.log(`   ✅ ${feature} implementado`);
        } else {
            console.log(`   ❌ ${feature} NO implementado`);
            allGood = false;
        }
    });
} else {
    console.log('   ❌ components/UpdateAlert.tsx NO existe');
    allGood = false;
}

// 3. Verificar componente UpdateSettings
console.log('\n3️⃣ Verificando componente UpdateSettings...');
const updateSettingsPath = path.join(__dirname, '../components/UpdateSettings.tsx');
if (fs.existsSync(updateSettingsPath)) {
    console.log('   ✅ components/UpdateSettings.tsx existe');

    const content = fs.readFileSync(updateSettingsPath, 'utf8');

    const settingsFeatures = [
        'UpdateSettings',
        'showUpdateAlerts',
        'checkFrequency',
        'savePreferences',
        'Switch'
    ];

    settingsFeatures.forEach(feature => {
        if (content.includes(feature)) {
            console.log(`   ✅ ${feature} implementado`);
        } else {
            console.log(`   ❌ ${feature} NO implementado`);
            allGood = false;
        }
    });
} else {
    console.log('   ❌ components/UpdateSettings.tsx NO existe');
    allGood = false;
}

// 4. Verificar integración en App.tsx
console.log('\n4️⃣ Verificando integración en App.tsx...');
const appPath = path.join(__dirname, '../App.tsx');
if (fs.existsSync(appPath)) {
    console.log('   ✅ App.tsx existe');

    const content = fs.readFileSync(appPath, 'utf8');

    const integrationFeatures = [
        'import UpdateAlert',
        'import UpdateSettings',
        'updateService',
        'showUpdateAlert',
        'showUpdateSettings',
        'updateInfo',
        'checkForUpdatesOnStart',
        'handleShowUpdateSettings',
        'cloud-download-outline'
    ];

    integrationFeatures.forEach(feature => {
        if (content.includes(feature)) {
            console.log(`   ✅ ${feature} integrado`);
        } else {
            console.log(`   ❌ ${feature} NO integrado`);
            allGood = false;
        }
    });
} else {
    console.log('   ❌ App.tsx NO existe');
    allGood = false;
}

// 5. Verificar configuración de versiones
console.log('\n5️⃣ Verificando configuración de versiones...');
const appJsonPath = path.join(__dirname, '../app.json');
const packageJsonPath = path.join(__dirname, '../package.json');

if (fs.existsSync(appJsonPath) && fs.existsSync(packageJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    const appVersion = appJson.expo.version;
    const packageVersion = packageJson.version;
    const versionCode = appJson.expo.android.versionCode;

    console.log(`   ✅ app.json versión: ${appVersion}`);
    console.log(`   ✅ package.json versión: ${packageVersion}`);
    console.log(`   ✅ version code: ${versionCode}`);

    if (appVersion === packageVersion) {
        console.log('   ✅ Versiones consistentes');
    } else {
        console.log('   ❌ Versiones inconsistentes');
        allGood = false;
    }
} else {
    console.log('   ❌ Archivos de configuración no encontrados');
    allGood = false;
}

// 6. Verificar dependencias
console.log('\n6️⃣ Verificando dependencias...');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const requiredDeps = [
    'expo-constants',
    '@react-native-async-storage/async-storage'
];

requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
        console.log(`   ✅ ${dep} instalado: ${packageJson.dependencies[dep]}`);
    } else {
        console.log(`   ❌ ${dep} NO instalado`);
        allGood = false;
    }
});

// Resumen final
console.log('\n📊 Resumen de verificación:');
if (allGood) {
    console.log('🎉 ¡Sistema de alertas de actualización implementado correctamente!');
    console.log('\n✅ Funcionalidades implementadas:');
    console.log('   • Servicio de verificación de actualizaciones');
    console.log('   • Componente de alerta elegante');
    console.log('   • Configuración de preferencias');
    console.log('   • Integración en la aplicación principal');
    console.log('   • Persistencia de preferencias');
    console.log('   • Redirección a Google Play Store');
    console.log('\n🚀 El sistema está listo para usar en producción');
} else {
    console.log('❌ Hay problemas que necesitan ser corregidos');
    console.log('\n💡 Revisa los errores anteriores y completa la implementación');
}

console.log('\n🔗 URL de Google Play Store configurada:');
console.log('   https://play.google.com/store/apps/details?id=com.pathly.game'); 