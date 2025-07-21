# 🎮 Pathly - Utils

Este directorio contiene utilidades y funciones auxiliares para el juego Pathly.

## 📁 Archivos

- `validatePath.ts` - Función principal para validar caminos del juego
- `validatePath.example.ts` - Ejemplos de uso de la función validatePath

---

## 🔍 validatePath

### Descripción

La función `validatePath` valida si la secuencia de celdas tocadas corresponde a una solución correcta del puzzle Pathly.

### Reglas de Validación

✅ **Camino válido** cuando:
- El camino pasa por **todas las celdas numeradas** una sola vez
- El orden de los números es **exactamente 1→2→3→4**
- No se repite ninguna celda
- Solo se incluyen celdas con números

❌ **Camino inválido** cuando:
- Orden incorrecto (ej: 1→3→2→4)
- Celdas repetidas
- Celdas faltantes o extra
- Incluye celdas sin números
- Path vacío

### Uso

```typescript
import { validatePath, createTestGrid, placeNumbers } from './utils/validatePath';

// Crear un grid 5x5
const grid = createTestGrid(5);

// Colocar números en el grid
placeNumbers(grid, [
    { x: 1, y: 1, value: 1 },
    { x: 3, y: 1, value: 2 },
    { x: 1, y: 3, value: 3 },
    { x: 3, y: 3, value: 4 }
]);

// Definir el camino trazado por el usuario
const path = [
    { x: 1, y: 1 }, // 1
    { x: 3, y: 1 }, // 2
    { x: 1, y: 3 }, // 3
    { x: 3, y: 3 }  // 4
];

// Validar el camino
const isValid = validatePath(grid, path);
console.log(isValid); // true
```

### Parámetros

#### `grid: Cell[][]`
Matriz bidimensional NxN donde cada celda tiene la estructura:
```typescript
interface Cell {
    x: number;      // Coordenada X
    y: number;      // Coordenada Y
    value: number | null;  // Número (1-4) o null si está vacía
}
```

#### `path: { x: number; y: number }[]`
Array de coordenadas representando el camino trazado por el usuario en el orden de toque.

### Retorno

- `true` - El camino es una solución válida
- `false` - El camino no es válido

---

## 🛠️ Funciones Auxiliares

### `createTestGrid(size: number): Cell[][]`

Crea un grid vacío del tamaño especificado.

```typescript
const grid = createTestGrid(5); // Grid 5x5
```

### `placeNumbers(grid: Cell[][], positions: Array<{ x: number; y: number; value: number }>): void`

Coloca números en posiciones específicas del grid.

```typescript
placeNumbers(grid, [
    { x: 1, y: 1, value: 1 },
    { x: 3, y: 1, value: 2 },
    { x: 1, y: 3, value: 3 },
    { x: 3, y: 3, value: 4 }
]);
```

---

## 🧪 Casos de Prueba

### Casos Válidos ✅

1. **Orden correcto 1→2→3→4**
2. **Números en diferentes posiciones**
3. **Grid de cualquier tamaño NxN**

### Casos Inválidos ❌

1. **Orden incorrecto** (1→3→2→4)
2. **Celdas repetidas**
3. **Camino incompleto** (falta algún número)
4. **Celdas extra** (más de 4 celdas)
5. **Incluye celdas sin números**
6. **Path vacío**
7. **Grid sin exactamente 4 números**

---

## 🎯 Integración con el Juego

La función se integra con el componente `Grid.tsx`:

```typescript
// En el componente Grid
const handlePathComplete = (path: Cell[]) => {
    const isValid = validatePath(grid, path.map(cell => ({ x: cell.x, y: cell.y })));
    
    if (isValid) {
        // ¡Nivel completado!
        onLevelComplete();
    } else {
        // Mostrar error o pista
        showError();
    }
};
```

---

## 📊 Performance

- **Complejidad temporal**: O(n²) donde n es el tamaño del grid
- **Complejidad espacial**: O(n²) para almacenar el grid
- **Tiempo de ejecución**: < 1ms para grids típicos (5x5)

---

## 🔧 Mantenimiento

- La función es **pura** (sin efectos secundarios)
- **Fácilmente testeable** con casos unitarios
- **Documentación completa** con JSDoc
- **TypeScript** para type safety 