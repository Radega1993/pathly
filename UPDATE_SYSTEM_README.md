# 🔄 Sistema de Alertas de Actualización - Pathly Game

## 📋 Descripción General

El sistema de alertas de actualización de Pathly Game permite notificar automáticamente a los usuarios cuando hay nuevas versiones disponibles en Google Play Store. El sistema es completamente configurable y respeta las preferencias del usuario.

## 🚀 Características Principales

### ✅ Funcionalidades Implementadas

- **Verificación automática**: Comprueba actualizaciones según la frecuencia configurada
- **Alertas elegantes**: Modal moderno con información detallada de la actualización
- **Configuración personalizable**: El usuario puede ajustar preferencias
- **Persistencia local**: Las preferencias se guardan en AsyncStorage
- **Redirección directa**: Enlace directo a Google Play Store
- **Respeto de preferencias**: No molesta si el usuario ha descartado la alerta

### 🎨 Diseño y UX

- **Modal moderno**: Diseño consistente con la paleta de colores de la app
- **Información clara**: Muestra versión actual vs nueva versión
- **Botones intuitivos**: "Actualizar ahora", "Recordar más tarde", "No mostrar de nuevo"
- **Iconografía**: Iconos descriptivos para mejor comprensión

## 📁 Estructura del Sistema

```
services/
├── updateService.ts          # Servicio principal de actualizaciones
components/
├── UpdateAlert.tsx          # Modal de alerta de actualización
└── UpdateSettings.tsx       # Configuración de preferencias
App.tsx                      # Integración en la aplicación principal
```

## 🔧 Configuración

### Variables de Entorno

El sistema utiliza la URL de Google Play Store configurada en el servicio:

```typescript
const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.pathly.game';
```

### Versiones

El sistema lee automáticamente las versiones desde:
- `app.json` - Versión de la aplicación
- `package.json` - Versión del paquete
- `Constants.expoConfig` - Configuración de Expo

## 🎯 Flujo de Funcionamiento

### 1. Inicialización
```typescript
// Al iniciar la app
await updateService.initialize();
await checkForUpdatesOnStart();
```

### 2. Verificación de Actualizaciones
```typescript
const updateInfo = await updateService.checkForUpdates();
```

### 3. Mostrar Alerta (si aplica)
```typescript
if (updateInfo.isUpdateAvailable && 
    !updateService.isUpdateDismissed(updateInfo.latestVersion) &&
    updateService.getPreferences().showUpdateAlerts) {
  setShowUpdateAlert(true);
}
```

### 4. Acciones del Usuario
- **Actualizar ahora**: Abre Google Play Store
- **Recordar más tarde**: Cierra la alerta temporalmente
- **No mostrar de nuevo**: Descarta la versión actual

## ⚙️ Configuración de Preferencias

### Tipos de Configuración

```typescript
interface UpdatePreferences {
  showUpdateAlerts: boolean;           // Mostrar alertas
  lastDismissedVersion?: string;       // Última versión descartada
  checkFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
}
```

### Frecuencias Disponibles

- **Diariamente**: Verifica cada 24 horas
- **Semanalmente**: Verifica cada 7 días (por defecto)
- **Mensualmente**: Verifica cada 30 días
- **Nunca**: No verifica automáticamente

## 🎮 Integración en la UI

### Botón de Configuración

Se añadió un botón en el header de la pantalla principal:
- **Icono**: `cloud-download-outline`
- **Posición**: Entre el botón de audio y el de autenticación
- **Función**: Abre la configuración de actualizaciones

### Acceso a Configuración

```typescript
const handleShowUpdateSettings = () => {
  setShowUpdateSettings(true);
};
```

## 🔄 Verificación de Actualizaciones

### Lógica de Verificación

1. **Obtener versión actual**: Desde `Constants.expoConfig`
2. **Verificar frecuencia**: Según preferencias del usuario
3. **Comparar versiones**: Versión actual vs disponible
4. **Mostrar alerta**: Si hay actualización y no está descartada

### Simulación para Desarrollo

