#!/usr/bin/env node

/**
 * Script para configurar variables de entorno para producción (close tester)
 * Ejecutar: node scripts/setup-production-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up environment for production (close tester)...\n');

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

// Configuración para producción (close tester)
const productionConfig = {
    // AdMob Production IDs para close tester
    'ADMOB_ANDROID_APP_ID': 'ca-app-pub-4553067801626383~6760188699',
    'ADMOB_IOS_APP_ID': 'ca-app-pub-4553067801626383~1234567890', // Reemplazar con tu ID real de iOS
    'ADMOB_INTERSTITIAL_AD_UNIT_ID': 'ca-app-pub-4553067801626383/6963330688',
    'ADMOB_REWARDED_AD_UNIT_ID': 'ca-app-pub-4553067801626383/6963330688',
    'ADMOB_BANNER_AD_UNIT_ID': 'ca-app-pub-4553067801626383/1234567890', // Reemplazar con tu ID real de banner

    // Configuración de entorno para close tester
    'NODE_ENV': 'production',
    'ENABLE_ADS': 'true',
    'ENABLE_MOCK_DATA': 'false',
    'DEBUG_MODE': 'false'
};

console.log('📋 Configuring variables for production (close tester):');

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
Object.entries(productionConfig).forEach(([key, value]) => {
    updatedEnv = updateEnvVariable(updatedEnv, key, value);
});

// Escribir el archivo .env actualizado
fs.writeFileSync(envPath, updatedEnv);

console.log('\n✅ Environment configured for production (close tester)!');
console.log('\n📱 Next steps:');
console.log('   1. Restart your development server');
console.log('   2. Run: npm start');
console.log('   3. Test with real production ads in close tester');

console.log('\n🔍 To verify configuration:');
console.log('   node scripts/check-env-config.js');

console.log('\n⚠️ Important notes:');
console.log('   - These are REAL production AdMob IDs');
console.log('   - Ads will count towards your AdMob account');
console.log('   - Make sure your AdMob account is approved');
console.log('   - Test thoroughly before publishing');

console.log('\n✅ Setup completed!'); 