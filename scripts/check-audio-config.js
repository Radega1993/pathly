#!/usr/bin/env node

/**
 * Script para verificar la configuración de audio
 * y identificar problemas
 */

const fs = require('fs');
const path = require('path');

console.log('🎵 Verificando configuración de audio...\n');

// 1. Verificar archivos de audio
console.log('1️⃣ Verificando archivos de audio...');
const audioDir = path.join(__dirname, '../assets/song');
const requiredFiles = [
    'forward.wav',
    'back.wav',
    'win.mp3',
    'MusicaMenu.mp3',
    'MazeLevel.mp3'
];

if (fs.existsSync(audioDir)) {
    console.log('   ✅ Directorio de audio encontrado');

    for (const file of requiredFiles) {
        const filePath = path.join(audioDir, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            const sizeKB = Math.round(stats.size / 1024);
            console.log(`   ✅ ${file} (${sizeKB}KB)`);
        } else {
            console.log(`   ❌ ${file} - NO ENCONTRADO`);
        }
    }
} else {
    console.log('   ❌ Directorio de audio no encontrado');
}

// 2. Verificar configuración de audio service
console.log('\n2️⃣ Verificando configuración de audio service...');
const audioServicePath = path.join(__dirname, '../services/audio.ts');
if (fs.existsSync(audioServicePath)) {
    const audioServiceContent = fs.readFileSync(audioServicePath, 'utf8');

    const hasExpoAv = audioServiceContent.includes('expo-av');
    const hasAudioMode = audioServiceContent.includes('setAudioModeAsync');
    const hasInitialize = audioServiceContent.includes('initialize()');
    const hasErrorHandling = audioServiceContent.includes('try {') && audioServiceContent.includes('catch (error)');
    const hasCleanup = audioServiceContent.includes('cleanup()');

    console.log('   ✅ expo-av importado:', hasExpoAv);
    console.log('   ✅ Audio mode configurado:', hasAudioMode);
    console.log('   ✅ Método initialize presente:', hasInitialize);
    console.log('   ✅ Manejo de errores presente:', hasErrorHandling);
    console.log('   ✅ Método cleanup presente:', hasCleanup);

    if (hasExpoAv && hasAudioMode && hasInitialize && hasErrorHandling) {
        console.log('   🎉 Configuración de audio service correcta');
    } else {
        console.log('   ⚠️ Configuración de audio service incompleta');
    }
} else {
    console.log('   ❌ services/audio.ts no encontrado');
}

// 3. Verificar inicialización en App.tsx
console.log('\n3️⃣ Verificando inicialización en App.tsx...');
const appPath = path.join(__dirname, '../App.tsx');
if (fs.existsSync(appPath)) {
    const appContent = fs.readFileSync(appPath, 'utf8');

    const hasAudioImport = appContent.includes('audioService');
    const hasAudioInit = appContent.includes('audioService.initialize()');
    const hasAudioPlay = appContent.includes('playBackgroundMusic');
    const hasAudioCleanup = appContent.includes('audioService.cleanup()');

    console.log('   ✅ audioService importado:', hasAudioImport);
    console.log('   ✅ Inicialización presente:', hasAudioInit);
    console.log('   ✅ Reproducción de música presente:', hasAudioPlay);
    console.log('   ✅ Cleanup presente:', hasAudioCleanup);

    if (hasAudioImport && hasAudioInit && hasAudioPlay && hasAudioCleanup) {
        console.log('   🎉 Inicialización de audio en App.tsx correcta');
    } else {
        console.log('   ⚠️ Inicialización de audio en App.tsx incompleta');
    }
} else {
    console.log('   ❌ App.tsx no encontrado');
}

// 4. Verificar dependencias
console.log('\n4️⃣ Verificando dependencias...');
const packagePath = path.join(__dirname, '../package.json');
if (fs.existsSync(packagePath)) {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    const hasExpoAv = packageContent.dependencies && packageContent.dependencies['expo-av'];
    const hasAsyncStorage = packageContent.dependencies && packageContent.dependencies['@react-native-async-storage/async-storage'];

    console.log('   ✅ expo-av instalado:', !!hasExpoAv);
    console.log('   ✅ @react-native-async-storage/async-storage instalado:', !!hasAsyncStorage);

    if (hasExpoAv && hasAsyncStorage) {
        console.log('   🎉 Dependencias de audio correctas');
    } else {
        console.log('   ⚠️ Faltan dependencias de audio');
    }
} else {
    console.log('   ❌ package.json no encontrado');
}

// 5. Problemas comunes y soluciones
console.log('\n🔍 Problemas comunes de audio:');
console.log('   1. **Archivos de audio corruptos**: Verificar que los archivos se descargaron correctamente');
console.log('   2. **Permisos de audio**: Verificar permisos en Android/iOS');
console.log('   3. **Audio mode no configurado**: Verificar setAudioModeAsync');
console.log('   4. **Archivos no encontrados**: Verificar rutas de require()');
console.log('   5. **Inicialización asíncrona**: Verificar que se espera a initialize()');

console.log('\n🔧 Soluciones para "sound is not loaded":');
console.log('   1. **Verificar inicialización**: Asegurar que audioService.initialize() se ejecuta');
console.log('   2. **Verificar archivos**: Confirmar que los archivos de audio existen');
console.log('   3. **Verificar permisos**: Asegurar permisos de audio en el dispositivo');
console.log('   4. **Verificar audio mode**: Confirmar que setAudioModeAsync se ejecuta');
console.log('   5. **Verificar volumen**: Asegurar que el volumen no está en 0');

console.log('\n📋 Checklist para solucionar el problema:');
console.log('   □ Verificar que los archivos de audio existen');
console.log('   □ Confirmar que expo-av está instalado');
console.log('   □ Verificar que audioService.initialize() se ejecuta');
console.log('   □ Confirmar que setAudioModeAsync se ejecuta');
console.log('   □ Verificar permisos de audio en el dispositivo');
console.log('   □ Probar con volumen diferente de 0');

console.log('\n✅ Script completado'); 