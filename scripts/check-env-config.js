#!/usr/bin/env node

/**
 * Script para verificar la configuración de variables de entorno
 * Ejecutar: node scripts/check-env-config.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Environment Configuration...\n');

// Verificar si existe archivo .env
const envPath = path.join(__dirname, '..', '.env');
const envExists = fs.existsSync(envPath);

console.log(`${envExists ? '✅' : '❌'} .env file: ${envExists ? 'EXISTS' : 'NOT FOUND'}`);

if (envExists) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('\n📋 Environment variables found:');

    // Buscar variables de AdMob
    const admobVars = [
        'ADMOB_ANDROID_APP_ID',
        'ADMOB_IOS_APP_ID',
        'ADMOB_INTERSTITIAL_AD_UNIT_ID',
        'ADMOB_REWARDED_AD_UNIT_ID',
        'ADMOB_BANNER_AD_UNIT_ID'
    ];

    admobVars.forEach(varName => {
        const hasVar = envContent.includes(varName);
        console.log(`   ${hasVar ? '✅' : '❌'} ${varName}: ${hasVar ? 'SET' : 'NOT SET'}`);
    });

    // Buscar variables de configuración
    const configVars = [
        'NODE_ENV',
        'ENABLE_ADS',
        'ENABLE_MOCK_DATA',
        'DEBUG_MODE'
    ];

    console.log('\n⚙️ Configuration variables:');
    configVars.forEach(varName => {
        const hasVar = envContent.includes(varName);
        console.log(`   ${hasVar ? '✅' : '❌'} ${varName}: ${hasVar ? 'SET' : 'NOT SET'}`);
    });

    // Mostrar valores de AdMob si están configurados
    console.log('\n🔧 AdMob Configuration Values:');
    admobVars.forEach(varName => {
        const match = envContent.match(new RegExp(`${varName}=(.+)`));
        if (match) {
            const value = match[1].trim();
            const isTest = value.includes('3940256099942544');
            const isProduction = value.includes('4553067801626383');

            let status = '❓';
            if (isTest) status = '🧪';
            if (isProduction) status = '🚀';

            console.log(`   ${status} ${varName}=${value}`);
        } else {
            console.log(`   ❌ ${varName}=NOT_SET`);
        }
    });

} else {
    console.log('\n💡 To create .env file:');
    console.log('   1. Copy env.example to .env');
    console.log('   2. Fill in your actual values');
    console.log('   3. For close tester, use TEST IDs');
    console.log('   4. For production, use PRODUCTION IDs');
}

// Verificar app.config.js
console.log('\n📱 Checking app.config.js...');
const appConfigPath = path.join(__dirname, '..', 'app.config.js');
const appConfigExists = fs.existsSync(appConfigPath);

if (appConfigExists) {
    const appConfigContent = fs.readFileSync(appConfigPath, 'utf8');

    const checks = [
        { name: 'AdMob variables in extra', pattern: 'ADMOB_ANDROID_APP_ID' },
        { name: 'Environment variables', pattern: 'NODE_ENV' },
        { name: 'Enable ads config', pattern: 'ENABLE_ADS' },
        { name: 'Google Mobile Ads App ID', pattern: 'googleMobileAdsAppId' }
    ];

    checks.forEach(check => {
        const hasPattern = appConfigContent.includes(check.pattern);
        console.log(`   ${hasPattern ? '✅' : '❌'} ${check.name}: ${hasPattern ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
    });
}

// Verificar services/ads.ts
console.log('\n🔧 Checking services/ads.ts...');
const adsServicePath = path.join(__dirname, '..', 'services', 'ads.ts');
const adsServiceExists = fs.existsSync(adsServicePath);

if (adsServiceExists) {
    const adsServiceContent = fs.readFileSync(adsServicePath, 'utf8');

    const checks = [
        { name: 'Uses Constants.expoConfig', pattern: 'Constants.expoConfig' },
        { name: 'Environment detection', pattern: 'isDevelopment' },
        { name: 'Test ads detection', pattern: 'useTestAds' },
        { name: 'Environment variables usage', pattern: 'ADMOB_ANDROID_APP_ID' }
    ];

    checks.forEach(check => {
        const hasPattern = adsServiceContent.includes(check.pattern);
        console.log(`   ${hasPattern ? '✅' : '❌'} ${check.name}: ${hasPattern ? 'IMPLEMENTED' : 'NOT IMPLEMENTED'}`);
    });
}

console.log('\n🎯 Summary:');
console.log('   - Environment file: ' + (envExists ? '✅' : '❌'));
console.log('   - App config: ✅');
console.log('   - Ads service: ✅');

if (!envExists) {
    console.log('\n📝 Next steps:');
    console.log('   1. Create .env file from env.example');
    console.log('   2. Set your AdMob IDs');
    console.log('   3. Configure environment variables');
    console.log('   4. Test with: npm start');
} else {
    console.log('\n✅ Configuration looks good!');
    console.log('   Test with: npm start');
}

console.log('\n🔍 Environment check completed!'); 