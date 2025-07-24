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
const LEVEL_CACHE_KEY = 'level_cache';
const CACHE_EXPIRY_HOURS = 24; // Cache válido por 24 horas

// Cache en memoria para niveles cargados
const levelCache = new Map<string, { level: Level; timestamp: number }>();


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
 * @param difficulty - Dificultad del nivel ('muy_facil', 'facil', 'normal', 'dificil', 'extremo')
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

/**
 * Cachea un nivel en memoria y AsyncStorage
 */
async function cacheLevel(levelNumber: number, level: Level): Promise<void> {
    try {
        const cacheKey = `level_${levelNumber}`;
        const cacheData = {
            level,
            timestamp: Date.now()
        };

        // Cache en memoria
        levelCache.set(cacheKey, cacheData);

        // Cache en AsyncStorage
        const existingCache = await AsyncStorage.getItem(LEVEL_CACHE_KEY);
        const cache = existingCache ? JSON.parse(existingCache) : {};
        cache[cacheKey] = cacheData;
        await AsyncStorage.setItem(LEVEL_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
        console.error('Error cacheando nivel:', error);
    }
}

/**
 * Obtiene un nivel del cache si está disponible y no ha expirado
 */
async function getCachedLevel(levelNumber: number): Promise<Level | null> {
    try {
        const cacheKey = `level_${levelNumber}`;
        const now = Date.now();
        const expiryTime = CACHE_EXPIRY_HOURS * 60 * 60 * 1000; // 24 horas en ms

        // Verificar cache en memoria primero
        const memoryCache = levelCache.get(cacheKey);
        if (memoryCache && (now - memoryCache.timestamp) < expiryTime) {
            return memoryCache.level;
        }

        // Verificar cache en AsyncStorage
        const cacheData = await AsyncStorage.getItem(LEVEL_CACHE_KEY);
        if (cacheData) {
            const cache = JSON.parse(cacheData);
            const storedCache = cache[cacheKey];

            if (storedCache && (now - storedCache.timestamp) < expiryTime) {
                // Actualizar cache en memoria
                levelCache.set(cacheKey, storedCache);
                return storedCache.level;
            }
        }

        return null;
    } catch (error) {
        console.error('Error obteniendo nivel del cache:', error);
        return null;
    }
}

/**
 * Carga niveles optimizados con mejor manejo de errores y UX
 */
export async function loadLevelsOptimized(
    startLevel: number,
    count: number,
    userProgress: number
): Promise<{ levels: Level[]; totalAvailable: number; currentLevel: number }> {
    try {
        const maxLevel = await getMaxLevelNumber();
        const endLevel = Math.min(startLevel + count - 1, maxLevel);
        const levelsToLoad = endLevel - startLevel + 1;
        const currentLevel = userProgress + 1;

        if (levelsToLoad <= 0) {
            return { levels: [], totalAvailable: maxLevel, currentLevel };
        }

        console.log(`🚀 Cargando niveles ${startLevel}-${endLevel} (${levelsToLoad} niveles)`);

        const levels: Level[] = [];
        const loadPromises: Promise<{ level: Level | null; levelNumber: number }>[] = [];

        // Crear promesas para cargar niveles
        for (let i = 0; i < levelsToLoad; i++) {
            const levelNumber = startLevel + i;
            loadPromises.push(
                loadLevelWithCache(levelNumber)
                    .then(level => ({ level, levelNumber }))
                    .catch(error => {
                        console.error(`Error cargando nivel ${levelNumber}:`, error);
                        return { level: null, levelNumber };
                    })
            );
        }

        // Cargar todos los niveles en paralelo
        const results = await Promise.all(loadPromises);

        // Procesar resultados y ordenar por número de nivel
        for (const result of results) {
            if (result.level) {
                levels.push(result.level);
            }
        }

        // Ordenar niveles por número
        levels.sort((a, b) => {
            const aNum = parseInt(a.id.match(/level_(\d+)/)?.[1] || '0', 10);
            const bNum = parseInt(b.id.match(/level_(\d+)/)?.[1] || '0', 10);
            return aNum - bNum;
        });

        console.log(`✅ Niveles cargados exitosamente: ${levels.length}/${levelsToLoad}`);
        return { levels, totalAvailable: maxLevel, currentLevel };
    } catch (error) {
        console.error('Error cargando niveles optimizados:', error);
        throw new Error('Error al cargar niveles');
    }
}

/**
 * Carga un nivel específico con cache
 */
export async function loadLevelWithCache(levelNumber: number): Promise<Level> {
    try {
        // Verificar cache primero
        const cachedLevel = await getCachedLevel(levelNumber);
        if (cachedLevel) {
            console.log(`📦 Nivel ${levelNumber} cargado desde cache`);
            return cachedLevel;
        }

        // Cargar desde Firestore
        const level = await loadLevelByNumber(levelNumber);

        // Cachear el nivel
        await cacheLevel(levelNumber, level);

        console.log(`🔥 Nivel ${levelNumber} cargado desde Firestore y cacheado`);
        return level;
    } catch (error) {
        console.error(`Error cargando nivel ${levelNumber} con cache:`, error);
        throw error;
    }
}

/**
 * Obtiene el rango de niveles para paginación optimizada
 * Mejora la UX mostrando siempre el nivel actual y algunos niveles alrededor
 */
export function getOptimalLevelRange(
    userProgress: number,
    maxLevel: number,
    pageSize: number = 20
): { start: number; end: number; shouldLoadMore: boolean } {
    // Caso especial: si no hay progreso, mostrar desde el nivel 1
    if (userProgress === 0) {
        const end = Math.min(pageSize, maxLevel);
        const shouldLoadMore = end < maxLevel;

        console.log(`📄 Usuario nuevo: niveles 1-${end}, maxLevel: ${maxLevel}, shouldLoadMore: ${shouldLoadMore}`);
        return { start: 1, end, shouldLoadMore };
    }

    // Para usuarios con progreso, centrar en el nivel actual
    const currentLevel = userProgress + 1;
    const halfPage = Math.floor(pageSize / 2);

    // Calcular rango centrado en el nivel actual
    let start = Math.max(1, currentLevel - halfPage);
    let end = Math.min(maxLevel, start + pageSize - 1);

    // Ajustar si llegamos al final
    if (end === maxLevel && start > 1) {
        start = Math.max(1, end - pageSize + 1);
    }

    const shouldLoadMore = end < maxLevel;

    console.log(`📄 Paginación optimizada: nivel actual ${currentLevel}, rango ${start}-${end}, maxLevel: ${maxLevel}, shouldLoadMore: ${shouldLoadMore}, userProgress: ${userProgress}`);

    return { start, end, shouldLoadMore };
}

/**
 * Limpia el cache de niveles expirados
 */
export async function cleanupExpiredCache(): Promise<void> {
    try {
        const now = Date.now();
        const expiryTime = CACHE_EXPIRY_HOURS * 60 * 60 * 1000;

        // Limpiar cache en memoria
        for (const [key, value] of levelCache.entries()) {
            if (now - value.timestamp > expiryTime) {
                levelCache.delete(key);
            }
        }

        // Limpiar cache en AsyncStorage
        const cacheData = await AsyncStorage.getItem(LEVEL_CACHE_KEY);
        if (cacheData) {
            const cache = JSON.parse(cacheData);
            const cleanedCache: Record<string, any> = {};

            for (const [key, value] of Object.entries(cache)) {
                if (now - (value as any).timestamp < expiryTime) {
                    cleanedCache[key] = value;
                }
            }

            await AsyncStorage.setItem(LEVEL_CACHE_KEY, JSON.stringify(cleanedCache));
        }

        console.log('🧹 Cache de niveles limpiado');
    } catch (error) {
        console.error('Error limpiando cache:', error);
    }
}

/**
 * Precarga niveles cercanos al progreso del usuario de forma más inteligente
 */
export async function preloadNearbyLevels(userProgress: number): Promise<void> {
    try {
        const maxLevel = await getMaxLevelNumber();
        const currentLevel = userProgress + 1;

        // Precargar niveles cercanos (actual + 3 siguientes + 2 anteriores)
        const preloadPromises: Promise<void>[] = [];

        // Niveles siguientes
        for (let i = 1; i <= 3; i++) {
            const levelNumber = currentLevel + i;
            if (levelNumber <= maxLevel) {
                preloadPromises.push(
                    loadLevelWithCache(levelNumber)
                        .then(() => console.log(`📦 Precargado nivel siguiente ${levelNumber}`))
                        .catch(() => console.log(`❌ Error precargando nivel siguiente ${levelNumber}`))
                );
            }
        }

        // Niveles anteriores (solo si no es el nivel 1)
        if (currentLevel > 1) {
            for (let i = 1; i <= 2; i++) {
                const levelNumber = currentLevel - i;
                if (levelNumber >= 1) {
                    preloadPromises.push(
                        loadLevelWithCache(levelNumber)
                            .then(() => console.log(`📦 Precargado nivel anterior ${levelNumber}`))
                            .catch(() => console.log(`❌ Error precargando nivel anterior ${levelNumber}`))
                    );
                }
            }
        }

        // Ejecutar precarga en background
        if (preloadPromises.length > 0) {
            Promise.all(preloadPromises).then(() => {
                console.log('✅ Precarga de niveles completada');
            });
        }
    } catch (error) {
        console.error('Error en precarga de niveles:', error);
    }
} 