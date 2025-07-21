# Servicio de Niveles - Firestore

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