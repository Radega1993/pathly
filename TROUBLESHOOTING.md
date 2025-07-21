# 🔧 Solución de Problemas - Firestore

## ❌ Problema: "Missing or insufficient permissions"

Este error indica que las reglas de Firestore no permiten lectura/escritura.

### 🔧 Solución 1: Configurar Reglas de Firestore

1. **Ve a la consola de Firebase:**
   ```
   https://console.firebase.google.com/
   ```

2. **Selecciona tu proyecto:** `pathly-68c8a`

3. **Ve a Firestore Database > Rules**

4. **Reemplaza las reglas actuales con:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Reglas para la colección de niveles
       match /levels/{levelId} {
         // Permitir lectura y escritura para desarrollo
         allow read, write: if true;
       }
       
       // Reglas para otras colecciones futuras
       match /{document=**} {
         // Permitir acceso total para desarrollo
         allow read, write: if true;
       }
     }
   }
   ```

5. **Haz clic en "Publish"**

### 🔧 Solución 2: Crear Niveles de Prueba

Ejecuta el script para crear niveles de prueba:

```bash
# Instalar dependencias si no las tienes
npm install firebase

# Ejecutar script de configuración
node scripts/setup-dev-mode.js
```

### 🔧 Solución 3: Modo Desarrollo Local

Si no puedes configurar Firestore ahora, la app funcionará en modo desarrollo local:

```bash
# La app automáticamente usará niveles locales
npm start -- --clear
```

## 🎯 Características del Modo Desarrollo

### ✅ **Niveles Locales Incluidos:**
- 🟢 **Fácil**: Grid 5x5 con números 1, 2, 4
- 🔵 **Normal**: Grid 5x5 con números 1, 2, 4  
- 🟡 **Difícil**: Grid 5x5 con números 1, 4
- 🔴 **Extremo**: Grid 5x5 con números 1, 4

### ✅ **Funcionalidades Completas:**
- Progresión de niveles
- Validación de soluciones
- Persistencia local
- UI/UX completa

## 🚀 Pasos para Configurar Firestore Completamente

### 1. **Configurar Reglas**
```bash
# Copiar reglas del archivo firestore.rules
# y pegarlas en la consola de Firebase
```

### 2. **Crear Niveles de Prueba**
```bash
node scripts/createTestLevels.js
```

### 3. **Verificar Configuración**
```bash
node scripts/setup-dev-mode.js
```

### 4. **Probar la App**
```bash
npm start -- --clear
```

## 🔍 Verificar que Todo Funciona

### ✅ **Indicadores de Éxito:**
- ✅ Firebase configurado correctamente
- ✅ Niveles cargados sin errores
- ✅ UI muestra niveles con colores por dificultad
- ✅ Progresión de niveles funciona

### ❌ **Indicadores de Problema:**
- ❌ "Missing or insufficient permissions"
- ❌ "No se encontraron niveles"
- ❌ Pantalla de error en lugar de niveles

## 🆘 Si Nada Funciona

### 🔄 **Modo de Emergencia:**
La app tiene un **modo desarrollo local** que funciona sin Firestore:

1. **La app detectará automáticamente** el problema de permisos
2. **Cambiará a modo local** sin intervención
3. **Usará niveles predefinidos** para todas las dificultades
4. **Funcionará completamente** con todas las características

### 📱 **Para Usar Solo Modo Local:**
```typescript
// En services/levelService.ts, activar manualmente:
await setDevMode(true);
```

## 🔄 Migración a Producción

### 📋 **Checklist para Producción:**

- [ ] Reglas de Firestore configuradas correctamente
- [ ] Niveles creados en la base de datos
- [ ] Permisos de lectura configurados
- [ ] Permisos de escritura restringidos
- [ ] Modo desarrollo desactivado

### 🔒 **Reglas de Producción Recomendadas:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /levels/{levelId} {
      allow read: if true;  // Cualquiera puede leer niveles
      allow write: if false; // Solo administradores pueden escribir
    }
  }
}
```

---

**💡 La app está diseñada para funcionar tanto con Firestore como en modo local. ¡No te preocupes si hay problemas de configuración!** 