#!/usr/bin/env node

/**
 * Script para verificar la configuración de Google OAuth
 * y identificar problemas de autorización
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Verificando configuración de Google OAuth...\n');

// 1. Verificar variables de entorno
console.log('1️⃣ Verificando variables de entorno...');
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');

    const hasGoogleClientId = envContent.includes('GOOGLE_WEB_CLIENT_ID');
    const hasFirebaseConfig = envContent.includes('FIREBASE_');

    console.log('   ✅ Archivo .env encontrado');
    console.log('   ✅ GOOGLE_WEB_CLIENT_ID presente:', hasGoogleClientId);
    console.log('   ✅ Configuración Firebase presente:', hasFirebaseConfig);

    if (hasGoogleClientId && hasFirebaseConfig) {
        console.log('   🎉 Variables de entorno configuradas');
    } else {
        console.log('   ⚠️ Faltan variables importantes');
    }
} else {
    console.log('   ❌ Archivo .env no encontrado');
}

// 2. Verificar configuración de auth
console.log('\n2️⃣ Verificando configuración de auth...');
const authPath = path.join(__dirname, '../services/auth.ts');
if (fs.existsSync(authPath)) {
    const authContent = fs.readFileSync(authPath, 'utf8');

    const hasExpoAuthSession = authContent.includes('expo-auth-session');
    const hasGoogleClientId = authContent.includes('GOOGLE_CLIENT_ID');
    const hasRedirectUri = authContent.includes('makeRedirectUri');
    const hasScheme = authContent.includes('com.pathly.game');
    const hasErrorHandling = authContent.includes('result.type === \'error\'');

    console.log('   ✅ expo-auth-session importado:', hasExpoAuthSession);
    console.log('   ✅ GOOGLE_CLIENT_ID configurado:', hasGoogleClientId);
    console.log('   ✅ Redirect URI configurado:', hasRedirectUri);
    console.log('   ✅ Scheme configurado:', hasScheme);
    console.log('   ✅ Manejo de errores presente:', hasErrorHandling);

    if (hasExpoAuthSession && hasGoogleClientId && hasRedirectUri && hasScheme) {
        console.log('   🎉 Configuración de auth correcta');
    } else {
        console.log('   ⚠️ Configuración de auth incompleta');
    }
} else {
    console.log('   ❌ services/auth.ts no encontrado');
}

// 3. Verificar app.config.js
console.log('\n3️⃣ Verificando app.config.js...');
const appConfigPath = path.join(__dirname, '../app.config.js');
if (fs.existsSync(appConfigPath)) {
    const appConfigContent = fs.readFileSync(appConfigPath, 'utf8');

    const hasScheme = appConfigContent.includes('scheme: "com.pathly.game"');
    const hasGoogleWebClientId = appConfigContent.includes('googleWebClientId');
    const hasAndroidPackage = appConfigContent.includes('package: "com.pathly.game"');

    console.log('   ✅ Scheme configurado:', hasScheme);
    console.log('   ✅ googleWebClientId en extra:', hasGoogleWebClientId);
    console.log('   ✅ Android package configurado:', hasAndroidPackage);

    if (hasScheme && hasGoogleWebClientId && hasAndroidPackage) {
        console.log('   🎉 app.config.js correcto');
    } else {
        console.log('   ⚠️ app.config.js necesita ajustes');
    }
} else {
    console.log('   ❌ app.config.js no encontrado');
}

// 4. Verificar dependencias
console.log('\n4️⃣ Verificando dependencias...');
const packagePath = path.join(__dirname, '../package.json');
if (fs.existsSync(packagePath)) {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    const hasExpoAuthSession = packageContent.dependencies && packageContent.dependencies['expo-auth-session'];
    const hasExpoCrypto = packageContent.dependencies && packageContent.dependencies['expo-crypto'];
    const hasFirebaseAuth = packageContent.dependencies && packageContent.dependencies['firebase'];

    console.log('   ✅ expo-auth-session instalado:', !!hasExpoAuthSession);
    console.log('   ✅ expo-crypto instalado:', !!hasExpoCrypto);
    console.log('   ✅ firebase instalado:', !!hasFirebaseAuth);

    if (hasExpoAuthSession && hasExpoCrypto && hasFirebaseAuth) {
        console.log('   🎉 Dependencias correctas');
    } else {
        console.log('   ⚠️ Faltan dependencias importantes');
    }
} else {
    console.log('   ❌ package.json no encontrado');
}

// 5. Problemas comunes y soluciones
console.log('\n🔍 Problemas comunes de Google OAuth:');
console.log('   1. **Client ID incorrecto**: Verificar que el GOOGLE_WEB_CLIENT_ID sea correcto');
console.log('   2. **OAuth consent screen**: Debe estar configurado en Google Cloud Console');
console.log('   3. **APIs no habilitadas**: Google+ API debe estar habilitada');
console.log('   4. **Dominios autorizados**: Verificar dominios en OAuth consent screen');
console.log('   5. **Scheme incorrecto**: Debe coincidir con el package name');

console.log('\n🔧 Soluciones para "access blocked: authorization error":');
console.log('   1. **Verificar OAuth consent screen**:');
console.log('      - Ir a Google Cloud Console > APIs & Services > OAuth consent screen');
console.log('      - Asegurar que el estado sea "Testing" o "In production"');
console.log('      - Verificar que el email esté en usuarios de prueba');
console.log('');
console.log('   2. **Verificar APIs habilitadas**:');
console.log('      - Google+ API debe estar habilitada');
console.log('      - Google Identity API debe estar habilitada');
console.log('');
console.log('   3. **Verificar Client ID**:');
console.log('      - Ir a Google Cloud Console > APIs & Services > Credentials');
console.log('      - Verificar que el Web Client ID sea correcto');
console.log('      - Asegurar que no haya restricciones de dominio');

console.log('\n📋 Checklist para solucionar el problema:');
console.log('   □ Verificar GOOGLE_WEB_CLIENT_ID en .env');
console.log('   □ Configurar OAuth consent screen');
console.log('   □ Habilitar APIs necesarias');
console.log('   □ Verificar usuarios de prueba');
console.log('   □ Probar con build de desarrollo');
console.log('   □ Verificar logs de error detallados');

console.log('\n✅ Script completado'); 