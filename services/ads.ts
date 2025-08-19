import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Intentar importar react-native-google-mobile-ads, con fallback a mock
let InterstitialAd: any;
let RewardedAd: any;
let TestIds: any;
let BannerAd: any;
let BannerAdSize: any;
let AdEventType: any;
let RewardedAdEventType: any;

try {
    const adsModule = require('react-native-google-mobile-ads');
    InterstitialAd = adsModule.InterstitialAd;
    RewardedAd = adsModule.RewardedAd;
    TestIds = adsModule.TestIds;
    BannerAd = adsModule.BannerAd;
    BannerAdSize = adsModule.BannerAdSize;
    AdEventType = adsModule.AdEventType;
    RewardedAdEventType = adsModule.RewardedAdEventType;
    console.log('✅ react-native-google-mobile-ads loaded successfully');
} catch (error) {
    console.warn('⚠️ react-native-google-mobile-ads not available, using mock implementation');
    console.warn('⚠️ This is expected during development or if native module is not ready');
}

// Configuración de AdMob - IDs desde variables de entorno
const AD_IDS = {
    ANDROID_APP_ID: process.env.ADMOB_ANDROID_APP_ID,
    INTERSTITIAL: process.env.ADMOB_INTERSTITIAL_ID,
    REWARDED: process.env.ADMOB_REWARDED_ID,
};

// Validar que las variables de entorno estén configuradas
if (!AD_IDS.ANDROID_APP_ID || !AD_IDS.INTERSTITIAL || !AD_IDS.REWARDED) {
    console.error('❌ Error: AdMob environment variables not configured');
    console.error('❌ Required: ADMOB_ANDROID_APP_ID, ADMOB_INTERSTITIAL_ID, ADMOB_REWARDED_ID');
    throw new Error('AdMob environment variables not configured');
}

