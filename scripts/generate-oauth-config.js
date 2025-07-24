#!/usr/bin/env node

/**
 * Script para generar la configuración exacta de OAuth
 * que necesitas en Google Cloud Console
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Generando configuración de OAuth para Google Cloud Console...\n');

// Leer configuración del proyecto
const appConfigPath = path.join(__dirname, '../app.config.js');
let expoUsername = 'tu-usuario-expo'; // Por defecto

if (fs.existsSync(appConfigPath)) {
    const appConfigContent = fs.readFileSync(appConfigPath, 'utf8');

    // Intentar extraer el username de Expo si está configurado
    const ownerMatch = appConfigContent.match(/owner:\s*["']([^"']+)["']/);
    if (ownerMatch) {
        expoUsername = ownerMatch[1];
    }
}

// Leer package.json para obtener el slug
const packagePath = path.join(__dirname, '../package.json');
let projectSlug = 'pathly-game';

if (fs.existsSync(packagePath)) {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    if (packageContent.name) {
        projectSlug = packageContent.name;
    }
}

console.log('📋 Configuración detectada:');
console.log(`   Usuario Expo: ${expoUsername}`);
console.log(`   Slug del proyecto: ${projectSlug}`);
console.log(`   Package name: com.pathly.game`);
console.log('');

console.log('🔧 Configuración para Google Cloud Console:');
console.log('');
console.log('=== ORÍGENES AUTORIZADOS DE JAVASCRIPT ===');
console.log('Para usar con solicitudes de un navegador:');
console.log('');
console.log('https://auth.expo.io');
console.log('https://expo.dev');
console.log('https://expo.io');
console.log('');

console.log('=== URIS DE REDIRECCIONAMIENTO AUTORIZADOS ===');
console.log('Para usar con solicitudes de un servidor web:');
console.log('');
console.log(`https://auth.expo.io/@${expoUsername}/${projectSlug}`);
console.log('com.pathly.game://auth');
console.log('com.pathly.game://');
console.log('');

console.log('📱 Configuración adicional para apps móviles:');
console.log('');
console.log('=== ANDROID ===');
console.log('Package name: com.pathly.game');
console.log('SHA-1 certificate fingerprint: (opcional para desarrollo)');
console.log('');
console.log('=== IOS ===');
console.log('Bundle ID: com.pathly.game');
console.log('');

console.log('⚠️  IMPORTANTE:');
console.log('   1. Copia exactamente estas URLs en Google Cloud Console');
console.log('   2. No añadas espacios extra o caracteres adicionales');
console.log('   3. La configuración puede tardar 5-60 minutos en aplicarse');
console.log('   4. Para desarrollo, también puedes añadir:');
console.log('      - http://localhost:19006');
console.log('      - http://localhost:8081');
console.log('');

console.log('🔍 Verificación después de configurar:');
console.log('   1. Ve a Google Cloud Console > APIs & Services > Credentials');
console.log('   2. Edita tu OAuth 2.0 Client ID');
console.log('   3. Pega las URLs en las secciones correspondientes');
console.log('   4. Guarda los cambios');
console.log('   5. Espera 5-60 minutos para que se apliquen');
console.log('');

console.log('✅ Configuración generada'); 