# 🎮 Pathly - Puzzle Game

Un juego de puzzle donde debes conectar números en orden trazando un camino en un grid NxN.

## 🚀 Stack Tecnológico

- **Framework**: React Native + Expo
- **Lenguaje**: TypeScript
- **Estilo**: Minimalista moderno con paleta de colores definida

## 🎨 Paleta de Colores

- **Primario**: Azul Puzzle `#3B82F6`
- **Neutro**: Gris Claro `#E5E7EB`
- **Éxito**: Verde Neón `#22C55E`

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios

# Ejecutar en web
npm run web
```

## 🎮 Pantallas del Juego

### 🏠 Pantalla Principal
- **Menú principal** con opciones de juego, configuración y estadísticas
- **Estadísticas** de niveles completados
- **Navegación** fluida entre pantallas

### 🗺️ Pantalla de Selección de Niveles
- **Mapa visual** con isla y elementos decorativos
- **Barriles como niveles** con números y estados
- **Ticks de completado** para niveles terminados
- **Carteles "Próximamente"** para niveles bloqueados
- **Nivel actual** destacado con borde rojo
- **Caminos conectores** entre niveles
- **Progreso local** sincronizado con AsyncStorage
- **Último nivel jugado** mostrado en el header

### 🎯 Pantalla de Juego
- **Grid interactivo** específico para cada nivel
- **Configuraciones únicas** de números por nivel
- **Validación completa** del camino
- **Botón de completar** cuando el nivel está terminado
- **Progreso visual** del camino trazado
- **Guardado automático** del progreso al completar niveles
- **Indicador de nivel ya completado** anteriormente
- **Estadísticas en tiempo real** de niveles completados

## 💾 Sistema de Progreso Local

El juego utiliza AsyncStorage para guardar el progreso del usuario localmente, sin necesidad de autenticación.

### Funciones Principales

```typescript
import {
  markLevelCompleted,
  getLastLevelPlayed,
  isLevelCompleted,
  getCompletedLevelsCount,
} from './services';

// Marcar nivel como completado
await markLevelCompleted('level_123');

// Obtener último nivel jugado
const lastLevel = await getLastLevelPlayed();

// Verificar si un nivel está completado
const completed = await isLevelCompleted('level_123');

// Obtener estadísticas
const count = await getCompletedLevelsCount();
```

### Características

- **Persistencia local**: Los datos se guardan en el dispositivo
- **Manejo de errores**: Recuperación automática de datos corruptos
- **Sincronización**: Progreso actualizado en tiempo real
- **Compatibilidad**: Funciona con el sistema de niveles existente

## 🧩 Componente Grid

El componente `Grid` es el núcleo del juego. Renderiza un tablero NxN interactivo que permite al usuario trazar caminos tocando celdas.

### Props

```typescript
interface GridProps {
  grid: Cell[][];           // Array bidimensional de celdas
  onPathChange?: (path: Cell[]) => void;  // Callback cuando cambia el camino
}

interface Cell {
  value: number | null;     // Número en la celda (null si está vacía)
  x: number;                // Posición X en el grid
  y: number;                // Posición Y en el grid
}
```

### Uso Básico

```typescript
import Grid, { Cell } from './components/Grid';

// Crear un grid 5x5
const gridData: Cell[][] = [
  [
    { value: 1, x: 0, y: 0 },
    { value: null, x: 1, y: 0 },
    // ... más celdas
  ],
  // ... más filas
];

function GameScreen() {
  const handlePathChange = (path: Cell[]) => {
    console.log('Camino actual:', path);
  };

  return (
    <Grid 
      grid={gridData} 
      onPathChange={handlePathChange}
    />
  );
}
```

### Características

- ✅ **Dibujo continuo**: Mantén presionado y arrastra para dibujar el camino
- ✅ **Interactividad táctil**: Toca celdas individuales o arrastra para trazar
- ✅ **Visualización del camino**: Líneas azules conectan las celdas del camino (sin pintar celdas)
- ✅ **Números siempre visibles**: Los números se mantienen sobre el camino
- ✅ **Punto de partida y final**: Número 1 (verde) y número 4 (naranja) destacados
- ✅ **Función de retroceso**: Toca un punto anterior del camino para retroceder
- ✅ **Botón de reinicio**: Reinicia el nivel completamente
- ✅ **Sistema de pistas**: Analiza el camino y te dice dónde está el error o la siguiente celda
- ✅ **Validación de adyacencia**: Solo permite conectar celdas adyacentes
- ✅ **Experiencia móvil optimizada**: PanResponder para gestos fluidos
- ✅ **Responsive**: Se adapta al tamaño de la pantalla
- ✅ **Accesibilidad**: Botones grandes y contrastes adecuados

### Estructura de Datos

El grid se representa como un array bidimensional donde cada celda tiene:

- `value`: El número que contiene (1, 2, 3, 4...) o `null` si está vacía
- `x`, `y`: Coordenadas de posición en el grid

### Eventos

- `onPathChange`: Se ejecuta cada vez que el usuario modifica el camino trazado
- `onReset`: Se ejecuta cuando el usuario presiona el botón de reinicio
- `onHint`: Se ejecuta cuando el usuario solicita una pista
- El camino se mantiene como un array de celdas en orden de selección

### Reglas de Juego

- **Punto de partida**: Debe comenzar en el número 1 (celda verde)
- **Punto final**: Debe terminar en el número 4 (celda naranja)
- **Conexión**: Solo se pueden conectar celdas adyacentes (horizontal o vertical)
- **Dibujo continuo**: Mantén presionado y arrastra para dibujar el camino
- **Retroceso**: Toca un punto anterior del camino para retroceder hasta ese punto
- **Reinicio**: Usa el botón "🔄 Reiniciar" para empezar de nuevo
- **Pistas**: Usa el botón "💡 Pista" para obtener ayuda sobre errores o siguiente paso
- **Números visibles**: Los números siempre se mantienen visibles sobre el camino
- **Completitud**: Debe usar TODAS las celdas del grid exactamente una vez
- **Orden correcto**: Los números deben aparecer en orden 1→2→3→4 en el camino

## 🎯 Objetivo del Juego

Conectar todos los números en orden (1 → 2 → 3 → 4) usando **TODAS** las celdas del grid exactamente una vez, creando un camino continuo que pase por cada celda sin repetir ninguna.

## 📁 Estructura del Proyecto

```
Pathly/
├── components/          # Componentes UI reutilizables
│   └── Grid.tsx        # Componente principal del grid
├── screens/            # Pantallas de la aplicación
│   ├── LevelSelectScreen.tsx  # Pantalla de selección de niveles
│   └── GameScreen.tsx         # Pantalla de juego individual
├── services/           # Servicios (Firebase, etc.)
├── utils/              # Utilidades y helpers
│   └── validatePath.ts # Validación de caminos
├── store/              # Estado global (Zustand/Context)
├── App.tsx             # Componente principal con navegación
└── README.md           # Documentación
```

## 🔧 Desarrollo

### Reglas de Desarrollo

1. **Commits semánticos**: `feat(grid): añade validación de camino`
2. **Testing**: Tests unitarios para lógica del juego
3. **Performance**: Tiempo de carga < 300ms
4. **Accesibilidad**: Fuente ≥ 14px, contrastes WCAG AA

### Próximos Pasos

- [x] ✅ Validación de caminos válidos
- [x] ✅ Pantalla de selección de niveles
- [x] ✅ Sistema de progresión de niveles
- [ ] Generador de niveles con IA
- [ ] Sistema de pistas
- [ ] Integración con Firebase
- [ ] Monetización con anuncios

## 📄 Licencia

MIT License 