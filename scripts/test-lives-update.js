#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando sistema de actualización de vidas...\n');

// Verificar useLives.ts
const useLivesPath = path.join(__dirname, '../utils/useLives.ts');
if (fs.existsSync(useLivesPath)) {
    const useLivesContent = fs.readFileSync(useLivesPath, 'utf8');

    console.log('✅ utils/useLives.ts encontrado');

    // Verificar que consumeLifeAndUpdate llame a loadLivesState
    if (useLivesContent.includes('await loadLivesState()')) {
        console.log('✅ consumeLifeAndUpdate llama a loadLivesState');
    } else {
        console.log('❌ consumeLifeAndUpdate NO llama a loadLivesState');
    }

    // Verificar que loadLivesState tenga logs de debug
    if (useLivesContent.includes('console.log(\'🔄 loadLivesState ejecutándose...\')')) {
        console.log('✅ loadLivesState tiene logs de debug');
    } else {
        console.log('❌ loadLivesState NO tiene logs de debug');
    }

    // Verificar que no use livesState.currentLives en dependencias
    if (useLivesContent.includes('livesState.currentLives')) {
        console.log('⚠️  useLives usa livesState.currentLives en dependencias (puede causar problemas)');
    } else {
        console.log('✅ useLives NO usa livesState.currentLives en dependencias');
    }
} else {
    console.log('❌ utils/useLives.ts NO encontrado');
}

// Verificar LivesDisplay.tsx
const livesDisplayPath = path.join(__dirname, '../components/LivesDisplay.tsx');
if (fs.existsSync(livesDisplayPath)) {
    const livesDisplayContent = fs.readFileSync(livesDisplayPath, 'utf8');

    console.log('\n✅ components/LivesDisplay.tsx encontrado');

    // Verificar que use el hook useLives
    if (livesDisplayContent.includes('const { livesState, timeRemaining, formatTimeRemaining } = useLives()')) {
        console.log('✅ LivesDisplay usa el hook useLives');
    } else {
        console.log('❌ LivesDisplay NO usa el hook useLives');
    }

    // Verificar que tenga logs de debug
    if (livesDisplayContent.includes('console.log(\'🔄 LivesDisplay render')) {
        console.log('✅ LivesDisplay tiene logs de debug');
    } else {
        console.log('❌ LivesDisplay NO tiene logs de debug');
    }

    // Verificar que no reciba props de livesState
    if (livesDisplayContent.includes('livesState?:') || livesDisplayContent.includes('timeRemaining?:')) {
        console.log('⚠️  LivesDisplay recibe props de estado (puede causar problemas)');
    } else {
        console.log('✅ LivesDisplay NO recibe props de estado');
    }
} else {
    console.log('\n❌ components/LivesDisplay.tsx NO encontrado');
}

// Verificar GameScreen.tsx
const gameScreenPath = path.join(__dirname, '../screens/GameScreen.tsx');
if (fs.existsSync(gameScreenPath)) {
    const gameScreenContent = fs.readFileSync(gameScreenPath, 'utf8');

    console.log('\n✅ screens/GameScreen.tsx encontrado');

    // Verificar que no pase props al LivesDisplay
    if (gameScreenContent.includes('livesState={livesState}') || gameScreenContent.includes('timeRemaining={timeRemaining}')) {
        console.log('❌ GameScreen pasa props al LivesDisplay');
    } else {
        console.log('✅ GameScreen NO pasa props al LivesDisplay');
    }

    // Verificar que llame a updateLivesDisplay
    if (gameScreenContent.includes('await updateLivesDisplay()')) {
        console.log('✅ GameScreen llama a updateLivesDisplay');
    } else {
        console.log('❌ GameScreen NO llama a updateLivesDisplay');
    }
} else {
    console.log('\n❌ screens/GameScreen.tsx NO encontrado');
}

// Verificar livesService.ts
const livesServicePath = path.join(__dirname, '../services/livesService.ts');
if (fs.existsSync(livesServicePath)) {
    const livesServiceContent = fs.readFileSync(livesServicePath, 'utf8');

    console.log('\n✅ services/livesService.ts encontrado');

    // Verificar que getCurrentLivesState llame a regenerateLives
    if (livesServiceContent.includes('export const getCurrentLivesState = async (): Promise<LivesState> => {') &&
        livesServiceContent.includes('return await regenerateLives();')) {
        console.log('✅ getCurrentLivesState llama a regenerateLives');
    } else {
        console.log('❌ getCurrentLivesState NO llama a regenerateLives');
    }
} else {
    console.log('\n❌ services/livesService.ts NO encontrado');
}

console.log('\n🎯 Resumen de verificación:');
console.log('- El sistema debe actualizar automáticamente el display de vidas');
console.log('- Los logs de debug ayudarán a identificar problemas');
console.log('- Si no se actualiza, revisar los logs en la consola'); 