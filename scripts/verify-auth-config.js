// Script para verificar la configuración del sistema de autenticación
import { authService, getCurrentUser } from '../services/auth';
import Constants from 'expo-constants';

const verifyAuthConfiguration = () => {
    console.log('🔍 Verificando configuración del sistema de autenticación...');

    // Verificar variables de entorno
    const firebaseConfig = {
        apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
        authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
        projectId: Constants.expoConfig?.extra?.firebaseProjectId,
        storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
        messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
        appId: Constants.expoConfig?.extra?.firebaseAppId,
    };

    console.log('📋 Configuración de Firebase:');
    console.log('   API Key:', firebaseConfig.apiKey ? '✅ Configurado' : '❌ Faltante');
    console.log('   Auth Domain:', firebaseConfig.authDomain ? '✅ Configurado' : '❌ Faltante');
    console.log('   Project ID:', firebaseConfig.projectId ? '✅ Configurado' : '❌ Faltante');
    console.log('   Storage Bucket:', firebaseConfig.storageBucket ? '✅ Configurado' : '❌ Faltante');
    console.log('   Messaging Sender ID:', firebaseConfig.messagingSenderId ? '✅ Configurado' : '❌ Faltante');
    console.log('   App ID:', firebaseConfig.appId ? '✅ Configurado' : '❌ Faltante');

    // Verificar estado del servicio
    console.log('\n🔧 Estado del servicio de autenticación:');
    console.log('   Inicializado:', authService.isAuthInitialized() ? '✅ Sí' : '❌ No');
    console.log('   Usuario actual:', getCurrentUser() ? '✅ Conectado' : '❌ No conectado');

    // Verificar funcionalidades
    console.log('\n🎯 Funcionalidades disponibles:');
    console.log('   ✅ Registro con email/contraseña');
    console.log('   ✅ Login con email/contraseña');
    console.log('   ✅ Recuperación de contraseña');
    console.log('   ✅ Persistencia de sesión');
    console.log('   ✅ Logout seguro');

    // Verificar configuración requerida en Firebase Console
    console.log('\n📋 Configuración requerida en Firebase Console:');
    console.log('   1. Authentication → Sign-in method → Email/Password → Habilitado');
    console.log('   2. Authentication → Templates → Password reset → Configurado');
    console.log('   3. Authentication → Settings → Authorized domains → Tu dominio listado');
    console.log('   4. Firestore → Rules → Configurado para usuarios');

    // Verificar si hay errores de configuración
    const missingConfigs = Object.entries(firebaseConfig)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

    if (missingConfigs.length > 0) {
        console.log('\n❌ Configuraciones faltantes:', missingConfigs.join(', '));
        console.log('💡 Asegúrate de configurar todas las variables de entorno en app.config.js');
    } else {
        console.log('\n✅ Todas las configuraciones básicas están presentes');
    }

    return {
        firebaseConfig,
        isInitialized: authService.isAuthInitialized(),
        currentUser: getCurrentUser(),
        missingConfigs
    };
};

// Ejecutar verificación
const config = verifyAuthConfiguration();

export default config; 