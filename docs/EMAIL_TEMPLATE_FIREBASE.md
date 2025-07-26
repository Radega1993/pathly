# 📧 Plantilla de Email para Firebase Console

## 🎯 Instrucciones

1. Ve a **Firebase Console** → **Authentication** → **Templates** → **Password reset**
2. Copia y pega la plantilla HTML completa
3. Guarda los cambios

## 📋 Plantilla Completa

### Asunto del Email:
```
Recuperar Contraseña - Pathly Game
```

### Contenido HTML:
```html
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

## ✅ Características de la Plantilla

- ✅ **Texto en castellano** completamente
- ✅ **Diseño profesional** con colores de Pathly
- ✅ **Responsive** para móviles y desktop
- ✅ **Botón de acción** claro y visible
- ✅ **Información de seguridad** sobre expiración
- ✅ **Footer profesional** con información de contacto

## 🔧 Pasos para Configurar

1. **Abrir Firebase Console**
2. **Ir a Authentication** → **Templates**
3. **Seleccionar "Password reset"**
4. **Copiar la plantilla HTML** completa
5. **Pegar en el editor** de Firebase
6. **Guardar cambios**

## 🧪 Probar la Plantilla

Después de configurar:

1. **Enviar email de recuperación** desde la app
2. **Revisar bandeja de entrada**
3. **Verificar diseño** en diferentes clientes de email
4. **Probar enlace** de recuperación

## 📱 Resultado Esperado

- ✅ Email con asunto: "Recuperar Contraseña - Pathly Game"
- ✅ Diseño profesional con logo y colores de Pathly
- ✅ Texto completamente en castellano
- ✅ Botón de acción claro
- ✅ Información de seguridad visible
- ✅ Footer profesional 