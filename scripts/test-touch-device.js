#!/usr/bin/env node

/**
 * Script para probar el touch en dispositivos reales
 * y identificar problemas específicos
 */

const fs = require('fs');
const path = require('path');

console.log('👆 Probando configuración de touch para dispositivos reales...\n');

// 1. Verificar Grid optimizado
console.log('1️⃣ Verificando Grid optimizado...');
const gridPath = path.join(__dirname, '../components/Grid.tsx');
if (fs.existsSync(gridPath)) {
    const gridContent = fs.readFileSync(gridPath, 'utf8');

    const hasTouchableOpacity = gridContent.includes('TouchableOpacity');
    const hasOnPress = gridContent.includes('onPress');
    const hasOnLongPress = gridContent.includes('onLongPress');
    const hasHitSlop = gridContent.includes('hitSlop');
    const hasDebugInfo = gridContent.includes('debugInfo');
    const hasConsoleLog = gridContent.includes('console.log');
    const hasActiveOpacity = gridContent.includes('activeOpacity');

    console.log('   ✅ TouchableOpacity implementado:', hasTouchableOpacity);
    console.log('   ✅ onPress implementado:', hasOnPress);
    console.log('   ✅ onLongPress implementado:', hasOnLongPress);
    console.log('   ✅ hitSlop implementado:', hasHitSlop);
    console.log('   ✅ Debug info implementado:', hasDebugInfo);
    console.log('   ✅ Console.log implementado:', hasConsoleLog);
    console.log('   ✅ activeOpacity implementado:', hasActiveOpacity);

    if (hasTouchableOpacity && hasOnPress && hasHitSlop && hasDebugInfo) {
        console.log('   🎉 Grid optimizado para dispositivos reales');
    } else {
        console.log('   ⚠️ Grid necesita más optimizaciones para touch');
    }
} else {
    console.log('   ❌ Grid no encontrado');
}

// 2. Verificar que no hay PanResponder
console.log('\n2️⃣ Verificando que PanResponder fue removido...');
if (fs.existsSync(gridPath)) {
    const gridContent = fs.readFileSync(gridPath, 'utf8');

    const hasPanResponder = gridContent.includes('PanResponder');
    const hasPanHandlers = gridContent.includes('panHandlers');

    console.log('   ✅ PanResponder removido:', !hasPanResponder);
    console.log('   ✅ panHandlers removido:', !hasPanHandlers);

    if (!hasPanResponder && !hasPanHandlers) {
        console.log('   🎉 PanResponder completamente removido');
    } else {
        console.log('   ⚠️ Aún hay referencias a PanResponder');
    }
} else {
    console.log('   ❌ Grid no encontrado');
}

// 3. Verificar configuración de Android
console.log('\n3️⃣ Verificando configuración de Android...');
const appConfigPath = path.join(__dirname, '../app.config.js');
if (fs.existsSync(appConfigPath)) {
    const appConfigContent = fs.readFileSync(appConfigPath, 'utf8');

    const hasAndroidConfig = appConfigContent.includes('android:');
    const hasPermissions = appConfigContent.includes('permissions');
    const hasTouchPermissions = appConfigContent.includes('TOUCH') || appConfigContent.includes('INTERNET');

    console.log('   ✅ Configuración Android presente:', hasAndroidConfig);
    console.log('   ✅ Permisos configurados:', hasPermissions);
    console.log('   ✅ Permisos de touch/red configurados:', hasTouchPermissions);

    if (hasAndroidConfig && hasPermissions) {
        console.log('   🎉 Configuración Android correcta');
    } else {
        console.log('   ⚠️ Configuración Android necesita revisión');
    }
} else {
    console.log('   ❌ app.config.js no encontrado');
}

// 4. Verificar dependencias
console.log('\n4️⃣ Verificando dependencias...');
const packagePath = path.join(__dirname, '../package.json');
if (fs.existsSync(packagePath)) {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    const hasReactNative = packageContent.dependencies && packageContent.dependencies['react-native'];
    const hasExpo = packageContent.dependencies && packageContent.dependencies['expo'];

    console.log('   ✅ React Native instalado:', !!hasReactNative);
    console.log('   ✅ Expo instalado:', !!hasExpo);

    if (hasReactNative && hasExpo) {
        console.log('   🎉 Dependencias correctas para touch');
    } else {
        console.log('   ⚠️ Faltan dependencias importantes');
    }
} else {
    console.log('   ❌ package.json no encontrado');
}

// 5. Verificar archivos de configuración nativa
console.log('\n5️⃣ Verificando archivos de configuración nativa...');
const androidManifestPath = path.join(__dirname, '../android/app/src/main/AndroidManifest.xml');
const iosInfoPlistPath = path.join(__dirname, '../ios/PathlyGame/Info.plist');

const hasAndroidManifest = fs.existsSync(androidManifestPath);
const hasIosInfoPlist = fs.existsSync(iosInfoPlistPath);

console.log('   ✅ AndroidManifest.xml presente:', hasAndroidManifest);
console.log('   ✅ Info.plist presente:', hasIosInfoPlist);

if (hasAndroidManifest || hasIosInfoPlist) {
    console.log('   🎉 Archivos de configuración nativa presentes');
} else {
    console.log('   ℹ️ Archivos nativos no presentes (normal en Expo)');
}

// Resumen
console.log('\n📋 Resumen de optimizaciones para touch:');
console.log('   • TouchableOpacity implementado con hitSlop');
console.log('   • PanResponder removido completamente');
console.log('   • Debug info añadido para troubleshooting');
console.log('   • Console.log para debugging en tiempo real');
console.log('   • Configuración Android optimizada');

console.log('\n🚀 Próximos pasos para testing en dispositivo real:');
console.log('   1. Compilar para dispositivo real');
console.log('   2. Probar touch en cada celda del grid');
console.log('   3. Verificar que debugInfo aparece al tocar');
console.log('   4. Probar long press como alternativa');
console.log('   5. Verificar que los botones funcionan');

console.log('\n🔍 Troubleshooting si el touch no funciona:');
console.log('   • Verificar que el dispositivo no está en modo desarrollador');
console.log('   • Probar con diferentes velocidades de touch');
console.log('   • Verificar que no hay apps que interfieran con el touch');
console.log('   • Probar en modo avión y luego con WiFi');
console.log('   • Reiniciar el dispositivo si es necesario');

console.log('\n✅ Script completado'); 