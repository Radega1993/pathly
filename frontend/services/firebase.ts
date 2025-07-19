// Configuración de Firebase para Pathly
// Nota: Las credenciales reales se deben obtener desde Firebase Console

export const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "pathly-game.firebaseapp.com",
    projectId: "pathly-game",
    storageBucket: "pathly-game.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Tipos para autenticación
export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

// Servicios de autenticación (placeholder para cuando se instale Firebase)
export class FirebaseAuthService {
    static async signInWithEmail(email: string, password: string): Promise<User> {
        // Placeholder - implementar cuando Firebase esté instalado
        console.log('Sign in with email:', email);
        return {
            uid: 'temp-uid',
            email: email,
            displayName: 'Usuario Temporal',
            photoURL: null
        };
    }

    static async signInWithGoogle(): Promise<User> {
        // Placeholder - implementar cuando Firebase esté instalado
        console.log('Sign in with Google');
        return {
            uid: 'google-uid',
            email: 'usuario@gmail.com',
            displayName: 'Usuario Google',
            photoURL: null
        };
    }

    static async signUp(email: string, password: string, displayName: string): Promise<User> {
        // Placeholder - implementar cuando Firebase esté instalado
        console.log('Sign up:', email, displayName);
        return {
            uid: 'new-uid',
            email: email,
            displayName: displayName,
            photoURL: null
        };
    }

    static async signOut(): Promise<void> {
        // Placeholder - implementar cuando Firebase esté instalado
        console.log('Sign out');
    }

    static async getCurrentUser(): Promise<User | null> {
        // Placeholder - implementar cuando Firebase esté instalado
        return null;
    }
} 