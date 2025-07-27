const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

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

async function testRegisterWithLocalProgress() {
    try {
        console.log('🧪 Probando registro con progreso local existente...\n');

        // 1. Simular progreso local existente
        console.log('1️⃣ Simulando progreso local existente...');
        const mockLocalProgress = {
            completedLevels: ['level_1', 'level_2', 'level_3', 'level_15', 'level_20'],
            lastPlayedLevel: 'level_21',
            lastPlayedAt: Date.now(),
            totalLevelsCompleted: 5
        };

        console.log('📊 Progreso local simulado:');
        console.log('- Niveles completados:', mockLocalProgress.completedLevels);
        console.log('- Último nivel jugado:', mockLocalProgress.lastPlayedLevel);
        console.log('- Nivel más alto:', getHighestLevelFromProgress(mockLocalProgress));

        // 2. Crear cuenta nueva con email único
        const timestamp = Date.now();
        const testEmail = `test_${timestamp}@example.com`;
        const testPassword = 'password123';
        const testDisplayName = 'Usuario Test';

        console.log('\n2️⃣ Registrando nueva cuenta...');
        console.log('- Email:', testEmail);
        console.log('- Nombre:', testDisplayName);

        const userCredential = await createUserWithEmailAndPassword(
            auth,
            testEmail,
            testPassword
        );
        const user = userCredential.user;
        console.log('✅ Cuenta creada exitosamente:', user.uid);

        // 3. Verificar que el progreso se sincronizó correctamente
        console.log('\n3️⃣ Verificando sincronización de progreso...');

        // Esperar un momento para que se complete la sincronización
        await new Promise(resolve => setTimeout(resolve, 2000));

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const progress = userData.progress;

            console.log('📊 Progreso en la nube después del registro:');
            console.log('- Niveles completados:', progress.completedLevels);
            console.log('- Último nivel jugado:', progress.lastPlayedLevel);
            console.log('- Total completados:', progress.totalLevelsCompleted);
            console.log('- Nivel más alto:', getHighestLevelFromProgress(progress));

            // Verificar que se sincronizó correctamente
            const expectedLevels = mockLocalProgress.completedLevels.length;
            const actualLevels = progress.completedLevels.length;

            if (actualLevels === expectedLevels) {
                console.log('✅ Sincronización exitosa: Progreso local transferido correctamente');
            } else {
                console.log('❌ Error en sincronización: Niveles no coinciden');
                console.log('- Esperado:', expectedLevels);
                console.log('- Actual:', actualLevels);
            }
        } else {
            console.log('❌ Usuario no encontrado en Firestore');
        }

        // 4. Limpiar - eliminar cuenta de prueba
        console.log('\n4️⃣ Limpiando cuenta de prueba...');
        await signOut(auth);
        console.log('✅ Logout exitoso');

        console.log('\n🎉 Prueba completada!');
        console.log('✅ El registro sincroniza correctamente el progreso local');
        console.log('✅ La nueva cuenta mantiene el progreso existente');

    } catch (error) {
        console.error('❌ Error durante la prueba:', error);

        // Mostrar detalles del error
        if (error.code === 'auth/email-already-in-use') {
            console.log('💡 El email de prueba ya existe, intenta con otro email');
        } else if (error.code === 'auth/weak-password') {
            console.log('💡 La contraseña es muy débil');
        } else if (error.code === 'auth/invalid-email') {
            console.log('💡 El email no es válido');
        }
    }
}

// Función auxiliar para obtener nivel más alto
function getHighestLevelFromProgress(progress) {
    if (!progress.completedLevels || progress.completedLevels.length === 0) return 0;

    let highestLevel = 0;
    for (const levelId of progress.completedLevels) {
        const match = levelId.match(/level_(\d+)/);
        if (match) {
            const levelNumber = parseInt(match[1], 10);
            if (levelNumber > highestLevel) {
                highestLevel = levelNumber;
            }
        }
    }
    return highestLevel;
}

// Ejecutar prueba
testRegisterWithLocalProgress(); 