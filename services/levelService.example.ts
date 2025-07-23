import { loadLevelFromFirestore, clearPlayedLevels, getPlayedLevelsCount } from './levelService';
import { Difficulty } from '../types/level';

/**
 * Ejemplo de uso de la función loadLevelFromFirestore
 */
export async function exampleUsage() {
    try {
        // Cargar un nivel fácil
        const easyLevel = await loadLevelFromFirestore('facil');
        console.log('Nivel fácil cargado:', {
            id: easyLevel.id,
            difficulty: easyLevel.difficulty,
            gridSize: easyLevel.gridSize,
            solutionLength: easyLevel.solution.length
        });

        // Cargar un nivel normal
        const normalLevel = await loadLevelFromFirestore('normal');
        console.log('Nivel normal cargado:', {
            id: normalLevel.id,
            difficulty: normalLevel.difficulty,
            gridSize: normalLevel.gridSize,
            solutionLength: normalLevel.solution.length
        });

        // Verificar cuántos niveles han sido jugados
        const playedCount = await getPlayedLevelsCount();
        console.log(`Niveles jugados: ${playedCount}`);

    } catch (error) {
        console.error('Error en el ejemplo:', error);
    }
}

/**
 * Ejemplo de cómo limpiar el historial de niveles jugados
 */
export async function resetProgress() {
    try {
        await clearPlayedLevels();
        console.log('Progreso reseteado - todos los niveles están disponibles nuevamente');
    } catch (error) {
        console.error('Error al resetear progreso:', error);
    }
}

/**
 * Ejemplo de carga de niveles por dificultad
 */
export async function loadLevelsByDifficulty() {
    const difficulties: Difficulty[] = ['muy_facil', 'facil', 'normal', 'dificil', 'extremo'];

    for (const difficulty of difficulties) {
        try {
            const level = await loadLevelFromFirestore(difficulty);
            console.log(`✅ Nivel ${difficulty} cargado: ${level.id}`);
        } catch (error) {
            console.log(`❌ Error cargando nivel ${difficulty}:`, error);
        }
    }
} 