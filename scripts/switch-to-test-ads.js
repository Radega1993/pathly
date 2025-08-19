#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Switching to AdMob Test Ads - Pathly Game');
console.log('============================================\n');

// IDs de test de AdMob
const TEST_IDS = {
    ANDROID_APP_ID: 'ca-app-pub-3940256099942544~3347511713',
    INTERSTITIAL_ID: 'ca-app-pub-3940256099942544/1033173712',
    REWARDED_ID: 'ca-app-pub-3940256099942544/5224354917'
};

// Leer el archivo .env actual
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
    console.error('❌ Archivo .env no encontrado');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

// Crear backup
const backupPath = path.join(__dirname, '..', '.env.backup-test');
fs.writeFileSync(backupPath, envContent);
console.log('✅ Backup creado en .env.backup-test');

// Actualizar líneas con IDs de test
const updatedLines = lines.map(line => {
    if (line.startsWith('ADMOB_ANDROID_APP_ID=')) {
        return `ADMOB_ANDROID_APP_ID=${TEST_IDS.ANDROID_APP_ID}`;
    }
    if (line.startsWith('ADMOB_INTERSTITIAL_ID=')) {
        return `ADMOB_INTERSTITIAL_ID=${TEST_IDS.INTERSTITIAL_ID}`;
    }
    if (line.startsWith('ADMOB_REWARDED_ID=')) {
        return `ADMOB_REWARDED_ID=${TEST_IDS.REWARDED_ID}`;
    }
    if (line.startsWith('ADMOB_DEBUG_MODE=')) {
        return 'ADMOB_DEBUG_MODE=true';
    }
    return line;
});

// Escribir archivo actualizado
fs.writeFileSync(envPath, updatedLines.join('\n'));

console.log('✅ Archivo .env actualizado con IDs de test:');
console.log(`   ADMOB_ANDROID_APP_ID: ${TEST_IDS.ANDROID_APP_ID}`);
console.log(`   ADMOB_INTERSTITIAL_ID: ${TEST_IDS.INTERSTITIAL_ID}`);
console.log(`   ADMOB_REWARDED_ID: ${TEST_IDS.REWARDED_ID}`);
console.log('   ADMOB_DEBUG_MODE: true');

console.log('\n📱 Próximos pasos:');
console.log('   1. Reinicia la app en tu dispositivo/emulador');
console.log('   2. Prueba las pistas (primera gratis, segunda con anuncio)');
console.log('   3. Completa 3 niveles para probar anuncio intersticial');
console.log('   4. Verifica que los anuncios de test se muestren correctamente');

console.log('\n🔄 Para volver a producción:');
console.log('   node scripts/switch-to-production-ads.js');

console.log('\n✅ Cambio completado'); 