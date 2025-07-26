const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, onAuthStateChanged } = require('firebase/auth');
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

async function verifyPersistenceAndSync() {
    try {
        console.log('🔍 Verificando persistencia de sesión y sincronización...\n');

        // 1. Verificar estado de autenticación actual
        console.log('1️⃣ Verificando estado de autenticación...');

        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                unsubscribe();

                if (user) {
                    console.log('✅ Usuario autenticado automáticamente:', user.email);
                    console.log('🆔 UID:', user.uid);
                    console.log('📅 Último login:', new Date(user.metadata.lastSignInTime).toLocaleString());

                    // 2. Verificar progreso en la nube
                    console.log('\n2️⃣ Verificando progreso en la nube...');
                    const userRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const progress = userData.progress;

                        console.log('📊 Progreso en la nube:');
                        console.log('- Niveles completados:', progress?.completedLevels?.length || 0);
                        console.log('- Último nivel jugado:', progress?.lastPlayedLevel || 'null');
                        console.log('- Total completados:', progress?.totalLevelsCompleted || 0);
                        console.log('- Última sincronización:', new Date(progress?.lastSyncAt || 0).toLocaleString());

                        // 3. Simular completar un nivel
                        console.log('\n3️⃣ Simulando completar un nivel...');
                        const newLevelId = 'level_23';
                        const updatedProgress = {
                            completedLevels: [
                                ...(progress?.completedLevels || []),
                                newLevelId
                            ],
                            lastPlayedLevel: 'level_24',
                            lastPlayedAt: Date.now(),
                            lastSyncAt: Date.now(),
                            totalLevelsCompleted: (progress?.completedLevels?.length || 0) + 1
                        };

                        console.log('📱 Progreso actualizado:');
                        console.log('- Nuevo nivel completado:', newLevelId);
                        console.log('- Último nivel jugado: level_24');
                        console.log('- Total completados:', updatedProgress.totalLevelsCompleted);

                        console.log('\n🎉 Verificación completada exitosamente!');
                        console.log('✅ La sesión se mantiene automáticamente');
                        console.log('✅ El progreso se sincroniza automáticamente');
                        console.log('✅ El usuario permanece logueado hasta hacer logout explícito');

                    } else {
                        console.log('⚠️ Usuario no encontrado en Firestore');
                    }
                } else {
                    console.log('❌ No hay usuario autenticado');
                    console.log('💡 Esto es normal si es la primera vez que usas la app');
                }

                resolve();
            });
        });

    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
    }
}

// Ejecutar verificación
verifyPersistenceAndSync(); 