const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBtabKhrGWgGR8TNBWhyyxYxHBOXENCxl0",
    authDomain: "pathly-68c8a.firebaseapp.com",
    projectId: "pathly-68c8a",
    storageBucket: "pathly-68c8a.firebasestorage.app",
    messagingSenderId: "486601405154",
    appId: "1:486601405154:web:8f4e4c58faca8a448e24bb",
    measurementId: "G-1YXXF0C51J"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupDevMode() {
    try {
        console.log('🔧 Configurando modo desarrollo...');

        // Intentar crear un nivel de prueba para verificar permisos
        const levelsRef = collection(db, 'levels');

        const testLevel = {
            difficulty: "easy",
            gridSize: 5,
            grid: {
                "0": [1, null, null, null, null],
                "1": [null, null, null, null, null],
                "2": [null, null, 2, null, null],
                "3": [null, null, null, null, null],
                "4": [null, null, null, null, 4]
            },
            solution: [
                { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 },
                { x: 4, y: 1 }, { x: 3, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 1 },
                { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
                { x: 4, y: 3 }, { x: 3, y: 3 }, { x: 2, y: 3 }, { x: 1, y: 3 }, { x: 0, y: 3 },
                { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }
            ]
        };

        const docRef = await addDoc(levelsRef, testLevel);
        console.log('✅ Permisos de Firestore OK - Nivel de prueba creado:', docRef.id);
        console.log('🎉 La app debería funcionar correctamente con Firestore');

    } catch (error) {
        console.error('❌ Error de permisos en Firestore:', error.message);
        console.log('🔧 Activando modo desarrollo local...');
        console.log('');
        console.log('📋 Para solucionar el problema de permisos:');
        console.log('1. Ve a https://console.firebase.google.com/');
        console.log('2. Selecciona tu proyecto "pathly-68c8a"');
        console.log('3. Ve a Firestore Database > Rules');
        console.log('4. Copia y pega las reglas del archivo firestore.rules');
        console.log('5. Haz clic en "Publish"');
        console.log('');
        console.log('🔄 Mientras tanto, la app funcionará en modo desarrollo local');
    }
}

setupDevMode(); 