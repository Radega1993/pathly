import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
    apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
    authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
    projectId: Constants.expoConfig?.extra?.firebaseProjectId,
    storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
    messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
    appId: Constants.expoConfig?.extra?.firebaseAppId,
    measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId,
};

// Validar que las credenciales estén configuradas
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);

if (missingFields.length > 0) {
    console.error('❌ Configuración de Firebase incompleta. Faltan:', missingFields);
    console.error('💡 Asegúrate de crear el archivo .env con tus credenciales de Firebase');
    throw new Error(`Configuración de Firebase incompleta. Faltan: ${missingFields.join(', ')}`);
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);

console.log('✅ Firebase configurado correctamente para el proyecto:', firebaseConfig.projectId);

export default app; 