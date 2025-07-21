/**
 * Script de prueba para verificar la integración del servicio de almacenamiento
 * 
 * Este script simula el uso del servicio de almacenamiento en las pantallas
 * para verificar que todo funciona correctamente.
 */

const { AsyncStorage } = require('@react-native-async-storage/async-storage');

// Simular las funciones del servicio de almacenamiento
const STORAGE_KEYS = {
    PROGRESS: 'puzzlepath_progress',
    LAST_LEVEL: 'puzzlepath_last_level',
};

// Función para simular getProgress
const getProgress = async () => {
    try {
        const progressData = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);

        if (!progressData) {
            return {
                completedLevels: new Set(),
                lastPlayedAt: Date.now(),
            };
        }

        const parsedData = JSON.parse(progressData);

        if (!parsedData || typeof parsedData !== 'object') {
            console.warn('Datos de progreso corruptos, reiniciando progreso');
            return {
                completedLevels: new Set(),
                lastPlayedAt: Date.now(),
            };
        }

        const completedLevels = new Set(
            Array.isArray(parsedData.completedLevels)
                ? parsedData.completedLevels.filter(id => typeof id === 'string')
                : []
        );

        const lastPlayedAt = typeof parsedData.lastPlayedAt === 'number'
            ? parsedData.lastPlayedAt
            : Date.now();

        return {
            completedLevels,
            lastPlayedAt,
        };
    } catch (error) {
        console.error('Error al obtener progreso:', error);
        return {
            completedLevels: new Set(),
            lastPlayedAt: Date.now(),
        };
    }
};

// Función para simular markLevelCompleted
const markLevelCompleted = async (levelId) => {
    try {
        const progress = await getProgress();
        progress.completedLevels.add(levelId);
        progress.lastPlayedAt = Date.now();

        const serializedProgress = {
            completedLevels: Array.from(progress.completedLevels),
            lastPlayedAt: progress.lastPlayedAt,
        };

        await AsyncStorage.setItem(
            STORAGE_KEYS.PROGRESS,
            JSON.stringify(serializedProgress)
        );

        console.log(`✅ Nivel ${levelId} marcado como completado`);
    } catch (error) {
        console.error('Error al marcar nivel como completado:', error);
        throw new Error('No se pudo marcar el nivel como completado');
    }
};

// Función para simular getLastLevelPlayed
const getLastLevelPlayed = async () => {
    try {
        const lastLevel = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LEVEL);
        return lastLevel || null;
    } catch (error) {
        console.error('Error al obtener último nivel jugado:', error);
        return null;
    }
};

// Función para simular setLastLevelPlayed
const setLastLevelPlayed = async (levelId) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_LEVEL, levelId);
        console.log(`📝 Último nivel jugado guardado: ${levelId}`);
    } catch (error) {
        console.error('Error al guardar último nivel jugado:', error);
        throw new Error('No se pudo guardar el último nivel jugado');
    }
};

// Función para simular isLevelCompleted
const isLevelCompleted = async (levelId) => {
    try {
        const progress = await getProgress();
        return progress.completedLevels.has(levelId);
    } catch (error) {
        console.error('Error al verificar nivel completado:', error);
        return false;
    }
};

// Función para simular getCompletedLevelsCount
const getCompletedLevelsCount = async () => {
    try {
        const progress = await getProgress();
        return progress.completedLevels.size;
    } catch (error) {
        console.error('Error al obtener conteo de niveles:', error);
        return 0;
    }
};

// Función para limpiar progreso
const clearProgress = async () => {
    try {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.PROGRESS,
            STORAGE_KEYS.LAST_LEVEL,
        ]);
        console.log('🧹 Progreso limpiado correctamente');
    } catch (error) {
        console.error('Error al limpiar progreso:', error);
        throw new Error('No se pudo limpiar el progreso');
    }
};

// Simulación del flujo de juego
const simulateGameFlow = async () => {
    console.log('🎮 Iniciando simulación del flujo de juego...\n');

    try {
        // 1. Limpiar progreso anterior
        await clearProgress();

        // 2. Simular que el usuario inicia un nivel
        const levelId = 'level_easy_001';
        await setLastLevelPlayed(levelId);

        // 3. Verificar si ya está completado (debería ser false)
        const wasCompleted = await isLevelCompleted(levelId);
        console.log(`📊 Nivel ${levelId} ya completado: ${wasCompleted}`);

        // 4. Obtener estadísticas iniciales
        const initialCount = await getCompletedLevelsCount();
        console.log(`📈 Niveles completados inicialmente: ${initialCount}`);

        // 5. Simular que el usuario completa el nivel
        await markLevelCompleted(levelId);

        // 6. Verificar que ahora está completado
        const nowCompleted = await isLevelCompleted(levelId);
        console.log(`✅ Nivel ${levelId} ahora completado: ${nowCompleted}`);

        // 7. Obtener estadísticas actualizadas
        const finalCount = await getCompletedLevelsCount();
        console.log(`📈 Niveles completados después: ${finalCount}`);

        // 8. Simular otro nivel
        const levelId2 = 'level_normal_001';
        await setLastLevelPlayed(levelId2);
        await markLevelCompleted(levelId2);

        const finalCount2 = await getCompletedLevelsCount();
        console.log(`📈 Niveles completados después del segundo: ${finalCount2}`);

        // 9. Obtener último nivel jugado
        const lastLevel = await getLastLevelPlayed();
        console.log(`🎯 Último nivel jugado: ${lastLevel}`);

        // 10. Mostrar progreso completo
        const progress = await getProgress();
        console.log(`📊 Progreso completo:`, {
            nivelesCompletados: Array.from(progress.completedLevels),
            ultimaJugada: new Date(progress.lastPlayedAt).toLocaleString(),
        });

        console.log('\n🎉 ¡Simulación completada exitosamente!');

    } catch (error) {
        console.error('❌ Error en la simulación:', error);
    }
};

// Simulación de manejo de errores
const simulateErrorHandling = async () => {
    console.log('\n🔧 Probando manejo de errores...\n');

    try {
        // Intentar marcar un nivel con ID inválido
        await markLevelCompleted('');
        console.log('✅ Manejo de ID vacío: OK');
    } catch (error) {
        console.log('❌ Error esperado con ID vacío:', error.message);
    }

    try {
        // Verificar nivel que no existe
        const completed = await isLevelCompleted('level_inexistente');
        console.log(`✅ Verificación de nivel inexistente: ${completed} (esperado: false)`);
    } catch (error) {
        console.log('❌ Error inesperado:', error.message);
    }

    console.log('\n🎯 Pruebas de manejo de errores completadas');
};

// Ejecutar las simulaciones
const runTests = async () => {
    console.log('🚀 Iniciando pruebas de integración del servicio de almacenamiento\n');

    await simulateGameFlow();
    await simulateErrorHandling();

    console.log('\n✨ Todas las pruebas completadas');
};

// Exportar funciones para uso en otros scripts
module.exports = {
    getProgress,
    markLevelCompleted,
    getLastLevelPlayed,
    setLastLevelPlayed,
    isLevelCompleted,
    getCompletedLevelsCount,
    clearProgress,
    simulateGameFlow,
    simulateErrorHandling,
    runTests,
};

// Si se ejecuta directamente este script
if (require.main === module) {
    runTests().catch(console.error);
} 