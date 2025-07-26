// Script para probar la recuperación de contraseña
import { resetPassword } from '../services/auth';

const testPasswordReset = async () => {
    console.log('🧪 Probando recuperación de contraseña...');

    const testEmail = 'test@example.com'; // Cambia por un email real

    try {
        console.log('📧 Enviando email de recuperación a:', testEmail);
        await resetPassword(testEmail);
        console.log('✅ Email de recuperación enviado exitosamente');
        console.log('📬 Revisa tu bandeja de entrada (y spam)');
    } catch (error) {
        console.error('❌ Error en recuperación de contraseña:', error);

        if (error.message.includes('user-not-found')) {
            console.log('💡 El email no está registrado. Prueba con un email que exista en tu Firebase.');
        } else if (error.message.includes('invalid-email')) {
            console.log('💡 El formato del email no es válido.');
        } else {
            console.log('💡 Verifica la configuración de Firebase Console:');
            console.log('   1. Authentication → Templates → Password reset');
            console.log('   2. Authentication → Settings → Authorized domains');
        }
    }
};

// Ejecutar la prueba
testPasswordReset(); 