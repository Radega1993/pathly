import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';

interface LoginFormProps {
    onLogin: (email: string, password: string) => void;
    onGoogleLogin: () => void;
    onRegister: () => void;
    loading: boolean;
    error: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
    onLogin,
    onGoogleLogin,
    onRegister,
    loading,
    error
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [displayName, setDisplayName] = useState('');

    const handleSubmit = () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        if (isRegister && !displayName) {
            Alert.alert('Error', 'Por favor ingresa tu nombre');
            return;
        }

        onLogin(email, password);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </Text>

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {isRegister && (
                <TextInput
                    style={styles.input}
                    placeholder="Nombre completo"
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                />
            )}

            <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Cargando...' : (isRegister ? 'Registrarse' : 'Iniciar Sesión')}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.googleButton, loading && styles.buttonDisabled]}
                onPress={onGoogleLogin}
                disabled={loading}
            >
                <Text style={styles.googleButtonText}>Continuar con Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.switchButton}
                onPress={() => setIsRegister(!isRegister)}
            >
                <Text style={styles.switchText}>
                    {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3B82F6',
        textAlign: 'center',
        marginBottom: 30,
    },
    errorContainer: {
        backgroundColor: '#FEE2E2',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
    },
    errorText: {
        color: '#DC2626',
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#3B82F6',
        paddingVertical: 15,
        borderRadius: 8,
        marginBottom: 15,
    },
    buttonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    buttonText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    googleButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingVertical: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    googleButtonText: {
        color: '#374151',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    switchButton: {
        paddingVertical: 10,
    },
    switchText: {
        color: '#6B7280',
        textAlign: 'center',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
}); 