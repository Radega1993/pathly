// Script para probar la nueva plantilla de email
import { resetPassword } from '../services/auth';

const testEmailTemplate = async () => {
    console.log('🧪 Probando nueva plantilla de email...');

    // Lista de emails de prueba (cambia por emails reales)
    const testEmails = [
        'test1@example.com',
        'test2@example.com'
    ];

    for (const email of testEmails) {
        try {
            console.log(`\n📧 Enviando email a: ${email}`);
            await resetPassword(email);
            console.log('✅ Email enviado exitosamente');
            console.log('📬 Revisa la bandeja de entrada y spam');
            console.log('💡 Recuerda marcar como "No es spam" si va a spam');

            // Esperar 2 segundos entre emails para evitar rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            console.error(`❌ Error enviando email a ${email}:`, error.message);

            if (error.message.includes('user-not-found')) {
                console.log('💡 El email no está registrado. Registra una cuenta primero.');
            }
        }
    }

    console.log('\n📋 Checklist de verificación:');
    console.log('   [ ] Email llega a bandeja principal (no spam)');
    console.log('   [ ] Asunto es "Recuperar Contraseña - Pathly Game"');
    console.log('   [ ] Contenido es profesional y claro');
    console.log('   [ ] Botón de recuperación funciona');
    console.log('   [ ] Enlace expira correctamente');

    console.log('\n🔧 Si el email va a spam:');
    console.log('   1. Marca como "No es spam"');
    console.log('   2. Agrega noreply@pathly-68c8a.firebaseapp.com a contactos');
    console.log('   3. Configura filtros en tu email');
    console.log('   4. Considera usar dominio personalizado');
};

// Ejecutar la prueba
testEmailTemplate(); 