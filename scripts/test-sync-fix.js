const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, getDoc, updateDoc } = require('firebase/firestore');

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

async function testSyncFix() {
    try {
        console.log('🔧 Probando y arreglando sincronización...\n');

        // 1. Autenticar usuario
        console.log('1️⃣ Autenticando usuario...');
        const userCredential = await signInWithEmailAndPassword(
            auth,
            'rauldearriba@gmail.com',
            'tu_contraseña_aqui' // Reemplazar con la contraseña real
        );
        const user = userCredential.user;
        console.log('✅ Usuario autenticado:', user.email);

        // 2. Obtener datos actuales
        console.log('\n2️⃣ Obteniendo datos actuales...');
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            console.log('❌ Usuario no encontrado en Firestore');
            return;
        }

        const userData = userDoc.data();
        console.log('📊 Estado actual en Firestore:');
        console.log('- Niveles completados:', userData.progress?.completedLevels?.length || 0);
        console.log('- Último nivel jugado:', userData.progress?.lastPlayedLevel || 'null');
        console.log('- Total completados:', userData.progress?.totalLevelsCompleted || 0);

        // 3. Crear progreso corregido (nivel 23)
        console.log('\n3️⃣ Creando progreso corregido...');
        const correctedProgress = {
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

        console.log('📱 Progreso corregido:');
        console.log('- Niveles completados:', correctedProgress.completedLevels.length);
        console.log('- Último nivel jugado:', correctedProgress.lastPlayedLevel);
        console.log('- Total completados:', correctedProgress.totalLevelsCompleted);

        // 4. Actualizar Firestore
        console.log('\n4️⃣ Actualizando Firestore...');
        await updateDoc(userRef, {
            progress: correctedProgress,
            lastLoginAt: Date.now()
        });

        console.log('✅ Firestore actualizado correctamente');

        // 5. Verificar actualización
        console.log('\n5️⃣ Verificando actualización...');
        const updatedDoc = await getDoc(userRef);
        const updatedData = updatedDoc.data();

        console.log('📊 Datos actualizados en Firestore:');
        console.log('- Niveles completados:', updatedData.progress?.completedLevels?.length || 0);
        console.log('- Último nivel jugado:', updatedData.progress?.lastPlayedLevel || 'null');
        console.log('- Total completados:', updatedData.progress?.totalLevelsCompleted || 0);
        console.log('- Última sincronización:', new Date(updatedData.progress?.lastSyncAt || 0).toLocaleString());

        console.log('\n🎉 ¡Sincronización arreglada exitosamente!');
        console.log('💡 Ahora el progreso refleja correctamente que estás en el nivel 23.');
        console.log('🔄 La próxima vez que hagas login, la sincronización debería funcionar correctamente.');

    } catch (error) {
        console.error('❌ Error durante la prueba:', error);

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

// Ejecutar prueba
testSyncFix(); 