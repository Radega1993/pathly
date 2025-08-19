#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Switching to AdMob Production Ads - Pathly Game');
console.log('==================================================\n');

// IDs de producción de AdMob - Ambos son "Intersticiales bonificados"
const PRODUCTION_IDS = {
    ANDROID_APP_ID: 'ca-app-pub-4553067801626383~6760188699',
    INTERSTITIAL_ID: 'ca-app-pub-4553067801626383/6975611425', // intrinsecal_pista - Intersticial bonificado
    REWARDED_ID: 'ca-app-pub-4553067801626383/6963330688'       // pista - Intersticial bonificado
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
const backupPath = path.join(__dirname, '..', '.env.backup-production');
fs.writeFileSync(backupPath, envContent);
console.log('✅ Backup creado en .env.backup-production');

// Actualizar líneas con IDs de producción
const updatedLines = lines.map(line => {
    if (line.startsWith('ADMOB_ANDROID_APP_ID=')) {
        return `ADMOB_ANDROID_APP_ID=${PRODUCTION_IDS.ANDROID_APP_ID}`;
    }
    if (line.startsWith('ADMOB_INTERSTITIAL_ID=')) {
        return `ADMOB_INTERSTITIAL_ID=${PRODUCTION_IDS.INTERSTITIAL_ID}`;
    }
    if (line.startsWith('ADMOB_REWARDED_ID=')) {
        return `ADMOB_REWARDED_ID=${PRODUCTION_IDS.REWARDED_ID}`;
    }
    if (line.startsWith('ADMOB_DEBUG_MODE=')) {
        return 'ADMOB_DEBUG_MODE=false';
    }
    return line;
});

// Escribir archivo actualizado
fs.writeFileSync(envPath, updatedLines.join('\n'));

console.log('✅ Archivo .env actualizado con IDs de producción:');
console.log(`   ADMOB_ANDROID_APP_ID: ${PRODUCTION_IDS.ANDROID_APP_ID}`);
console.log(`   ADMOB_INTERSTITIAL_ID: ${PRODUCTION_IDS.INTERSTITIAL_ID}`);
console.log(`   ADMOB_REWARDED_ID: ${PRODUCTION_IDS.REWARDED_ID}`);
console.log('   ADMOB_DEBUG_MODE: false');

console.log('\n📱 Próximos pasos:');
console.log('   1. Reinicia la app en tu dispositivo/emulador');
console.log('   2. Verifica que los anuncios de producción funcionen');
console.log('   3. Si no funcionan, verifica en Google AdMob Console que estén activos');

console.log('\n🔄 Para volver a test:');
console.log('   node scripts/switch-to-test-ads.js');

console.log('\n✅ Cambio completado'); 