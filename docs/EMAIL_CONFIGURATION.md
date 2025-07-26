# 📧 Configuración de Emails Profesionales - Pathly Game

## 🎯 Objetivo

Configurar emails de recuperación de contraseña que sean profesionales, confiables y no vayan a spam.

## 🔧 Configuración Básica

### 1. **Plantilla de Email Profesional**

En Firebase Console → Authentication → Templates → Password reset:

```html
<!-- Asunto -->
Recuperar Contraseña - Pathly Game

<!-- Contenido HTML -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Contraseña - Pathly Game</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <!-- Header con logo -->
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3B82F6; margin: 0; font-size: 28px;">🎮 Pathly Game</h1>
        <p style="color: #6B7280; margin: 5px 0;">Tu juego de puzzle favorito</p>
    </div>

    <!-- Contenido principal -->
    <div style="background-color: #F9FAFB; padding: 30px; border-radius: 12px; border: 1px solid #E5E7EB;">
        <h2 style="color: #1F2937; margin-top: 0; font-size: 24px;">🔐 Recuperar Contraseña</h2>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            ¡Hola!
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            Has solicitado restablecer tu contraseña para tu cuenta de <strong>Pathly Game</strong>.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 30px;">
            Haz clic en el siguiente botón para crear una nueva contraseña:
        </p>
        
        <!-- Botón de acción -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{link}}" style="background-color: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);">
                🔑 Restablecer Contraseña
            </a>
        </div>
        
        <p style="font-size: 14px; color: #6B7280; margin-bottom: 20px;">
            <strong>Importante:</strong> Este enlace expirará en 1 hora por seguridad.
        </p>
        
        <p style="font-size: 14px; color: #6B7280; margin-bottom: 0;">
            Si no solicitaste este cambio, puedes ignorar este correo electrónico de forma segura.
        </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
        <p style="font-size: 14px; color: #9CA3AF; margin: 5px 0;">
            Saludos,<br>
            <strong>El equipo de Pathly Game</strong>
        </p>
        
        <p style="font-size: 12px; color: #9CA3AF; margin: 5px 0;">
            Este es un correo electrónico automático, por favor no respondas a este mensaje.
        </p>
        
        <p style="font-size: 12px; color: #9CA3AF; margin: 5px 0;">
            © 2024 Pathly Game. Todos los derechos reservados.
        </p>
    </div>
</body>
</html>
```

## 🚀 Configuración Avanzada (Dominio Personalizado)

### Opción 1: Usar Firebase Hosting con Dominio Personalizado

1. **Configurar Firebase Hosting**:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   ```

2. **Configurar dominio personalizado**:
   - Ve a Firebase Console → Hosting
   - Agrega tu dominio personalizado
   - Configura DNS según las instrucciones

3. **Actualizar configuración de Auth**:
   - Ve a Authentication → Settings → Authorized domains
   - Agrega tu dominio personalizado

### Opción 2: Usar Servicio de Email Profesional

Para emails más confiables, puedes usar servicios como:

- **SendGrid** (recomendado)
- **Mailgun**
- **Amazon SES**

## 📋 Mejores Prácticas para Evitar Spam

### 1. **Configuración de DNS**

Configura estos registros DNS para tu dominio:

```dns
# SPF Record
TXT @ "v=spf1 include:_spf.google.com ~all"

# DKIM (si usas dominio personalizado)
TXT google._domainkey "v=DKIM1; k=rsa; p=..."

# DMARC
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@tudominio.com"
```

### 2. **Configuración de Firebase**

En Firebase Console → Authentication → Settings:

1. **Authorized domains**: Agrega tu dominio
2. **Action code settings**: Configura URL de redirección
3. **Email templates**: Usa plantillas profesionales

### 3. **Configuración de la App**

Actualiza la configuración de Firebase en tu app:

```javascript
// app.config.js
export default {
  expo: {
    // ... otras configuraciones
    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: "tu-dominio.com", // Usa tu dominio personalizado
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      // ... otras configuraciones
    },
  },
};
```

## 🧪 Pruebas de Email

### Test de Entrega

```bash
# Script para probar envío de emails
node scripts/test-email-delivery.js
```

### Verificación de Spam

1. **Enviar email de prueba**
2. **Revisar bandeja de entrada**
3. **Revisar carpeta de spam**
4. **Marcar como "No es spam"** si va a spam
5. **Agregar remitente a contactos**

## 📊 Monitoreo de Emails

### Métricas a Revisar

- **Tasa de entrega**: % de emails que llegan
- **Tasa de apertura**: % de emails abiertos
- **Tasa de clics**: % de enlaces clickeados
- **Tasa de spam**: % de emails marcados como spam

### Herramientas de Monitoreo

- **Firebase Analytics**: Para tracking de eventos
- **Google Analytics**: Para métricas de conversión
- **Email testing tools**: Para verificar entrega

## 🔍 Solución de Problemas

### Problema: Emails van a spam

**Soluciones**:
1. Configurar registros SPF/DKIM/DMARC
2. Usar dominio personalizado
3. Mejorar plantilla de email
4. Agregar remitente a contactos

### Problema: Emails no llegan

**Soluciones**:
1. Verificar configuración de Firebase
2. Revisar dominios autorizados
3. Verificar plantilla de email
4. Revisar logs de Firebase

### Problema: Enlaces no funcionan

**Soluciones**:
1. Verificar URL de redirección
2. Configurar dominios autorizados
3. Probar en diferentes navegadores
4. Verificar configuración de hosting

## ✅ Checklist de Configuración

- [ ] Plantilla de email profesional configurada
- [ ] Dominio personalizado configurado (opcional)
- [ ] Registros DNS configurados (SPF, DKIM, DMARC)
- [ ] Dominios autorizados en Firebase
- [ ] Plantilla de email probada
- [ ] Emails llegan a bandeja principal
- [ ] Enlaces de recuperación funcionan
- [ ] Métricas de entrega monitoreadas

## 🚀 Próximos Pasos

1. **Configurar plantilla profesional** en Firebase Console
2. **Probar envío de emails** con la nueva plantilla
3. **Configurar dominio personalizado** (opcional)
4. **Monitorear métricas** de entrega
5. **Optimizar plantilla** según resultados

## 📞 Recursos Adicionales

- [Firebase Auth Email Templates](https://firebase.google.com/docs/auth/custom-email)
- [Firebase Hosting Custom Domains](https://firebase.google.com/docs/hosting/custom-domain)
- [Email Deliverability Best Practices](https://sendgrid.com/blog/email-deliverability-best-practices/)
- [SPF/DKIM/DMARC Configuration](https://dmarc.org/) 