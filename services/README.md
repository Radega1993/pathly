# Servicios - Firebase y Almacenamiento Local

Este directorio contiene los servicios principales de la aplicación:

## 📁 Archivos

- **`firebase.ts`** - Configuración de Firebase
- **`levelService.ts`** - Servicio de niveles desde Firestore
- **`storage.ts`** - Servicio de almacenamiento local con AsyncStorage
- **`index.ts`** - Exportaciones centralizadas

---

# 🔥 Servicio de Niveles - Firestore

Este servicio permite cargar niveles desde Firebase Firestore de forma aleatoria, evitando mostrar niveles repetidos.

## Configuración

### 1. Instalar dependencias

```bash
npm install firebase @react-native-async-storage/async-storage
```

### 2. Configurar Firebase

Edita `services/firebase.ts` con tus credenciales de Firebase:

```typescript
const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};
```

### 3. Estructura de datos en Firestore

Los niveles deben estar en la colección `levels` con la siguiente estructura:

```typescript
{
  difficulty: "easy" | "normal" | "hard" | "extreme",
  gridSize: number,
  grid: (number | null)[][], // Matriz donde null = celda vacía, número = valor de la celda
  solution: Array<{ x: number; y: number }> // Coordenadas de la solución
}
```

## Uso

### Función principal

```typescript
import { loadLevelFromFirestore } from './services/levelService';
import { Difficulty } from './types/level';

// Cargar un nivel aleatorio
const level = await loadLevelFromFirestore('easy');
console.log(level);
// {
//   id: "level_123",
//   difficulty: "easy",
//   gridSize: 5,
//   grid: Cell[][],
//   solution: [{x: 0, y: 0}, {x: 1, y: 0}, ...]
// }
```

### Funciones adicionales

```typescript
import { 
  clearPlayedLevels, 
  getPlayedLevelsCount 
} from './services/levelService';

// Limpiar historial de niveles jugados
await clearPlayedLevels();

// Obtener cantidad de niveles jugados
const count = await getPlayedLevelsCount();
console.log(`Niveles jugados: ${count}`);
```

## Características

### ✅ Funcionalidades implementadas

- **Carga aleatoria**: Selecciona un nivel aleatorio de la dificultad especificada
- **Evita repeticiones**: No muestra niveles ya jugados (opcional)
- **Persistencia local**: Usa AsyncStorage para recordar niveles jugados
- **Manejo de errores**: Gestión robusta de errores de red y datos
- **Tipado completo**: TypeScript con interfaces bien definidas
- **Conversión automática**: Convierte datos de Firestore al formato de la app

### 🔧 Configuración avanzada

#### Límite de consulta
La función limita las consultas a 100 documentos para evitar problemas de rendimiento. Puedes modificar este valor en `levelService.ts`:

```typescript
limit(100) // Cambiar por el número deseado
```

#### Fallback a niveles repetidos
Si no hay niveles sin jugar disponibles, la función automáticamente usa todos los niveles de esa dificultad.

## Ejemplo completo

```typescript
import React, { useState, useEffect } from 'react';
import { loadLevelFromFirestore } from './services/levelService';
import { Level, Difficulty } from './types/level';

const GameComponent: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(false);

  const loadNewLevel = async (difficulty: Difficulty) => {
    setLoading(true);
    try {
      const level = await loadLevelFromFirestore(difficulty);
      setCurrentLevel(level);
    } catch (error) {
      console.error('Error cargando nivel:', error);
      // Mostrar mensaje de error al usuario
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <p>Cargando nivel...</p>}
      {currentLevel && (
        <div>
          <h2>Nivel {currentLevel.difficulty}</h2>
          <p>ID: {currentLevel.id}</p>
          <p>Tamaño: {currentLevel.gridSize}x{currentLevel.gridSize}</p>
          {/* Renderizar el grid aquí */}
        </div>
      )}
      <button onClick={() => loadNewLevel('easy')}>Cargar nivel fácil</button>
      <button onClick={() => loadNewLevel('normal')}>Cargar nivel normal</button>
    </div>
  );
};
```

## Troubleshooting

### Error: "No se encontraron niveles con dificultad: X"
- Verifica que existan documentos en la colección `levels`
- Confirma que el campo `difficulty` coincida exactamente con el valor buscado
- Revisa las reglas de seguridad de Firestore

### Error: "Error al cargar nivel desde Firestore"
- Verifica la configuración de Firebase
- Confirma que tienes permisos de lectura en la colección `levels`
- Revisa la conexión a internet

### Niveles se repiten constantemente
- Ejecuta `clearPlayedLevels()` para resetear el historial
- Verifica que AsyncStorage esté funcionando correctamente

---

# 💾 Servicio de Almacenamiento Local

Este servicio gestiona el progreso del usuario localmente usando AsyncStorage, permitiendo guardar niveles completados y el último nivel jugado sin necesidad de autenticación.

