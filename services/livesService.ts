import AsyncStorage from '@react-native-async-storage/async-storage';
import { adsManager } from './ads';

// Claves para AsyncStorage
const STORAGE_KEYS = {
    LIVES: 'puzzlepath_lives',
    LAST_LIFE_REGEN: 'puzzlepath_last_life_regen',
} as const;

// Configuración del sistema de vidas
const LIVES_CONFIG = {
    MAX_LIVES: 5,
    REGEN_TIME_MINUTES: 10,
    REGEN_TIME_MS: 10 * 60 * 1000, // 10 minutos en milisegundos
} as const;

// Interfaz para el estado de vidas
export interface LivesState {
    currentLives: number;
    lastRegenerationTime: number;
}

/**
 * Obtiene el estado actual de las vidas del usuario
 * @returns Promise<LivesState> - Estado actual de las vidas
 */
export const getLivesState = async (): Promise<LivesState> => {
    try {
        const livesData = await AsyncStorage.getItem(STORAGE_KEYS.LIVES);
        const lastRegenData = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LIFE_REGEN);

        let currentLives: number = LIVES_CONFIG.MAX_LIVES;
        let lastRegenerationTime = Date.now();

        if (livesData) {
            const parsedLives = parseInt(livesData, 10);
            if (!isNaN(parsedLives) && parsedLives >= 0 && parsedLives <= LIVES_CONFIG.MAX_LIVES) {
                currentLives = parsedLives as number;
            }
        }

        if (lastRegenData) {
            const parsedTime = parseInt(lastRegenData, 10);
            if (!isNaN(parsedTime) && parsedTime > 0) {
                lastRegenerationTime = parsedTime;
            }
        }

        return {
            currentLives,
            lastRegenerationTime,
        };
    } catch (error) {
        console.error('Error al obtener estado de vidas:', error);
        return {
            currentLives: LIVES_CONFIG.MAX_LIVES,
            lastRegenerationTime: Date.now(),
        };
    }
};

/**
 * Guarda el estado de las vidas
 * @param state - Estado de vidas a guardar
 * @returns Promise<void>
 */
export const saveLivesState = async (state: LivesState): Promise<void> => {
    try {
        await AsyncStorage.multiSet([
            [STORAGE_KEYS.LIVES, state.currentLives.toString()],
            [STORAGE_KEYS.LAST_LIFE_REGEN, state.lastRegenerationTime.toString()],
        ]);
    } catch (error) {
        console.error('Error al guardar estado de vidas:', error);
        throw new Error('No se pudo guardar el estado de vidas');
    }
};

/**
 * Consume una vida del usuario
 * @returns Promise<boolean> - true si se pudo consumir la vida, false si no hay vidas
 */
export const consumeLife = async (): Promise<boolean> => {
    try {
        const state = await getLivesState();

        if (state.currentLives <= 0) {
            return false;
        }

        const newState: LivesState = {
            currentLives: state.currentLives - 1,
            lastRegenerationTime: state.lastRegenerationTime,
        };

        await saveLivesState(newState);
        return true;
    } catch (error) {
        console.error('Error al consumir vida:', error);
        return false;
    }
};

/**
 * Regenera las vidas basándose en el tiempo transcurrido
 * @returns Promise<LivesState> - Estado actualizado de las vidas
 */
export const regenerateLives = async (): Promise<LivesState> => {
    try {
        const state = await getLivesState();
        const now = Date.now();
        const timeSinceLastRegen = now - state.lastRegenerationTime;

        // Calcular cuántas vidas se pueden regenerar
        const livesToRegenerate = Math.floor(timeSinceLastRegen / LIVES_CONFIG.REGEN_TIME_MS);

        if (livesToRegenerate > 0 && state.currentLives < LIVES_CONFIG.MAX_LIVES) {
            const newLives = Math.min(
                state.currentLives + livesToRegenerate,
                LIVES_CONFIG.MAX_LIVES
            );

            // Calcular el tiempo de la última regeneración real
            const actualRegenerationTime = state.lastRegenerationTime + (livesToRegenerate * LIVES_CONFIG.REGEN_TIME_MS);

            const newState: LivesState = {
                currentLives: newLives,
                lastRegenerationTime: actualRegenerationTime,
            };

            await saveLivesState(newState);
            console.log(`❤️ Regeneradas ${newLives - state.currentLives} vidas. Total: ${newLives}`);
            return newState;
        }

        return state;
    } catch (error) {
        console.error('Error al regenerar vidas:', error);
        return await getLivesState();
    }
};

/**
 * Regenera todas las vidas (usado para anuncios recompensados)
 * @returns Promise<LivesState> - Estado actualizado de las vidas
 */
export const regenerateAllLives = async (): Promise<LivesState> => {
    try {
        const newState: LivesState = {
            currentLives: LIVES_CONFIG.MAX_LIVES,
            lastRegenerationTime: Date.now(),
        };

        await saveLivesState(newState);
        console.log(`❤️ Todas las vidas regeneradas. Total: ${LIVES_CONFIG.MAX_LIVES}`);
        return newState;
    } catch (error) {
        console.error('Error al regenerar todas las vidas:', error);
        throw new Error('No se pudieron regenerar las vidas');
    }
};

/**
 * Obtiene el tiempo restante para la próxima regeneración de vida
 * @returns Promise<number> - Tiempo restante en milisegundos (0 si no hay vidas para regenerar)
 */
export const getTimeUntilNextLife = async (): Promise<number> => {
    try {
        const state = await getLivesState();

        if (state.currentLives >= LIVES_CONFIG.MAX_LIVES) {
            return 0; // No hay vidas para regenerar
        }

        const now = Date.now();
        const timeSinceLastRegen = now - state.lastRegenerationTime;
        const timeUntilNextLife = LIVES_CONFIG.REGEN_TIME_MS - (timeSinceLastRegen % LIVES_CONFIG.REGEN_TIME_MS);

        return Math.max(0, timeUntilNextLife);
    } catch (error) {
        console.error('Error al calcular tiempo para próxima vida:', error);
        return 0;
    }
};

/**
 * Verifica si el usuario puede jugar (tiene vidas disponibles)
 * @returns Promise<boolean> - true si puede jugar
 */
export const canPlay = async (): Promise<boolean> => {
    try {
        const state = await regenerateLives(); // Regenerar vidas automáticamente
        return state.currentLives > 0;
    } catch (error) {
        console.error('Error al verificar si puede jugar:', error);
        return false;
    }
};

/**
 * Obtiene el estado actual de vidas con regeneración automática
 * @returns Promise<LivesState> - Estado actual de las vidas
 */
export const getCurrentLivesState = async (): Promise<LivesState> => {
    return await regenerateLives();
};

/**
 * Muestra un anuncio recompensado para regenerar todas las vidas
 * @returns Promise<boolean> - true si el anuncio se mostró exitosamente
 */
export const showLivesRewardedAd = async (): Promise<boolean> => {
    try {
        const success = await adsManager.showRewardedAd();
        if (success) {
            await regenerateAllLives();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error al mostrar anuncio de vidas:', error);
        return false;
    }
};

/**
 * Formatea el tiempo restante en formato legible
 * @param timeMs - Tiempo en milisegundos
 * @returns string - Tiempo formateado (ej: "5:30")
 */
export const formatTimeRemaining = (timeMs: number): string => {
    if (timeMs <= 0) return '0:00';

    const minutes = Math.floor(timeMs / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Exportar configuración para uso en otros componentes
export { LIVES_CONFIG }; 