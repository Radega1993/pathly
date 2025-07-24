# 🔐 Solución para Error de Autorización de Google OAuth

## 🚨 Problema Identificado

**Error:** `access blocked: authorization error`

Este error ocurre cuando Google bloquea la autorización debido a problemas de configuración en Google Cloud Console.

## ✅ Soluciones Implementadas

### 1. **Mejorado Sistema de Debug**
- ✅ Logs detallados en cada paso del proceso
- ✅ Información de configuración visible
- ✅ Manejo específico de diferentes tipos de error
- ✅ Fallback a mock user si falla

### 2. **Optimizada Configuración de Auth**
- ✅ Uso de `expo-auth-session` en lugar de Google Sign-In nativo
- ✅ Configuración correcta de redirect URI
- ✅ Manejo de errores específicos

## 🔧 Pasos para Solucionar el Error

### **Paso 1: Verificar Google Cloud Console**

1. **Ir a Google Cloud Console:**
   ```
   https://console.cloud.google.com/
   ```

2. **Seleccionar el proyecto correcto:**
   - Asegúrate de que estés en el proyecto `pathly-68c8a`

### **Paso 2: Configurar OAuth Consent Screen**

1. **Navegar a:** `APIs & Services` > `OAuth consent screen`

2. **Verificar configuración:**
   - ✅ **App name:** Pathly Game
   - ✅ **User support email:** Tu email
   - ✅ **Developer contact information:** Tu email
   - ✅ **App domain:** Dejar vacío por ahora

3. **Scopes:**
   - ✅ `openid`
   - ✅ `email`
   - ✅ `profile`

4. **Test users:**
   - ✅ **Añadir tu email** como usuario de prueba
   - ✅ **Añadir emails de otros testers** si es necesario

### **Paso 3: Verificar Credentials**

1. **Navegar a:** `APIs & Services` > `Credentials`

2. **Verificar Web Client ID:**
   - ✅ Debe ser: `727976213025-jlau2lt454rmeom1h8mptbdfbscqkh6c.apps.googleusercontent.com`
   - ✅ **Authorized JavaScript origins:** Dejar vacío para apps móviles
   - ✅ **Authorized redirect URIs:** Dejar vacío para apps móviles

### **Paso 4: Habilitar APIs Necesarias**

1. **Navegar a:** `APIs & Services` > `Library`

2. **Buscar y habilitar:**
   - ✅ **Google+ API** (si no está habilitada)
   - ✅ **Google Identity API** (si no está habilitada)
   - ✅ **Google Sign-In API** (si no está habilitada)

### **Paso 5: Verificar Estado del Proyecto**

1. **Navegar a:** `APIs & Services` > `OAuth consent screen`

2. **Verificar estado:**
   - ✅ **Testing:** Para desarrollo (máximo 100 usuarios)
   - ✅ **In production:** Para lanzamiento público

## 🧪 Testing de la Solución

### **1. Probar en Desarrollo**
```bash
# Ejecutar en emulador/dispositivo de desarrollo
npx expo start
```

### **2. Verificar Logs**
Los logs ahora muestran información detallada:
```
🔄 Iniciando login con Google usando Expo AuthSession...
🔧 Configuración: { clientId: "...", redirectUri: "...", scheme: "..." }
📱 Resultado de autorización: success/error/cancel
```

### **3. Probar en Build de Producción**
```bash
# Generar build de prueba
./scripts/build-touch-test.sh
```

## 🔍 Troubleshooting Detallado

### **Si el error persiste:**

1. **Verificar OAuth Consent Screen:**
   - ¿Está en estado "Testing" o "In production"?
   - ¿Tu email está en la lista de usuarios de prueba?

2. **Verificar APIs:**
   - ¿Están habilitadas las APIs necesarias?
   - ¿Hay errores en la consola de APIs?

3. **Verificar Credentials:**
   - ¿El Client ID es correcto?
   - ¿No hay restricciones de dominio?

4. **Verificar Proyecto:**
   - ¿Estás en el proyecto correcto?
   - ¿El proyecto tiene facturación habilitada?

### **Logs de Error Comunes:**

```
❌ Error de autorización: access_denied
→ Usuario no está en lista de prueba

❌ Error de autorización: invalid_client
→ Client ID incorrecto

❌ Error de autorización: invalid_scope
→ Scopes no configurados correctamente
```

## 📱 Configuración en la App

### **Variables de Entorno (.env):**
```env
GOOGLE_WEB_CLIENT_ID=727976213025-jlau2lt454rmeom1h8mptbdfbscqkh6c.apps.googleusercontent.com
```

### **app.config.js:**
```javascript
scheme: "com.pathly.game",
extra: {
    googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
}
```

## 🚀 Próximos Pasos

1. **Configurar Google Cloud Console** siguiendo los pasos arriba
2. **Probar en emulador** para verificar que funciona
3. **Generar build de prueba** para testing en dispositivo real
4. **Si funciona**, proceder con el lanzamiento

## 📞 Soporte

Si el problema persiste después de seguir todos los pasos:

1. **Compartir logs completos** del error
2. **Verificar configuración** en Google Cloud Console
3. **Probar con usuario de prueba** diferente
4. **Verificar que el proyecto** tenga facturación habilitada

---

**Estado:** ✅ **CONFIGURACIÓN LISTA - REQUIERE VERIFICACIÓN EN GOOGLE CLOUD CONSOLE** 