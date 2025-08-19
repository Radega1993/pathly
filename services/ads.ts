import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Intentar importar react-native-google-mobile-ads, con fallback a mock
let InterstitialAd: any;
let RewardedAd: any;
let RewardedInterstitialAd: any;
let TestIds: any;
let BannerAd: any;
let BannerAdSize: any;
let AdEventType: any;
let RewardedAdEventType: any;
let RewardedInterstitialAdEventType: any;

try {
    const adsModule = require('react-native-google-mobile-ads');
    InterstitialAd = adsModule.InterstitialAd;
    RewardedAd = adsModule.RewardedAd;
    RewardedInterstitialAd = adsModule.RewardedInterstitialAd;
    TestIds = adsModule.TestIds;
    BannerAd = adsModule.BannerAd;
    BannerAdSize = adsModule.BannerAdSize;
    AdEventType = adsModule.AdEventType;
    RewardedAdEventType = adsModule.RewardedAdEventType;
    RewardedInterstitialAdEventType = adsModule.RewardedInterstitialAdEventType;
    console.log('✅ react-native-google-mobile-ads loaded successfully');
} catch (error) {
    console.warn('⚠️ react-native-google-mobile-ads not available, using mock implementation');
    console.warn('⚠️ This is expected during development or if native module is not ready');
}

// Configuración de AdMob - IDs desde variables de entorno
// Nota: Ambos son "Intersticiales bonificados" en AdMob Console
const AD_IDS = {
    ANDROID_APP_ID: process.env.ADMOB_ANDROID_APP_ID,
    INTERSTITIAL: process.env.ADMOB_INTERSTITIAL_ID,        // Intersticial bonificado para niveles
    REWARDED: process.env.ADMOB_REWARDED_ID,               // Intersticial bonificado para pistas
};

// Validar que las variables de entorno estén configuradas
if (!AD_IDS.ANDROID_APP_ID || !AD_IDS.INTERSTITIAL || !AD_IDS.REWARDED) {
    console.error('❌ Error: AdMob environment variables not configured');
    console.error('❌ Required: ADMOB_ANDROID_APP_ID, ADMOB_INTERSTITIAL_ID, ADMOB_REWARDED_ID');
    throw new Error('AdMob environment variables not configured');
}

console.log('✅ AdMob configuration loaded');

// Claves para AsyncStorage
const STORAGE_KEYS = {
    LEVELS_COMPLETED: 'levels_completed_count',
    HINTS_USED_IN_LEVEL: 'hints_used_in_level_',
};

// Función simple para verificar si el usuario es premium
const isPremium = (): boolean => {
    try {
        // Por ahora, siempre retornar false para testing
        return false;
    } catch (error) {
        console.error('Error checking premium status:', error);
        return false;
    }
};

class AdsManager {
    private static instance: AdsManager;
    private isInitialized = false;
    private interstitialAd: any = null;
    private rewardedAd: any = null;
    private useMockAds = false;

    private constructor() { }

    static getInstance(): AdsManager {
        if (!AdsManager.instance) {
            AdsManager.instance = new AdsManager();
        }
        return AdsManager.instance;
    }

    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            console.log('🔄 Initializing AdMob...');

            // Verificar si el módulo nativo está disponible
            if (!InterstitialAd || !RewardedAd || !RewardedInterstitialAd) {
                console.warn('⚠️ Native AdMob module not available, using mock ads');
                this.useMockAds = true;
                this.isInitialized = true;
                console.log('✅ AdMob initialized successfully (mock mode)');
                return;
            }

            // Crear anuncio intersticial bonificado para niveles
            this.interstitialAd = RewardedInterstitialAd.createForAdRequest(AD_IDS.INTERSTITIAL, {
                requestNonPersonalizedAdsOnly: true,
                keywords: ['puzzle', 'game', 'brain'],
            });

            // Crear anuncio intersticial bonificado para pistas
            this.rewardedAd = RewardedInterstitialAd.createForAdRequest(AD_IDS.REWARDED, {
                requestNonPersonalizedAdsOnly: true,
                keywords: ['puzzle', 'game', 'brain'],
            });

            // Cargar anuncios iniciales
            await this.loadInterstitialAd();
            await this.loadRewardedAd();

