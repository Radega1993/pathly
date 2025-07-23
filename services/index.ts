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
    clearProgress
} from './storage';

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
    signInWithGoogle,
    signOut,
    getCurrentUser,
    isPremium,
    getUserType,
    subscribeToAuthState
} from './auth';

// Exportar tipos
export type { Level, Difficulty, FirestoreLevel } from '../types/level';
export type { Progress } from './storage';
export type { User, AuthState } from './auth';

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