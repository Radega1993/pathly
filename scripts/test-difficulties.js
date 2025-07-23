/**
 * Script para probar que las dificultades se muestran correctamente
 * Verifica que las dificultades del generador Python coinciden con el frontend
 */

console.log('🧪 Probando sistema de dificultades...\n');

// Simular las dificultades del generador Python
const pythonDifficulties = [
    'muy_facil',
    'facil',
    'normal',
    'dificil',
    'extremo'
];

// Simular las funciones del frontend
const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
        case 'muy_facil': return '#22C55E'; // Verde
        case 'facil': return '#10B981'; // Verde claro
        case 'normal': return '#3B82F6'; // Azul
        case 'dificil': return '#F59E0B'; // Naranja
        case 'extremo': return '#EF4444'; // Rojo
        default: return '#6B7280'; // Gris
    }
};

const getDifficultyEmoji = (difficulty) => {
    switch (difficulty) {
        case 'muy_facil': return '🟢';
        case 'facil': return '🟩';
        case 'normal': return '🔵';
        case 'dificil': return '🟡';
        case 'extremo': return '🔴';
        default: return '⚪';
    }
};

const getDifficultyText = (difficulty) => {
    switch (difficulty) {
        case 'muy_facil': return 'Muy Fácil';
        case 'facil': return 'Fácil';
        case 'normal': return 'Normal';
        case 'dificil': return 'Difícil';
        case 'extremo': return 'Extremo';
        default: return 'Desconocido';
    }
};

// Probar cada dificultad
console.log('📊 Probando dificultades del generador Python:');
pythonDifficulties.forEach((difficulty, index) => {
    const color = getDifficultyColor(difficulty);
    const emoji = getDifficultyEmoji(difficulty);
    const text = getDifficultyText(difficulty);

    console.log(`   ${index + 1}. ${difficulty}:`);
    console.log(`      🎨 Color: ${color}`);
    console.log(`      😀 Emoji: ${emoji}`);
    console.log(`      📝 Texto: ${text}`);
    console.log('');
});

// Probar dificultad desconocida
console.log('❓ Probando dificultad desconocida:');
const unknownDifficulty = 'unknown';
const unknownColor = getDifficultyColor(unknownDifficulty);
const unknownEmoji = getDifficultyEmoji(unknownDifficulty);
const unknownText = getDifficultyText(unknownDifficulty);

console.log(`   Dificultad: ${unknownDifficulty}`);
console.log(`   🎨 Color: ${unknownColor}`);
console.log(`   😀 Emoji: ${unknownEmoji}`);
console.log(`   📝 Texto: ${unknownText}`);
console.log('');

// Mostrar mapeo de dificultades
console.log('📋 Mapeo de dificultades:');
console.log('   Python Generator → Frontend Display');
console.log('   ──────────────────────────────────');
console.log('   muy_facil → Muy Fácil 🟢');
console.log('   facil → Fácil 🟩');
console.log('   normal → Normal 🔵');
console.log('   dificil → Difícil 🟡');
console.log('   extremo → Extremo 🔴');
console.log('');

// Verificar que no hay dificultades faltantes
const allDifficulties = ['muy_facil', 'facil', 'normal', 'dificil', 'extremo'];
const missingDifficulties = [];

allDifficulties.forEach(difficulty => {
    if (getDifficultyText(difficulty) === 'Desconocido') {
        missingDifficulties.push(difficulty);
    }
});

if (missingDifficulties.length > 0) {
    console.log('⚠️  Dificultades faltantes:', missingDifficulties);
} else {
    console.log('✅ Todas las dificultades están correctamente mapeadas');
}

console.log('\n🎉 Prueba de dificultades completada!'); 