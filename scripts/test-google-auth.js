#!/usr/bin/env node

/**
 * Script para probar específicamente el auth de Google
 * y identificar por qué está fallando
 */

const { GoogleSignin } = require('@react-native-google-signin/google-signin');

console.log('🔍 Probando configuración de Google Sign-In...\n');

// Configurar Google Sign-In
GoogleSignin.configure({
    webClientId: '727976213025-jlau2lt454rmeom1h8mptbdfbscqkh6c.apps.googleusercontent.com',
    offlineAccess: true,
    forceCodeForRefreshToken: true,
});

console.log('✅ Google Sign-In configurado');

async function testGoogleAuth() {
    try {
        console.log('\n1️⃣ Verificando Google Play Services...');
        await GoogleSignin.hasPlayServices();
        console.log('✅ Google Play Services disponible');

        console.log('\n2️⃣ Verificando si el usuario ya está logueado...');
        const isSignedIn = await GoogleSignin.isSignedIn();
        console.log('Usuario logueado:', isSignedIn);

        if (isSignedIn) {
            console.log('\n3️⃣ Obteniendo información del usuario actual...');
            const currentUser = await GoogleSignin.getCurrentUser();
            console.log('Usuario actual:', currentUser);
        }

        console.log('\n4️⃣ Intentando login...');
        const userInfo = await GoogleSignin.signIn();
        console.log('✅ Login exitoso');
        console.log('Información del usuario:', userInfo);

        console.log('\n5️⃣ Obteniendo tokens...');
        const tokens = await GoogleSignin.getTokens();
        console.log('✅ Tokens obtenidos');
        console.log('ID Token:', tokens.idToken ? '✅ Presente' : '❌ Ausente');
        console.log('Access Token:', tokens.accessToken ? '✅ Presente' : '❌ Ausente');

        if (tokens.idToken) {
            console.log('\n6️⃣ ID Token válido para Firebase Auth');
            console.log('✅ Todo listo para autenticar con Firebase');
        } else {
            console.log('\n❌ Error: No se obtuvo ID Token');
            console.log('Esto puede ser por:');
            console.log('- Configuración incorrecta del Web Client ID');
            console.log('- Permisos insuficientes en Google Cloud Console');
            console.log('- OAuth consent screen no configurado');
        }

    } catch (error) {
        console.error('\n❌ Error en el test:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));

        if (error.code === 'SIGN_IN_CANCELLED') {
            console.log('\n💡 El usuario canceló el login');
        } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
            console.log('\n💡 Google Play Services no disponible');
        } else if (error.code === 'SIGN_IN_REQUIRED') {
            console.log('\n💡 Login requerido');
        } else {
            console.log('\n💡 Error desconocido, revisa la configuración');
        }
    }
}

// Ejecutar el test
testGoogleAuth(); 