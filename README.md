# 🎮 Pathly - Puzzle Game

Un juego de puzzle donde debes conectar números en orden trazando un camino en un grid NxN.

## 🏆 MVP Casi Completado - v0.9.0

**Estado actual**: MVP funcional con sistema de pistas inteligente implementado. Solo falta la integración de anuncios y pagos.

### ✅ Funcionalidades Completadas
- 🎮 **Juego completo** con grid interactivo
- 🗺️ **Sistema de niveles** con progreso local
- 🎯 **Sistema de pistas inteligente** con coordenadas corregidas
- 💾 **Persistencia de datos** con AsyncStorage
- 🎨 **UI/UX moderna** con paleta de colores definida
- 🔧 **Generador de niveles** en Python
- 📱 **Multiplataforma** (Android, iOS, Web)
- 🛡️ **Validaciones robustas** y manejo de errores
- 🎨 **Logo oficial de Pathly Game** integrado
- 🏠 **Pantalla de inicio rediseñada** con mejor UX
- 📱 **Iconos personalizados** para Google Play

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
- **Logo oficial de Pathly Game** prominente y centrado
- **Menú principal** con botón de juego destacado
- **Información del juego** organizada en tarjetas
- **Diseño moderno** con sombras y efectos visuales
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

## 🎯 Sistema de Pistas Inteligente

El sistema de pistas analiza el camino actual del usuario y lo compara con la solución correcta para proporcionar ayuda contextual.

### Características del Sistema

- **Comparación inteligente**: Analiza paso a paso el camino vs la solución
- **Pistas contextuales**: Diferentes tipos de ayuda según el estado del juego
- **Efectos visuales**: Ilumina la celda sugerida con efectos especiales
- **Coordenadas corregidas**: Sistema robusto que maneja correctamente las coordenadas del grid

### Tipos de Pistas

1. **Sin camino**: Ilumina el número 1 para empezar
2. **Camino correcto**: Ilumina la siguiente celda de la solución
3. **Camino incorrecto**: Ilumina la última celda correcta para retroceder

### Uso

```typescript
// El sistema se activa automáticamente al presionar "💡 Pista"
<Grid 
  grid={gridData}
  solution={levelSolution}
  onHint={(hint) => console.log(hint)}
/>
```

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
│   ├── Grid.tsx        # Componente principal del grid
│   └── Logo.tsx        # Componente de logo reutilizable
├── screens/            # Pantallas de la aplicación
│   ├── LevelSelectScreen.tsx  # Pantalla de selección de niveles
│   └── GameScreen.tsx         # Pantalla de juego individual
├── services/           # Servicios (Firebase, etc.)
├── utils/              # Utilidades y helpers
│   └── validatePath.ts # Validación de caminos
├── assets/             # Recursos gráficos
│   ├── logo.png        # Logo oficial de Pathly Game
│   ├── icon.png        # Icono principal de la app
│   └── ...             # Otros iconos y recursos
├── scripts/            # Scripts de automatización
│   ├── update-with-official-logo.js
│   └── verify-logo-only.js
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
- [x] ✅ Generador de niveles con IA
- [x] ✅ Sistema de pistas inteligente
- [x] ✅ Integración con Firebase
- [ ] Monetización con anuncios y pagos

## 📄 Licencia

MIT License 