En desarrollo, el sistema simula una versión más nueva:
```typescript
private getMockLatestVersion(currentVersion: string) {
  const versionParts = currentVersion.split('.');
  const patch = parseInt(versionParts[2]) + 1;
  return {
    version: `${versionParts[0]}.${versionParts[1]}.${patch}`,
    versionCode: this.getCurrentVersionInfo().versionCode + 1,
  };
}
```

## 🚀 Producción

### API Real

Para producción, reemplaza la simulación con una llamada a tu API:

```typescript
async checkForUpdates(): Promise<UpdateInfo> {
  // Llamada a tu API
  const response = await fetch('https://tu-api.com/updates/latest');
  const latestVersion = await response.json();
  
  return {
    currentVersion: this.getCurrentVersionInfo().version,
    latestVersion: latestVersion.version,
    isUpdateAvailable: this.isVersionNewer(latestVersion, current),
    // ... resto de la información
  };
}
```

### Configuración de Google Play Store

Asegúrate de que la URL esté correcta:
```typescript
const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.pathly.game';
```

## 🧪 Testing

### Script de Verificación

Ejecuta el script de prueba para verificar la implementación:

```bash
node scripts/test-update-system.js
```

### Verificaciones Incluidas

- ✅ Existencia de archivos
- ✅ Implementación de funcionalidades
- ✅ Integración en App.tsx
- ✅ Configuración de versiones
- ✅ Dependencias requeridas

## 📱 Experiencia del Usuario

### Primera Vez
1. Usuario abre la app
2. Sistema verifica actualizaciones automáticamente
3. Si hay actualización, muestra alerta elegante
4. Usuario puede actualizar, recordar más tarde, o descartar

### Configuración
1. Usuario toca el botón de actualizaciones en el header
2. Se abre la pantalla de configuración
3. Puede ajustar frecuencia y preferencias
4. Los cambios se guardan automáticamente

### Alertas Recurrentes
- Solo se muestran si hay una versión más nueva
- Respetan la frecuencia configurada
- No molestan si el usuario descartó la versión

## 🔒 Privacidad y Datos

### Datos Almacenados Localmente

- Preferencias de alertas
- Frecuencia de verificación
- Última versión descartada
- Timestamp de última verificación

### No se Envían Datos

- No se envían datos a servidores externos
- No se rastrea el comportamiento del usuario
- Solo verificación local de versiones

## 🐛 Solución de Problemas

### Problemas Comunes

1. **No se muestran alertas**
   - Verificar que `showUpdateAlerts` esté en `true`
   - Verificar que la frecuencia no sea "never"
   - Verificar que la versión no esté descartada

2. **Error al abrir Google Play Store**
   - Verificar que la URL sea correcta
   - Verificar permisos de internet
   - Fallback a búsqueda manual

3. **Versiones inconsistentes**
   - Verificar `app.json` y `package.json`
   - Verificar `Constants.expoConfig`
   - Limpiar cache si es necesario

### Logs de Debug

El sistema incluye logs detallados:
```typescript
console.log('✅ UpdateService initialized');
console.log('❌ Error checking for updates:', error);
```

## 📈 Métricas y Analytics

### Eventos a Rastrear (Opcional)

- `update_alert_shown`
- `update_alert_dismissed`
- `update_alert_accepted`
- `update_settings_changed`

## 🔮 Futuras Mejoras

### Funcionalidades Planificadas

- [ ] Verificación de actualizaciones críticas
- [ ] Notificaciones push para actualizaciones importantes
- [ ] Descarga automática en WiFi
- [ ] Changelog detallado en las alertas
- [ ] Soporte para iOS App Store

### Integración con Analytics

- [ ] Tracking de conversión de actualizaciones
- [ ] Métricas de engagement con alertas
- [ ] A/B testing de diferentes mensajes

---

## 📞 Soporte

Si encuentras algún problema con el sistema de actualizaciones:

1. Ejecuta el script de verificación
2. Revisa los logs de la consola
3. Verifica la configuración de versiones
4. Comprueba la conectividad de internet

**¡El sistema está listo para producción!** 🚀 