import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Tipos
export interface UpdateInfo {
    currentVersion: string;
    currentVersionCode: number;
    latestVersion?: string;
    latestVersionCode?: number;
    updateUrl: string;
    isUpdateAvailable: boolean;
    lastChecked: number;
}

export interface UpdatePreferences {
    showUpdateAlerts: boolean;
    lastDismissedVersion?: string;
    checkFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
}

// Configuración
const UPDATE_CONFIG = {
    GOOGLE_PLAY_URL: 'https://play.google.com/store/apps/details?id=com.pathly.game',
    STORAGE_KEYS: {
        UPDATE_PREFERENCES: 'update_preferences',
        LAST_CHECK: 'last_update_check',
    },
    CHECK_INTERVALS: {
        daily: 24 * 60 * 60 * 1000, // 24 horas
        weekly: 7 * 24 * 60 * 60 * 1000, // 7 días
        monthly: 30 * 24 * 60 * 60 * 1000, // 30 días
    },
    DEFAULT_PREFERENCES: {
        showUpdateAlerts: true,
        checkFrequency: 'weekly' as const,
    },
};

class UpdateService {
    private preferences: UpdatePreferences = UPDATE_CONFIG.DEFAULT_PREFERENCES;

    /**
     * Inicializar el servicio de actualizaciones
     */
    async initialize(): Promise<void> {
        try {
            await this.loadPreferences();
            console.log('✅ UpdateService initialized');
        } catch (error) {
            console.error('❌ Error initializing UpdateService:', error);
        }
    }

    /**
     * Obtener información de la versión actual
     */
    getCurrentVersionInfo(): { version: string; versionCode: number } {
        const manifest = Constants.expoConfig;

        if (Platform.OS === 'android') {
            return {
                version: manifest?.version || '1.1.0',
                versionCode: manifest?.android?.versionCode || 18,
            };
        } else {
            return {
                version: manifest?.version || '1.1.0',
                versionCode: manifest?.ios?.buildNumber ? parseInt(manifest.ios.buildNumber) : 1,
            };
        }
    }

    /**
     * Verificar si hay una actualización disponible
     * Nota: En un entorno real, esto haría una llamada a una API
     * Por ahora, simulamos la verificación
     */
    async checkForUpdates(): Promise<UpdateInfo> {
        try {
            const current = this.getCurrentVersionInfo();
            const lastCheck = await this.getLastCheckTime();

            // Verificar si debemos hacer la comprobación según la frecuencia configurada
            if (!this.shouldCheckForUpdates(lastCheck)) {
                return {
                    currentVersion: current.version,
                    currentVersionCode: current.versionCode,
                    updateUrl: UPDATE_CONFIG.GOOGLE_PLAY_URL,
                    isUpdateAvailable: false,
                    lastChecked: lastCheck,
                };
            }

            // En un entorno real, aquí harías una llamada a tu API
            // Por ahora, simulamos que siempre hay una versión más nueva
            // (esto se puede cambiar para producción)
            const mockLatestVersion = this.getMockLatestVersion(current.version);

            const updateInfo: UpdateInfo = {
                currentVersion: current.version,
                currentVersionCode: current.versionCode,
                latestVersion: mockLatestVersion.version,
                latestVersionCode: mockLatestVersion.versionCode,
                updateUrl: UPDATE_CONFIG.GOOGLE_PLAY_URL,
                isUpdateAvailable: this.isVersionNewer(mockLatestVersion, current),
                lastChecked: Date.now(),
            };

            // Guardar la última verificación
            await this.setLastCheckTime(updateInfo.lastChecked);

            return updateInfo;
        } catch (error) {
            console.error('❌ Error checking for updates:', error);
            return {
                currentVersion: this.getCurrentVersionInfo().version,
                currentVersionCode: this.getCurrentVersionInfo().versionCode,
                updateUrl: UPDATE_CONFIG.GOOGLE_PLAY_URL,
                isUpdateAvailable: false,
                lastChecked: Date.now(),
            };
        }
    }

