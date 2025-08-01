// Exportar configuración de Firebase
export { db } from './firebase';

// Exportar funciones del servicio de niveles
export {
    loadLevelFromFirestore,
    clearPlayedLevels,
    getPlayedLevelsCount,
    resetGameProgress
} from './levelService';

// Exportar funciones del servicio de almacenamiento local
export {
    getProgress,
    saveProgress,
    markLevelCompleted,
    getLastLevelPlayed,
    setLastLevelPlayed,
    isLevelCompleted,
    getCompletedLevelsCount,
    getHighestCompletedLevel,
    clearProgress
} from './storage';

// Exportar funciones del servicio de sincronización
export {
    syncOnRegister,
    syncOnLogin,
    syncToCloud,
    syncFromCloud,
    getCloudProgress,
    compareProgress,
    forceSyncToCloud,
    forceSyncFromCloud
} from './syncService';

// Exportar funciones del servicio de anuncios
export {
    showInterstitialAd,
    showRewardedAd,
    incrementLevelsCompleted,
    shouldShowInterstitialAd,
    canUseFreeHint,
    incrementHintsUsedInLevel,
    resetHintsForLevel,
    adsManager
} from './ads';

// Exportar funciones del servicio de autenticación
export {
    authService,
    register,
    login,
    resetPassword,
    signOut,
    getCurrentUser,
    isPremium,
    getUserType,
    subscribeToAuthState,
    loadSessionFromStorage,
    isAuthInitialized
} from './auth';

// Exportar tipos
export type { Level, Difficulty, FirestoreLevel } from '../types/level';
export type { Progress } from './storage';
export type { User, AuthState, LoginCredentials, RegisterCredentials } from './auth';
export type { CloudProgress, UserDocument } from './syncService';

// Exportar funciones del servicio de compras
export {
    purchasesService,
    initializePurchases,
    getOfferings,
    getPackages,
    purchasePackage,
    restorePurchases,
    isPremium as isPremiumPurchase,
    getCustomerInfo,
    setUserID,
    getFormattedPrice,
    getPackageDescription
} from './purchases'; 