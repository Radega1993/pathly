#!/usr/bin/env node

/**
 * Script para generar configuración de OAuth específica para Android
 */

console.log('🔐 Generando configuración de OAuth para Android...\n');

// Datos de la app
const packageName = 'com.pathly.game';
const sha1Fingerprint = '8C:A7:06:79:A5:AC:E9:4C:B2:66:5E:69:1F:B0:46:9D:AC:AF:E6:DB';

console.log('📋 Configuración para Google Cloud Console - OAuth Client ID Android:\n');

console.log('=== CONFIGURACIÓN BÁSICA ===');
console.log('Tipo de aplicación: Android');
console.log('Nombre: Pathly Android App (o el nombre que prefieras)');
console.log('');

console.log('=== NOMBRE DEL PAQUETE (OBLIGATORIO) ===');
console.log(packageName);
console.log('');

console.log('=== HUELLA DIGITAL SHA-1 (RECOMENDADO) ===');
console.log(sha1Fingerprint);
console.log('');

console.log('=== COMANDO PARA OBTENER SHA-1 ===');
console.log('keytool -keystore android/app/pathly-release-key.keystore -list -v -alias pathly-key-alias -storepass pathly123');
console.log('');

console.log('=== CONFIGURACIÓN ADICIONAL ===');
console.log('✅ Verifica la propiedad de la app: Opcional');
console.log('✅ Configuración puede tardar: 5-60 minutos');
console.log('');

console.log('=== PASOS EN GOOGLE CLOUD CONSOLE ===');
console.log('1. Ve a Google Cloud Console > APIs & Services > Credentials');
console.log('2. Haz clic en "CREATE CREDENTIALS" > "OAuth client ID"');
console.log('3. Selecciona "Android" como tipo de aplicación');
console.log('4. Nombre: Pathly Android App');
console.log('5. Package name: ' + packageName);
console.log('6. SHA-1 certificate fingerprint: ' + sha1Fingerprint);
console.log('7. Haz clic en "CREATE"');
console.log('');

console.log('=== DESPUÉS DE CREAR ===');
console.log('1. Copia el nuevo Client ID');
console.log('2. Actualiza tu archivo .env con el nuevo Client ID');
console.log('3. Actualiza app.config.js si es necesario');
console.log('4. Haz un nuevo build de la app');
console.log('');

console.log('=== VENTAJAS DE ESTA CONFIGURACIÓN ===');
console.log('✅ Específica para Android');
console.log('✅ Más segura con SHA-1 fingerprint');
console.log('✅ Cumple con las políticas de Google Play');
console.log('✅ Funciona en producción');
console.log('✅ No requiere URLs de redireccionamiento web');
console.log('');

console.log('=== ARCHIVO .ENV ACTUALIZADO ===');
console.log('GOOGLE_WEB_CLIENT_ID=tu_nuevo_client_id_para_android');
console.log('');

console.log('✅ Configuración generada para Android'); 