import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { authService } from '../services/auth';

interface AuthModalProps {
    visible: boolean;
    onClose: () => void;
    onUserAuthenticated: (user: any) => void;
    authState: any;
}

const AuthModal: React.FC<AuthModalProps> = ({
    visible,
    onClose,
    onUserAuthenticated,
    authState = { isAuthenticated: false, user: null },
}) => {
    const [isLoading, setIsLoading] = useState(false);



    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const user = await authService.signInWithGoogle();
            onUserAuthenticated(user);
            onClose();
        } catch (error) {
            console.error('Error signing in with Google:', error);
            Alert.alert(
                'Google Auth No Configurado',
                'El login con Google no está configurado aún. Usa login anónimo por ahora.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        Alert.alert(
            'Desvincular Cuenta',
            '¿Estás seguro de que quieres desvincular tu cuenta? Tu progreso se mantendrá localmente.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Desvincular',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            await authService.signOut();
                            onClose();
                        } catch (error) {
                            console.error('Error signing out:', error);
                            Alert.alert('Error', 'No se pudo desvincular la cuenta');
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {authState?.isAuthenticated ? (
                        // Usuario ya vinculado
                        <>
                            <Text style={styles.title}>✅ Cuenta Vinculada</Text>
                            <Text style={styles.subtitle}>
                                Tu cuenta está vinculada como: {authState?.user?.displayName || authState?.user?.email}
                            </Text>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.button, styles.signOutButton]}
                                    onPress={handleSignOut}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>Desvincular Cuenta</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.skipButton}
                                    onPress={onClose}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.skipText}>Cerrar</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.info}>
                                💡 Tu progreso se sincroniza automáticamente con tu cuenta de Google
                            </Text>
                        </>
                    ) : (
                        // Usuario no vinculado
                        <>
                            <Text style={styles.title}>🔗 Vincular con Google</Text>
                            <Text style={styles.subtitle}>
                                Conecta tu cuenta de Google para guardar tu progreso y acceder desde cualquier dispositivo
                            </Text>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.button, styles.googleButton]}
                                    onPress={handleGoogleLogin}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Text style={styles.googleIcon}>G</Text>
                                            <Text style={styles.buttonText}>Continuar con Google</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.skipButton}
                                    onPress={onClose}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.skipText}>Saltar por ahora</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.info}>
                                💡 Tu progreso se guardará automáticamente y podrás acceder desde cualquier dispositivo
                            </Text>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        margin: 20,
        alignItems: 'center',
        maxWidth: 400,
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
        gap: 15,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 2,
        minHeight: 50,
    },
    googleButton: {
        backgroundColor: '#4285F4',
        borderColor: '#4285F4',
    },
    signOutButton: {
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
    },
    googleIcon: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginRight: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    skipButton: {
        paddingVertical: 10,
        marginTop: 10,
    },
    skipText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    info: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 20,
        lineHeight: 20,
    },
});

export default AuthModal; 