import {
    getProgress,
    markLevelCompleted,
    getLastLevelPlayed,
    setLastLevelPlayed,
    isLevelCompleted,
    getCompletedLevelsCount,
    clearProgress,
    type Progress
} from './storage';

/**
 * Ejemplo de uso del servicio de almacenamiento local
 * 
 * Este archivo muestra cómo usar las funciones del servicio storage.ts
 * para gestionar el progreso del juego localmente.
 */

// Ejemplo 1: Obtener progreso actual
export const exampleGetProgress = async () => {
    try {
        const progress: Progress = await getProgress();
        console.log('Progreso actual:', {
            nivelesCompletados: progress.completedLevels.size,
            ultimaJugada: new Date(progress.lastPlayedAt).toLocaleString(),
        });
        return progress;
    } catch (error) {
        console.error('Error al obtener progreso:', error);
    }
};

// Ejemplo 2: Marcar nivel como completado
export const exampleMarkLevelCompleted = async (levelId: string) => {
    try {
        await markLevelCompleted(levelId);
        console.log(`Nivel ${levelId} marcado como completado`);
    } catch (error) {
        console.error('Error al marcar nivel:', error);
    }
};

// Ejemplo 3: Guardar último nivel jugado
export const exampleSetLastLevelPlayed = async (levelId: string) => {
    try {
        await setLastLevelPlayed(levelId);
        console.log(`Último nivel jugado guardado: ${levelId}`);
    } catch (error) {
        console.error('Error al guardar último nivel:', error);
    }
};

// Ejemplo 4: Verificar si un nivel está completado
export const exampleCheckLevelCompleted = async (levelId: string) => {
    try {
        const isCompleted = await isLevelCompleted(levelId);
        console.log(`Nivel ${levelId} completado: ${isCompleted}`);
        return isCompleted;
    } catch (error) {
        console.error('Error al verificar nivel:', error);
        return false;
    }
};

// Ejemplo 5: Obtener estadísticas del progreso
export const exampleGetProgressStats = async () => {
    try {
        const [progress, lastLevel, completedCount] = await Promise.all([
            getProgress(),
            getLastLevelPlayed(),
            getCompletedLevelsCount(),
        ]);

        console.log('Estadísticas del progreso:', {
            totalNivelesCompletados: completedCount,
            ultimoNivelJugado: lastLevel || 'Ninguno',
            ultimaJugada: new Date(progress.lastPlayedAt).toLocaleString(),
        });

        return {
            progress,
            lastLevel,
            completedCount,
        };
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
    }
};

// Ejemplo 6: Flujo completo de juego
export const exampleGameFlow = async (levelId: string) => {
    try {
        // 1. Guardar que el usuario está jugando este nivel
        await setLastLevelPlayed(levelId);

        // 2. Verificar si ya lo completó antes
        const wasCompleted = await isLevelCompleted(levelId);

        if (wasCompleted) {
            console.log(`Nivel ${levelId} ya fue completado anteriormente`);
        } else {
            console.log(`Nivel ${levelId} es nuevo para el usuario`);
        }

        // 3. Simular que el usuario completa el nivel
        // (esto se llamaría cuando el usuario resuelve el puzzle)
        await markLevelCompleted(levelId);

        // 4. Obtener progreso actualizado
        const stats = await exampleGetProgressStats();

        return {
            levelId,
            wasCompleted,
            stats,
        };
    } catch (error) {
        console.error('Error en flujo de juego:', error);
    }
};

// Ejemplo 7: Limpiar progreso (útil para testing)
export const exampleClearProgress = async () => {
    try {
        await clearProgress();
        console.log('Progreso limpiado correctamente');
    } catch (error) {
        console.error('Error al limpiar progreso:', error);
    }
};

// Ejemplo 8: Manejo de errores robusto
export const exampleRobustProgressHandling = async (levelId: string) => {
    try {
        // Intentar obtener progreso con manejo de errores
        const progress = await getProgress();

        // Verificar si el nivel ya está completado
        if (progress.completedLevels.has(levelId)) {
            console.log(`Nivel ${levelId} ya completado`);
            return { status: 'already_completed', levelId };
        }

        // Marcar como completado
        await markLevelCompleted(levelId);
        console.log(`Nivel ${levelId} marcado como completado`);

        return { status: 'completed', levelId };

    } catch (error) {
        console.error('Error en manejo de progreso:', error);

        // En caso de error, intentar recuperar progreso básico
        try {
            const basicProgress = await getProgress();
            return {
                status: 'error_recovered',
                levelId,
                completedCount: basicProgress.completedLevels.size
            };
        } catch (recoveryError) {
            console.error('Error en recuperación:', recoveryError);
            return { status: 'error_unrecoverable', levelId };
        }
    }
}; 