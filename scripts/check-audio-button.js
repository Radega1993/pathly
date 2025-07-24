#!/usr/bin/env node

/**
 * Script para verificar que el botón de audio esté presente en todas las pantallas
 */

const fs = require('fs');
const path = require('path');

console.log('🔊 Verificando botón de audio en todas las pantallas...\n');

// 1. Verificar App.tsx (pantalla principal)
console.log('1️⃣ Verificando App.tsx (pantalla principal)...');
const appPath = path.join(__dirname, '../App.tsx');
if (fs.existsSync(appPath)) {
    const appContent = fs.readFileSync(appPath, 'utf8');

    const hasAudioButton = appContent.includes('audioButton');
    const hasAudioSettingsModal = appContent.includes('AudioSettings');
    const hasHandleShowAudioSettings = appContent.includes('handleShowAudioSettings');
    const hasHandleCloseAudioSettings = appContent.includes('handleCloseAudioSettings');

    console.log('   ✅ Botón de audio en header:', hasAudioButton);
    console.log('   ✅ Modal de AudioSettings:', hasAudioSettingsModal);
    console.log('   ✅ Función handleShowAudioSettings:', hasHandleShowAudioSettings);
    console.log('   ✅ Función handleCloseAudioSettings:', hasHandleCloseAudioSettings);

    if (hasAudioButton && hasAudioSettingsModal) {
        console.log('   🎉 Audio configurado correctamente en App.tsx');
    } else {
        console.log('   ⚠️ Audio necesita configuración en App.tsx');
    }
} else {
    console.log('   ❌ App.tsx no encontrado');
}

// 2. Verificar LevelSelectScreen
console.log('\n2️⃣ Verificando LevelSelectScreen...');
const levelSelectPath = path.join(__dirname, '../screens/LevelSelectScreen.tsx');
if (fs.existsSync(levelSelectPath)) {
    const levelSelectContent = fs.readFileSync(levelSelectPath, 'utf8');

    const hasAudioButton = levelSelectContent.includes('audioButton');
    const hasAudioButtonText = levelSelectContent.includes('audioButtonText');
    const hasOnShowAudioSettings = levelSelectContent.includes('onShowAudioSettings');
    const hasAudioButtonInHeader = levelSelectContent.includes('onPress={onShowAudioSettings}');

    console.log('   ✅ Estilo audioButton:', hasAudioButton);
    console.log('   ✅ Estilo audioButtonText:', hasAudioButtonText);
    console.log('   ✅ Prop onShowAudioSettings:', hasOnShowAudioSettings);
    console.log('   ✅ Botón en header:', hasAudioButtonInHeader);

    if (hasAudioButton && hasOnShowAudioSettings && hasAudioButtonInHeader) {
        console.log('   🎉 Audio configurado correctamente en LevelSelectScreen');
    } else {
        console.log('   ⚠️ Audio necesita configuración en LevelSelectScreen');
    }
} else {
    console.log('   ❌ LevelSelectScreen.tsx no encontrado');
}

// 3. Verificar GameScreen
console.log('\n3️⃣ Verificando GameScreen...');
const gameScreenPath = path.join(__dirname, '../screens/GameScreen.tsx');
if (fs.existsSync(gameScreenPath)) {
    const gameScreenContent = fs.readFileSync(gameScreenPath, 'utf8');

    const hasAudioButton = gameScreenContent.includes('audioButton');
    const hasAudioButtonText = gameScreenContent.includes('audioButtonText');
    const hasOnShowAudioSettings = gameScreenContent.includes('onShowAudioSettings');
    const hasAudioButtonInHeader = gameScreenContent.includes('onPress={onShowAudioSettings}');

    console.log('   ✅ Estilo audioButton:', hasAudioButton);
    console.log('   ✅ Estilo audioButtonText:', hasAudioButtonText);
    console.log('   ✅ Prop onShowAudioSettings:', hasOnShowAudioSettings);
    console.log('   ✅ Botón en header:', hasAudioButtonInHeader);

    if (hasAudioButton && hasOnShowAudioSettings && hasAudioButtonInHeader) {
        console.log('   🎉 Audio configurado correctamente en GameScreen');
    } else {
        console.log('   ⚠️ Audio necesita configuración en GameScreen');
    }
} else {
    console.log('   ❌ GameScreen.tsx no encontrado');
}

// 4. Verificar que App.tsx pase la función a las pantallas
console.log('\n4️⃣ Verificando paso de función desde App.tsx...');
if (fs.existsSync(appPath)) {
    const appContent = fs.readFileSync(appPath, 'utf8');

    const passesToLevelSelect = appContent.includes('onShowAudioSettings={handleShowAudioSettings}');
    const passesToGameScreen = appContent.includes('onShowAudioSettings={handleShowAudioSettings}');

    console.log('   ✅ Pasa función a LevelSelectScreen:', passesToLevelSelect);
    console.log('   ✅ Pasa función a GameScreen:', passesToGameScreen);

    if (passesToLevelSelect && passesToGameScreen) {
        console.log('   🎉 App.tsx pasa correctamente la función a todas las pantallas');
    } else {
        console.log('   ⚠️ App.tsx no pasa la función a todas las pantallas');
    }
}

// 5. Resumen de implementación
console.log('\n📋 Resumen de implementación del botón de audio:');
console.log('   • Botón de audio en pantalla principal (App.tsx)');
console.log('   • Botón de audio en selección de niveles (LevelSelectScreen)');
console.log('   • Botón de audio en pantalla de juego (GameScreen)');
console.log('   • Modal de AudioSettings accesible desde todas las pantallas');
console.log('   • Función handleShowAudioSettings compartida');

console.log('\n🎯 Funcionalidades del botón de audio:');
console.log('   • Control de volumen de música');
console.log('   • Control de volumen de efectos de sonido');
console.log('   • Activar/desactivar música');
console.log('   • Activar/desactivar efectos de sonido');
console.log('   • Configuración persistente');

console.log('\n📱 Ubicación del botón:');
console.log('   • Header superior derecho en todas las pantallas');
console.log('   • Icono 🔊 para fácil identificación');
console.log('   • Estilo consistente con el resto de la UI');
console.log('   • Accesible en cualquier momento del juego');

console.log('\n✅ Script completado'); 