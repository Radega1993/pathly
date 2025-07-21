import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    QueryDocumentSnapshot,
    DocumentData
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';
import { Level, Difficulty, FirestoreLevel } from '../types/level';
import { Cell } from '../components/Grid';

const PLAYED_LEVELS_KEY = 'played_levels';
const DEV_MODE_KEY = 'dev_mode';

// Niveles de desarrollo local
const devLevels: { [key in Difficulty]: FirestoreLevel } = {
    easy: {
        difficulty: 'easy',
        gridSize: 5,
        grid: [
            [1, null, null, null, null],
            [null, null, null, null, null],
            [null, null, 2, null, null],
            [null, null, null, null, null],
            [null, null, null, null, 4]
        ],
        solution: [
            { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 },
            { x: 4, y: 1 }, { x: 3, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 1 },
            { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
            { x: 4, y: 3 }, { x: 3, y: 3 }, { x: 2, y: 3 }, { x: 1, y: 3 }, { x: 0, y: 3 },
            { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }
        ]
    },
    normal: {
        difficulty: 'normal',
        gridSize: 5,
        grid: [
            [null, 1, null, null, null],
            [null, null, null, null, null],
            [null, null, null, 2, null],
            [null, null, null, null, null],
            [null, null, null, null, 4]
        ],
        solution: [
            { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 0 },
            { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
            { x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 2 }, { x: 0, y: 2 },
            { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 },
            { x: 4, y: 4 }, { x: 3, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 4 }, { x: 0, y: 4 }
        ]
    },
    hard: {
        difficulty: 'hard',
        gridSize: 5,
        grid: [
            [null, null, 1, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, 4]
        ],
        solution: [
            { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0 },
            { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
            { x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 2 }, { x: 0, y: 2 },
            { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 },
            { x: 4, y: 4 }, { x: 3, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 4 }, { x: 0, y: 4 }
        ]
    },
    extreme: {
        difficulty: 'extreme',
        gridSize: 5,
        grid: [
            [null, null, null, null, null],
            [null, 1, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, 4]
        ],
        solution: [
            { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 0, y: 1 },
            { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 },
            { x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 2 }, { x: 0, y: 2 },
            { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 },
            { x: 4, y: 4 }, { x: 3, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 4 }, { x: 0, y: 4 }
        ]
    }
};

/**
 * Convierte un grid de Firestore a Cell[][]
 * Soporta tanto arrays como objetos con índices
 * Convierte 0s a null para celdas vacías
 */
function convertGridToCells(grid: (number | null)[][] | { [key: string]: (number | null)[] }): Cell[][] {
    if (Array.isArray(grid)) {
        // Formato de array
        return grid.map((row, y) =>
            row.map((value, x) => ({
                x,
                y,
                value: value === 0 ? null : value // Convertir 0 a null
            }))
        );
    } else {
        // Formato de objeto con índices
        const size = Object.keys(grid).length;
        const result: Cell[][] = [];

        for (let y = 0; y < size; y++) {
            result[y] = [];
            const row = grid[y.toString()];
            for (let x = 0; x < row.length; x++) {
                result[y][x] = {
                    x,
                    y,
                    value: row[x] === 0 ? null : row[x] // Convertir 0 a null
                };
            }
        }

        return result;
    }
}

/**
 * Obtiene los IDs de niveles ya jugados desde AsyncStorage
 */
async function getPlayedLevelIds(): Promise<string[]> {
    try {
        const playedLevels = await AsyncStorage.getItem(PLAYED_LEVELS_KEY);
        return playedLevels ? JSON.parse(playedLevels) : [];
    } catch (error) {
        console.error('Error al obtener niveles jugados:', error);
        return [];
    }
}

/**
 * Guarda un ID de nivel como jugado en AsyncStorage
 */
async function markLevelAsPlayed(levelId: string): Promise<void> {
    try {
        const playedLevels = await getPlayedLevelIds();
        if (!playedLevels.includes(levelId)) {
            playedLevels.push(levelId);
            await AsyncStorage.setItem(PLAYED_LEVELS_KEY, JSON.stringify(playedLevels));
        }
    } catch (error) {
        console.error('Error al marcar nivel como jugado:', error);
    }
}

/**
 * Carga un nivel específico desde Firestore por número
 * 
 * @param levelNumber - Número del nivel (1, 2, 3, etc.)
 * @returns Promise<Level> - Nivel específico con id, gridSize, grid y solution
 */
export async function loadLevelByNumber(levelNumber: number): Promise<Level> {
    try {
        const levelsRef = collection(db, 'levels');
        const difficulties: Difficulty[] = ['easy', 'normal', 'hard', 'extreme'];
        const targetDifficulty = difficulties[(levelNumber - 1) % difficulties.length];

        // Buscar por dificultad
        const levelQuery = query(
            levelsRef,
            where('difficulty', '==', targetDifficulty)
        );

        const querySnapshot = await getDocs(levelQuery);

        if (querySnapshot.empty) {
            // Si no hay niveles en Firestore, usar modo desarrollo
            console.log('No se encontraron niveles en Firestore, usando modo desarrollo');
            return loadDevLevel(levelNumber);
        }

        // Obtener todos los documentos de la dificultad
        const docs = querySnapshot.docs;

        // Seleccionar el nivel basado en el número (usando módulo para distribuir)
        const levelIndex = Math.floor((levelNumber - 1) / difficulties.length) % docs.length;
        const doc = docs[levelIndex];

        const levelId = doc.id;
        const levelData = doc.data() as FirestoreLevel;

        // Convertir el grid de Firestore a formato Cell
        const cellGrid = convertGridToCells(levelData.grid);

        // Crear el objeto Level
        const level: Level = {
            id: levelId,
            difficulty: levelData.difficulty,
            gridSize: levelData.gridSize,
            grid: cellGrid,
            solution: levelData.solution
        };

        console.log(`Nivel cargado: ${level.id} (${levelData.difficulty}) - Nivel ${levelNumber}`);
        return level;

    } catch (error) {
        console.error('Error al cargar nivel desde Firestore:', error);
        // Fallback a modo desarrollo
        console.log('Fallback a modo desarrollo para nivel', levelNumber);
        return loadDevLevel(levelNumber);
    }
}

/**
 * Carga un nivel de desarrollo local por número
 */
function loadDevLevel(levelNumber: number): Level {
    const difficulties: Difficulty[] = ['easy', 'normal', 'hard', 'extreme'];
    const difficulty = difficulties[(levelNumber - 1) % difficulties.length];
    const devLevel = devLevels[difficulty];

    // Crear un ID único para el nivel de desarrollo
    const devLevelId = `dev_${difficulty}_${levelNumber}`;

    // Convertir el grid a formato Cell
    const cellGrid = convertGridToCells(devLevel.grid);

    const level: Level = {
        id: devLevelId,
        difficulty: devLevel.difficulty,
        gridSize: devLevel.gridSize,
        grid: cellGrid,
        solution: devLevel.solution
    };

    console.log(`Nivel de desarrollo cargado: ${level.id} (${difficulty}) - Nivel ${levelNumber}`);
    return level;
}

/**
 * Carga el siguiente nivel disponible según el progreso del usuario
 * 
 * @param difficulty - Dificultad del nivel ('easy', 'normal', 'hard', 'extreme')
 * @returns Promise<Level> - Nivel específico con id, gridSize, grid y solution
 */
export async function loadLevelFromFirestore(difficulty: Difficulty): Promise<Level> {
    try {
        // Obtener el progreso local para determinar qué nivel cargar
        const completedCount = await getPlayedLevelsCount();
        const levelNumber = completedCount + 1; // El siguiente nivel a jugar

        // Usar la función loadLevelByNumber para cargar el nivel específico
        return await loadLevelByNumber(levelNumber);

    } catch (error) {
        console.error('Error al cargar nivel desde Firestore:', error);
        throw new Error(`Error al cargar nivel de dificultad ${difficulty}: ${error}`);
    }
}

/**
 * Limpia el historial de niveles jugados
 */
export async function clearPlayedLevels(): Promise<void> {
    try {
        await AsyncStorage.removeItem(PLAYED_LEVELS_KEY);
        console.log('Historial de niveles jugados limpiado');
    } catch (error) {
        console.error('Error al limpiar historial de niveles:', error);
    }
}

/**
 * Resetea completamente el progreso del juego (útil para empezar desde el nivel 1)
 */
export async function resetGameProgress(): Promise<void> {
    try {
        // Limpiar niveles jugados
        await clearPlayedLevels();

        // Limpiar progreso local
        const { clearProgress } = await import('./storage');
        await clearProgress();

        console.log('✅ Progreso del juego reseteado completamente');
        console.log('🎮 Puedes empezar desde el nivel 1');
    } catch (error) {
        console.error('❌ Error al resetear progreso:', error);
        throw new Error('No se pudo resetear el progreso del juego');
    }
}

/**
 * Obtiene la cantidad de niveles jugados
 */
export async function getPlayedLevelsCount(): Promise<number> {
    try {
        const playedLevels = await getPlayedLevelIds();
        return playedLevels.length;
    } catch (error) {
        console.error('Error al obtener cantidad de niveles jugados:', error);
        return 0;
    }
} 