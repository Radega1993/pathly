import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getProgress, saveProgress, getLastLevelPlayed, setLastLevelPlayed, Progress } from './storage';
import { getCurrentUser } from './auth';

// Interfaz para el progreso en la nube
interface CloudProgress {
    completedLevels: string[];
    lastPlayedLevel: string | null;
    lastPlayedAt: number;
    lastSyncAt: number;
    totalLevelsCompleted: number;
}

// Interfaz para el documento de usuario en Firestore
interface UserDocument {
    uid: string;
    email: string;
    displayName: string;
    userType: 'free' | 'monthly' | 'lifetime';
    createdAt: number;
    lastLoginAt: number;
    isEmailVerified: boolean;
    progress: CloudProgress;
}

class SyncService {
    private static instance: SyncService;
    private isSyncing = false;

    private constructor() { }

    static getInstance(): SyncService {
        if (!SyncService.instance) {
            SyncService.instance = new SyncService();
        }
        return SyncService.instance;
    }

    /**
     * Sincroniza el progreso local con la nube al registrar un usuario
     */
    async syncOnRegister(userId: string): Promise<void> {
        try {
            console.log('🔄 Sincronizando progreso al registrar usuario...');

            const localProgress = await getProgress();
            const lastLevelPlayed = await getLastLevelPlayed();

            // Crear progreso en la nube con datos locales
            const cloudProgress: CloudProgress = {
                completedLevels: Array.from(localProgress.completedLevels),
                lastPlayedLevel: lastLevelPlayed,
                lastPlayedAt: localProgress.lastPlayedAt,
                lastSyncAt: Date.now(),
                totalLevelsCompleted: localProgress.completedLevels.size,
            };

            // Guardar en Firestore
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                progress: cloudProgress,
                lastLoginAt: Date.now(),
            });

