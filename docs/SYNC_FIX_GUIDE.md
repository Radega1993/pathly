# 🔧 Guía de Solución de Problemas de Sincronización

## 🚨 Problema Identificado

**Situación**: El usuario está en el nivel 23 pero en Firestore aparece:
- `totalLevelsCompleted: 0`
- `lastPlayedLevel: null`
- `completedLevels: []` (array vacío)

**Causa**: El progreso local no se sincronizó correctamente con la nube.

## 🛠️ Soluciones Disponibles

### **Opción 1: Script de Corrección Automática (Recomendado)**

```bash
# 1. Editar el script con tu contraseña
nano scripts/test-sync-fix.js

# 2. Cambiar 'tu_contraseña_aqui' por tu contraseña real
# Línea 25: 'tu_contraseña_aqui' → 'tu_contraseña_real'

# 3. Ejecutar el script
node scripts/test-sync-fix.js
```

**Resultado esperado:**
```
🔧 Probando y arreglando sincronización...

1️⃣ Autenticando usuario...
✅ Usuario autenticado: rauldearriba@gmail.com

2️⃣ Obteniendo datos actuales...
📊 Estado actual en Firestore:
- Niveles completados: 0
- Último nivel jugado: null
- Total completados: 0

3️⃣ Creando progreso corregido...
📱 Progreso corregido:
- Niveles completados: 22
- Último nivel jugado: level_23
- Total completados: 22

4️⃣ Actualizando Firestore...
✅ Firestore actualizado correctamente

5️⃣ Verificando actualización...
📊 Datos actualizados en Firestore:
- Niveles completados: 22
- Último nivel jugado: level_23
- Total completados: 22

🎉 ¡Sincronización arreglada exitosamente!
```

### **Opción 2: Corrección Manual en Firebase Console**

1. **Ir a Firebase Console** → Firestore Database
2. **Navegar a**: `users/j54pl6d7KFM3vh6PPtH46V1GK8y1`
3. **Editar el campo `progress`**:

```json
{
  "completedLevels": [
    "level_1", "level_2", "level_3", "level_4", "level_5",
    "level_6", "level_7", "level_8", "level_9", "level_10",
    "level_11", "level_12", "level_13", "level_14", "level_15",
    "level_16", "level_17", "level_18", "level_19", "level_20",
    "level_21", "level_22"
  ],
  "lastPlayedLevel": "level_23",
  "lastPlayedAt": 1753554172588,
  "lastSyncAt": 1753554172588,
  "totalLevelsCompleted": 22
}
```

### **Opción 3: Forzar Sincronización desde la App**

```typescript
import { forceSyncToCloud, getCurrentUser } from './services';

// Forzar sincronización manual
const user = getCurrentUser();
if (user) {
  await forceSyncToCloud(user.uid);
}
```

## 🔍 Verificación Post-Corrección

### **1. Verificar en Firebase Console**

Después de la corrección, el documento debería mostrar:
```json
{
  "progress": {
    "completedLevels": ["level_1", "level_2", ..., "level_22"],
    "lastPlayedLevel": "level_23",
    "lastPlayedAt": 1753554172588,
    "lastSyncAt": 1753554172588,
    "totalLevelsCompleted": 22
  }
}
```

### **2. Verificar en la App**

```typescript
import { compareProgress, getCurrentUser } from './services';

const user = getCurrentUser();
if (user) {
  const comparison = await compareProgress(user.uid);
  console.log('Progreso local:', comparison.localCount);
  console.log('Progreso nube:', comparison.cloudCount);
}
```

## 🚀 Prevención de Problemas Futuros

### **Mejoras Implementadas**

1. **Detección automática**: El sistema ahora detecta cuando la nube no tiene progreso pero el local sí
2. **Sincronización forzada**: Se fuerza la sincronización local hacia la nube
3. **Logs mejorados**: Más información de debug para identificar problemas
4. **Funciones de emergencia**: `forceSyncToCloud` y `forceSyncFromCloud`

### **Monitoreo Continuo**

```typescript
// Verificar estado de sincronización periódicamente
setInterval(async () => {
  const user = getCurrentUser();
  if (user) {
    const comparison = await compareProgress(user.uid);
    if (comparison.localCount !== comparison.cloudCount) {
      console.warn('⚠️ Desincronización detectada');
      await forceSyncToCloud(user.uid);
    }
  }
}, 30000); // Cada 30 segundos
```

## 📊 Logs de Debug

### **Logs Normales**
```
🔄 Sincronizando progreso al hacer login...
📊 Comparando progreso:
- Local: niveles completados: 22 último: level_23
- Nube: niveles completados: 0 último: null
📤 Nube sin progreso pero local con progreso, forzando sincronización local
✅ Progreso sincronizado al hacer login
```

### **Logs de Error**
```
❌ Error sincronizando al hacer login: [Error details]
🔧 Posibles soluciones:
1. Verificar conexión a internet
2. Verificar configuración de Firebase
3. Verificar reglas de Firestore
```

## ✅ Checklist de Verificación

- [ ] Script ejecutado correctamente
- [ ] Firebase Console muestra progreso correcto
- [ ] App muestra nivel 23 como actual
- [ ] Sincronización automática funciona
- [ ] Logs muestran sincronización exitosa
- [ ] Progreso se mantiene al cambiar de dispositivo

## 🆘 Si el Problema Persiste

1. **Verificar credenciales de Firebase**
2. **Verificar reglas de Firestore**
3. **Verificar conexión a internet**
4. **Revisar logs de error específicos**
5. **Contactar soporte con logs completos**

## 📞 Contacto

Si necesitas ayuda adicional, proporciona:
- Logs completos del error
- Captura de pantalla de Firebase Console
- Versión de la app
- Dispositivo y sistema operativo 