## Funciones principales

### `getProgress(): Promise<Progress>`
Obtiene el progreso guardado del usuario.

```typescript
import { getProgress } from './services/storage';

const progress = await getProgress();
console.log('Niveles completados:', progress.completedLevels.size);
console.log('Última jugada:', new Date(progress.lastPlayedAt));
```

### `markLevelCompleted(levelId: string): Promise<void>`
Marca un nivel como completado.

```typescript
import { markLevelCompleted } from './services/storage';

await markLevelCompleted('level_123');
```

### `getLastLevelPlayed(): Promise<string | null>`
Obtiene el ID del último nivel jugado.

```typescript
import { getLastLevelPlayed } from './services/storage';

const lastLevel = await getLastLevelPlayed();
if (lastLevel) {
  console.log('Último nivel jugado:', lastLevel);
}
```

### `setLastLevelPlayed(levelId: string): Promise<void>`
Guarda el ID del nivel que está jugando el usuario.

```typescript
import { setLastLevelPlayed } from './services/storage';

await setLastLevelPlayed('level_456');
```

### `isLevelCompleted(levelId: string): Promise<boolean>`
Verifica si un nivel específico está completado.

```typescript
import { isLevelCompleted } from './services/storage';

const completed = await isLevelCompleted('level_123');
if (completed) {
  console.log('Este nivel ya fue completado');
}
```

### `getCompletedLevelsCount(): Promise<number>`
Obtiene el número total de niveles completados.

```typescript
import { getCompletedLevelsCount } from './services/storage';

const count = await getCompletedLevelsCount();
console.log(`Has completado ${count} niveles`);
```

### `clearProgress(): Promise<void>`
Limpia todo el progreso guardado (útil para testing).

```typescript
import { clearProgress } from './services/storage';

await clearProgress();
```

## Estructura de datos

### Interfaz Progress
```typescript
interface Progress {
  completedLevels: Set<string>;  // IDs de niveles completados
  lastPlayedAt: number;          // Timestamp de la última jugada
}
```

## Características

### ✅ Funcionalidades implementadas

- **Persistencia local**: Usa AsyncStorage para guardar datos
- **Manejo de errores**: Gestión robusta de errores y datos corruptos
- **Validación de datos**: Verifica la integridad de los datos guardados
- **Recuperación automática**: En caso de error, reinicia el progreso
- **Tipado completo**: TypeScript con interfaces bien definidas
- **Funciones utilitarias**: Métodos para verificar estado y estadísticas

### 🔧 Manejo de errores

El servicio incluye manejo robusto de errores:

- **Datos corruptos**: Si detecta datos malformados, reinicia el progreso
- **Errores de AsyncStorage**: Captura y maneja errores de almacenamiento
- **Recuperación**: En caso de error, devuelve valores por defecto seguros

## Ejemplo de uso completo

```typescript
import React, { useEffect, useState } from 'react';
import {
  getProgress,
  markLevelCompleted,
  setLastLevelPlayed,
  isLevelCompleted,
  getCompletedLevelsCount
} from './services/storage';

const GameScreen: React.FC<{ levelId: string }> = ({ levelId }) => {
  const [completed, setCompleted] = useState(false);
  const [totalCompleted, setTotalCompleted] = useState(0);

  useEffect(() => {
    const initializeGame = async () => {
      // Guardar que el usuario está jugando este nivel
      await setLastLevelPlayed(levelId);
      
      // Verificar si ya lo completó
      const wasCompleted = await isLevelCompleted(levelId);
      setCompleted(wasCompleted);
      
      // Obtener estadísticas
      const count = await getCompletedLevelsCount();
      setTotalCompleted(count);
    };

    initializeGame();
  }, [levelId]);

  const handleLevelComplete = async () => {
    try {
      await markLevelCompleted(levelId);
      setCompleted(true);
      setTotalCompleted(prev => prev + 1);
      console.log('¡Nivel completado!');
    } catch (error) {
      console.error('Error al guardar progreso:', error);
    }
  };

  return (
    <div>
      <h2>Nivel {levelId}</h2>
      {completed && <p>✅ Ya completaste este nivel</p>}
      <p>Total completados: {totalCompleted}</p>
      <button onClick={handleLevelComplete}>Completar nivel</button>
    </div>
  );
};
```

## Troubleshooting

### Error: "No se pudo guardar el progreso"
- Verifica que AsyncStorage esté disponible
- Confirma que tienes permisos de escritura en el dispositivo
- Revisa el espacio disponible en el almacenamiento

### Progreso no se guarda entre sesiones
- Verifica que AsyncStorage esté funcionando correctamente
- Confirma que no hay errores en la consola
- Ejecuta `clearProgress()` y prueba de nuevo

### Datos corruptos detectados
- El servicio automáticamente reinicia el progreso
- Verifica que no haya múltiples instancias escribiendo datos
- Revisa la integridad del dispositivo 