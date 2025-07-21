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
 */
function convertGridToCells(grid: (number | null)[][] | { [key: string]: (number | null)[] }): Cell[][] {
    if (Array.isArray(grid)) {
        // Formato de array
        return grid.map((row, y) =>
            row.map((value, x) => ({
                x,
                y,
                value
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
                    value: row[x]
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
 * Carga un nivel aleatorio desde Firestore con la dificultad especificada
 * 
 * @param difficulty - Dificultad del nivel ('easy', 'normal', 'hard', 'extreme')
 * @returns Promise<Level> - Nivel aleatorio con id, gridSize, grid y solution
 */
export async function loadLevelFromFirestore(difficulty: Difficulty): Promise<Level> {
    try {
        // Obtener niveles ya jugados
        const playedLevelIds = await getPlayedLevelIds();

        // Crear query para obtener niveles de la dificultad especificada
        const levelsRef = collection(db, 'levels');
        const difficultyQuery = query(
            levelsRef,
            where('difficulty', '==', difficulty),
            orderBy('__name__'), // Ordenar por ID del documento
            limit(100) // Limitar a 100 documentos para evitar problemas de rendimiento
        );

        const querySnapshot = await getDocs(difficultyQuery);

        if (querySnapshot.empty) {
            throw new Error(`No se encontraron niveles con dificultad: ${difficulty}`);
        }

        // Filtrar niveles no jugados
        const availableLevels: Array<{ id: string; data: FirestoreLevel }> = [];

        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            const levelId = doc.id;
            const levelData = doc.data() as FirestoreLevel;

            // Solo incluir niveles que no han sido jugados
            if (!playedLevelIds.includes(levelId)) {
                availableLevels.push({ id: levelId, data: levelData });
            }
        });

        // Si no hay niveles disponibles sin jugar, usar todos los niveles
        const levelsToChooseFrom = availableLevels.length > 0 ? availableLevels :
            querySnapshot.docs.map(doc => ({
                id: doc.id,
                data: doc.data() as FirestoreLevel
            }));

        // Seleccionar un nivel aleatorio
        const randomIndex = Math.floor(Math.random() * levelsToChooseFrom.length);
        const selectedLevel = levelsToChooseFrom[randomIndex];

        // Convertir el grid de Firestore a formato Cell
        const cellGrid = convertGridToCells(selectedLevel.data.grid);

        // Crear el objeto Level
        const level: Level = {
            id: selectedLevel.id,
            difficulty: selectedLevel.data.difficulty,
            gridSize: selectedLevel.data.gridSize,
            grid: cellGrid,
            solution: selectedLevel.data.solution
        };

        // Marcar el nivel como jugado
        await markLevelAsPlayed(selectedLevel.id);

        console.log(`Nivel cargado: ${level.id} (${difficulty})`);
        return level;

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