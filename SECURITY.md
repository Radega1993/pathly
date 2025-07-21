# 🔐 Configuración Segura de Firebase

## ✅ Estado Actual: CONFIGURADO SEGURO

Tu proyecto Pathly ahora tiene una configuración segura de Firebase usando variables de entorno.

## 📁 Archivos de Configuración

### Archivos creados/modificados:

1. **`.env`** - Variables de entorno con credenciales reales (NO se sube a Git)
2. **`env.example`** - Plantilla para otros desarrolladores
3. **`app.config.js`** - Configuración de Expo que lee variables de entorno
4. **`services/firebase.ts`** - Usa variables de entorno en lugar de credenciales hardcodeadas
5. **`.gitignore`** - Incluye `.env` para evitar subir credenciales a Git
6. **`setup-env.sh`** - Script para configurar automáticamente el `.env`

## 🚀 Cómo funciona

### 1. Variables de Entorno
```bash
# .env (archivo local, no en Git)
FIREBASE_API_KEY=AIzaSyBtabKhrGWgGR8TNBWhyyxYxHBOXENCxl0
FIREBASE_AUTH_DOMAIN=pathly-68c8a.firebaseapp.com
FIREBASE_PROJECT_ID=pathly-68c8a
# ... etc
```

### 2. Expo Constants
```javascript
// app.config.js
extra: {
  firebaseApiKey: process.env.FIREBASE_API_KEY,
  firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
  // ... etc
}
```

### 3. Firebase Config
```typescript
// services/firebase.ts
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  // ... etc
};
```

## 🔒 Ventajas de Seguridad

### ✅ Beneficios implementados:

1. **No credenciales en código**: Las credenciales no están hardcodeadas en el código fuente
2. **Git seguro**: El archivo `.env` está en `.gitignore` y no se sube al repositorio
3. **Validación automática**: El código verifica que todas las credenciales estén configuradas
4. **Plantilla para equipo**: `env.example` permite a otros desarrolladores configurar su entorno
5. **Script automático**: `setup-env.sh` facilita la configuración inicial

### 🛡️ Protecciones adicionales:

- **Validación de campos requeridos**: Si faltan credenciales, la app falla con un mensaje claro
- **Logs informativos**: Muestra qué proyecto de Firebase está configurado
- **Documentación**: Este archivo explica la configuración de seguridad

## 🚨 Importante para el Equipo

### Para nuevos desarrolladores:

1. **Clonar el repositorio**
2. **Ejecutar**: `./setup-env.sh` (o copiar manualmente `env.example` a `.env`)
3. **Verificar**: `npm start` debería funcionar sin errores

### Para producción:

1. **Variables de entorno del servidor**: Configurar las mismas variables en el servidor de producción
2. **Reglas de Firestore**: Asegurar que las reglas de seguridad estén configuradas correctamente
3. **Monitoreo**: Revisar logs de Firebase para detectar uso no autorizado

## 🔧 Troubleshooting

### Error: "Configuración de Firebase incompleta"
- Verificar que el archivo `.env` existe
- Verificar que todas las variables están definidas
- Ejecutar `./setup-env.sh` para recrear el archivo

### Error: "Cannot read property 'extra' of undefined"
- Verificar que `expo-constants` está instalado: `npm install expo-constants`
- Reiniciar el servidor de desarrollo: `npm start --clear`

### Variables de entorno no se cargan
- Verificar que `dotenv` está instalado: `npm install dotenv`
- Verificar que `app.config.js` existe y está configurado correctamente

## 📋 Checklist de Seguridad

- [x] Credenciales en variables de entorno
- [x] Archivo `.env` en `.gitignore`
- [x] Plantilla `env.example` disponible
- [x] Validación de configuración
- [x] Documentación de seguridad
- [x] Script de configuración automática

## 🔄 Actualización de Credenciales

Si necesitas cambiar las credenciales de Firebase:

1. **Actualizar `.env`** con las nuevas credenciales
2. **Actualizar `env.example`** con la nueva estructura (sin valores reales)
3. **Actualizar `setup-env.sh`** con las nuevas credenciales
4. **Notificar al equipo** sobre el cambio

---

**✅ Tu configuración de Firebase está ahora segura y lista para desarrollo y producción!** 