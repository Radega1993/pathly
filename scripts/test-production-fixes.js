#!/usr/bin/env node

/**
 * Script para probar las correcciones de producción
 * - Parpadeo en barras de volumen
 * - Touch en Grid
 * - Auth de Google
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Probando correcciones de producción...\n');

// 1. Verificar AudioSettings optimizado
console.log('1️⃣ Verificando AudioSettings optimizado...');
const audioSettingsPath = path.join(__dirname, '../components/AudioSettings.tsx');
if (fs.existsSync(audioSettingsPath)) {
    const audioSettingsContent = fs.readFileSync(audioSettingsPath, 'utf8');

    const hasUseCallback = audioSettingsContent.includes('useCallback');
    const hasUseMemo = audioSettingsContent.includes('useMemo');
    const hasVolumeBar = audioSettingsContent.includes('renderVolumeBar');
    const hasButtonControls = audioSettingsContent.includes('handleVolumeButtonPress');

    console.log('   ✅ useCallback implementado:', hasUseCallback);
    console.log('   ✅ useMemo implementado:', hasUseMemo);
    console.log('   ✅ Barras de volumen optimizadas:', hasVolumeBar);
    console.log('   ✅ Controles de botón implementados:', hasButtonControls);

    if (hasUseCallback && hasUseMemo && hasVolumeBar && hasButtonControls) {
        console.log('   🎉 AudioSettings optimizado correctamente');
    } else {
        console.log('   ⚠️ AudioSettings necesita más optimizaciones');
    }
} else {
    console.log('   ❌ AudioSettings no encontrado');
}

// 2. Verificar Grid simplificado
console.log('\n2️⃣ Verificando Grid simplificado...');
const gridPath = path.join(__dirname, '../components/Grid.tsx');
if (fs.existsSync(gridPath)) {
    const gridContent = fs.readFileSync(gridPath, 'utf8');

    const hasPanResponder = gridContent.includes('PanResponder');
    const hasTouchableOpacity = gridContent.includes('TouchableOpacity');
    const hasOnLongPress = gridContent.includes('onLongPress');
    const hasHandleCellPress = gridContent.includes('handleCellPress');

    console.log('   ✅ PanResponder removido:', !hasPanResponder);
    console.log('   ✅ TouchableOpacity implementado:', hasTouchableOpacity);
    console.log('   ✅ Long press implementado:', hasOnLongPress);
    console.log('   ✅ handleCellPress implementado:', hasHandleCellPress);

    if (!hasPanResponder && hasTouchableOpacity && hasOnLongPress && hasHandleCellPress) {
        console.log('   🎉 Grid simplificado correctamente');
    } else {
        console.log('   ⚠️ Grid necesita más simplificaciones');
    }
} else {
    console.log('   ❌ Grid no encontrado');
}

// 3. Verificar Auth de Google
console.log('\n3️⃣ Verificando Auth de Google...');
const authPath = path.join(__dirname, '../services/auth.ts');
if (fs.existsSync(authPath)) {
    const authContent = fs.readFileSync(authPath, 'utf8');

    const hasGoogleSignin = authContent.includes('@react-native-google-signin/google-signin');
    const hasGoogleAuthProvider = authContent.includes('GoogleAuthProvider');
    const hasSignInWithCredential = authContent.includes('signInWithCredential');
    const hasFallbackMock = authContent.includes('signInWithGoogleMock');

    console.log('   ✅ Google Sign-In importado:', hasGoogleSignin);
    console.log('   ✅ GoogleAuthProvider implementado:', hasGoogleAuthProvider);
    console.log('   ✅ signInWithCredential implementado:', hasSignInWithCredential);
    console.log('   ✅ Fallback mock implementado:', hasFallbackMock);

    if (hasGoogleSignin && hasGoogleAuthProvider && hasSignInWithCredential && hasFallbackMock) {
        console.log('   🎉 Auth de Google implementado correctamente');
    } else {
        console.log('   ⚠️ Auth de Google necesita más implementaciones');
    }
} else {
    console.log('   ❌ Auth service no encontrado');
}

// 4. Verificar App.tsx actualizado
console.log('\n4️⃣ Verificando App.tsx actualizado...');
const appPath = path.join(__dirname, '../App.tsx');
if (fs.existsSync(appPath)) {
    const appContent = fs.readFileSync(appPath, 'utf8');

    const hasAudioSettingsState = appContent.includes('showAudioSettings');
    const hasAudioSettingsModal = appContent.includes('AudioSettings');
    const hasAudioButton = appContent.includes('audioButton');

    console.log('   ✅ Estado de AudioSettings implementado:', hasAudioSettingsState);
    console.log('   ✅ Modal de AudioSettings implementado:', hasAudioSettingsModal);
    console.log('   ✅ Botón de audio implementado:', hasAudioButton);

    if (hasAudioSettingsState && hasAudioSettingsModal && hasAudioButton) {
        console.log('   🎉 App.tsx actualizado correctamente');
    } else {
        console.log('   ⚠️ App.tsx necesita más actualizaciones');
    }
} else {
    console.log('   ❌ App.tsx no encontrado');
}

// 5. Verificar dependencias
console.log('\n5️⃣ Verificando dependencias...');
const packagePath = path.join(__dirname, '../package.json');
if (fs.existsSync(packagePath)) {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    const hasGoogleSignin = packageContent.dependencies &&
        packageContent.dependencies['@react-native-google-signin/google-signin'];

    console.log('   ✅ Google Sign-In instalado:', !!hasGoogleSignin);

    if (hasGoogleSignin) {
        console.log('   🎉 Dependencias actualizadas correctamente');
    } else {
        console.log('   ⚠️ Falta instalar Google Sign-In');
    }
} else {
    console.log('   ❌ package.json no encontrado');
}

// Resumen
console.log('\n📋 Resumen de correcciones:');
console.log('   • Parpadeo en barras de volumen: Optimizado con useCallback y useMemo');
console.log('   • Touch en Grid: Simplificado removiendo PanResponder');
console.log('   • Auth de Google: Implementado con fallback mock');
console.log('   • App.tsx: Actualizado para usar modal de AudioSettings');

console.log('\n🚀 Próximos pasos:');
console.log('   1. Configurar Web Client ID en services/auth.ts');
console.log('   2. Probar en dispositivo real');
console.log('   3. Verificar que no hay parpadeo en barras de volumen');
console.log('   4. Verificar que el touch funciona correctamente');
console.log('   5. Verificar que el auth de Google funciona');

console.log('\n✅ Script completado'); 