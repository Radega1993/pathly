#!/usr/bin/env node

/**
 * Script de Testing en Tiempo Real para AdMob
 * 
 * Este script simula el comportamiento de la app para verificar que AdMob funciona
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 TESTING ADMOB EN TIEMPO REAL');
console.log('===============================\n');

// Función para ejecutar comandos de forma segura
function runCommand(command, description) {
    try {
        console.log(`🔄 ${description}...`);
        const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
        console.log(`✅ ${description} completado`);
        return result;
    } catch (error) {
        console.error(`❌ Error en ${description}:`, error.message);
        return null;
    }
}

// 1. Verificar que el development build esté compilado
console.log('1️⃣ Verificando development build...');
const androidPath = path.join(__dirname, '..', 'android');
if (!fs.existsSync(androidPath)) {
    console.error('❌ ERROR: Carpeta android no encontrada');
    console.log('💡 Ejecuta: npx expo prebuild --platform android --clean');
    process.exit(1);
}

console.log('✅ Development build encontrado');

// 2. Verificar que el emulador esté ejecutándose
console.log('\n2️⃣ Verificando emulador...');
const emulatorCheck = runCommand('adb devices', 'Verificando dispositivos conectados');

if (!emulatorCheck || !emulatorCheck.includes('device')) {
    console.error('❌ ERROR: No hay dispositivos Android conectados');
    console.log('💡 Asegúrate de que el emulador esté ejecutándose o conecta un dispositivo');
    process.exit(1);
}

console.log('✅ Dispositivo Android conectado');

// 3. Instalar la app si no está instalada
console.log('\n3️⃣ Verificando instalación de la app...');
const appCheck = runCommand('adb shell pm list packages | grep com.pathly.game', 'Verificando si la app está instalada');

if (!appCheck || !appCheck.includes('com.pathly.game')) {
    console.log('📱 App no instalada, instalando...');
    const installResult = runCommand('npx expo run:android', 'Instalando app en dispositivo');

    if (!installResult) {
        console.error('❌ ERROR: No se pudo instalar la app');
        process.exit(1);
    }
} else {
    console.log('✅ App ya instalada');
}

// 4. Iniciar la app
console.log('\n4️⃣ Iniciando la app...');
const startResult = runCommand('adb shell am start -n com.pathly.game/.MainActivity', 'Iniciando app');

if (!startResult) {
    console.error('❌ ERROR: No se pudo iniciar la app');
    process.exit(1);
}

console.log('✅ App iniciada correctamente');

// 5. Instrucciones para testing manual
console.log('\n🎯 INSTRUCCIONES PARA TESTING MANUAL');
console.log('====================================');
console.log('1. La app se ha iniciado en tu dispositivo/emulador');
console.log('2. Abre la consola de Metro para ver los logs:');
console.log('   npx expo start --clear');
console.log('');
console.log('3. Prueba las siguientes funcionalidades:');
console.log('   □ Navega a la pantalla de juego');
console.log('   □ Completa 3 niveles para ver anuncios intersticiales');
console.log('   □ Usa más de 1 pista para ver anuncios recompensados');
console.log('   □ Verifica que el icono cambie de 💡 a 📺');
console.log('');
console.log('4. Verifica los logs en la consola:');
console.log('   ✅ AdMob configuration loaded');
console.log('   ✅ Using environment variables for AdMob IDs');
console.log('   ✅ AdMob initialized successfully');
console.log('   ✅ Interstitial ad loaded');
console.log('   ✅ Rewarded ad loaded');
console.log('');
console.log('5. Si ves "mock mode", significa que el módulo nativo no está disponible');
console.log('   Esto es normal durante desarrollo, pero debe funcionar en producción');

// 6. Checklist de verificación
console.log('\n📋 CHECKLIST DE VERIFICACIÓN');
console.log('===========================');
console.log('□ La app se inicia sin errores');
console.log('□ No hay errores de "TurboModuleRegistry"');
console.log('□ Los logs de AdMob aparecen en la consola');
console.log('□ Los anuncios se muestran correctamente');
console.log('□ El icono de pistas cambia de 💡 a 📺');
console.log('□ No hay crashes o errores fatales');

// 7. Comandos útiles
console.log('\n🔧 COMANDOS ÚTILES');
console.log('==================');
console.log('Ver logs en tiempo real:');
console.log('  adb logcat | grep -E "(AdMob|Ads|Google)"');
console.log('');
console.log('Reiniciar la app:');
console.log('  adb shell am force-stop com.pathly.game');
console.log('  adb shell am start -n com.pathly.game/.MainActivity');
console.log('');
console.log('Limpiar cache de Metro:');
console.log('  npx expo start --clear');

console.log('\n✅ TESTING EN TIEMPO REAL CONFIGURADO');
console.log('🚀 ¡Ahora prueba la app manualmente!'); 