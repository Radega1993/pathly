import { initializeAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import app, { db } from './firebase';
import { Progress } from './storage';

// Inicializar Auth (sin persistencia por ahora para evitar errores)
const auth = initializeAuth(app);

// Configuración de Google OAuth
const GOOGLE_CLIENT_ID = process.env.GOOGLE_WEB_CLIENT_ID;
const GOOGLE_REDIRECT_URI = AuthSession.makeRedirectUri({
    scheme: 'com.pathly.game',
    path: 'auth'
});

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

    // Login con Google usando Expo AuthSession
    async signInWithGoogle(): Promise<User> {
        try {
            console.log('🔄 Iniciando login con Google usando Expo AuthSession...');
            console.log('🔧 Configuración completa:', {
                clientId: GOOGLE_CLIENT_ID,
                redirectUri: GOOGLE_REDIRECT_URI,
                scheme: 'com.pathly.game',
                clientIdLength: GOOGLE_CLIENT_ID?.length || 0,
                redirectUriLength: GOOGLE_REDIRECT_URI?.length || 0
            });

            if (!GOOGLE_CLIENT_ID) {
                throw new Error('GOOGLE_CLIENT_ID no está configurado');
            }

            // Crear solicitud de autorización
            const request = new AuthSession.AuthRequest({
                clientId: GOOGLE_CLIENT_ID,
                scopes: ['openid', 'profile', 'email'],
                redirectUri: GOOGLE_REDIRECT_URI,
                responseType: AuthSession.ResponseType.Code,
                codeChallenge: await Crypto.digestStringAsync(
                    Crypto.CryptoDigestAlgorithm.SHA256,
                    'challenge',
                    { encoding: Crypto.CryptoEncoding.HEX }
                ),
                codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
            });

            console.log('✅ Solicitud de autorización creada');
            console.log('🔗 URL de autorización:', await request.makeAuthUrlAsync({
                authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
            }));

            // Ejecutar la solicitud
            const result = await request.promptAsync({
                authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
            });

            console.log('📱 Resultado de autorización:', result.type);
            console.log('📋 Detalles del resultado:', JSON.stringify(result, null, 2));

            if (result.type === 'success') {
                console.log('✅ Autorización exitosa');
                console.log('🔑 Código recibido:', result.params.code ? 'SÍ' : 'NO');

                // Intercambiar código por tokens
                const tokenResult = await AuthSession.exchangeCodeAsync(
                    {
                        clientId: GOOGLE_CLIENT_ID,
                        code: result.params.code,
                        redirectUri: GOOGLE_REDIRECT_URI,
                        extraParams: {
                            code_verifier: 'challenge',
                        },
                    },
                    {
                        tokenEndpoint: 'https://oauth2.googleapis.com/token',
                    }
                );

                console.log('✅ Tokens obtenidos');
                console.log('🆔 ID Token presente:', !!tokenResult.idToken);

                // Crear credencial de Firebase
                const credential = GoogleAuthProvider.credential(tokenResult.idToken);

                console.log('✅ Credencial de Firebase creada');

                // Autenticar con Firebase
                const firebaseResult = await signInWithCredential(auth, credential);
                const firebaseUser = firebaseResult.user;

                console.log('✅ Usuario autenticado con Firebase:', firebaseUser.uid);

                // Crear objeto de usuario
                const user: User = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || undefined,
                    displayName: firebaseUser.displayName || 'Usuario Google',
                    photoURL: firebaseUser.photoURL || undefined,
                    userType: 'free',
                    createdAt: firebaseUser.metadata.creationTime ?
                        new Date(firebaseUser.metadata.creationTime).getTime() : Date.now(),
                    lastLoginAt: Date.now(),
                };

                // Crear o actualizar datos del usuario en Firestore
                await this.createOrUpdateUserData(user);

                this.currentUser = user;
                this.notifyAuthStateChange();

                console.log('✅ Login con Google exitoso');
                return user;
            } else if (result.type === 'cancel') {
                console.log('❌ Usuario canceló la autorización');
                throw new Error('Autorización cancelada por el usuario');
            } else if (result.type === 'error') {
                console.log('❌ Error en autorización:', result.error);
                throw new Error(`Error de autorización: ${result.error}`);
            } else {
                console.log('❌ Resultado inesperado:', result.type);
                throw new Error('Resultado de autorización inesperado');
            }
        } catch (error) {
            console.error('❌ Error en login con Google:', error);
            console.error('❌ Error details:', JSON.stringify(error, null, 2));

            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            const errorStack = error instanceof Error ? error.stack : 'No disponible';

            console.error('❌ Error message:', errorMessage);
            console.error('❌ Error stack:', errorStack);

            // Lanzar el error real en lugar de usar mock
            throw new Error(`Error en login con Google: ${errorMessage}`);
        }
    }

    // Login con Google (mock como fallback)
    private async signInWithGoogleMock(): Promise<User> {
        try {
            console.log('🔄 Iniciando login con Google (mock)...');

            // Crear un usuario mock de Google
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
            console.error('❌ Error en login con Google (mock):', error);
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
            // Cerrar sesión de Firebase
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