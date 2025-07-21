// Exportar configuración de Firebase
export { db } from './firebase';

// Exportar funciones del servicio de niveles
export {
    loadLevelFromFirestore,
    clearPlayedLevels,
    getPlayedLevelsCount
} from './levelService';

// Exportar tipos
export type { Level, Difficulty, FirestoreLevel } from '../types/level'; 