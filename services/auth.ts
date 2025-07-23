import { initializeAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import app, { db } from './firebase';
import { Progress } from './storage';

// Inicializar Auth (sin persistencia por ahora para evitar errores)
const auth = initializeAuth(app);

// Tipos
export interface User {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    userType: 'free' | 'monthly' | 'lifetime';
    createdAt: number;
    lastLoginAt: number;
}

export interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

class AuthService {
    private static instance: AuthService;
    private currentUser: User | null = null;
    private authStateListeners: ((state: AuthState) => void)[] = [];

    private constructor() {
        this.initializeAuthListener();
    }

    static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    // Inicializar listener de auth
    private initializeAuthListener(): void {
        auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                // Usuario autenticado
                const user: User = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || undefined,
                    displayName: firebaseUser.displayName || 'Usuario',
                    photoURL: firebaseUser.photoURL || undefined,
                    userType: 'free', // Por defecto free, se actualizará desde Firestore
                    createdAt: firebaseUser.metadata.creationTime ?
                        new Date(firebaseUser.metadata.creationTime).getTime() : Date.now(),
                    lastLoginAt: Date.now(),
                };

                // Cargar datos del usuario desde Firestore
                await this.loadUserData(user);
                this.currentUser = user;
            } else {
                // Usuario no autenticado
                this.currentUser = null;
            }

            this.notifyAuthStateChange();
        });
    }



    // Login con Google (simplificado - solo mock por ahora)
    async signInWithGoogle(): Promise<User> {
        try {
            console.log('🔄 Iniciando login con Google...');

            // Por ahora, crear un usuario mock de Google
            const mockGoogleUser: User = {
                uid: `google_${Date.now()}`,
                email: 'usuario@gmail.com',
                displayName: 'Usuario Google',
                photoURL: 'https://via.placeholder.com/150',
                userType: 'free',
                createdAt: Date.now(),
                lastLoginAt: Date.now(),
            };

            // Crear o actualizar datos del usuario en Firestore
            await this.createOrUpdateUserData(mockGoogleUser);

            this.currentUser = mockGoogleUser;
            this.notifyAuthStateChange();

            console.log('✅ Login con Google exitoso (mock)');
            return mockGoogleUser;
        } catch (error) {
            console.error('❌ Error en login con Google:', error);
            throw error;
        }
    }

    // Crear o actualizar datos del usuario en Firestore
    private async createOrUpdateUserData(user: User): Promise<void> {
        try {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                // Usuario existe, actualizar último login
                await updateDoc(userRef, {
                    lastLoginAt: user.lastLoginAt,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                });

                // Cargar datos existentes
                const userData = userDoc.data();
                user.userType = userData.userType || 'free';
            } else {
                // Usuario nuevo, crear documento
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    userType: user.userType,
                    createdAt: user.createdAt,
                    lastLoginAt: user.lastLoginAt,
                    progress: {
                        completedLevels: [],
                        lastPlayedLevel: null,
                        totalLevelsCompleted: 0,
                    }
                });
            }

            console.log('✅ Datos de usuario guardados en Firestore');
        } catch (error) {
            console.error('❌ Error guardando datos de usuario:', error);
        }
    }

    // Cargar datos del usuario desde Firestore
    private async loadUserData(user: User): Promise<void> {
        try {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                user.userType = userData.userType || 'free';
                user.displayName = userData.displayName || user.displayName;
                user.photoURL = userData.photoURL || user.photoURL;
            }
        } catch (error) {
            console.error('❌ Error cargando datos de usuario:', error);
        }
    }

    // Obtener usuario actual
    getCurrentUser(): User | null {
        return this.currentUser;
    }

    // Verificar si el usuario es premium
    isPremium(): boolean {
        return this.currentUser?.userType === 'monthly' || this.currentUser?.userType === 'lifetime';
    }

    // Obtener tipo de usuario
    getUserType(): 'free' | 'monthly' | 'lifetime' {
        return this.currentUser?.userType || 'free';
    }

    // Logout
    async signOut(): Promise<void> {
        try {
            await auth.signOut();
            this.currentUser = null;
            this.notifyAuthStateChange();
            console.log('✅ Logout exitoso');
        } catch (error) {
            console.error('❌ Error en logout:', error);
            throw error;
        }
    }

    // Suscribirse a cambios de auth state
    subscribeToAuthState(listener: (state: AuthState) => void): () => void {
        this.authStateListeners.push(listener);

        // Notificar estado actual inmediatamente
        listener(this.getAuthState());

        // Retornar función para desuscribirse
        return () => {
            const index = this.authStateListeners.indexOf(listener);
            if (index > -1) {
                this.authStateListeners.splice(index, 1);
            }
        };
    }

    // Notificar cambios de auth state
    private notifyAuthStateChange(): void {
        const state = this.getAuthState();
        this.authStateListeners.forEach(listener => listener(state));
    }

    // Obtener estado actual de auth
    private getAuthState(): AuthState {
        return {
            user: this.currentUser,
            isLoading: false,
            isAuthenticated: this.currentUser !== null,
        };
    }

    // Actualizar tipo de usuario (para cuando se configure RevenueCat)
    async updateUserType(userType: 'free' | 'monthly' | 'lifetime'): Promise<void> {
        if (!this.currentUser) return;

        try {
            const userRef = doc(db, 'users', this.currentUser.uid);
            await updateDoc(userRef, { userType });

            this.currentUser.userType = userType;
            this.notifyAuthStateChange();

            console.log('✅ Tipo de usuario actualizado:', userType);
        } catch (error) {
            console.error('❌ Error actualizando tipo de usuario:', error);
        }
    }
}

// Exportar instancia singleton
export const authService = AuthService.getInstance();

// Funciones de conveniencia
export const signInWithGoogle = (): Promise<User> => authService.signInWithGoogle();
export const signOut = (): Promise<void> => authService.signOut();
export const getCurrentUser = (): User | null => authService.getCurrentUser();
export const isPremium = (): boolean => authService.isPremium();
export const getUserType = (): 'free' | 'monthly' | 'lifetime' => authService.getUserType();
export const subscribeToAuthState = (listener: (state: AuthState) => void) => authService.subscribeToAuthState(listener);

export default authService; 