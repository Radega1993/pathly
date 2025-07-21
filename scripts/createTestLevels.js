const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Configuración de Firebase (usar las mismas credenciales que en tu .env)
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

// Niveles de prueba
const testLevels = [
    {
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
    },
    {
        difficulty: "normal",
        gridSize: 5,
        grid: {
            "0": [null, 1, null, null, null],
            "1": [null, null, null, null, null],
            "2": [null, null, null, 2, null],
            "3": [null, null, null, null, null],
            "4": [null, null, null, null, 4]
        },
        solution: [
            { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 0 },
            { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
            { x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 2 }, { x: 0, y: 2 },
            { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 },
            { x: 4, y: 4 }, { x: 3, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 4 }, { x: 0, y: 4 }
        ]
    },
    {
        difficulty: "hard",
        gridSize: 5,
        grid: {
            "0": [null, null, 1, null, null],
            "1": [null, null, null, null, null],
            "2": [null, null, null, null, null],
            "3": [null, null, null, null, null],
            "4": [null, null, null, null, 4]
        },
        solution: [
            { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0 },
            { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
            { x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 2 }, { x: 0, y: 2 },
            { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 },
            { x: 4, y: 4 }, { x: 3, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 4 }, { x: 0, y: 4 }
        ]
    },
    {
        difficulty: "extreme",
        gridSize: 5,
        grid: {
            "0": [null, null, null, null, null],
            "1": [null, 1, null, null, null],
            "2": [null, null, null, null, null],
            "3": [null, null, null, null, null],
            "4": [null, null, null, null, 4]
        },
        solution: [
            { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 0, y: 1 },
            { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 },
            { x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 2 }, { x: 0, y: 2 },
            { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 },
            { x: 4, y: 4 }, { x: 3, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 4 }, { x: 0, y: 4 }
        ]
    }
];

async function createTestLevels() {
    try {
        console.log('🚀 Creando niveles de prueba en Firestore...');

        const levelsRef = collection(db, 'levels');

        for (const level of testLevels) {
            const docRef = await addDoc(levelsRef, level);
            console.log(`✅ Nivel ${level.difficulty} creado con ID: ${docRef.id}`);
        }

        console.log('🎉 ¡Todos los niveles de prueba han sido creados exitosamente!');
        console.log('📊 Niveles creados:');
        testLevels.forEach(level => {
            console.log(`  - ${level.difficulty}: ${level.gridSize}x${level.gridSize}`);
        });

    } catch (error) {
        console.error('❌ Error creando niveles:', error);
        console.error('💡 Verifica que:');
        console.error('   1. Las credenciales de Firebase sean correctas');
        console.error('   2. Las reglas de Firestore permitan escritura');
        console.error('   3. Tengas permisos de administrador en el proyecto');
    }
}

// Ejecutar el script
createTestLevels(); 