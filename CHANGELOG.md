# 🎮 Pathly - Changelog

## [1.2.2] - 2024-12-24

### 🔧 Bug Fixes
- **Lives System**: Fixed critical bug in the lives management system
- **Gameplay**: Resolved issues with lives not updating correctly
- **User Experience**: Improved lives display and functionality

### 📱 Technical Improvements
- **Lives Service**: Enhanced lives service reliability and stability
- **State Management**: Better synchronization of lives state
- **Performance**: Optimized lives-related operations

## [1.2.1] - 2024-12-24

### 🔧 Bug Fixes
- **Performance**: Fixed performance issues and optimized app responsiveness
- **Stability**: Improved app stability and crash prevention
- **User Experience**: Enhanced overall user experience

### 📱 Technical Improvements
- **Memory Management**: Better memory usage optimization
- **Performance**: Optimized app performance and loading times
- **Stability**: Enhanced app stability and error handling

## [1.2.0] - 2024-12-24

### ✨ New Features
- **Enhanced Gameplay**: Improved puzzle solving mechanics
- **Performance Optimization**: Better app performance and responsiveness
- **User Experience**: Enhanced overall user experience

### 🔧 Bug Fixes
- **Authentication**: Fixed authentication system issues
- **User Session**: Improved session management and persistence
- **Login Flow**: Enhanced login and registration process stability

### 📱 Technical Improvements
- **Auth Error Handling**: Better error handling for authentication failures
- **Session Persistence**: Improved session persistence across app restarts
- **Security**: Enhanced authentication security measures
- **Performance**: Optimized app performance and memory usage

## [1.1.2] - 2024-12-24

### 🔧 Bug Fixes
- **Authentication**: Fixed authentication system issues
- **User Session**: Improved session management and persistence
- **Login Flow**: Enhanced login and registration process stability

### 📱 Technical Improvements
- **Auth Error Handling**: Better error handling for authentication failures
- **Session Persistence**: Improved session persistence across app restarts
- **Security**: Enhanced authentication security measures

## [1.1.1] - 2024-12-24

### 🔧 Bug Fixes
- **App Signing**: Fixed app signing issues with Google Play Store
- **Keystore Management**: Implemented proper keystore configuration for release builds
- **Build Process**: Improved release build process with correct signing setup

### 📱 Technical Improvements
- **Google Play App Signing**: Configured proper upload keystore for Google Play App Signing
- **Build Optimization**: Enhanced build process for better compatibility
- **Release Management**: Streamlined release process with automated scripts

---

## [1.1.0] - 2024-12-24

### ✨ New Features
- **Drag and Drop System**: Implemented intuitive drag and drop functionality for connecting puzzle cells
- **Enhanced Touch Interaction**: Added smooth drag gestures for better mobile gameplay experience
- **Visual Feedback**: Real-time visual feedback during drag operations with highlighted paths
- **Improved Gameplay**: More intuitive and responsive puzzle solving mechanics

### 🎮 Gameplay Enhancements
- **Touch Gestures**: Support for drag gestures to connect numbers in sequence
- **Path Visualization**: Real-time path preview during drag operations
- **Cell Highlighting**: Visual feedback for valid and invalid connections
- **Smooth Animations**: Fluid animations for drag and drop interactions

### 🔧 Fixed
- **Touch Responsiveness**: Improved touch input handling for better device compatibility
- **Path Rendering**: Enhanced path visualization with better line connections
- **Performance**: Optimized drag and drop operations for smooth gameplay

### 🎨 UI/UX Improvements
- **Interactive Elements**: Added visual states for draggable cells
- **Feedback System**: Clear visual feedback for user actions
- **Accessibility**: Improved touch targets and interaction areas

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