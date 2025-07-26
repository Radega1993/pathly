#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Cambiando a IDs de producción de AdMob...');

const envPath = path.join(__dirname, '..', '.env');

try {
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Cambiar IDs de test a producción
    envContent = envContent.replace(
        /ADMOB_INTERSTITIAL_ID=ca-app-pub-3940256099942544\/1033173712/,
        'ADMOB_INTERSTITIAL_ID=ca-app-pub-4553067801626383/6963330688'
    );

    envContent = envContent.replace(
        /ADMOB_REWARDED_ID=ca-app-pub-3940256099942544\/5224354917/,
        'ADMOB_REWARDED_ID=ca-app-pub-4553067801626383/6975611425'
    );

    fs.writeFileSync(envPath, envContent);

    console.log('✅ IDs de producción configurados:');
    console.log('   - Intersticial: ca-app-pub-4553067801626383/6963330688');
    console.log('   - Recompensado: ca-app-pub-4553067801626383/6975611425');
    console.log('');
    console.log('🔄 Reinicia la app con: npx expo start --clear');

} catch (error) {
    console.error('❌ Error cambiando a IDs de producción:', error);
} 