    /**
     * Simular la versión más reciente disponible
     * En producción, esto vendría de tu API
     */
    private getMockLatestVersion(currentVersion: string): { version: string; versionCode: number } {
        // Simular que hay una versión más nueva
        // En producción, esto se reemplazaría con datos reales de tu API
        const versionParts = currentVersion.split('.');
        const major = parseInt(versionParts[0]);
        const minor = parseInt(versionParts[1]);
        const patch = parseInt(versionParts[2]) + 1; // Incrementar patch version

        return {
            version: `${major}.${minor}.${patch}`,
            versionCode: this.getCurrentVersionInfo().versionCode + 1,
        };
    }

    /**
     * Comparar versiones para determinar si hay una más nueva
     */
    private isVersionNewer(
        latest: { version: string; versionCode: number },
        current: { version: string; versionCode: number }
    ): boolean {
        // Comparar version code primero (más confiable)
        if (latest.versionCode > current.versionCode) {
            return true;
        }

        // Si los version codes son iguales, comparar version strings
        return this.compareVersions(latest.version, current.version) > 0;
    }

    /**
     * Comparar versiones semánticas
     */
    private compareVersions(v1: string, v2: string): number {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);

        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const part1 = parts1[i] || 0;
            const part2 = parts2[i] || 0;

            if (part1 > part2) return 1;
            if (part1 < part2) return -1;
        }

        return 0;
    }

    /**
     * Verificar si debemos hacer la comprobación según la frecuencia configurada
     */
    private shouldCheckForUpdates(lastCheck: number): boolean {
        if (this.preferences.checkFrequency === 'never') {
            return false;
        }

        const interval = UPDATE_CONFIG.CHECK_INTERVALS[this.preferences.checkFrequency];
        const timeSinceLastCheck = Date.now() - lastCheck;

        return timeSinceLastCheck >= interval;
    }

    /**
     * Cargar preferencias del usuario
     */
    async loadPreferences(): Promise<void> {
        try {
            const stored = await AsyncStorage.getItem(UPDATE_CONFIG.STORAGE_KEYS.UPDATE_PREFERENCES);
            if (stored) {
                this.preferences = { ...UPDATE_CONFIG.DEFAULT_PREFERENCES, ...JSON.parse(stored) };
            }
        } catch (error) {
            console.error('❌ Error loading update preferences:', error);
        }
    }

    /**
     * Guardar preferencias del usuario
     */
    async savePreferences(preferences: Partial<UpdatePreferences>): Promise<void> {
        try {
            this.preferences = { ...this.preferences, ...preferences };
            await AsyncStorage.setItem(
                UPDATE_CONFIG.STORAGE_KEYS.UPDATE_PREFERENCES,
                JSON.stringify(this.preferences)
            );
        } catch (error) {
            console.error('❌ Error saving update preferences:', error);
        }
    }

    /**
     * Obtener preferencias actuales
     */
    getPreferences(): UpdatePreferences {
        return { ...this.preferences };
    }

    /**
     * Obtener la última vez que se verificó actualizaciones
     */
    private async getLastCheckTime(): Promise<number> {
        try {
            const stored = await AsyncStorage.getItem(UPDATE_CONFIG.STORAGE_KEYS.LAST_CHECK);
            return stored ? parseInt(stored) : 0;
        } catch (error) {
            console.error('❌ Error getting last check time:', error);
            return 0;
        }
    }

    /**
     * Guardar la última vez que se verificó actualizaciones
     */
    private async setLastCheckTime(timestamp: number): Promise<void> {
        try {
            await AsyncStorage.setItem(UPDATE_CONFIG.STORAGE_KEYS.LAST_CHECK, timestamp.toString());
        } catch (error) {
            console.error('❌ Error setting last check time:', error);
        }
    }

    /**
     * Marcar una versión como descartada por el usuario
     */
    async dismissUpdate(version: string): Promise<void> {
        await this.savePreferences({ lastDismissedVersion: version });
    }

    /**
     * Verificar si el usuario ya descartó esta versión
     */
    isUpdateDismissed(version: string): boolean {
        return this.preferences.lastDismissedVersion === version;
    }

    /**
     * Obtener la URL de actualización
     */
    getUpdateUrl(): string {
        return UPDATE_CONFIG.GOOGLE_PLAY_URL;
    }
}

// Exportar instancia singleton
export const updateService = new UpdateService();
export default updateService; 