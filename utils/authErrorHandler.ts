/**
 * Utilidad para manejar errores de autenticación de Firebase
 * Convierte códigos de error técnicos en mensajes amigables para el usuario
 */

export interface AuthErrorInfo {
    title: string;
    message: string;
    type: 'error' | 'warning' | 'info';
    suggestions?: string[];
}

export const getAuthErrorInfo = (error: any): AuthErrorInfo => {
    const errorCode = error?.code || '';
    const errorMessage = error?.message || '';

    switch (errorCode) {
        // Errores de login
        case 'auth/user-not-found':
            return {
                title: 'Usuario no encontrado',
                message: 'No existe una cuenta con este correo electrónico. Verifica que el email sea correcto o crea una nueva cuenta.',
                type: 'error',
                suggestions: [
                    'Verifica que el correo electrónico esté escrito correctamente',
                    'Si no tienes cuenta, regístrate primero',
                    'Revisa que no haya espacios extra al inicio o final'
                ]
            };

        case 'auth/wrong-password':
            return {
                title: 'Contraseña incorrecta',
                message: 'La contraseña que ingresaste no es correcta. Intenta nuevamente.',
                type: 'error',
                suggestions: [
                    'Verifica que la contraseña esté escrita correctamente',
                    'Asegúrate de que las mayúsculas y minúsculas sean correctas',
                    'Si olvidaste tu contraseña, usa la opción de recuperación'
                ]
            };

        case 'auth/invalid-email':
            return {
                title: 'Email inválido',
                message: 'El formato del correo electrónico no es válido. Por favor, ingresa un email correcto.',
                type: 'error',
                suggestions: [
                    'Asegúrate de incluir el símbolo @',
                    'Verifica que el dominio del email sea correcto',
                    'Ejemplo de formato válido: usuario@ejemplo.com'
                ]
            };

        case 'auth/user-disabled':
            return {
                title: 'Cuenta deshabilitada',
                message: 'Esta cuenta ha sido deshabilitada. Contacta con soporte para más información.',
                type: 'error',
                suggestions: [
                    'Contacta con el equipo de soporte',
                    'Verifica si recibiste algún email de notificación'
                ]
            };

        case 'auth/too-many-requests':
            return {
                title: 'Demasiados intentos',
                message: 'Has intentado iniciar sesión demasiadas veces. Espera unos minutos antes de intentar nuevamente.',
                type: 'warning',
                suggestions: [
                    'Espera 5-10 minutos antes de intentar nuevamente',
                    'Verifica que tus credenciales sean correctas',
                    'Si el problema persiste, contacta con soporte'
                ]
            };

        // Errores de registro
        case 'auth/email-already-in-use':
            return {
                title: 'Email ya registrado',
                message: 'Ya existe una cuenta con este correo electrónico. Intenta iniciar sesión en lugar de registrarte.',
                type: 'warning',
                suggestions: [
                    'Intenta iniciar sesión con tu contraseña',
                    'Si olvidaste tu contraseña, usa la opción de recuperación',
                    'Si no recuerdas haber creado esta cuenta, contacta con soporte'
                ]
            };

        case 'auth/weak-password':
            return {
                title: 'Contraseña muy débil',
                message: 'La contraseña debe tener al menos 6 caracteres. Elige una contraseña más segura.',
                type: 'warning',
                suggestions: [
                    'Usa al menos 6 caracteres',
                    'Combina letras, números y símbolos',
                    'Evita información personal como tu nombre o fecha de nacimiento'
                ]
            };

        case 'auth/invalid-password':
            return {
                title: 'Contraseña inválida',
                message: 'La contraseña no cumple con los requisitos de seguridad.',
                type: 'error',
                suggestions: [
                    'Usa al menos 6 caracteres',
                    'Evita caracteres especiales problemáticos',
                    'Elige una contraseña más simple pero segura'
                ]
            };

        // Errores de recuperación de contraseña
        case 'auth/user-not-found':
            return {
                title: 'Email no encontrado',
                message: 'No existe una cuenta registrada con este correo electrónico.',
                type: 'error',
                suggestions: [
                    'Verifica que el email esté escrito correctamente',
                    'Si no tienes cuenta, regístrate primero',
                    'Revisa si usaste un email diferente al registrarte'
                ]
            };

        // Errores de red/conexión
        case 'auth/network-request-failed':
            return {
                title: 'Error de conexión',
                message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
                type: 'error',
                suggestions: [
                    'Verifica que tengas conexión a internet',
                    'Intenta nuevamente en unos momentos',
                    'Si el problema persiste, contacta con soporte'
                ]
            };

        case 'auth/operation-not-allowed':
            return {
                title: 'Operación no permitida',
                message: 'Esta operación no está habilitada en tu cuenta. Contacta con soporte.',
                type: 'error',
                suggestions: [
                    'Contacta con el equipo de soporte',
                    'Verifica que tu cuenta esté activa'
                ]
            };

        // Errores de timeout
        case 'auth/timeout':
            return {
                title: 'Tiempo de espera agotado',
                message: 'La operación tardó demasiado en completarse. Intenta nuevamente.',
                type: 'warning',
                suggestions: [
                    'Verifica tu conexión a internet',
                    'Intenta nuevamente en unos momentos',
                    'Si el problema persiste, reinicia la aplicación'
                ]
            };

        // Errores de logout
        case 'auth/no-current-user':
            return {
                title: 'No hay sesión activa',
                message: 'No hay una sesión activa para cerrar.',
                type: 'info',
                suggestions: [
                    'Ya has cerrado sesión',
                    'Refresca la aplicación si es necesario'
                ]
            };

        // Errores genéricos
        default:
            return {
                title: 'Error inesperado',
                message: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
                type: 'error',
                suggestions: [
                    'Intenta nuevamente en unos momentos',
                    'Verifica tu conexión a internet',
                    'Si el problema persiste, contacta con soporte'
                ]
            };
    }
};

/**
 * Función helper para mostrar errores de autenticación
 */
export const showAuthError = (error: any, showAlert: (errorInfo: AuthErrorInfo) => void) => {
    const errorInfo = getAuthErrorInfo(error);
    showAlert(errorInfo);
};

/**
 * Función para validar email antes de enviar
 */
export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
        return { isValid: false, message: 'El correo electrónico es requerido' };
    }

    if (!emailRegex.test(email)) {
        return { isValid: false, message: 'El formato del correo electrónico no es válido' };
    }

    return { isValid: true };
};

/**
 * Función para validar contraseña antes de enviar
 */
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (!password.trim()) {
        return { isValid: false, message: 'La contraseña es requerida' };
    }

    if (password.length < 6) {
        return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }

    return { isValid: true };
};

/**
 * Función para validar nombre de usuario
 */
export const validateDisplayName = (displayName: string): { isValid: boolean; message?: string } => {
    if (!displayName.trim()) {
        return { isValid: false, message: 'El nombre de usuario es requerido' };
    }

    if (displayName.trim().length < 2) {
        return { isValid: false, message: 'El nombre debe tener al menos 2 caracteres' };
    }

    if (displayName.trim().length > 50) {
        return { isValid: false, message: 'El nombre no puede tener más de 50 caracteres' };
    }

    return { isValid: true };
}; 