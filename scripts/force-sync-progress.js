const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function forceSyncProgress() {
    try {
        console.log('🔄 Forzando sincronización de progreso...\n');

        // 1. Autenticar usuario
        console.log('1️⃣ Autenticando usuario...');
        const userCredential = await signInWithEmailAndPassword(
            auth,
            'rauldearriba@gmail.com',
            'tu_contraseña_aqui' // Reemplazar con la contraseña real
        );
        const user = userCredential.user;
        console.log('✅ Usuario autenticado:', user.email);

        // 2. Crear progreso actualizado (nivel 23)
        console.log('\n2️⃣ Creando progreso actualizado...');
        const updatedProgress = {
            completedLevels: [
                'level_1', 'level_2', 'level_3', 'level_4', 'level_5',
                'level_6', 'level_7', 'level_8', 'level_9', 'level_10',
                'level_11', 'level_12', 'level_13', 'level_14', 'level_15',
                'level_16', 'level_17', 'level_18', 'level_19', 'level_20',
                'level_21', 'level_22'
            ],
            lastPlayedLevel: 'level_23',
            lastPlayedAt: Date.now(),
            lastSyncAt: Date.now(),
            totalLevelsCompleted: 22
        };

        console.log('📊 Progreso a sincronizar:');
        console.log('- Niveles completados:', updatedProgress.completedLevels.length);
        console.log('- Último nivel jugado:', updatedProgress.lastPlayedLevel);
        console.log('- Total completados:', updatedProgress.totalLevelsCompleted);

        // 3. Actualizar Firestore
        console.log('\n3️⃣ Actualizando Firestore...');
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            progress: updatedProgress,
            lastLoginAt: Date.now()
        });

        console.log('✅ Sincronización forzada completada exitosamente!');
        console.log('💡 El progreso ahora refleja que estás en el nivel 23.');

    } catch (error) {
        console.error('❌ Error durante la sincronización forzada:', error);

        if (error.code === 'auth/user-not-found') {
            console.log('🔧 Solución: Verificar que el email sea correcto');
        } else if (error.code === 'auth/wrong-password') {
            console.log('🔧 Solución: Verificar que la contraseña sea correcta');
        } else if (error.code === 'permission-denied') {
            console.log('🔧 Solución: Verificar reglas de Firestore');
        } else {
            console.log('🔧 Solución: Revisar configuración de Firebase');
        }
    }
}

// Ejecutar sincronización forzada
forceSyncProgress(); 