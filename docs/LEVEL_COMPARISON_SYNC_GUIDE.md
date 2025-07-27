# 🏆 Guía de Comparación de Niveles Más Altos y Reseteo

## 📋 Resumen

El sistema ahora compara el **nivel más alto** entre local y online, y usa el más alto. Además, al hacer logout se **resetea el progreso local** para evitar que se sobrescriba el progreso de otra cuenta.

## 🏆 Nueva Lógica de Comparación

### **¿Cómo Funciona?**

```typescript
// En syncOnLogin - Compara niveles más altos
const localHighestLevel = this.getHighestLevelFromProgress(localProgress);
const cloudHighestLevel = this.getHighestLevelFromProgress(cloudProgress);

if (localHighestLevel > cloudHighestLevel) {
    // Local tiene nivel más alto → Actualizar nube
    await this.updateCloudFromLocal(userId, localProgress, localLastLevel);
} else if (cloudHighestLevel > localHighestLevel) {
    // Nube tiene nivel más alto → Actualizar local
    await this.updateLocalFromCloud(cloudProgress);
} else {
    // Mismo nivel más alto → Mantener sincronización por timestamp
}
```

### **Ejemplos de Comparación**

#### **Caso 1: Local más alto**
- **Local**: `['level_1', 'level_2', 'level_25']` → Nivel más alto: 25
- **Nube**: `['level_1', 'level_2', 'level_3', 'level_20']` → Nivel más alto: 20
- **Resultado**: Usa local (nivel 25) y actualiza la nube

#### **Caso 2: Nube más alta**
- **Local**: `['level_1', 'level_2', 'level_3']` → Nivel más alto: 3
- **Nube**: `['level_1', 'level_2', 'level_3', 'level_4', 'level_15']` → Nivel más alto: 15
- **Resultado**: Usa nube (nivel 15) y actualiza local

#### **Caso 3: Mismo nivel más alto**
- **Local**: `['level_1', 'level_2', 'level_10']` → Nivel más alto: 10
- **Nube**: `['level_1', 'level_2', 'level_3', 'level_10']` → Nivel más alto: 10
- **Resultado**: Compara timestamps para decidir cuál es más reciente

## 🔄 Reseteo al Logout

### **¿Por Qué se Resetea?**

Para evitar que el progreso de una cuenta se sobrescriba cuando otra cuenta hace login en el mismo dispositivo.

### **Flujo de Reseteo**

```typescript
// En signOut - Reseteo automático
async signOut(): Promise<void> {
    // 1. Cerrar sesión de Firebase
    await firebaseSignOut(auth);
    
    // 2. Limpiar datos locales
    this.currentUser = null;
    await this.clearSessionFromStorage();
    
    // 3. Resetear progreso local
    await this.resetLocalProgress();
    
    console.log('✅ Logout exitoso - Progreso local reseteado');
}
```

### **Beneficios del Reseteo**

✅ **Evita contaminación** de progreso entre cuentas
✅ **Garantiza privacidad** de datos entre usuarios
✅ **Previene sobrescritura** accidental de progreso
✅ **Experiencia limpia** para cada usuario

## 📱 Casos de Uso Completos

### **Caso 1: Usuario A con progreso alto**

1. **Usuario A** hace login → Progreso local: nivel 25
2. **Usuario A** completa nivel 26 → Progreso local: nivel 26
3. **Usuario A** hace logout → Progreso local reseteado
4. **Usuario B** hace login → Progreso limpio, descarga su progreso de la nube

### **Caso 2: Múltiples dispositivos**

1. **Dispositivo A**: Usuario completa hasta nivel 30
2. **Dispositivo B**: Usuario completa hasta nivel 15
3. **Login en Dispositivo A**: Compara y usa nivel 30 (más alto)
4. **Sincronización**: Nube actualizada con nivel 30

### **Caso 3: Progreso no secuencial**

1. **Local**: `['level_1', 'level_2', 'level_25']` (saltó niveles)
2. **Nube**: `['level_1', 'level_2', 'level_3', 'level_4', 'level_5']`
3. **Resultado**: Usa local (nivel 25) porque es más alto

