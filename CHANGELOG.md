# 🎮 Pathly - Changelog

## [1.1.0] - 2024-01-XX

### 🔧 Fixed
- **Conexión de caminos**: Arreglado el sistema de renderizado de líneas para que las celdas del camino se conecten correctamente
- **Líneas más visibles**: Aumentado el grosor de las líneas de 4px a 6px para mejor visibilidad
- **Posicionamiento mejorado**: Ajustado el posicionamiento de las líneas para que se conecten desde los bordes de las celdas
- **Código simplificado**: Eliminadas funciones complejas y redundantes de renderizado de líneas

### 🎨 UI/UX Improvements
- **Líneas redondeadas**: Añadido `borderRadius: 2` a las líneas para un aspecto más moderno
- **Mejor conectividad**: Las líneas ahora se extienden ligeramente más allá del centro para mejor conexión visual
- **Código más limpio**: Eliminadas las funciones `getPathDirection`, `getLineDirection`, `getAdjustedPathDirection`, `getPreviousCellDirection` y `shouldUpdatePreviousCell`

### 🧹 Code Cleanup
- Eliminados estilos de esquinas (`cornerLine`, `corner-top-left`, etc.) que ya no se usan
- Simplificada la lógica de renderizado de líneas con funciones más claras:
  - `renderLineToCell()`: Renderiza línea desde la celda actual hacia la siguiente
  - `renderLineFromCell()`: Renderiza línea desde la celda anterior hacia la actual
  - `getDirection()`: Función simple para determinar la dirección entre dos celdas

### 🔄 Breaking Changes
- Ninguno. Los cambios son internos y no afectan la API del componente.

---

## [1.0.0] - 2024-01-XX

### ✨ Initial Release
- Componente Grid funcional con validación de caminos
- Sistema de pistas y retroceso
- Interfaz táctil optimizada para móviles
- Paleta de colores minimalista moderna 