            console.log('✅ Progreso sincronizado al registrar usuario');
        } catch (error) {
            console.error('❌ Error sincronizando al registrar:', error);
            throw error;
        }
    }

    /**
 * Sincroniza el progreso al hacer login
 */
    async syncOnLogin(userId: string): Promise<void> {
        try {
            console.log('🔄 Sincronizando progreso al hacer login...');

            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                console.log('⚠️ Usuario no encontrado en Firestore, creando progreso inicial');
                await this.syncOnRegister(userId);
                return;
            }

            const userData = userDoc.data() as UserDocument;
            const cloudProgress = userData.progress || this.getEmptyCloudProgress();
            const localProgress = await getProgress();
            const localLastLevel = await getLastLevelPlayed();

            console.log('📊 Comparando progreso:');
            console.log('- Local: niveles completados:', localProgress.completedLevels.size, 'último:', localLastLevel);
            console.log('- Nube: niveles completados:', cloudProgress.totalLevelsCompleted, 'último:', cloudProgress.lastPlayedLevel);

            // Si la nube no tiene progreso pero el local sí, forzar sincronización local
            if (cloudProgress.totalLevelsCompleted === 0 && localProgress.completedLevels.size > 0) {
                console.log('📤 Nube sin progreso pero local con progreso, forzando sincronización local');
                await this.updateCloudFromLocal(userId, localProgress, localLastLevel);
                return;
            }

            // Comparar fechas para decidir qué datos usar
            const cloudIsNewer = cloudProgress.lastPlayedAt > localProgress.lastPlayedAt;
            const localIsNewer = localProgress.lastPlayedAt > cloudProgress.lastPlayedAt;

            if (cloudIsNewer) {
                // La nube tiene datos más recientes, actualizar local
                console.log('📥 Actualizando progreso local con datos de la nube');
                await this.updateLocalFromCloud(cloudProgress);
            } else if (localIsNewer) {
                // Local tiene datos más recientes, actualizar nube
                console.log('📤 Actualizando nube con datos locales');
                await this.updateCloudFromLocal(userId, localProgress, localLastLevel);
            } else {
                // Ambos están sincronizados, solo actualizar timestamp
                console.log('✅ Progreso ya sincronizado');
                await this.updateLastSync(userId);
            }

            console.log('✅ Progreso sincronizado al hacer login');
        } catch (error) {
            console.error('❌ Error sincronizando al hacer login:', error);
            throw error;
        }
    }

    /**
     * Sincroniza el progreso local hacia la nube
     */
    async syncToCloud(): Promise<void> {
        if (this.isSyncing) {
            console.log('⚠️ Sincronización ya en progreso, saltando...');
            return;
        }

        const user = getCurrentUser();
        if (!user) {
            console.log('⚠️ No hay usuario autenticado, saltando sincronización');
            return;
        }

        this.isSyncing = true;
        try {
            console.log('🔄 Sincronizando progreso local hacia la nube...');

            const localProgress = await getProgress();
            const lastLevelPlayed = await getLastLevelPlayed();

            await this.updateCloudFromLocal(user.uid, localProgress, lastLevelPlayed);

            console.log('✅ Progreso sincronizado hacia la nube');
        } catch (error) {
            console.error('❌ Error sincronizando hacia la nube:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Sincroniza el progreso de la nube hacia local
     */
    async syncFromCloud(): Promise<void> {
        if (this.isSyncing) {
            console.log('⚠️ Sincronización ya en progreso, saltando...');
            return;
        }

        const user = getCurrentUser();
        if (!user) {
            console.log('⚠️ No hay usuario autenticado, saltando sincronización');
            return;
        }

        this.isSyncing = true;
        try {
            console.log('🔄 Sincronizando progreso de la nube hacia local...');

            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const userData = userDoc.data() as UserDocument;
                const cloudProgress = userData.progress;

                if (cloudProgress) {
                    await this.updateLocalFromCloud(cloudProgress);
                    console.log('✅ Progreso sincronizado desde la nube');
                } else {
                    console.log('⚠️ No hay progreso en la nube');
                }
            } else {
                console.log('⚠️ Usuario no encontrado en Firestore');
            }
        } catch (error) {
            console.error('❌ Error sincronizando desde la nube:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Actualiza el progreso local con datos de la nube
     */
    private async updateLocalFromCloud(cloudProgress: CloudProgress): Promise<void> {
        const localProgress: Progress = {
            completedLevels: new Set(cloudProgress.completedLevels),
            lastPlayedAt: cloudProgress.lastPlayedAt,
        };

        await saveProgress(localProgress);

        if (cloudProgress.lastPlayedLevel) {
            await setLastLevelPlayed(cloudProgress.lastPlayedLevel);
        }
    }

    /**
     * Actualiza la nube con datos locales
     */
    private async updateCloudFromLocal(userId: string, localProgress: Progress, lastLevelPlayed: string | null): Promise<void> {
        const cloudProgress: CloudProgress = {
            completedLevels: Array.from(localProgress.completedLevels),
            lastPlayedLevel: lastLevelPlayed,
            lastPlayedAt: localProgress.lastPlayedAt,
            lastSyncAt: Date.now(),
            totalLevelsCompleted: localProgress.completedLevels.size,
        };

        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            progress: cloudProgress,
            lastLoginAt: Date.now(),
        });
    }

    /**
     * Actualiza solo el timestamp de última sincronización
     */
    private async updateLastSync(userId: string): Promise<void> {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            'progress.lastSyncAt': Date.now(),
            lastLoginAt: Date.now(),
        });
    }

    /**
     * Obtiene un progreso vacío para la nube
     */
    private getEmptyCloudProgress(): CloudProgress {
        return {
            completedLevels: [],
            lastPlayedLevel: null,
            lastPlayedAt: Date.now(),
            lastSyncAt: Date.now(),
            totalLevelsCompleted: 0,
        };
    }

    /**
     * Obtiene el progreso de la nube para un usuario
     */
    async getCloudProgress(userId: string): Promise<CloudProgress | null> {
        try {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const userData = userDoc.data() as UserDocument;
                return userData.progress || null;
            }

            return null;
        } catch (error) {
            console.error('❌ Error obteniendo progreso de la nube:', error);
            return null;
        }
    }

    /**
 * Compara el progreso local con el de la nube
 */
    async compareProgress(userId: string): Promise<{
        localNewer: boolean;
        cloudNewer: boolean;
        localCount: number;
        cloudCount: number;
    }> {
        try {
            const localProgress = await getProgress();
            const cloudProgress = await this.getCloudProgress(userId);

            if (!cloudProgress) {
                return {
                    localNewer: true,
                    cloudNewer: false,
                    localCount: localProgress.completedLevels.size,
                    cloudCount: 0,
                };
            }

            const localNewer = localProgress.lastPlayedAt > cloudProgress.lastPlayedAt;
            const cloudNewer = cloudProgress.lastPlayedAt > localProgress.lastPlayedAt;

            return {
                localNewer,
                cloudNewer,
                localCount: localProgress.completedLevels.size,
                cloudCount: cloudProgress.totalLevelsCompleted,
            };
        } catch (error) {
            console.error('❌ Error comparando progreso:', error);
            return {
                localNewer: false,
                cloudNewer: false,
                localCount: 0,
                cloudCount: 0,
            };
        }
    }

    /**
     * Fuerza la sincronización del progreso local hacia la nube
     */
    async forceSyncToCloud(userId: string): Promise<void> {
        try {
            console.log('🔄 Forzando sincronización local hacia la nube...');

            const localProgress = await getProgress();
            const localLastLevel = await getLastLevelPlayed();

            console.log('📊 Progreso local a sincronizar:');
            console.log('- Niveles completados:', localProgress.completedLevels.size);
            console.log('- Último nivel jugado:', localLastLevel);
            console.log('- Última actividad:', new Date(localProgress.lastPlayedAt).toLocaleString());

            await this.updateCloudFromLocal(userId, localProgress, localLastLevel);

            console.log('✅ Sincronización forzada completada');
        } catch (error) {
            console.error('❌ Error en sincronización forzada:', error);
            throw error;
        }
    }

    /**
     * Fuerza la sincronización del progreso de la nube hacia local
     */
    async forceSyncFromCloud(userId: string): Promise<void> {
        try {
            console.log('🔄 Forzando sincronización desde la nube hacia local...');

            const cloudProgress = await this.getCloudProgress(userId);

            if (!cloudProgress) {
                console.log('⚠️ No hay progreso en la nube para sincronizar');
                return;
            }

            console.log('📊 Progreso de la nube a sincronizar:');
            console.log('- Niveles completados:', cloudProgress.totalLevelsCompleted);
            console.log('- Último nivel jugado:', cloudProgress.lastPlayedLevel);
            console.log('- Última actividad:', new Date(cloudProgress.lastPlayedAt).toLocaleString());

            await this.updateLocalFromCloud(cloudProgress);

            console.log('✅ Sincronización forzada desde la nube completada');
        } catch (error) {
            console.error('❌ Error en sincronización forzada desde la nube:', error);
            throw error;
        }
    }
}

// Exportar instancia singleton
export const syncService = SyncService.getInstance();

// Funciones de conveniencia
export const syncOnRegister = (userId: string): Promise<void> => syncService.syncOnRegister(userId);
export const syncOnLogin = (userId: string): Promise<void> => syncService.syncOnLogin(userId);
export const syncToCloud = (): Promise<void> => syncService.syncToCloud();
export const syncFromCloud = (): Promise<void> => syncService.syncFromCloud();
export const getCloudProgress = (userId: string): Promise<CloudProgress | null> => syncService.getCloudProgress(userId);
export const compareProgress = (userId: string) => syncService.compareProgress(userId);
export const forceSyncToCloud = (userId: string): Promise<void> => syncService.forceSyncToCloud(userId);
export const forceSyncFromCloud = (userId: string): Promise<void> => syncService.forceSyncFromCloud(userId);

export type { CloudProgress, UserDocument }; 