# 🔐 Guía de Persistencia de Sesión y Sincronización

## 📋 Resumen

El sistema de Pathly mantiene al usuario **logueado permanentemente** y **sincroniza automáticamente** el progreso al completar niveles, sin intervención manual del usuario.

## 🔐 Persistencia de Sesión

### **¿Cómo Funciona?**

```typescript
// Configuración en auth.ts
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});
```

### **Comportamiento de la Sesión**

✅ **Se mantiene logueado** hasta logout explícito
✅ **Sobrevive a reinicios** de la aplicación
✅ **Sobrevive a actualizaciones** de la app
✅ **Sobrevive a cambios** de red
✅ **Solo se desloguea** si el usuario presiona "Cerrar Sesión"

### **Flujo de Persistencia**

1. **Usuario hace login** → Se guarda token en AsyncStorage
2. **App se reinicia** → Firebase Auth recupera automáticamente la sesión
3. **Usuario abre app** → Ya está logueado automáticamente
4. **Usuario hace logout** → Se elimina token y sesión

## 🔄 Sincronización Automática

### **¿Cuándo se Sincroniza?**

✅ **Al registrar usuario** → Progreso local → Nube
✅ **Al hacer login** → Compara y sincroniza según timestamps
✅ **Al completar nivel** → Sincronización automática inmediata
✅ **Al cambiar último nivel jugado** → Sincronización automática

### **Flujo de Sincronización al Completar Nivel**

```typescript
// En storage.ts
export const markLevelCompleted = async (levelId: string): Promise<void> => {
    try {
        // 1. Actualizar progreso local
        const progress = await getProgress();
        progress.completedLevels.add(levelId);
        progress.lastPlayedAt = Date.now();
        await saveProgress(progress);
        
        // 2. Sincronización automática con la nube
        await syncToCloud();
        
        console.log('✅ Nivel completado y sincronizado automáticamente');
    } catch (error) {
        console.error('❌ Error al completar nivel:', error);
    }
};
```

### **Proceso Detallado**

1. **Usuario completa nivel** → Se guarda en AsyncStorage
2. **Sincronización automática** → Se sube a Firestore inmediatamente
3. **Progreso actualizado** → Disponible en todos los dispositivos
4. **Sin intervención manual** → Todo es automático

## 📱 Casos de Uso

### **Caso 1: Usuario Nuevo**

1. **Se registra** → Sesión persistente + progreso vacío sincronizado
2. **Completa nivel 1** → Sincronización automática
3. **Cierra app** → Sesión se mantiene
4. **Abre app** → Ya está logueado + progreso disponible

### **Caso 2: Usuario Existente**

1. **Hace login** → Sesión persistente + progreso descargado
2. **Completa nivel 5** → Sincronización automática
3. **Cambia de dispositivo** → Login automático + progreso sincronizado

### **Caso 3: Múltiples Dispositivos**

1. **Dispositivo A**: Completa nivel 10 → Sincroniza automáticamente
2. **Dispositivo B**: Hace login → Descarga progreso actualizado
3. **Ambos dispositivos**: Progreso sincronizado

## 🔍 Verificación del Sistema

### **Script de Verificación**

```bash
# Verificar persistencia y sincronización
node scripts/verify-persistence-sync.js
```

### **Verificación Manual**

1. **Hacer login** en la app
2. **Completar un nivel**
3. **Cerrar la app completamente**
4. **Abrir la app nuevamente**
5. **Verificar que esté logueado automáticamente**
6. **Verificar que el progreso esté sincronizado**

### **Logs de Verificación**

```typescript
// Logs esperados
✅ Usuario autenticado automáticamente: usuario@ejemplo.com
📊 Progreso en la nube:
- Niveles completados: 5
- Último nivel jugado: level_6
- Total completados: 5
✅ La sesión se mantiene automáticamente
✅ El progreso se sincroniza automáticamente
```

## 🛠️ Configuración Técnica

### **Firebase Auth Persistence**

```typescript
// Configuración automática
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});
```

### **AsyncStorage Keys**

```typescript
// Claves utilizadas
const STORAGE_KEYS = {
    PROGRESS: 'puzzlepath_progress',
    LAST_LEVEL: 'puzzlepath_last_level',
    // Firebase Auth maneja sus propias claves automáticamente
};
```

### **Sincronización Automática**

```typescript
// Trigger automático en storage.ts
export const markLevelCompleted = async (levelId: string) => {
    // ... actualizar local
    await syncToCloud(); // Sincronización automática
};
```

## 🚀 Beneficios del Sistema

### **Para el Usuario**

✅ **No necesita volver a loguearse** cada vez que abre la app
✅ **Progreso siempre sincronizado** automáticamente
✅ **Cambio de dispositivo transparente** sin pérdida de progreso
✅ **Experiencia fluida** sin interrupciones

### **Para el Desarrollador**

✅ **Menos código** para manejar sesiones
✅ **Sincronización automática** sin lógica compleja
✅ **Manejo de errores** centralizado
✅ **Escalabilidad** automática

## 🔧 Solución de Problemas

### **Problema: Usuario no se mantiene logueado**

**Causas posibles:**
- AsyncStorage no configurado correctamente
- Firebase Auth no inicializado con persistencia
- Permisos de almacenamiento

**Solución:**
```typescript
// Verificar configuración
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});
```

### **Problema: Progreso no se sincroniza**

**Causas posibles:**
- Usuario no autenticado
- Error de red
- Reglas de Firestore restrictivas

**Solución:**
```typescript
// Verificar autenticación antes de sincronizar
const user = getCurrentUser();
if (user) {
    await syncToCloud();
}
```

### **Problema: Sincronización lenta**

**Causas posibles:**
- Conexión lenta
- Muchos datos para sincronizar
- Firebase con latencia

**Solución:**
- El sistema es asíncrono, no bloquea la UI
- Los datos se sincronizan en segundo plano

## ✅ Checklist de Verificación

- [ ] Usuario permanece logueado después de reiniciar app
- [ ] Progreso se sincroniza automáticamente al completar nivel
- [ ] Progreso se mantiene al cambiar de dispositivo
- [ ] Logout funciona correctamente
- [ ] Sincronización no bloquea la UI
- [ ] Logs muestran sincronización exitosa

## 📞 Soporte

Si tienes problemas con la persistencia o sincronización:

1. **Verificar logs** de la aplicación
2. **Ejecutar script** de verificación
3. **Revisar configuración** de Firebase
4. **Contactar soporte** con logs completos 