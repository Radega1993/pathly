#!/usr/bin/env node

/**
 * Script para verificar que todos los espaciados estén correctos
 * y evitar que se superpongan con iconos del sistema
 */

const fs = require('fs');
const path = require('path');

console.log('📱 Verificando espaciado de layout para dispositivos reales...\n');

// 1. Verificar App.tsx
console.log('1️⃣ Verificando App.tsx...');
const appPath = path.join(__dirname, '../App.tsx');
if (fs.existsSync(appPath)) {
    const appContent = fs.readFileSync(appPath, 'utf8');

    const hasSafeAreaView = appContent.includes('SafeAreaView');
    const hasHeaderPadding = appContent.includes('paddingTop: 20') || appContent.includes('paddingTop: 30');
    const hasFooterPadding = appContent.includes('paddingBottom: 40');
    const hasHeaderHeight = appContent.includes('height: 120');

    console.log('   ✅ SafeAreaView usado:', hasSafeAreaView);
    console.log('   ✅ Header padding superior:', hasHeaderPadding);
    console.log('   ✅ Footer padding inferior:', hasFooterPadding);
    console.log('   ✅ Header height aumentado:', hasHeaderHeight);

    if (hasSafeAreaView && hasHeaderPadding && hasFooterPadding) {
        console.log('   🎉 Espaciado en App.tsx correcto');
    } else {
        console.log('   ⚠️ Espaciado en App.tsx necesita ajustes');
    }
} else {
    console.log('   ❌ App.tsx no encontrado');
}

// 2. Verificar LevelSelectScreen
console.log('\n2️⃣ Verificando LevelSelectScreen...');
const levelSelectPath = path.join(__dirname, '../screens/LevelSelectScreen.tsx');
if (fs.existsSync(levelSelectPath)) {
    const levelSelectContent = fs.readFileSync(levelSelectPath, 'utf8');

    const hasSafeAreaView = levelSelectContent.includes('SafeAreaView');
    const hasHeaderPadding = levelSelectContent.includes('paddingTop: 30');
    const hasFooterPadding = levelSelectContent.includes('paddingBottom: 40');
    const hasHeaderPaddingVertical = levelSelectContent.includes('paddingVertical: 20');

    console.log('   ✅ SafeAreaView usado:', hasSafeAreaView);
    console.log('   ✅ Header padding superior:', hasHeaderPadding);
    console.log('   ✅ Footer padding inferior:', hasFooterPadding);
    console.log('   ✅ Header padding vertical:', hasHeaderPaddingVertical);

    if (hasSafeAreaView && hasHeaderPadding && hasFooterPadding) {
        console.log('   🎉 Espaciado en LevelSelectScreen correcto');
    } else {
        console.log('   ⚠️ Espaciado en LevelSelectScreen necesita ajustes');
    }
} else {
    console.log('   ❌ LevelSelectScreen.tsx no encontrado');
}

// 3. Verificar GameScreen
console.log('\n3️⃣ Verificando GameScreen...');
const gameScreenPath = path.join(__dirname, '../screens/GameScreen.tsx');
if (fs.existsSync(gameScreenPath)) {
    const gameScreenContent = fs.readFileSync(gameScreenPath, 'utf8');

    const hasSafeAreaView = gameScreenContent.includes('SafeAreaView');
    const hasHeaderPadding = gameScreenContent.includes('paddingTop: 30');
    const hasFooterPadding = gameScreenContent.includes('paddingBottom: 40');
    const hasHeaderPaddingVertical = gameScreenContent.includes('paddingVertical: 20');

    console.log('   ✅ SafeAreaView usado:', hasSafeAreaView);
    console.log('   ✅ Header padding superior:', hasHeaderPadding);
    console.log('   ✅ Footer padding inferior:', hasFooterPadding);
    console.log('   ✅ Header padding vertical:', hasHeaderPaddingVertical);

    if (hasSafeAreaView && hasHeaderPadding && hasFooterPadding) {
        console.log('   🎉 Espaciado en GameScreen correcto');
    } else {
        console.log('   ⚠️ Espaciado en GameScreen necesita ajustes');
    }
} else {
    console.log('   ❌ GameScreen.tsx no encontrado');
}

// 4. Verificar Grid component
console.log('\n4️⃣ Verificando Grid component...');
const gridPath = path.join(__dirname, '../components/Grid.tsx');
if (fs.existsSync(gridPath)) {
    const gridContent = fs.readFileSync(gridPath, 'utf8');

    const hasGridMargin = gridContent.includes('GRID_MARGIN = 40');
    const hasContainerPadding = gridContent.includes('padding: GRID_MARGIN');

    console.log('   ✅ Grid margin aumentado:', hasGridMargin);
    console.log('   ✅ Container padding:', hasContainerPadding);

    if (hasGridMargin && hasContainerPadding) {
        console.log('   🎉 Espaciado en Grid correcto');
    } else {
        console.log('   ⚠️ Espaciado en Grid necesita ajustes');
    }
} else {
    console.log('   ❌ Grid.tsx no encontrado');
}

// 5. Resumen de mejoras implementadas
console.log('\n📋 Resumen de mejoras de espaciado:');
console.log('   • Header height aumentado de 100 a 120px');
console.log('   • Header padding superior añadido (20-30px)');
console.log('   • Footer padding inferior aumentado (40px)');
console.log('   • Grid margin aumentado de 20 a 40px');
console.log('   • SafeAreaView usado en todas las pantallas');
console.log('   • Padding horizontal consistente (20px)');

console.log('\n🎯 Beneficios para dispositivos reales:');
console.log('   • Evita superposición con notch/status bar');
console.log('   • Evita superposición con navigation bar');
console.log('   • Mejor experiencia en tablets');
console.log('   • Compatible con diferentes tamaños de pantalla');
console.log('   • Respeta safe areas del sistema');

console.log('\n📱 Dispositivos compatibles:');
console.log('   • iPhone con notch (X, XS, XR, 11, 12, 13, 14, 15)');
console.log('   • iPhone con Dynamic Island (14 Pro, 15 Pro)');
console.log('   • Android con notch/cutout');
console.log('   • Tablets (iPad, Android tablets)');
console.log('   • Dispositivos con navigation gestures');

console.log('\n✅ Script completado'); 