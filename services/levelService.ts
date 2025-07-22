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

        // Buscar directamente por el campo 'level' (numeración secuencial)
        const levelQuery = query(
            levelsRef,
            where('level', '==', levelNumber)
        );

        const querySnapshot = await getDocs(levelQuery);

        if (querySnapshot.empty) {
            // Si no hay niveles en Firestore, lanzar error
            throw new Error(`No se encontró el nivel ${levelNumber} en Firestore`);
        }

        // Obtener el documento del nivel específico
        const doc = querySnapshot.docs[0];
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
        throw new Error(`No se pudo cargar el nivel ${levelNumber}: ${error}`);
    }
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

/**
 * Obtiene el número máximo de nivel disponible de forma eficiente
 */
export async function getMaxLevelNumber(): Promise<number> {
    try {
        const levelsRef = collection(db, 'levels');
        const maxLevelQuery = query(levelsRef, orderBy('level', 'desc'), limit(1));
        const querySnapshot = await getDocs(maxLevelQuery);

        if (querySnapshot.empty) {
            return 0;
        }

        const doc = querySnapshot.docs[0];
        const data = doc.data() as DocumentData;
        return (data.level as number) || 0;
    } catch (error) {
        console.error('Error obteniendo nivel máximo:', error);
        return 0;
    }
} 