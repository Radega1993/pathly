# 🔐 Configuración de Google Auth - Pathly

## 📋 Pasos para configurar Google Auth

### 1. **Firebase Console - Authentication**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `pathly-68c8a`
3. Ve a **Authentication** → **Sign-in method**
4. Habilita **Google** como proveedor
5. Configura:
   - **Project support email**: tu email
   - **Web SDK configuration**: opcional

### 2. **Obtener Client IDs**

#### **Para Android:**
1. Ve a **Project settings** → **General**
2. En la sección **Your apps**, selecciona tu app Android
3. Copia el **SHA-1 fingerprint** de tu keystore
4. Ve a [Google Cloud Console](https://console.cloud.google.com/)
5. Selecciona tu proyecto
6. Ve a **APIs & Services** → **Credentials**
7. Crea una nueva **OAuth 2.0 Client ID** para Android
8. Usa el SHA-1 fingerprint y package name: `com.pathly.game`

#### **Para iOS:**
1. Ve a **Project settings** → **General**
2. En la sección **Your apps**, selecciona tu app iOS
3. Copia el **Bundle ID**: `com.pathly.game`
4. Ve a [Google Cloud Console](https://console.cloud.google.com/)
5. Selecciona tu proyecto
6. Ve a **APIs & Services** → **Credentials**
7. Crea una nueva **OAuth 2.0 Client ID** para iOS
8. Usa el Bundle ID

### 3. **Actualizar código**

Reemplaza los Client IDs en `services/auth.ts`:

```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
  androidClientId: 'TU_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'TU_IOS_CLIENT_ID.apps.googleusercontent.com',
  webClientId: 'TU_WEB_CLIENT_ID.apps.googleusercontent.com',
  scopes: ['profile', 'email'],
});
```

### 4. **Configurar app.json**

Añade la configuración de Google Auth en `app.json`:

```json
{
  "expo": {
    "scheme": "pathly",
    "android": {
      "package": "com.pathly.game",
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "bundleIdentifier": "com.pathly.game",
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

### 5. **Descargar archivos de configuración**

1. **Android**: Descarga `google-services.json` desde Firebase Console
2. **iOS**: Descarga `GoogleService-Info.plist` desde Firebase Console
3. Coloca los archivos en la raíz del proyecto

---

## 🚀 **RevenueCat Setup**

### 1. **Crear cuenta en RevenueCat**

1. Ve a [RevenueCat](https://www.revenuecat.com/)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto: **Pathly**

### 2. **Configurar productos**

#### **En App Store Connect (iOS):**
1. Crea productos in-app:
   - `pathly_premium_monthly` (Suscripción mensual)
   - `pathly_premium_lifetime` (Compra única)

#### **En Google Play Console (Android):**
1. Crea productos in-app:
   - `pathly_premium_monthly` (Suscripción mensual)
   - `pathly_premium_lifetime` (Compra única)

### 3. **Configurar RevenueCat**

1. **Products**: Añade los productos creados
2. **Entitlements**: Crea `premium` entitlement
3. **Offerings**: Crea offering con los productos

### 4. **Obtener API Keys**

1. Ve a **Project Settings** → **API Keys**
2. Copia las API keys:
   - **Android**: `goog_xxxxxxxxxxxxxxxxxxxxxx`
   - **iOS**: `appl_xxxxxxxxxxxxxxxxxxxxxx`

### 5. **Actualizar código**

Reemplaza las API keys en `services/purchases.ts`:

```typescript
const REVENUECAT_API_KEYS = {
  ANDROID: 'goog_TU_ANDROID_API_KEY',
  IOS: 'appl_TU_IOS_API_KEY',
};
```

---

## 🧪 **Testing**

### **Google Auth Testing:**
```bash
# Probar login anónimo
npm run test:auth-anonymous

# Probar login con Google (requiere configuración)
npm run test:auth-google
```

### **RevenueCat Testing:**
```bash
# Probar carga de productos
npm run test:purchases-load

# Probar compra (sandbox)
npm run test:purchases-buy
```

---

## 🔧 **Troubleshooting**

### **Google Auth Issues:**
- **Error**: "Google sign-in was cancelled"
  - **Solución**: Verificar Client IDs y configuración
- **Error**: "Network error"
  - **Solución**: Verificar conexión a internet

### **RevenueCat Issues:**
- **Error**: "No offerings available"
  - **Solución**: Verificar configuración de productos
- **Error**: "Purchase failed"
  - **Solución**: Verificar sandbox/testing mode

---

## 📱 **Flujo de Usuario**

### **Login con Google:**
1. Usuario toca "Conectar con Google"
2. Se abre modal de Google Auth
3. Usuario selecciona cuenta
4. Se crea/actualiza usuario en Firestore
5. Se configura RevenueCat con user ID

### **Compra Premium:**
1. Usuario toca "Ir Premium"
2. Se muestran opciones de suscripción
3. Usuario selecciona plan
4. Se procesa compra con RevenueCat
5. Se actualiza estado premium en Firestore
6. Se desactivan anuncios automáticamente

---

**Estado**: ✅ **CONFIGURACIÓN COMPLETA**

Una vez configurados los Client IDs y API Keys, el sistema estará completamente funcional. 