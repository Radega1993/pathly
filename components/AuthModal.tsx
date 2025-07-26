import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { authService, User, LoginCredentials, RegisterCredentials } from '../services/auth';
import CustomAlert from './CustomAlert';
import { getAuthErrorInfo, validateEmail, validatePassword, validateDisplayName, AuthErrorInfo } from '../utils/authErrorHandler';

interface AuthModalProps {
    visible: boolean;
    onClose: () => void;
    onUserAuthenticated: (user: User) => void;
    authState: any;
}

type AuthMode = 'login' | 'register' | 'resetPassword';

const AuthModal: React.FC<AuthModalProps> = ({
    visible,
    onClose,
    onUserAuthenticated,
    authState = { isAuthenticated: false, user: null },
}) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [isLoading, setIsLoading] = useState(false);

    // Estado para CustomAlert
    const [alertInfo, setAlertInfo] = useState<AuthErrorInfo | null>(null);
    const [showAlert, setShowAlert] = useState(false);

    // Formulario de login/registro
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Formulario de recuperación
    const [resetEmail, setResetEmail] = useState('');

    // Función para mostrar alerts personalizados
    const showCustomAlert = (errorInfo: AuthErrorInfo) => {
        setAlertInfo(errorInfo);
        setShowAlert(true);
    };

    const handleLogin = async () => {
        if (!email || !password) {
            showCustomAlert({
                title: 'Campos incompletos',
                message: 'Por favor completa todos los campos requeridos.',
                type: 'warning'
            });
            return;
        }

        setIsLoading(true);
        try {
            const credentials: LoginCredentials = { email, password };
            const user = await authService.login(credentials);
            onUserAuthenticated(user);
            onClose();
            resetForm();
        } catch (error) {
            console.error('Error en login:', error);
            const errorInfo = getAuthErrorInfo(error);
            showCustomAlert(errorInfo);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!email || !password || !displayName || !confirmPassword) {
            showCustomAlert({
                title: 'Campos incompletos',
                message: 'Por favor completa todos los campos requeridos.',
                type: 'warning'
            });
            return;
        }

        if (password !== confirmPassword) {
            showCustomAlert({
                title: 'Contraseñas no coinciden',
                message: 'Las contraseñas que ingresaste no coinciden. Verifica que ambas sean iguales.',
                type: 'error'
            });
            return;
        }

        if (password.length < 6) {
            showCustomAlert({
                title: 'Contraseña muy corta',
                message: 'La contraseña debe tener al menos 6 caracteres para mayor seguridad.',
                type: 'warning'
            });
            return;
        }

        setIsLoading(true);
        try {
            const credentials: RegisterCredentials = { email, password, displayName };
            const user = await authService.register(credentials);
            onUserAuthenticated(user);
            onClose();
            resetForm();
        } catch (error) {
            console.error('Error en registro:', error);
            const errorInfo = getAuthErrorInfo(error);
            showCustomAlert(errorInfo);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!resetEmail) {
            showCustomAlert({
                title: 'Email requerido',
                message: 'Por favor ingresa tu correo electrónico para enviarte las instrucciones de recuperación.',
                type: 'warning'
            });
            return;
        }

        setIsLoading(true);
        try {
            await authService.resetPassword(resetEmail);
            Alert.alert(
                'Correo Enviado',
                'Se ha enviado un correo electrónico con instrucciones para recuperar tu contraseña.\n\n💡 Si no lo encuentras, revisa tu carpeta de spam o correo no deseado.',
                [{ text: 'Entendido', onPress: () => setMode('login') }]
            );
            setResetEmail('');
        } catch (error) {
            console.error('Error enviando email de recuperación:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'Error enviando correo electrónico');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que quieres cerrar sesión? Tu progreso se mantendrá localmente.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            await authService.signOut();
                            onClose();
                        } catch (error) {
                            console.error('Error cerrando sesión:', error);
                            Alert.alert('Error', 'No se pudo cerrar la sesión');
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setDisplayName('');
        setConfirmPassword('');
        setResetEmail('');
        setMode('login');
    };

    const renderLoginForm = () => (
        <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Iniciar Sesión</Text>

            <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />

            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
            />

            <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleLogin}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Iniciar Sesión</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.linkButton}
                onPress={() => setMode('resetPassword')}
                disabled={isLoading}
            >
                <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o</Text>
                <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
                style={styles.linkButton}
                onPress={() => setMode('register')}
                disabled={isLoading}
            >
                <Text style={styles.linkText}>Crear cuenta nueva</Text>
            </TouchableOpacity>
        </View>
    );

    const renderRegisterForm = () => (
        <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Crear Cuenta</Text>

            <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
            />

            <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />

            <TextInput
                style={styles.input}
                placeholder="Contraseña (mín. 6 caracteres)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
            />

            <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleRegister}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Crear Cuenta</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.linkButton}
                onPress={() => setMode('login')}
                disabled={isLoading}
            >
                <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
            </TouchableOpacity>
        </View>
    );

    const renderResetPasswordForm = () => (
        <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Recuperar Contraseña</Text>
            <Text style={styles.formSubtitle}>
                Ingresa tu correo electrónico y te enviaremos instrucciones para recuperar tu contraseña
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />

            <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleResetPassword}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Enviar Correo</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.linkButton}
                onPress={() => setMode('login')}
                disabled={isLoading}
            >
                <Text style={styles.linkText}>Volver al inicio de sesión</Text>
            </TouchableOpacity>
        </View>
    );

    const renderUserProfile = () => (
        <View style={styles.formContainer}>
            <Text style={styles.formTitle}>✅ Cuenta Conectada</Text>
            <Text style={styles.userInfo}>
                {authState?.user?.displayName || authState?.user?.email}
            </Text>
            <Text style={styles.userEmail}>{authState?.user?.email}</Text>

            <TouchableOpacity
                style={[styles.button, styles.signOutButton]}
                onPress={handleSignOut}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Cerrar Sesión</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.skipButton}
                onPress={onClose}
                disabled={isLoading}
            >
                <Text style={styles.skipText}>Cerrar</Text>
            </TouchableOpacity>

            <Text style={styles.info}>
                💡 Tu progreso se sincroniza automáticamente con tu cuenta
            </Text>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.modal}>
                        {authState?.isAuthenticated ? (
                            renderUserProfile()
                        ) : (
                            <>
                                {mode === 'login' && renderLoginForm()}
                                {mode === 'register' && renderRegisterForm()}
                                {mode === 'resetPassword' && renderResetPasswordForm()}
                            </>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        margin: 20,
        alignItems: 'center',
        maxWidth: 400,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    formContainer: {
        width: '100%',
        alignItems: 'center',
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 10,
        textAlign: 'center',
    },
    formSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    userInfo: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 5,
        textAlign: 'center',
    },
    userEmail: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 16,
        backgroundColor: '#F9FAFB',
    },
    button: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 2,
        minHeight: 50,
        marginBottom: 16,
    },
    primaryButton: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    signOutButton: {
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    linkButton: {
        paddingVertical: 10,
        marginBottom: 10,
    },
    linkText: {
        fontSize: 14,
        color: '#3B82F6',
        textAlign: 'center',
        textDecorationLine: 'underline',
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
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        color: '#9CA3AF',
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