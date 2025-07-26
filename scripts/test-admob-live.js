#!/usr/bin/env node

/**
 * Script de Testing en Vivo para AdMob
 * 
 * Este script te guía para probar los anuncios en tiempo real
 */

const { spawn } = require('child_process');
const readline = require('readline');

console.log('🎯 TESTING EN VIVO DE ADMOB');
console.log('===========================\n');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('📱 PASOS PARA TESTING EN VIVO:');
console.log('==============================\n');

console.log('1️⃣ PREPARACIÓN:');
console.log('   - Asegúrate de que el emulador/dispositivo esté conectado');
console.log('   - Ejecuta: npx expo start --clear');
console.log('   - Escanea el QR o presiona "a" para abrir en Android\n');

console.log('2️⃣ TESTING DE ANUNCIOS INTERSTICIALES:');
console.log('   - Completa 3 niveles consecutivos');
console.log('   - Deberías ver un anuncio intersticial después del nivel 3');
console.log('   - Verifica los logs en la consola\n');

console.log('3️⃣ TESTING DE ANUNCIOS RECOMPENSADOS:');
console.log('   - Ve a cualquier nivel');
console.log('   - Usa la primera pista (debería ser gratis)');
console.log('   - Usa una segunda pista (debería mostrar anuncio recompensado)');
console.log('   - Verifica que el icono cambie de 💡 a 📺\n');

console.log('4️⃣ LOGS A VERIFICAR:');
console.log('   ✅ AdMob configuration loaded');
console.log('   ✅ Using environment variables for AdMob IDs');
console.log('   ✅ AdMob initialized successfully');
console.log('   ✅ Interstitial ad loaded');
console.log('   ✅ Rewarded ad loaded');
console.log('   ✅ Showing interstitial ad...');
console.log('   ✅ Showing rewarded ad...\n');

console.log('5️⃣ POSIBLES RESULTADOS:');
console.log('   🟢 ANUNCIOS FUNCIONAN: Verás los logs de arriba y los anuncios se muestran');
console.log('   🟡 MOCK MODE: Verás "mock mode" en los logs (normal en desarrollo)');
console.log('   🔴 ERROR: Verás errores de "TurboModuleRegistry" o similares\n');

// Función para preguntar al usuario
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.toLowerCase());
        });
    });
}

// Función principal de testing
async function runLiveTest() {
    console.log('🚀 ¿Quieres iniciar el testing en vivo? (s/n): ');
    const start = await askQuestion('');

    if (start !== 's' && start !== 'si' && start !== 'y' && start !== 'yes') {
        console.log('❌ Testing cancelado');
        rl.close();
        return;
    }

    console.log('\n🔄 Iniciando Metro bundler...');
    console.log('💡 Ejecutando: npx expo start --clear');

    // Iniciar Metro bundler
    const metro = spawn('npx', ['expo', 'start', '--clear'], {
        stdio: 'inherit',
        shell: true
    });

    console.log('\n📱 INSTRUCCIONES:');
    console.log('=================');
    console.log('1. Metro bundler se ha iniciado');
    console.log('2. Escanea el QR code o presiona "a" para Android');
    console.log('3. Prueba las funcionalidades mencionadas arriba');
    console.log('4. Observa los logs en esta consola');
    console.log('5. Presiona Ctrl+C para detener cuando termines\n');

    // Manejar la salida del proceso
    metro.on('close', (code) => {
        console.log(`\n📊 Metro bundler terminado con código: ${code}`);
        rl.close();
    });

    // Manejar errores
    metro.on('error', (error) => {
        console.error('❌ Error iniciando Metro bundler:', error);
        rl.close();
    });
}

// Función para mostrar comandos útiles
function showUsefulCommands() {
    console.log('\n🔧 COMANDOS ÚTILES:');
    console.log('===================');
    console.log('Ver logs de AdMob en tiempo real:');
    console.log('  adb logcat | grep -E "(AdMob|Ads|Google)"');
    console.log('');
    console.log('Reiniciar la app:');
    console.log('  adb shell am force-stop com.pathly.game');
    console.log('  adb shell am start -n com.pathly.game/.MainActivity');
    console.log('');
    console.log('Limpiar cache:');
    console.log('  npx expo start --clear');
    console.log('');
    console.log('Ver dispositivos conectados:');
    console.log('  adb devices');
}

// Mostrar comandos útiles
showUsefulCommands();

// Preguntar si quiere ver comandos adicionales
askQuestion('\n¿Quieres ver comandos adicionales de debugging? (s/n): ').then((answer) => {
    if (answer === 's' || answer === 'si' || answer === 'y' || answer === 'yes') {
        console.log('\n🐛 COMANDOS DE DEBUGGING:');
        console.log('========================');
        console.log('Ver todos los logs de la app:');
        console.log('  adb logcat | grep com.pathly.game');
        console.log('');
        console.log('Ver logs de React Native:');
        console.log('  adb logcat | grep ReactNativeJS');
        console.log('');
        console.log('Ver logs de Metro:');
        console.log('  adb logcat | grep Metro');
        console.log('');
        console.log('Limpiar logs:');
        console.log('  adb logcat -c');
        console.log('');
        console.log('Ver información del dispositivo:');
        console.log('  adb shell getprop ro.build.version.release');
        console.log('  adb shell getprop ro.product.model');
    }

    // Iniciar el testing en vivo
    runLiveTest();
});

// Manejar Ctrl+C
process.on('SIGINT', () => {
    console.log('\n\n👋 Testing terminado');
    rl.close();
    process.exit(0);
}); 