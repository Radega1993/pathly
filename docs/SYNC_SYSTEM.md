# 🔄 Sistema de Sincronización - Pathly Game

## 📋 Resumen

El sistema de sincronización permite mantener el progreso del juego sincronizado entre el dispositivo local y la nube, permitiendo a los usuarios cambiar de dispositivo sin perder su progreso.

## 🎯 Características Principales

### ✅ Funcionalidades Implementadas

- **Sincronización automática** al registrar usuario
- **Sincronización automática** al hacer login
- **Sincronización automática** al completar niveles
- **Comparación inteligente** de fechas para resolver conflictos
- **Sincronización bidireccional** local ↔ nube
- **Manejo de conflictos** basado en timestamps
- **Sincronización en tiempo real** sin interrumpir el juego

## 🏗️ Arquitectura del Sistema

### Servicio de Sincronización (`services/syncService.ts`)

```typescript
class SyncService {
  // Singleton pattern para instancia única
  private static instance: SyncService;
  private isSyncing = false; // Evita sincronizaciones simultáneas
}
```

### Interfaces Principales

```typescript
interface CloudProgress {
  completedLevels: string[];
  lastPlayedLevel: string | null;
  lastPlayedAt: number;
  lastSyncAt: number;
  totalLevelsCompleted: number;
}

interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  userType: 'free' | 'monthly' | 'lifetime';
  createdAt: number;
  lastLoginAt: number;
  isEmailVerified: boolean;
  progress: CloudProgress;
}
```

## 🔄 Flujo de Sincronización

### 1. **Al Registrar un Usuario**

```typescript
// 1. Usuario se registra
const user = await register(credentials);

// 2. Se crea el documento en Firestore
await createUserData(user);

// 3. Se sincroniza el progreso local con la nube
await syncOnRegister(user.uid);
```

**Proceso:**
1. Obtener progreso local actual
2. Crear progreso en la nube con datos locales
3. Guardar en Firestore
4. Actualizar timestamp de sincronización

### 2. **Al Hacer Login**

```typescript
// 1. Usuario hace login
const user = await login(credentials);

// 2. Se actualiza último login
await updateLastLogin(user.uid);

// 3. Se sincroniza progreso
await syncOnLogin(user.uid);
```

**Proceso:**
1. Obtener progreso de la nube
2. Obtener progreso local
3. Comparar timestamps
4. Decidir qué datos usar (más recientes)
5. Sincronizar en la dirección correcta

### 3. **Al Completar un Nivel**

```typescript
// 1. Usuario completa nivel
await markLevelCompleted('level_5');

// 2. Se guarda localmente
await saveProgress(progress);

// 3. Se sincroniza automáticamente con la nube
await syncToCloud();
```

**Proceso:**
1. Actualizar progreso local
2. Sincronizar automáticamente con la nube
3. Actualizar timestamp de sincronización

## 🧠 Lógica de Resolución de Conflictos

### Comparación de Timestamps

```typescript
// Comparar fechas para decidir qué datos usar
const cloudIsNewer = cloudProgress.lastPlayedAt > localProgress.lastPlayedAt;
const localIsNewer = localProgress.lastPlayedAt > cloudProgress.lastPlayedAt;

if (cloudIsNewer) {
  // La nube tiene datos más recientes
  await updateLocalFromCloud(cloudProgress);
} else if (localIsNewer) {
  // Local tiene datos más recientes
  await updateCloudFromLocal(userId, localProgress, localLastLevel);
} else {
  // Ambos están sincronizados
  await updateLastSync(userId);
}
```

### Reglas de Resolución

1. **Nube más reciente**: Actualizar local con datos de la nube
2. **Local más reciente**: Actualizar nube con datos locales
3. **Misma fecha**: Solo actualizar timestamp de sincronización
4. **Sin datos en nube**: Crear progreso inicial con datos locales

## 📱 Integración con la App

### Uso Automático

```typescript
// La sincronización es automática, no necesitas hacer nada
// Solo registra usuarios y haz login normalmente

// Al registrar
const user = await register({
  email: 'usuario@ejemplo.com',
  password: 'contraseña123',
  displayName: 'Usuario Ejemplo'
});
// ✅ Progreso se sincroniza automáticamente

// Al hacer login
const user = await login({
  email: 'usuario@ejemplo.com',
  password: 'contraseña123'
});
// ✅ Progreso se sincroniza automáticamente

// Al completar nivel
await markLevelCompleted('level_3');
// ✅ Progreso se sincroniza automáticamente
```

### Uso Manual (Opcional)

