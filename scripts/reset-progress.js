#!/usr/bin/env node
/**
 * Script para resetear el progreso del juego
 * Uso: node scripts/reset-progress.js
 */

const { resetGameProgress } = require('../services/levelService');

async function main() {
    try {
        console.log('🔄 Reseteando progreso del juego...');
        await resetGameProgress();
        console.log('✅ ¡Progreso reseteado! Puedes empezar desde el nivel 1');
    } catch (error) {
        console.error('❌ Error al resetear progreso:', error.message);
        process.exit(1);
    }
}

main(); 