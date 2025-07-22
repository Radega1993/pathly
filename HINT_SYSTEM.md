# 🎯 Sistema de Pistas - Pathly

## 📋 Descripción General

El sistema de pistas ayuda a los jugadores cuando se quedan bloqueados en un nivel. Compara el camino actual del usuario con la solución correcta y proporciona feedback visual y textual.

## 🔧 Funcionamiento

### 1. **Comparación de Caminos**
- El sistema compara cada celda del camino del usuario con la solución
- Encuentra el último índice donde ambos caminos coinciden
- Determina si el usuario está en el camino correcto o se ha equivocado

### 2. **Tipos de Pistas**

#### ✅ **Camino Correcto**
- Si el usuario está siguiendo la solución correctamente
- **Ilumina**: La siguiente celda de la solución
- **Mensaje**: "Siguiente paso: Ve a la celda (X, Y)"

#### ❌ **Camino Incorrecto**
- Si el usuario se ha desviado de la solución
- **Ilumina**: La última celda correcta del camino
- **Mensaje**: "El camino es correcto hasta el paso N. Retrocede hasta esa posición y prueba otra dirección"

#### 🚀 **Sin Camino**
- Si el usuario no ha empezado
- **Ilumina**: El número 1 (punto de partida)
- **Mensaje**: "Toca el número 1 para empezar el camino"

### 3. **Validaciones**

#### 🔍 **Validaciones de Camino**
- Verifica que el camino empiece en el número 1
- Comprueba que las celdas sean adyacentes
- Detecta celdas repetidas
- Valida que la solución sea correcta

#### ⚠️ **Casos de Error**
- Solución no disponible
- Camino que salta celdas
- Celdas repetidas en el camino
- Solución que no empieza en el número 1

## 🎨 Efectos Visuales

### **Celda de Pista**
```css
- Color de fondo: #FEF3C7 (amarillo claro)
- Borde: #F59E0B (naranja) con 4px de grosor
- Sombra: Efecto de resplandor naranja
- Escala: 1.05x (ligeramente más grande)
- Duración: 5 segundos
```

### **Prioridad Visual**
1. Celda de pista (máxima prioridad)
2. Celda de inicio (número 1)
3. Celdas del camino
4. Celdas hover
5. Celdas normales

## 🔄 Flujo de Interacción

1. **Usuario presiona "💡 Pista"**
2. **Sistema calcula la pista** basada en el camino actual
3. **Se ilumina la celda sugerida** con efectos visuales
4. **Se muestra el mensaje** explicativo
5. **La pista se limpia automáticamente** después de 5 segundos
6. **La pista se limpia inmediatamente** si el usuario hace cambios

## 📊 Logs de Debug

El sistema incluye logs detallados para debugging:

```
🔍 SOLUCIÓN DEL NIVEL: [{"x": 1, "y": 1}, ...]
🔍 CALCULANDO PISTA - Camino actual: (1,1) -> (1,2)
🔍 Último índice correcto: 1 de 1
🔍 PISTA: Iluminando siguiente celda de la solución (1, 3)
```

## 🛠️ Funciones Principales

### `getHint()`: Genera el mensaje de pista
### `getSuggestedCell()`: Determina qué celda iluminar
### `findLastCorrectIndex()`: Encuentra el último punto correcto
### `handleHint()`: Maneja la interacción del botón de pista

## 🎯 Casos de Uso

### **Usuario Nuevo**
- Pista inicial: "Toca el número 1"
- Ilumina el punto de partida

### **Usuario Bloqueado**
- Pista de retroceso: "Retrocede hasta el paso X"
- Ilumina la última celda correcta

### **Usuario Avanzando**
- Pista de continuación: "Ve a la celda (X, Y)"
- Ilumina la siguiente celda de la solución

## 🔧 Configuración

### **Duración de Pista**
```javascript
setTimeout(() => {
    setHintCell(null);
}, 5000); // 5 segundos
```

### **Estilos de Pista**
```javascript
cellHint: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 4,
    shadowOpacity: 0.8,
    transform: [{ scale: 1.05 }]
}
```

## 🚀 Mejoras Futuras

- [ ] Pistas progresivas (más específicas según el nivel)
- [ ] Animaciones de pulso para la celda de pista
- [ ] Sonidos de feedback
- [ ] Estadísticas de uso de pistas
- [ ] Pistas contextuales basadas en patrones comunes 