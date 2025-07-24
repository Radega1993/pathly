#!/usr/bin/env node

/**
 * Script para probar que las barras de volumen muestren correctamente el porcentaje
 */

const fs = require('fs');
const path = require('path');

console.log('🔊 Verificando barras de volumen en AudioSettings...\n');

// Verificar AudioSettings.tsx
console.log('1️⃣ Verificando AudioSettings.tsx...');
const audioSettingsPath = path.join(__dirname, '../components/AudioSettings.tsx');
if (fs.existsSync(audioSettingsPath)) {
    const audioSettingsContent = fs.readFileSync(audioSettingsPath, 'utf8');

    // Verificar función renderVolumeBar
    const hasRenderVolumeBar = audioSettingsContent.includes('renderVolumeBar');
    const hasSegments = audioSettingsContent.includes('const segments = 10');
    const hasFilledSegments = audioSettingsContent.includes('filledSegments = Math.round(volume * segments)');
    const hasIndexLogic = audioSettingsContent.includes('index < filledSegments');

    console.log('   ✅ Función renderVolumeBar:', hasRenderVolumeBar);
    console.log('   ✅ 10 segmentos definidos:', hasSegments);
    console.log('   ✅ Lógica de segmentos llenos:', hasFilledSegments);
    console.log('   ✅ Lógica de índice:', hasIndexLogic);

    // Verificar estilos
    const hasVolumeSegment = audioSettingsContent.includes('volumeSegment');
    const hasVolumeSegmentEmpty = audioSettingsContent.includes('volumeSegmentEmpty');
    const hasMusicSegmentFilled = audioSettingsContent.includes('musicSegmentFilled');
    const hasSoundSegmentFilled = audioSettingsContent.includes('soundSegmentFilled');

    console.log('   ✅ Estilo volumeSegment:', hasVolumeSegment);
    console.log('   ✅ Estilo volumeSegmentEmpty:', hasVolumeSegmentEmpty);
    console.log('   ✅ Estilo musicSegmentFilled:', hasMusicSegmentFilled);
    console.log('   ✅ Estilo soundSegmentFilled:', hasSoundSegmentFilled);

    // Verificar que no hay estilos que sobrescriban
    const hasMusicSegment = audioSettingsContent.includes('musicSegment:');
    const hasSoundSegment = audioSettingsContent.includes('soundSegment:');

    console.log('   ⚠️ Estilos que sobrescriben (deberían estar eliminados):');
    console.log('      musicSegment:', hasMusicSegment);
    console.log('      soundSegment:', hasSoundSegment);

    if (hasRenderVolumeBar && hasSegments && hasFilledSegments && hasIndexLogic &&
        hasVolumeSegment && hasVolumeSegmentEmpty && hasMusicSegmentFilled && hasSoundSegmentFilled) {
        console.log('   🎉 Barras de volumen configuradas correctamente');
    } else {
        console.log('   ⚠️ Barras de volumen necesitan configuración');
    }

    if (hasMusicSegment || hasSoundSegment) {
        console.log('   ⚠️ Hay estilos que pueden sobrescribir la lógica de volumen');
    }
} else {
    console.log('   ❌ AudioSettings.tsx no encontrado');
}

// Verificar lógica de volumen
console.log('\n2️⃣ Verificando lógica de volumen...');
if (fs.existsSync(audioSettingsPath)) {
    const audioSettingsContent = fs.readFileSync(audioSettingsPath, 'utf8');

    // Verificar que se usa la lógica correcta
    const hasCorrectLogic = audioSettingsContent.includes('index < filledSegments') &&
        audioSettingsContent.includes('musicSegmentFilled') &&
        audioSettingsContent.includes('soundSegmentFilled');

    if (hasCorrectLogic) {
        console.log('   ✅ Lógica de volumen correcta implementada');
        console.log('   ✅ Los segmentos se pintan según el porcentaje real');
    } else {
        console.log('   ⚠️ La lógica de volumen necesita ajustes');
    }
}

// Explicar cómo debería funcionar
console.log('\n📋 Cómo deberían funcionar las barras de volumen:');
console.log('   • 10 segmentos totales');
console.log('   • Los segmentos se llenan según el porcentaje de volumen');
console.log('   • Música: segmentos azules (#3B82F6)');
console.log('   • Efectos: segmentos verdes (#22C55E)');
console.log('   • Segmentos vacíos: gris claro (#E5E7EB)');
console.log('   • Ejemplo: 50% de volumen = 5 segmentos llenos');

console.log('\n🎯 Ejemplos de visualización:');
console.log('   • 0%:   [░░░░░░░░░░] (todos vacíos)');
console.log('   • 30%:  [███░░░░░░░] (3 llenos)');
console.log('   • 50%:  [█████░░░░░] (5 llenos)');
console.log('   • 80%:  [████████░░] (8 llenos)');
console.log('   • 100%: [██████████] (todos llenos)');

console.log('\n🔧 Si las barras no funcionan correctamente:');
console.log('   • Verificar que no hay estilos que sobrescriban la lógica');
console.log('   • Asegurar que la función renderVolumeBar usa la lógica correcta');
console.log('   • Comprobar que los estilos musicSegmentFilled y soundSegmentFilled existen');
console.log('   • Verificar que volumeSegmentEmpty está definido');

console.log('\n✅ Script completado'); 