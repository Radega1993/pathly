import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LoginForm } from '../components/LoginForm';
import { useAuthStore } from '../store/authStore';

interface LoginScreenProps {
    navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const { user, loading, error, signInWithEmail, signInWithGoogle, clearError } = useAuthStore();

    // Redirigir si el usuario está autenticado
    useEffect(() => {
        if (user) {
            navigation.navigate('Home');
        }
    }, [user, navigation]);

    // Limpiar error cuando se monta el componente
    useEffect(() => {
        clearError();
    }, [clearError]);

    const handleLogin = (email: string, password: string) => {
        signInWithEmail(email, password);
    };

    const handleGoogleLogin = () => {
        signInWithGoogle();
    };

    const handleRegister = () => {
        // Por ahora, el registro se maneja en el mismo formulario
        console.log('Registro solicitado');
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.appTitle}>Pathly</Text>
                <Text style={styles.subtitle}>Conecta los números en orden</Text>

                <LoginForm
                    onLogin={handleLogin}
                    onGoogleLogin={handleGoogleLogin}
                    onRegister={handleRegister}
                    loading={loading}
                    error={error}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 20,
    },
    appTitle: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#3B82F6',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#6B7280',
        marginBottom: 50,
        textAlign: 'center',
    },
}); 