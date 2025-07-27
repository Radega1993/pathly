import {
    initializeAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import app, { db } from './firebase';
import { syncOnRegister, syncOnLogin } from './syncService';

// Inicializar Auth con persistencia
const auth = initializeAuth(app);

// Tipos
export interface User {
    uid: string;
    email: string;
    displayName: string;
    userType: 'free' | 'monthly' | 'lifetime';
    createdAt: number;
    lastLoginAt: number;
    isEmailVerified: boolean;
}

export interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials extends LoginCredentials {
    displayName: string;
}

class AuthService {
    private static instance: AuthService;
    private currentUser: User | null = null;
    private authStateListeners: ((state: AuthState) => void)[] = [];
    private isInitialized = false;

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
        onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Usuario autenticado
                const user: User = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    displayName: firebaseUser.displayName || 'Usuario',
                    userType: 'free', // Por defecto free, se actualizará desde Firestore
                    createdAt: firebaseUser.metadata.creationTime ?
                        new Date(firebaseUser.metadata.creationTime).getTime() : Date.now(),
                    lastLoginAt: Date.now(),
                    isEmailVerified: firebaseUser.emailVerified,
                };

                // Cargar datos del usuario desde Firestore
                await this.loadUserData(user);
                this.currentUser = user;

                // Guardar sesión en AsyncStorage para persistencia
                await this.saveSessionToStorage(user);
            } else {
                // Usuario no autenticado
                this.currentUser = null;
                await this.clearSessionFromStorage();
            }

            this.isInitialized = true;
            this.notifyAuthStateChange();
        });
    }

    // Registro de usuario
    async register(credentials: RegisterCredentials): Promise<User> {
        try {
            console.log('🔄 Registrando nuevo usuario...');

            // Validar credenciales
            this.validateCredentials(credentials);

            // Crear usuario en Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                credentials.email,
                credentials.password
            );

            const firebaseUser = userCredential.user;

            // Crear objeto de usuario
            const user: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || credentials.email,
                displayName: credentials.displayName,
                userType: 'free',
                createdAt: Date.now(),
                lastLoginAt: Date.now(),
                isEmailVerified: firebaseUser.emailVerified,
            };

            // Crear datos del usuario en Firestore
            await this.createUserData(user);

            // Sincronizar progreso local con la nube
            await syncOnRegister(user.uid);

            this.currentUser = user;
            this.notifyAuthStateChange();

            console.log('✅ Registro exitoso con sincronización');
            return user;
        } catch (error: any) {
            console.error('❌ Error en registro:', error);

            // Manejar errores específicos de Firebase
            let errorMessage = 'Error en el registro';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'El email ya está registrado';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'La contraseña debe tener al menos 6 caracteres';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'El email no es válido';
            }

            throw new Error(errorMessage);
        }
    }

    // Login de usuario
    async login(credentials: LoginCredentials): Promise<User> {
        try {
            console.log('🔄 Iniciando login...');

            // Validar credenciales
            this.validateCredentials(credentials);

            // Autenticar con Firebase
            const userCredential = await signInWithEmailAndPassword(
                auth,
                credentials.email,
                credentials.password
            );

            const firebaseUser = userCredential.user;

            // Crear objeto de usuario
            const user: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || credentials.email,
                displayName: firebaseUser.displayName || 'Usuario',
                userType: 'free',
                createdAt: firebaseUser.metadata.creationTime ?
                    new Date(firebaseUser.metadata.creationTime).getTime() : Date.now(),
                lastLoginAt: Date.now(),
                isEmailVerified: firebaseUser.emailVerified,
            };

            // Cargar datos del usuario desde Firestore
            await this.loadUserData(user);

            // Actualizar último login
            await this.updateLastLogin(user.uid);

            // Sincronizar progreso con la nube
            await syncOnLogin(user.uid);

            this.currentUser = user;
            this.notifyAuthStateChange();

            console.log('✅ Login exitoso con sincronización');
            return user;
        } catch (error: any) {
            console.error('❌ Error en login:', error);

            // Manejar errores específicos de Firebase
            let errorMessage = 'Error en el login';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'Usuario no encontrado';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Contraseña incorrecta';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'El email no es válido';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Demasiados intentos fallidos. Intenta más tarde';
            }

            throw new Error(errorMessage);
        }
    }

    // Recuperar contraseña
    async resetPassword(email: string): Promise<void> {
        try {
            console.log('🔄 Enviando email de recuperación...');

            if (!email || !email.includes('@')) {
                throw new Error('Email no válido');
            }

            await sendPasswordResetEmail(auth, email);
            console.log('✅ Email de recuperación enviado');
        } catch (error: any) {
            console.error('❌ Error enviando email de recuperación:', error);

            let errorMessage = 'Error enviando email de recuperación';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No existe una cuenta con este email';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'El email no es válido';
            }

            throw new Error(errorMessage);
        }
    }

    // Logout
    async signOut(): Promise<void> {
        try {
            console.log('🔄 Cerrando sesión...');

            // Cerrar sesión de Firebase
            await firebaseSignOut(auth);

            // Limpiar datos locales
            this.currentUser = null;
            await this.clearSessionFromStorage();

            // Resetear progreso local para evitar que se sobrescriba el progreso de otra cuenta
            await this.resetLocalProgress();

            this.notifyAuthStateChange();
            console.log('✅ Logout exitoso - Progreso local reseteado');
        } catch (error) {
            console.error('❌ Error en logout:', error);
            throw error;
        }
    }

    // Validar credenciales
    private validateCredentials(credentials: LoginCredentials | RegisterCredentials): void {
        if (!credentials.email || !credentials.email.includes('@')) {
            throw new Error('Email no válido');
        }

        if (!credentials.password || credentials.password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        if ('displayName' in credentials && (!credentials.displayName || credentials.displayName.trim().length < 2)) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
        }
    }

    // Crear datos del usuario en Firestore
    private async createUserData(user: User): Promise<void> {
        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                userType: user.userType,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt,
                isEmailVerified: user.isEmailVerified,
                progress: {
                    completedLevels: [],
                    lastPlayedLevel: null,
                    totalLevelsCompleted: 0,
                }
            });

            console.log('✅ Datos de usuario creados en Firestore');
        } catch (error) {
            console.error('❌ Error creando datos de usuario:', error);
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
                user.createdAt = userData.createdAt || user.createdAt;
            }
        } catch (error) {
            console.error('❌ Error cargando datos de usuario:', error);
        }
    }

    // Actualizar último login
    private async updateLastLogin(uid: string): Promise<void> {
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, {
                lastLoginAt: Date.now(),
            });
        } catch (error) {
            console.error('❌ Error actualizando último login:', error);
        }
    }

    // Guardar sesión en AsyncStorage
    private async saveSessionToStorage(user: User): Promise<void> {
        try {
            await AsyncStorage.setItem('user_session', JSON.stringify(user));
        } catch (error) {
            console.error('❌ Error guardando sesión:', error);
        }
    }

    // Limpiar sesión de AsyncStorage
    private async clearSessionFromStorage(): Promise<void> {
        try {
            await AsyncStorage.removeItem('user_session');
        } catch (error) {
            console.error('❌ Error limpiando sesión:', error);
        }
    }

    // Resetear progreso local al hacer logout
    private async resetLocalProgress(): Promise<void> {
        try {
            console.log('🔄 Reseteando progreso local...');

            // Importar funciones de storage dinámicamente para evitar dependencias circulares
            const { clearProgress } = await import('./storage');

            // Limpiar progreso local (incluye último nivel jugado)
            await clearProgress();

            console.log('✅ Progreso local reseteado');
        } catch (error) {
            console.error('❌ Error reseteando progreso local:', error);
        }
    }

    // Cargar sesión desde AsyncStorage (para persistencia)
    async loadSessionFromStorage(): Promise<User | null> {
        try {
            const sessionData = await AsyncStorage.getItem('user_session');
            if (sessionData) {
                const user = JSON.parse(sessionData) as User;
                console.log('✅ Sesión cargada desde storage');
                return user;
            }
        } catch (error) {
            console.error('❌ Error cargando sesión:', error);
        }
        return null;
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

    // Verificar si la autenticación está inicializada
    isAuthInitialized(): boolean {
        return this.isInitialized;
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
            isLoading: !this.isInitialized,
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
export const register = (credentials: RegisterCredentials): Promise<User> => authService.register(credentials);
export const login = (credentials: LoginCredentials): Promise<User> => authService.login(credentials);
export const resetPassword = (email: string): Promise<void> => authService.resetPassword(email);
export const signOut = (): Promise<void> => authService.signOut();
export const getCurrentUser = (): User | null => authService.getCurrentUser();
export const isPremium = (): boolean => authService.isPremium();
export const getUserType = (): 'free' | 'monthly' | 'lifetime' => authService.getUserType();
export const subscribeToAuthState = (listener: (state: AuthState) => void) => authService.subscribeToAuthState(listener);
export const loadSessionFromStorage = (): Promise<User | null> => authService.loadSessionFromStorage();
export const isAuthInitialized = (): boolean => authService.isAuthInitialized();

export default authService; 