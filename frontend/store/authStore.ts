import { create } from 'zustand';
import { User, AuthState, FirebaseAuthService } from '../services/firebase';

interface AuthStore extends AuthState {
    // Acciones
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signUp: (email: string, password: string, displayName: string) => Promise<void>;
    signOut: () => Promise<void>;
    clearError: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    // Estado inicial
    user: null,
    loading: false,
    error: null,

    // Acciones
    signInWithEmail: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
            const user = await FirebaseAuthService.signInWithEmail(email, password);
            set({ user, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Error al iniciar sesión',
                loading: false
            });
        }
    },

    signInWithGoogle: async () => {
        set({ loading: true, error: null });
        try {
            const user = await FirebaseAuthService.signInWithGoogle();
            set({ user, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Error al iniciar sesión con Google',
                loading: false
            });
        }
    },

    signUp: async (email: string, password: string, displayName: string) => {
        set({ loading: true, error: null });
        try {
            const user = await FirebaseAuthService.signUp(email, password, displayName);
            set({ user, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Error al registrarse',
                loading: false
            });
        }
    },

    signOut: async () => {
        set({ loading: true, error: null });
        try {
            await FirebaseAuthService.signOut();
            set({ user: null, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Error al cerrar sesión',
                loading: false
            });
        }
    },

    clearError: () => set({ error: null }),
    setLoading: (loading: boolean) => set({ loading }),
})); 