console.log('✅ AdMob configuration loaded');
console.log('✅ Using environment variables for AdMob IDs');
console.log('✅ Android App ID:', AD_IDS.ANDROID_APP_ID);
console.log('✅ Interstitial ID:', AD_IDS.INTERSTITIAL);
console.log('✅ Rewarded ID:', AD_IDS.REWARDED);

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
            if (!InterstitialAd || !RewardedAd) {
                console.warn('⚠️ Native AdMob module not available, using mock ads');
                this.useMockAds = true;
                this.isInitialized = true;
                console.log('✅ AdMob initialized successfully (mock mode)');
                return;
            }

            // Crear anuncio intersticial
            this.interstitialAd = InterstitialAd.createForAdRequest(AD_IDS.INTERSTITIAL, {
                requestNonPersonalizedAdsOnly: true,
                keywords: ['puzzle', 'game', 'brain'],
            });

            // Crear anuncio intersticial para pistas (usando el ID de "recompensado" como intersticial)
            this.rewardedAd = InterstitialAd.createForAdRequest(AD_IDS.REWARDED, {
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
            console.log('✅ Interstitial ad loaded');
        } catch (error) {
            console.error('❌ Error loading interstitial ad:', error);
        }
    }

    private async loadRewardedAd(): Promise<void> {
        if (!this.rewardedAd || this.useMockAds) return;

        try {
            console.log('🔄 Loading hint interstitial ad...');
            console.log('🔍 DEBUG: Hint interstitial ad ID:', AD_IDS.REWARDED);
            console.log('🔍 DEBUG: Hint interstitial ad object exists:', !!this.rewardedAd);
            console.log('🔍 DEBUG: Hint interstitial ad object type:', typeof this.rewardedAd);

            // Verificar si el objeto tiene los métodos necesarios
            console.log('🔍 DEBUG: Has load method:', typeof this.rewardedAd.load === 'function');
            console.log('🔍 DEBUG: Has addAdEventListener method:', typeof this.rewardedAd.addAdEventListener === 'function');

            // Agregar listener para eventos de carga
            const unsubscribeLoaded = this.rewardedAd.addAdEventListener(
                AdEventType.LOADED,
                () => {
                    console.log('✅ Hint interstitial ad loaded event fired');
                }
            );

            const unsubscribeError = this.rewardedAd.addAdEventListener(
                AdEventType.ERROR,
                (error: any) => {
                    console.error('❌ Hint interstitial ad load error event:', error);
                    console.error('❌ Error code:', error?.code);
                    console.error('❌ Error message:', error?.message);
                }
            );

            console.log('🔄 Calling rewardedAd.load()...');

            // Intentar cargar con timeout
            const loadPromise = this.rewardedAd.load();
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Load timeout')), 15000); // 15 segundos
            });

            await Promise.race([loadPromise, timeoutPromise]);
            console.log('🔄 load() promise resolved');

            // Esperar más tiempo para que se procese completamente
            console.log('🔄 Waiting for ad to be fully loaded...');
            for (let i = 0; i < 10; i++) {
                await new Promise(resolve => setTimeout(resolve, 500));
                if (this.rewardedAd.loaded) {
                    console.log(`✅ Ad loaded after ${(i + 1) * 500}ms`);
                    break;
                }
                console.log(`🔄 Still waiting... (${(i + 1) * 500}ms)`);
            }

            // Verificar si realmente se cargó
            console.log('🔍 DEBUG: Checking if ad is loaded...');
            console.log('🔍 DEBUG: this.rewardedAd.loaded:', this.rewardedAd.loaded);

            if (this.rewardedAd.loaded) {
                console.log('✅ Hint interstitial ad loaded successfully');
            } else {
                console.error('❌ Hint interstitial ad failed to load - loaded property is false');
                console.log('🔍 DEBUG: Ad object after load attempt:', {
                    loaded: this.rewardedAd.loaded,
                    hasLoad: typeof this.rewardedAd.load === 'function',
                    hasShow: typeof this.rewardedAd.show === 'function'
                });
            }

            // Limpiar listeners
            unsubscribeLoaded();
            unsubscribeError();

        } catch (error) {
            console.error('❌ Error loading hint interstitial ad:', error);
            if (error instanceof Error) {
                console.error('❌ Error name:', error.name);
                console.error('❌ Error message:', error.message);
                console.error('❌ Error stack:', error.stack);
            }
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

            console.log('🔄 Showing interstitial ad...');

            // Verificar si el anuncio está cargado
            if (!this.interstitialAd.loaded) {
                console.log('🔄 Loading interstitial ad...');
                await this.loadInterstitialAd();

                if (!this.interstitialAd.loaded) {
                    console.error('❌ Failed to load interstitial ad');
                    return;
                }
            }

            // Mostrar el anuncio
            await this.interstitialAd.show();
            console.log('✅ Interstitial ad completed');

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

                // Configurar listeners
                const unsubscribeLoaded = this.rewardedAd.addAdEventListener(
                    AdEventType.LOADED,
                    () => {
                        console.log('✅ Hint interstitial ad loaded in listener');
                    }
                );

                const unsubscribeClosed = this.rewardedAd.addAdEventListener(
                    AdEventType.CLOSED,
                    () => {
                        console.log('✅ Hint interstitial ad closed');
                        unsubscribeLoaded();
                        unsubscribeClosed();
                        unsubscribeError();

                        // Cargar nuevo anuncio para la próxima vez
                        this.loadRewardedAd();

                        resolve(true); // Siempre otorgar recompensa al cerrar
                    }
                );

                const unsubscribeError = this.rewardedAd.addAdEventListener(
                    AdEventType.ERROR,
                    (error: any) => {
                        console.error('❌ Hint interstitial ad error:', error);
                        unsubscribeLoaded();
                        unsubscribeClosed();
                        unsubscribeError();

                        // Intentar recargar el anuncio
                        this.loadRewardedAd();

                        resolve(false);
                    }
                );

                // Verificar si el anuncio está cargado
                if (!this.rewardedAd.loaded) {
                    console.log('🔄 Loading rewarded ad before showing...');
                    await this.loadRewardedAd();

                    // Esperar más tiempo para que se cargue completamente
                    console.log('🔄 Waiting for ad to be ready...');
                    for (let i = 0; i < 20; i++) {
                        await new Promise(resolve => setTimeout(resolve, 250));
                        if (this.rewardedAd.loaded) {
                            console.log(`✅ Ad ready after ${(i + 1) * 250}ms`);
                            break;
                        }
                    }

                    if (!this.rewardedAd.loaded) {
                        console.error('❌ Failed to load rewarded ad after retry');
                        console.log('⚠️ Attempting to show ad anyway...');
                        // Intentar mostrar el anuncio de todas formas
                    }
                }

                console.log('✅ Rewarded ad is loaded, showing...');

                // Mostrar el anuncio
                await this.rewardedAd.show();
                adShown = true;
                console.log('✅ Rewarded ad show() called successfully');

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
            console.log('🔍 DEBUG: Getting hint for level:', levelId);
            await this.debugAdStatus();

            const canUseFree = await this.canUseFreeHint(levelId);
            console.log('🔍 DEBUG: canUseFree:', canUseFree);

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
                console.log('🔍 DEBUG: rewardEarned:', rewardEarned);

                if (rewardEarned) {
                    console.log('✅ Anuncio completado, pista otorgada');
                    await this.incrementHintsUsedInLevel(levelId);
                    return true;
                } else {
                    console.log('❌ Anuncio no completado, pista no otorgada');
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

    // Función de debug para verificar el estado de los anuncios
    async debugAdStatus(): Promise<void> {
        console.log('🔍 DEBUG: Ad Status');
        console.log('  - isInitialized:', this.isInitialized);
        console.log('  - useMockAds:', this.useMockAds);
        console.log('  - interstitialAd exists:', !!this.interstitialAd);
        console.log('  - rewardedAd exists:', !!this.rewardedAd);

        if (this.interstitialAd) {
            console.log('  - interstitialAd.loaded:', this.interstitialAd.loaded);
        }

        if (this.rewardedAd) {
            console.log('  - rewardedAd.loaded:', this.rewardedAd.loaded);
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
export const debugAdStatus = (): Promise<void> => adsManager.debugAdStatus(); 