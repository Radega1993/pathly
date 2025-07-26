#!/usr/bin/env node

/**
 * Script para configurar variables de entorno para close tester
 * Ejecutar: node scripts/setup-close-tester-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment for close tester...\n');

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', 'env.example');

// Leer el archivo .env actual si existe
let currentEnv = '';
if (fs.existsSync(envPath)) {
    currentEnv = fs.readFileSync(envPath, 'utf8');
    console.log('✅ Found existing .env file');
}

// Leer el archivo env.example
let envExample = '';
if (fs.existsSync(envExamplePath)) {
    envExample = fs.readFileSync(envExamplePath, 'utf8');
    console.log('✅ Found env.example file');
}

// Configuración para close tester
const closeTesterConfig = {
    // AdMob Test IDs para close tester
    'ADMOB_ANDROID_APP_ID': 'ca-app-pub-3940256099942544~3347511713',
    'ADMOB_IOS_APP_ID': 'ca-app-pub-3940256099942544~1458002511',
    'ADMOB_INTERSTITIAL_AD_UNIT_ID': 'ca-app-pub-3940256099942544/1033173712',
    'ADMOB_REWARDED_AD_UNIT_ID': 'ca-app-pub-3940256099942544/5224354917',
    'ADMOB_BANNER_AD_UNIT_ID': 'ca-app-pub-3940256099942544/6300978111',

    // Configuración de entorno
    'NODE_ENV': 'development',
    'ENABLE_ADS': 'true',
    'ENABLE_MOCK_DATA': 'true',
    'DEBUG_MODE': 'true'
};

console.log('📋 Configuring variables for close tester:');

// Función para actualizar o agregar una variable
function updateEnvVariable(envContent, key, value) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    const newLine = `${key}=${value}`;

    if (regex.test(envContent)) {
        // Variable existe, actualizarla
        console.log(`   🔄 ${key}=${value}`);
        return envContent.replace(regex, newLine);
    } else {
        // Variable no existe, agregarla
        console.log(`   ➕ ${key}=${value}`);
        return envContent + `\n${newLine}`;
    }
}

// Actualizar variables de AdMob
let updatedEnv = currentEnv;
Object.entries(closeTesterConfig).forEach(([key, value]) => {
    updatedEnv = updateEnvVariable(updatedEnv, key, value);
});

// Escribir el archivo .env actualizado
fs.writeFileSync(envPath, updatedEnv);

console.log('\n✅ Environment configured for close tester!');
console.log('\n📱 Next steps:');
console.log('   1. Restart your development server');
console.log('   2. Run: npm start');
console.log('   3. Test ads should now work in close tester');

console.log('\n🔍 To verify configuration:');
console.log('   node scripts/check-env-config.js');

console.log('\n🔄 To switch back to production:');
console.log('   node scripts/setup-production-env.js');

console.log('\n✅ Setup completed!'); 