            this.isInitialized = true;
            console.log('✅ AdMob initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing AdMob:', error);
            console.warn('⚠️ Falling back to mock ads');
            this.useMockAds = true;
            this.isInitialized = true;
        }
    }

    private async loadInterstitialAd(): Promise<void> {
        if (!this.interstitialAd || this.useMockAds) return;

        try {
            await this.interstitialAd.load();
            console.log('✅ Rewarded interstitial ad loaded');
        } catch (error) {
            console.error('❌ Error loading rewarded interstitial ad:', error);
        }
    }

    private async loadRewardedAd(): Promise<void> {
        if (!this.rewardedAd || this.useMockAds) return;

        try {

            // Intentar cargar con timeout
            const loadPromise = this.rewardedAd.load();
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Load timeout')), 15000); // 15 segundos
            });

            await Promise.race([loadPromise, timeoutPromise]);

            // Esperar a que se cargue completamente
            for (let i = 0; i < 10; i++) {
                await new Promise(resolve => setTimeout(resolve, 500));
                if (this.rewardedAd.loaded) {
                    break;
                }
            }

        } catch (error) {
            console.error('❌ Error loading hint ad:', error);
        }
    }

    async showInterstitialAd(): Promise<void> {
        try {
            // Verificar si el usuario es premium
            if (isPremium()) {
                console.log('✅ User is premium, skipping interstitial ad');
                return;
            }

            if (!this.isInitialized) {
                await this.initialize();
            }

            // Si estamos usando mock ads, simular el comportamiento
            if (this.useMockAds) {
                console.log('🔄 Showing interstitial ad (mock)...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log('✅ Interstitial ad completed (mock)');
                return;
            }

            if (!this.interstitialAd) {
                console.error('❌ Interstitial ad not initialized');
                return;
            }

            console.log('🔄 Showing rewarded interstitial ad (level completion)...');

            // Verificar si el anuncio está cargado
            if (!this.interstitialAd.loaded) {
                console.log('🔄 Loading rewarded interstitial ad...');
                await this.loadInterstitialAd();

                if (!this.interstitialAd.loaded) {
                    console.error('❌ Failed to load rewarded interstitial ad');
                    return;
                }
            }

            // Mostrar el anuncio
            await this.interstitialAd.show();
            console.log('✅ Rewarded interstitial ad completed');

            // Cargar nuevo anuncio para la próxima vez
            this.loadInterstitialAd();

        } catch (error) {
            console.error('❌ Error showing interstitial ad:', error);
            // Intentar recargar el anuncio
            this.loadInterstitialAd();
        }
    }

    async showRewardedAd(): Promise<boolean> {
        return new Promise(async (resolve) => {
            try {
                // Verificar si el usuario es premium
                if (isPremium()) {
                    console.log('✅ User is premium, granting reward without ad');
                    resolve(true);
                    return;
                }

                if (!this.isInitialized) {
                    await this.initialize();
                }

                // Si estamos usando mock ads, simular el comportamiento
                if (this.useMockAds) {
                    console.log('🔄 Showing hint interstitial ad (mock)...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    console.log('✅ Hint interstitial ad completed (mock)');
                    resolve(true);
                    return;
                }

                if (!this.rewardedAd) {
                    console.error('❌ Hint interstitial ad not initialized');
                    resolve(false);
                    return;
                }

                console.log('🔄 Showing hint interstitial ad...');

                let adShown = false;

                // Mostrar RewardedInterstitialAd sin listeners complejos
                // Verificar si el anuncio está cargado
                if (!this.rewardedAd.loaded) {
                    await this.loadRewardedAd();

                    // Esperar a que se cargue
                    for (let i = 0; i < 20; i++) {
                        await new Promise(resolve => setTimeout(resolve, 250));
                        if (this.rewardedAd.loaded) {
                            break;
                        }
                    }
                }

                // Mostrar el anuncio
                await this.rewardedAd.show();
                adShown = true;

                // Para RewardedInterstitialAd, siempre otorgar recompensa después de show()
                // Cargar nuevo anuncio para la próxima vez
                this.loadRewardedAd();
                resolve(true); // ✅ Otorgar recompensa siempre

            } catch (error) {
                console.error('❌ Error showing rewarded ad:', error);
                // Intentar recargar el anuncio
                this.loadRewardedAd();
                resolve(false);
            }
        });
    }

    async incrementLevelsCompleted(): Promise<void> {
        try {
            const currentCount = await this.getLevelsCompletedCount();
            const newCount = currentCount + 1;
            await AsyncStorage.setItem(STORAGE_KEYS.LEVELS_COMPLETED, newCount.toString());
        } catch (error) {
            console.error('Error incrementing levels completed:', error);
        }
    }

    async getLevelsCompletedCount(): Promise<number> {
        try {
            const count = await AsyncStorage.getItem(STORAGE_KEYS.LEVELS_COMPLETED);
            return count ? parseInt(count, 10) : 0;
        } catch (error) {
            console.error('Error getting levels completed count:', error);
            return 0;
        }
    }

    async shouldShowInterstitialAd(): Promise<boolean> {
        const count = await this.getLevelsCompletedCount();
        return count > 0 && count % 3 === 0; // Mostrar cada 3 niveles
    }

    async getHintsUsedInLevel(levelId: string): Promise<number> {
        try {
            const hints = await AsyncStorage.getItem(STORAGE_KEYS.HINTS_USED_IN_LEVEL + levelId);
            return hints ? parseInt(hints, 10) : 0;
        } catch (error) {
            console.error('Error getting hints used in level:', error);
            return 0;
        }
    }

    async incrementHintsUsedInLevel(levelId: string): Promise<void> {
        try {
            const currentHints = await this.getHintsUsedInLevel(levelId);
            const newHints = currentHints + 1;
            await AsyncStorage.setItem(STORAGE_KEYS.HINTS_USED_IN_LEVEL + levelId, newHints.toString());
        } catch (error) {
            console.error('Error incrementing hints used in level:', error);
        }
    }

    // NUEVA FUNCIÓN: Verificar si puede usar pista gratis
    async canUseFreeHint(levelId: string): Promise<boolean> {
        // Si el usuario es premium, siempre puede usar pistas gratis
        if (isPremium()) {
            return true;
        }

        const hintsUsed = await this.getHintsUsedInLevel(levelId);
        return hintsUsed === 0; // Solo la primera pista es gratuita para usuarios no premium
    }

    // NUEVA FUNCIÓN: Obtener pista (gratis o con anuncio)
    async getHint(levelId: string): Promise<boolean> {
        try {
            const canUseFree = await this.canUseFreeHint(levelId);

            if (canUseFree) {
                // Primera pista gratis
                console.log('✅ Primera pista gratis');
                await this.incrementHintsUsedInLevel(levelId);
                return true;
            } else {
                // Pistas adicionales requieren anuncio
                console.log('🔄 Pista adicional requiere anuncio');

                // Verificar si el anuncio recompensado está disponible
                if (!this.rewardedAd || !this.rewardedAd.loaded) {
                    console.log('⚠️ Rewarded ad not available, attempting to load...');
                    await this.loadRewardedAd();

                    // Si aún no está disponible, otorgar pista gratis temporalmente
                    if (!this.rewardedAd || !this.rewardedAd.loaded) {
                        console.log('⚠️ Rewarded ad still not available, granting free hint');
                        await this.incrementHintsUsedInLevel(levelId);
                        return true;
                    }
                }

                const rewardEarned = await this.showRewardedAd();

                if (rewardEarned) {
                    await this.incrementHintsUsedInLevel(levelId);
                    return true;
                } else {
                    return false;
                }
            }
        } catch (error) {
            console.error('❌ Error getting hint:', error);
            // En caso de error, otorgar pista gratis
            console.log('⚠️ Error occurred, granting free hint as fallback');
            await this.incrementHintsUsedInLevel(levelId);
            return true;
        }
    }

    async resetHintsForLevel(levelId: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.HINTS_USED_IN_LEVEL + levelId);
        } catch (error) {
            console.error('Error resetting hints for level:', error);
        }
    }


}

// Exportar instancia singleton
export const adsManager = AdsManager.getInstance();

// Funciones de conveniencia
export const showInterstitialAd = (): Promise<void> => adsManager.showInterstitialAd();
export const showRewardedAd = (): Promise<boolean> => adsManager.showRewardedAd();
export const incrementLevelsCompleted = (): Promise<void> => adsManager.incrementLevelsCompleted();
export const shouldShowInterstitialAd = (): Promise<boolean> => adsManager.shouldShowInterstitialAd();
export const canUseFreeHint = (levelId: string): Promise<boolean> => adsManager.canUseFreeHint(levelId);
export const getHint = (levelId: string): Promise<boolean> => adsManager.getHint(levelId);
export const incrementHintsUsedInLevel = (levelId: string): Promise<void> => adsManager.incrementHintsUsedInLevel(levelId);
export const resetHintsForLevel = (levelId: string): Promise<void> => adsManager.resetHintsForLevel(levelId);
