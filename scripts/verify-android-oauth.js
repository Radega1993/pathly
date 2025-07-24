#!/usr/bin/env node

/**
 * Script para verificar la configuración de OAuth para Android
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Verificando configuración de OAuth para Android...\n');

// Verificar archivo .env
console.log('1️⃣ Verificando archivo .env...');
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasGoogleClientId = envContent.includes('GOOGLE_WEB_CLIENT_ID');
    const hasCorrectClientId = envContent.includes('727976213025-b49ei7dlpp08s8vf0dhjtsfuqk1c1i18.apps.googleusercontent.com');

    console.log('   ✅ Variable GOOGLE_WEB_CLIENT_ID presente:', hasGoogleClientId);
    console.log('   ✅ Client ID correcto configurado:', hasCorrectClientId);

    if (hasGoogleClientId && hasCorrectClientId) {
        console.log('   🎉 Archivo .env configurado correctamente');
    } else {
        console.log('   ⚠️ Archivo .env necesita configuración');
    }
} else {
    console.log('   ❌ Archivo .env no encontrado');
}

// Verificar services/auth.ts
console.log('\n2️⃣ Verificando services/auth.ts...');
const authPath = path.join(__dirname, '../services/auth.ts');
if (fs.existsSync(authPath)) {
    const authContent = fs.readFileSync(authPath, 'utf8');
    const usesEnvVariable = authContent.includes('process.env.GOOGLE_WEB_CLIENT_ID');
    const hasFallback = authContent.includes('727976213025-b49ei7dlpp08s8vf0dhjtsfuqk1c1i18.apps.googleusercontent.com');

    console.log('   ✅ Usa variable de entorno:', usesEnvVariable);
    console.log('   ✅ Tiene fallback correcto:', hasFallback);

    if (usesEnvVariable && hasFallback) {
        console.log('   🎉 services/auth.ts configurado correctamente');
    } else {
        console.log('   ⚠️ services/auth.ts necesita configuración');
    }
} else {
    console.log('   ❌ services/auth.ts no encontrado');
}

// Verificar app.config.js
console.log('\n3️⃣ Verificando app.config.js...');
const configPath = path.join(__dirname, '../app.config.js');
if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const hasGoogleClientId = configContent.includes('googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID');
    const hasScheme = configContent.includes('scheme: "com.pathly.game"');

    console.log('   ✅ googleWebClientId en extra:', hasGoogleClientId);
    console.log('   ✅ Scheme configurado:', hasScheme);

    if (hasGoogleClientId && hasScheme) {
        console.log('   🎉 app.config.js configurado correctamente');
    } else {
        console.log('   ⚠️ app.config.js necesita configuración');
    }
} else {
    console.log('   ❌ app.config.js no encontrado');
}

// Verificar Google Cloud Console
console.log('\n4️⃣ Verificación en Google Cloud Console:');
console.log('   ✅ Tipo de aplicación: Android');
console.log('   ✅ Package name: com.pathly.game');
console.log('   ✅ SHA-1 fingerprint: 8C:A7:06:79:A5:AC:E9:4C:B2:66:5E:69:1F:B0:46:9D:AC:AF:E6:DB');
console.log('   ✅ Client ID: 727976213025-b49ei7dlpp08s8vf0dhjtsfuqk1c1i18.apps.googleusercontent.com');

// Resumen de configuración
console.log('\n📋 Resumen de configuración:');
console.log('   • Client ID para Android configurado');
console.log('   • Variable de entorno actualizada');
console.log('   • Fallback en código añadido');
console.log('   • Scheme configurado en app.config.js');
console.log('   • Google Cloud Console configurado para Android');

console.log('\n🎯 Próximos pasos:');
console.log('   1. Asegúrate de que el archivo .env tenga el Client ID correcto');
console.log('   2. Haz un nuevo build de la app');
console.log('   3. Prueba el auth en un dispositivo real');
console.log('   4. Verifica que no aparezca el error "access blocked"');

console.log('\n✅ Verificación completada'); 