```typescript
import { syncToCloud, syncFromCloud, compareProgress } from './services';

// Sincronizar manualmente hacia la nube
await syncToCloud();

// Sincronizar manualmente desde la nube
await syncFromCloud();

// Comparar progreso local vs nube
const comparison = await compareProgress(userId);
console.log('Progreso local más reciente:', comparison.localNewer);
console.log('Progreso nube más reciente:', comparison.cloudNewer);
console.log('Niveles locales:', comparison.localCount);
console.log('Niveles en nube:', comparison.cloudCount);
```

## 🔧 Configuración de Firestore

### Reglas de Seguridad

```javascript
// Firestore Rules para sincronización
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Usuario puede leer/escribir solo su propio documento
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Validar estructura del documento
      allow create: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.data.keys().hasAll(['uid', 'email', 'displayName', 'userType', 'createdAt', 'lastLoginAt', 'isEmailVerified', 'progress']);
    }
  }
}
```

### Estructura del Documento

```javascript
// Ejemplo de documento de usuario en Firestore
{
  "uid": "user123",
  "email": "usuario@ejemplo.com",
  "displayName": "Usuario Ejemplo",
  "userType": "free",
  "createdAt": 1703123456789,
  "lastLoginAt": 1703123456789,
  "isEmailVerified": false,
  "progress": {
    "completedLevels": ["level_1", "level_2", "level_3"],
    "lastPlayedLevel": "level_4",
    "lastPlayedAt": 1703123456789,
    "lastSyncAt": 1703123456789,
    "totalLevelsCompleted": 3
  }
}
```

## 🚀 Casos de Uso

### 1. **Nuevo Usuario**

1. Usuario se registra
2. Progreso local (vacío) se sincroniza con la nube
3. Usuario puede jugar normalmente

### 2. **Usuario Existente en Nuevo Dispositivo**

1. Usuario hace login
2. Progreso de la nube se descarga al dispositivo
3. Usuario continúa desde donde se quedó

### 3. **Usuario Jugando en Múltiples Dispositivos**

1. Dispositivo A: Completa nivel → Sincroniza con nube
2. Dispositivo B: Hace login → Descarga progreso actualizado
3. Ambos dispositivos están sincronizados

### 4. **Conflicto de Datos**

1. Dispositivo A: Completa nivel a las 14:00
2. Dispositivo B: Completa nivel a las 15:00
3. Al sincronizar: Se usa el más reciente (15:00)

## 📊 Monitoreo y Debug

### Logs de Sincronización

```typescript
// Logs automáticos del sistema
console.log('🔄 Sincronizando progreso al registrar usuario...');
console.log('✅ Progreso sincronizado al registrar usuario');

console.log('🔄 Sincronizando progreso al hacer login...');
console.log('📥 Actualizando progreso local con datos de la nube');
console.log('📤 Actualizando nube con datos locales');
console.log('✅ Progreso sincronizado al hacer login');
```

### Verificación de Sincronización

```typescript
// Verificar estado de sincronización
const comparison = await compareProgress(userId);

if (comparison.localNewer) {
  console.log('⚠️ Progreso local más reciente que la nube');
} else if (comparison.cloudNewer) {
  console.log('⚠️ Progreso de nube más reciente que local');
} else {
  console.log('✅ Progreso sincronizado');
}
```

## 🔍 Solución de Problemas

### Problema: Sincronización no funciona

**Soluciones:**
1. Verificar conexión a internet
2. Verificar configuración de Firebase
3. Verificar reglas de Firestore
4. Revisar logs de error

### Problema: Datos no se sincronizan

**Soluciones:**
1. Verificar que el usuario esté autenticado
2. Verificar permisos de Firestore
3. Forzar sincronización manual
4. Comparar progreso local vs nube

### Problema: Conflictos de datos

**Soluciones:**
1. El sistema resuelve automáticamente usando timestamps
2. Verificar logs de resolución de conflictos
3. Comparar progreso para entender qué pasó

## ✅ Checklist de Verificación

- [ ] Firebase configurado correctamente
- [ ] Firestore Rules configurados
- [ ] Usuario autenticado correctamente
- [ ] Progreso local funcionando
- [ ] Sincronización al registrar funciona
- [ ] Sincronización al login funciona
- [ ] Sincronización automática funciona
- [ ] Resolución de conflictos funciona
- [ ] Logs de sincronización visibles

## 🚀 Próximos Pasos

1. **Implementar sincronización en tiempo real** con Firestore listeners
2. **Añadir indicador de sincronización** en la UI
3. **Implementar sincronización offline** con cache
4. **Añadir analytics** de sincronización
5. **Implementar backup automático** de progreso

## 📚 Recursos Adicionales

- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Offline Persistence](https://firebase.google.com/docs/firestore/manage-data/enable-offline) 