import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncToCloud } from './syncService';

// Claves para AsyncStorage
const STORAGE_KEYS = {
    PROGRESS: 'puzzlepath_progress',
    LAST_LEVEL: 'puzzlepath_last_level',
} as const;

// Interfaz para el progreso del usuario
export interface Progress {
    completedLevels: Set<string>;
    lastPlayedAt: number;
}

// Interfaz para el progreso serializado (para AsyncStorage)
interface SerializedProgress {
    completedLevels: string[];
    lastPlayedAt: number;
}

/**
 * Obtiene el progreso guardado del usuario
 * @returns Promise<Progress> - Objeto con niveles completados y timestamp
 */
export const getProgress = async (): Promise<Progress> => {
    try {
        const progressData = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);

        if (!progressData) {
            // Si no hay datos, devolver progreso vacío
            return {
                completedLevels: new Set<string>(),
                lastPlayedAt: Date.now(),
            };
        }

        const parsedData: SerializedProgress = JSON.parse(progressData);

        // Validar estructura de datos
        if (!parsedData || typeof parsedData !== 'object') {
            console.warn('Datos de progreso corruptos, reiniciando progreso');
            return {
                completedLevels: new Set<string>(),
                lastPlayedAt: Date.now(),
            };
        }

        // Validar y convertir array a Set
        const completedLevels = new Set<string>(
            Array.isArray(parsedData.completedLevels)
                ? parsedData.completedLevels.filter(id => typeof id === 'string')
                : []
        );

        // Validar timestamp
        const lastPlayedAt = typeof parsedData.lastPlayedAt === 'number'
            ? parsedData.lastPlayedAt
            : Date.now();

        return {
            completedLevels,
            lastPlayedAt,
        };
    } catch (error) {
        console.error('Error al obtener progreso:', error);
        // En caso de error, devolver progreso vacío
        return {
            completedLevels: new Set<string>(),
            lastPlayedAt: Date.now(),
        };
    }
};

/**
 * Guarda el progreso del usuario
 * @param progress - Objeto Progress a guardar
 * @returns Promise<void>
 */
export const saveProgress = async (progress: Progress): Promise<void> => {
    try {
        // Serializar el Set a array para AsyncStorage
        const serializedProgress: SerializedProgress = {
            completedLevels: Array.from(progress.completedLevels),
            lastPlayedAt: progress.lastPlayedAt,
        };

        await AsyncStorage.setItem(
            STORAGE_KEYS.PROGRESS,
            JSON.stringify(serializedProgress)
        );
    } catch (error) {
        console.error('Error al guardar progreso:', error);
        throw new Error('No se pudo guardar el progreso');
    }
};

/**
 * Marca un nivel como completado
 * @param levelId - ID del nivel completado
 * @returns Promise<void>
 */
export const markLevelCompleted = async (levelId: string): Promise<void> => {
    try {
        const progress = await getProgress();
        progress.completedLevels.add(levelId);
        progress.lastPlayedAt = Date.now();

        await saveProgress(progress);

        // Sincronizar con la nube automáticamente
        await syncToCloud();
    } catch (error) {
        console.error('Error al marcar nivel como completado:', error);
        throw new Error('No se pudo marcar el nivel como completado');
    }
};

/**
 * Obtiene el último nivel jugado
 * @returns Promise<string | null> - ID del último nivel o null si no hay
 */
export const getLastLevelPlayed = async (): Promise<string | null> => {
    try {
        const lastLevel = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LEVEL);
        return lastLevel || null;
    } catch (error) {
        console.error('Error al obtener último nivel jugado:', error);
        return null;
    }
};

/**
 * Guarda el último nivel jugado
 * @param levelId - ID del nivel jugado
 * @returns Promise<void>
 */
export const setLastLevelPlayed = async (levelId: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_LEVEL, levelId);

        // Sincronizar con la nube automáticamente
        await syncToCloud();
    } catch (error) {
        console.error('Error al guardar último nivel jugado:', error);
        throw new Error('No se pudo guardar el último nivel jugado');
    }
};

/**
 * Verifica si un nivel está completado
 * @param levelId - ID del nivel a verificar
 * @returns Promise<boolean> - true si está completado
 */
export const isLevelCompleted = async (levelId: string): Promise<boolean> => {
    try {
        const progress = await getProgress();
        return progress.completedLevels.has(levelId);
    } catch (error) {
        console.error('Error al verificar nivel completado:', error);
        return false;
    }
};

/**
 * Obtiene el número total de niveles completados
 * @returns Promise<number> - Cantidad de niveles completados
 */
export const getCompletedLevelsCount = async (): Promise<number> => {
    try {
        const progress = await getProgress();
        return progress.completedLevels.size;
    } catch (error) {
        console.error('Error al obtener conteo de niveles:', error);
        return 0;
    }
};

/**
 * Obtiene el nivel más alto completado secuencialmente
 * @returns Promise<number> - Nivel más alto completado (0 si no hay ninguno)
 */
export const getHighestCompletedLevel = async (): Promise<number> => {
    try {
        const progress = await getProgress();
        let highestLevel = 0;

        console.log(`🔍 getHighestCompletedLevel: ${progress.completedLevels.size} niveles completados`);
        console.log(`🔍 Niveles completados:`, Array.from(progress.completedLevels));

        // Buscar el nivel más alto completado secuencialmente
        for (const levelId of progress.completedLevels) {
            // Extraer el número del nivel del ID (asumiendo formato como "level_1", "level_2", etc.)
            const match = levelId.match(/level_(\d+)/);
            if (match) {
                const levelNumber = parseInt(match[1], 10);
                console.log(`🔍 Nivel ${levelId} -> número ${levelNumber}`);
                if (levelNumber > highestLevel) {
                    highestLevel = levelNumber;
                }
            } else {
                console.log(`🔍 No se pudo extraer número del nivel: ${levelId}`);
            }
        }

        console.log(`🔍 Nivel más alto completado: ${highestLevel}`);
        return highestLevel;
    } catch (error) {
        console.error('Error al obtener nivel más alto completado:', error);
        return 0;
    }
};

/**
 * Limpia todo el progreso guardado (útil para testing o reset)
 * @returns Promise<void>
 */
export const clearProgress = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.PROGRESS,
            STORAGE_KEYS.LAST_LEVEL,
        ]);
    } catch (error) {
        console.error('Error al limpiar progreso:', error);
        throw new Error('No se pudo limpiar el progreso');
    }
}; 