# 🔐 Guía de Verificación - Recuperación de Contraseña

## 📋 Resumen

Esta guía te ayudará a verificar que el sistema de recuperación de contraseña esté funcionando correctamente en Pathly Game.

## ✅ Verificación Rápida

### 1. **Probar la Funcionalidad**

```bash
# Ejecutar el script de verificación
node scripts/verify-auth-config.js

# Probar recuperación de contraseña (cambia el email)
node scripts/test-password-reset.js
```

### 2. **Verificar en la App**

1. Abre la app
2. Ve a "Iniciar Sesión"
3. Toca "¿Olvidaste tu contraseña?"
4. Ingresa un email registrado
5. Toca "Enviar Email"
6. Revisa tu bandeja de entrada

## 🔧 Configuración de Firebase Console

### Paso 1: Habilitar Email/Password

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Authentication** → **Sign-in method**
4. Habilita **Email/Password**
5. Guarda los cambios

### Paso 2: Configurar Plantilla de Email

1. Ve a **Authentication** → **Templates**
2. Selecciona **Password reset**
3. Configura la plantilla:

```html
<!-- Asunto del email -->
Recuperar Contraseña - Pathly Game

<!-- Contenido del email -->
<h2>Recuperar Contraseña - Pathly Game</h2>
<p>Hola,</p>
<p>Has solicitado restablecer tu contraseña para tu cuenta de Pathly Game.</p>
<p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
<a href="{{link}}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Restablecer Contraseña</a>
<p>Si no solicitaste este cambio, puedes ignorar este email.</p>
<p>Este enlace expirará en 1 hora.</p>
<p>Saludos,<br>El equipo de Pathly Game</p>
```

### Paso 3: Configurar Dominios Autorizados

1. Ve a **Authentication** → **Settings**
2. Pestaña **Authorized domains**
3. Asegúrate de que estén listados:
   - `localhost` (para desarrollo)
   - Tu dominio de producción
   - `firebaseapp.com` (automático)

### Paso 4: Configurar Firestore Rules

```javascript
// Firestore Rules para usuarios
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🧪 Pruebas de Funcionalidad

### Test 1: Email No Registrado

```typescript
// Debería mostrar error
await resetPassword('noexiste@example.com');
// Error esperado: "No existe una cuenta con este email"
```

### Test 2: Email Inválido

```typescript
// Debería mostrar error
await resetPassword('email-invalido');
// Error esperado: "El email no es válido"
```

### Test 3: Email Válido y Registrado

```typescript
// Debería enviar email
await resetPassword('usuario@ejemplo.com');
// Éxito esperado: "Email de recuperación enviado"
```

## 📧 Verificación del Email

### 1. **Revisar Bandeja de Entrada**

- Busca emails de `noreply@[tu-proyecto].firebaseapp.com`
- Revisa también la carpeta de spam
- El email debe contener un enlace de recuperación

### 2. **Probar el Enlace**

1. Abre el email de recuperación
2. Haz clic en "Restablecer Contraseña"
3. Deberías ir a una página de Firebase
4. Ingresa la nueva contraseña
5. Confirma el cambio

### 3. **Verificar el Cambio**

1. Intenta iniciar sesión con la nueva contraseña
2. Debería funcionar correctamente

## 🐛 Solución de Problemas

### Problema: "No existe una cuenta con este email"

**Causa**: El email no está registrado en Firebase Auth.

**Solución**:
1. Registra primero una cuenta con ese email
2. O usa un email que ya esté registrado

### Problema: "El email no es válido"

**Causa**: Formato de email incorrecto.

**Solución**:
1. Verifica que el email tenga formato válido (ejemplo@dominio.com)
2. Asegúrate de que no tenga espacios extra

### Problema: "Error enviando email de recuperación"

**Causa**: Configuración de Firebase incompleta.

**Solución**:
1. Verifica que Email/Password esté habilitado
2. Verifica que la plantilla de email esté configurada
3. Verifica que el dominio esté autorizado

### Problema: No llega el email

**Causa**: Configuración de email o spam.

**Solución**:
1. Revisa la carpeta de spam
2. Verifica que la plantilla de email esté configurada
3. Espera unos minutos (puede tardar)
4. Verifica que el dominio esté autorizado

## 🔍 Logs de Debug

### Logs Exitosos

```
🔄 Enviando email de recuperación...
✅ Email de recuperación enviado
```

### Logs de Error Comunes

```
❌ Error enviando email de recuperación: FirebaseError: Firebase: Error (auth/user-not-found).
No existe una cuenta con este email
```

```
❌ Error enviando email de recuperación: FirebaseError: Firebase: Error (auth/invalid-email).
El email no es válido
```

## 📱 Integración en la App

### Uso en el Modal

```typescript
const handleResetPassword = async () => {
    if (!resetEmail) {
        Alert.alert('Error', 'Por favor ingresa tu email');
        return;
    }

    setIsLoading(true);
    try {
        await authService.resetPassword(resetEmail);
        Alert.alert(
            'Email Enviado',
            'Se ha enviado un email con instrucciones para recuperar tu contraseña',
            [{ text: 'OK', onPress: () => setMode('login') }]
        );
        setResetEmail('');
    } catch (error) {
        Alert.alert('Error', error.message);
    } finally {
        setIsLoading(false);
    }
};
```

### Uso Directo

```typescript
import { resetPassword } from './services/auth';

// Enviar email de recuperación
try {
    await resetPassword('usuario@ejemplo.com');
    console.log('Email enviado correctamente');
} catch (error) {
    console.error('Error:', error.message);
}
```

## ✅ Checklist de Verificación

- [ ] Firebase Console: Email/Password habilitado
- [ ] Firebase Console: Plantilla de email configurada
- [ ] Firebase Console: Dominios autorizados configurados
- [ ] Firestore Rules: Configurados para usuarios
- [ ] Variables de entorno: Todas configuradas
- [ ] App: Modal de recuperación funciona
- [ ] Email: Llega correctamente
- [ ] Enlace: Funciona y permite cambiar contraseña
- [ ] Nueva contraseña: Permite iniciar sesión

## 🚀 Próximos Pasos

1. **Verificar configuración** con los scripts
2. **Probar funcionalidad** con email real
3. **Configurar plantilla** personalizada
4. **Testear en producción** con dominio real
5. **Monitorear logs** para errores

## 📞 Soporte

Si tienes problemas:

1. Ejecuta `node scripts/verify-auth-config.js`
2. Revisa los logs de error
3. Verifica la configuración de Firebase Console
4. Consulta la [documentación de Firebase Auth](https://firebase.google.com/docs/auth) 