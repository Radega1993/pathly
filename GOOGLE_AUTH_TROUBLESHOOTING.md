# 🔍 Troubleshooting Google Auth - Pathly

## ❌ Problema Actual
El auth de Google está creando usuarios mock en lugar de usuarios reales de Google.

## 🔍 Diagnóstico

### 1. Verificar Firebase Console
Ve a [Firebase Console](https://console.firebase.google.com/) > Tu proyecto > Authentication > Sign-in method

**Verificar que Google esté habilitado:**
- ✅ Google debe estar en la lista de proveedores
- ✅ Debe estar habilitado (toggle ON)
- ✅ Debe tener el Web Client ID correcto configurado

### 2. Verificar Google Cloud Console
Ve a [Google Cloud Console](https://console.cloud.google.com/) > APIs & Services > Credentials

**Verificar OAuth 2.0 Client IDs:**
- ✅ Debe existir un "Web client" con el ID: `727976213025-jlau2lt454rmeom1h8mptbdfbscqkh6c.apps.googleusercontent.com`
- ✅ Debe estar configurado para el dominio correcto

### 3. Verificar OAuth Consent Screen
Ve a [Google Cloud Console](https://console.cloud.google.com/) > APIs & Services > OAuth consent screen

**Verificar configuración:**
- ✅ Debe estar configurado (no en modo testing)
- ✅ Debe incluir los scopes necesarios (email, profile)
- ✅ Debe tener usuarios de prueba si está en modo testing

## 🛠️ Soluciones

### Solución 1: Habilitar Google Sign-In en Firebase
1. Ve a Firebase Console > Authentication > Sign-in method
2. Busca "Google" en la lista
3. Haz clic en "Enable"
4. Configura el Web Client ID: `727976213025-jlau2lt454rmeom1h8mptbdfbscqkh6c.apps.googleusercontent.com`
5. Guarda los cambios

### Solución 2: Verificar OAuth Consent Screen
1. Ve a Google Cloud Console > APIs & Services > OAuth consent screen
2. Si está en "Testing", añade tu email como usuario de prueba
3. O cambia a "Production" si estás listo

### Solución 3: Verificar APIs Habilitadas
1. Ve a Google Cloud Console > APIs & Services > Library
2. Busca y habilita estas APIs:
   - Google Sign-In API
   - Google+ API (si existe)
   - People API

### Solución 4: Verificar Credenciales
1. Ve a Google Cloud Console > APIs & Services > Credentials
2. Verifica que el Web Client ID esté correcto
3. Verifica que no haya restricciones que bloqueen la app

## 🔧 Configuración Actual

### En `services/auth.ts`:
```typescript
GoogleSignin.configure({
    webClientId: '727976213025-jlau2lt454rmeom1h8mptbdfbscqkh6c.apps.googleusercontent.com',
    offlineAccess: true,
    forceCodeForRefreshToken: true,
});
```

### En `app.config.js`:
```javascript
plugins: [
    [
        "@react-native-google-signin/google-signin",
        {
            iosUrlScheme: "com.googleusercontent.apps.727976213025-jlau2lt454rmeom1h8mptbdfbscqkh6c",
            webClientId: process.env.GOOGLE_WEB_CLIENT_ID
        }
    ]
]
```

## 🧪 Testing

### Ejecutar test de Google Auth:
```bash
node scripts/test-google-auth.js
```

### Verificar logs en la app:
1. Abre la app en desarrollo
2. Intenta hacer login con Google
3. Revisa los logs en la consola
4. Busca mensajes de error específicos

## 📋 Checklist de Verificación

- [ ] Google Sign-In habilitado en Firebase Console
- [ ] Web Client ID configurado correctamente
- [ ] OAuth Consent Screen configurado
- [ ] APIs necesarias habilitadas en Google Cloud
- [ ] Credenciales sin restricciones problemáticas
- [ ] App en modo testing o producción según corresponda

## 🚨 Errores Comunes

### "SIGN_IN_CANCELLED"
- Usuario canceló el login manualmente

### "PLAY_SERVICES_NOT_AVAILABLE"
- Google Play Services no disponible en el dispositivo

### "SIGN_IN_REQUIRED"
- Usuario no está logueado

### "DEVELOPER_ERROR"
- Configuración incorrecta del Web Client ID
- OAuth Consent Screen no configurado

### "NETWORK_ERROR"
- Problema de conectividad
- Firewall bloqueando la conexión

## 📞 Próximos Pasos

1. Verificar Firebase Console
2. Verificar Google Cloud Console
3. Ejecutar test de Google Auth
4. Revisar logs de error específicos
5. Corregir configuración según los errores encontrados 