## 🔧 Funciones Técnicas

### **Extracción de Número de Nivel**

```typescript
private extractLevelNumber(levelId: string): number {
    const match = levelId.match(/level_(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}
```

### **Cálculo de Nivel Más Alto**

```typescript
private getHighestLevelFromProgress(progress: Progress | CloudProgress): number {
    if ('completedLevels' in progress && progress.completedLevels instanceof Set) {
        // Progreso local (Set)
        let highestLevel = 0;
        for (const levelId of progress.completedLevels) {
            const levelNumber = this.extractLevelNumber(levelId);
            if (levelNumber > highestLevel) {
                highestLevel = levelNumber;
            }
        }
        return highestLevel;
    } else {
        // Progreso de nube (array)
        const cloudProgress = progress as CloudProgress;
        let highestLevel = 0;
        for (const levelId of cloudProgress.completedLevels) {
            const levelNumber = this.extractLevelNumber(levelId);
            if (levelNumber > highestLevel) {
                highestLevel = levelNumber;
            }
        }
        return highestLevel;
    }
}
```

## 🧪 Testing

### **Script de Prueba**

```bash
# Probar la nueva lógica
node scripts/test-level-comparison-sync.js
```

### **Verificación Manual**

1. **Crear progreso local** con nivel alto (ej: nivel 25)
2. **Crear progreso en nube** con nivel bajo (ej: nivel 20)
3. **Hacer login** → Verificar que usa el nivel más alto
4. **Hacer logout** → Verificar que se resetea progreso local
5. **Login con otra cuenta** → Verificar progreso limpio

### **Logs Esperados**

```typescript
📊 Comparando progreso:
- Local: niveles completados: 6, último: level_26
- Nube: niveles completados: 11, último: level_21

🏆 Nivel más alto:
- Local: 25
- Nube: 20

📤 Local tiene nivel más alto, actualizando nube
✅ Progreso sincronizado al hacer login

🔄 Cerrando sesión...
🔄 Reseteando progreso local...
✅ Progreso local reseteado
✅ Logout exitoso - Progreso local reseteado
```

## 🚀 Beneficios del Sistema

### **Para el Usuario**

✅ **Progreso preservado** - Nunca pierde el nivel más alto
✅ **Sincronización inteligente** - Usa siempre el mejor progreso
✅ **Privacidad garantizada** - No hay contaminación entre cuentas
✅ **Experiencia consistente** - Mismo progreso en todos los dispositivos

### **Para el Desarrollador**

✅ **Lógica robusta** - Maneja casos edge automáticamente
✅ **Debugging fácil** - Logs detallados de comparación
✅ **Mantenimiento simple** - Funciones bien separadas
✅ **Escalabilidad** - Funciona con cualquier cantidad de niveles

## 🔍 Solución de Problemas

### **Problema: No se detecta el nivel más alto**

**Causa**: Formato incorrecto de IDs de nivel
**Solución**: Verificar que los IDs sigan el formato `level_X`

### **Problema: Progreso no se resetea al logout**

**Causa**: Error en AsyncStorage
**Solución**: Verificar permisos y espacio disponible

### **Problema: Sincronización incorrecta**

**Causa**: Timestamps corruptos
**Solución**: Verificar que `lastPlayedAt` sea un timestamp válido

## ✅ Checklist de Verificación

- [ ] Compara correctamente niveles más altos
- [ ] Usa el nivel más alto entre local y nube
- [ ] Resetea progreso local al logout
- [ ] No hay contaminación entre cuentas
- [ ] Logs muestran comparación correcta
- [ ] Funciona con progreso no secuencial
- [ ] Maneja casos edge (progreso vacío, etc.)

## 📞 Soporte

Si tienes problemas con la comparación o reseteo:

1. **Verificar logs** de sincronización
2. **Ejecutar script** de prueba
3. **Revisar formato** de IDs de nivel
4. **Contactar soporte** con logs completos 