#!/usr/bin/env node

/**
 * Script para probar la configuración de OAuth y diagnosticar problemas
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Probando configuración de OAuth...\n');

// Verificar variables de entorno
console.log('1️⃣ Verificando variables de entorno...');
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    let googleClientId = null;
    for (const line of lines) {
        if (line.startsWith('GOOGLE_WEB_CLIENT_ID=')) {
            googleClientId = line.split('=')[1];
            break;
        }
    }

    if (googleClientId) {
        console.log('   ✅ GOOGLE_WEB_CLIENT_ID encontrado');
        console.log('   📋 Client ID:', googleClientId);
        console.log('   📏 Longitud:', googleClientId.length);

        // Verificar formato del Client ID
        if (googleClientId.includes('.apps.googleusercontent.com')) {
            console.log('   ✅ Formato correcto (contiene .apps.googleusercontent.com)');
        } else {
            console.log('   ⚠️ Formato incorrecto (debería contener .apps.googleusercontent.com)');
        }

        // Verificar que no esté vacío
        if (googleClientId.trim() === '') {
            console.log('   ❌ Client ID está vacío');
        } else {
            console.log('   ✅ Client ID no está vacío');
        }
    } else {
        console.log('   ❌ GOOGLE_WEB_CLIENT_ID no encontrado en .env');
    }
} else {
    console.log('   ❌ Archivo .env no encontrado');
}

// Verificar configuración en Google Cloud Console
console.log('\n2️⃣ Verificación en Google Cloud Console:');
console.log('   📋 Tipo de aplicación: Android');
console.log('   📋 Package name: com.pathly.game');
console.log('   📋 SHA-1 fingerprint: 8C:A7:06:79:A5:AC:E9:4C:B2:66:5E:69:1F:B0:46:9D:AC:AF:E6:DB');

// Verificar servicios habilitados
console.log('\n3️⃣ Servicios que deben estar habilitados en Google Cloud Console:');
console.log('   ✅ Google+ API');
console.log('   ✅ Google Identity API');
console.log('   ✅ Google Sign-In API');

// Verificar OAuth Consent Screen
console.log('\n4️⃣ OAuth Consent Screen debe tener:');
console.log('   ✅ App name: Pathly');
console.log('   ✅ User support email: tu email');
console.log('   ✅ Developer contact information: tu email');
console.log('   ✅ Test users: añade tu email de Google');
console.log('   ✅ Scopes: email, profile, openid');

// Posibles problemas comunes
console.log('\n5️⃣ Posibles problemas y soluciones:');
console.log('   🔍 Problema: "400: invalid request"');
console.log('      Solución: Verificar que el Client ID sea correcto y específico para Android');
console.log('');
console.log('   🔍 Problema: "access blocked: authorization error"');
console.log('      Solución: Verificar OAuth Consent Screen y test users');
console.log('');
console.log('   🔍 Problema: "redirect_uri_mismatch"');
console.log('      Solución: No aplica para Android, solo para web');
console.log('');
console.log('   🔍 Problema: "invalid_client"');
console.log('      Solución: Verificar que el Client ID sea el correcto');

// Comandos de verificación
console.log('\n6️⃣ Comandos para verificar:');
console.log('   📱 Prueba en dispositivo real (no emulador)');
console.log('   🔄 Haz un nuevo build después de cambiar configuración');
console.log('   ⏰ Espera 5-60 minutos después de cambiar Google Cloud Console');
console.log('   🧪 Prueba con una cuenta de test user');

console.log('\n✅ Análisis completado'); 