# 🎮 Generador de Producción para PuzzlePath

Generador robusto de puzzles tipo Zip para producción, con integración automática a Firebase. Crea puzzles donde el jugador debe conectar números en orden pasando por todas las celdas exactamente una vez.

## 🚀 Características

- ✅ **Sin dependencias de IA** - Algoritmos puros de Python
- ✅ **Integración Firebase** - Subida automática a la base de datos
- ✅ **Numeración automática** - Asigna números de nivel secuenciales
- ✅ **Generación robusta** - Algoritmo de backtracking optimizado
- ✅ **Múltiples dificultades** - Muy fácil, fácil, normal, difícil, extremo
- ✅ **Validación automática** - Verifica que los puzzles sean solucionables
- ✅ **CLI completo** - Interfaz de línea de comandos con opciones
- ✅ **Formato JSON** - Salida estándar compatible con el juego

## 📋 Requisitos

- Python 3.8+
- Firebase Admin SDK configurado
- Archivo `service-account-key.json` en el directorio

## 🎯 Uso Rápido

### Generar y subir un puzzle a Firebase

```bash
python production_generator.py
```

### Generar múltiples puzzles

```bash
python production_generator.py --size 4 --numbers 4 --count 5
```

### Generar sin subir a Firebase

```bash
python production_generator.py --size 6 --numbers 6 --no-upload
```

### Generar y guardar en archivo

```bash
python production_generator.py --size 5 --numbers 5 --count 3 --output levels.json
```

## 📊 Opciones del CLI

```bash
python production_generator.py [OPCIONES]

Opciones:
  --size SIZE        Tamaño de la matriz (3-8, default: 4)
  --numbers NUMBERS  Número de números en el puzzle (2-N², default: 4)
  --count COUNT      Número de puzzles a generar (default: 1)
  --output OUTPUT    Archivo de salida (opcional)
  --no-upload        No subir a Firebase (solo generar)
  --seed SEED        Semilla para reproducibilidad
```

## 🧪 Testing

### Probar generador de producción

```bash
python test_production.py
```

### Probar generación sin subir a Firebase

```bash
python production_generator.py --no-upload
```

## 📁 Estructura del Puzzle

```json
{
  "difficulty": "normal",
  "gridSize": 4,
  "puzzle": [
    [1, 0, 0, 0],
    [0, 2, 0, 0],
    [0, 0, 3, 0],
    [4, 0, 0, 0]
  ],
  "solution": [
    [0,0], [0,1], [0,2], [0,3], [1,3], [1,2], [1,1], [1,0],
    [2,0], [2,1], [2,2], [2,3], [3,3], [3,2], [3,1], [3,0]
  ]
}
```

## 🔍 Algoritmo

### 1. Creación de Matriz
- Genera una matriz NxN vacía

### 2. Selección de Puntos
- Selecciona aleatoriamente punto de inicio y fin diferentes

### 3. Búsqueda de Camino Hamiltoniano
- Usa backtracking con heurísticas optimizadas
- Busca camino que recorra todas las celdas sin repetir
- Solo movimientos horizontales y verticales

### 4. Validación y Numeración
- Verifica que el camino sea válido
- Coloca números secuenciales (1, 2, 3, ..., N)
- Distribuye números uniformemente por el camino

### 5. Cálculo de Dificultad
- Factor de tamaño de matriz
- Factor de densidad de números
- Factor de eficiencia del camino

## 📊 Dificultades

| Dificultad | Tamaño Típico | Números | Complejidad |
|------------|---------------|---------|-------------|
| Muy Fácil  | 3x3           | 3       | Muy baja     |
| Fácil      | 4x4           | 4       | Baja         |
| Normal     | 5x5           | 5       | Media        |
| Difícil    | 6x6           | 6       | Alta         |
| Extremo    | 7x7+          | 7+      | Muy alta     |

## 🔧 Uso Programático

```python
from production_generator import ProductionPuzzleGenerator

# Crear generador
generator = ProductionPuzzleGenerator()

# Generar puzzle
puzzle = generator.generate_puzzle(size=4, num_numbers=4)

if puzzle:
    print(f"Dificultad: {puzzle['difficulty']}")
    print(f"Nivel: {puzzle['level']}")
    print(f"Puzzle: {puzzle['grid']}")
    print(f"Solución: {puzzle['solution']}")
    
    # Subir a Firebase
    generator.upload_to_firebase(puzzle)
```

## 🚨 Limitaciones

- **Puzzles grandes**: Para matrices 7x7+ puede tardar más tiempo
- **Complejidad**: Algunas configuraciones pueden no tener solución
- **Aleatoriedad**: Los puzzles generados son aleatorios

## 🎯 Ejemplos de Uso

### Generar y subir un puzzle

```bash
python production_generator.py --size 4 --numbers 4
```

### Generar conjunto de puzzles

```bash
python production_generator.py --size 5 --numbers 5 --count 10
```

### Generar puzzle reproducible

```bash
python production_generator.py --size 4 --numbers 4 --seed 12345
```

### Generar para testing (sin subir)

```bash
python production_generator.py --size 4 --numbers 4 --no-upload --output test.json
```

## 📝 Logs

El generador muestra logs detallados:

```
🎮 Generador de Puzzles Tipo Zip
📊 Configuración: 4x4, 4 números
🎯 Generando 3 puzzle(s)...

🔄 Generando puzzle 1/3...
📍 Inicio: (3, 2), Fin: (0, 2)
✅ Camino encontrado: 16 pasos
✅ Puzzle generado: normal

🎉 Proceso completado:
   ✅ Puzzles generados: 3
   💾 Guardados en: puzzles.json
   📊 Distribución de dificultades:
      normal: 3
```

## 🤝 Integración con el Juego

Los puzzles generados son compatibles directamente con el juego PuzzlePath:

1. **Formato JSON**: Estructura idéntica a la esperada
2. **Validación**: Puzzles verificados como solucionables
3. **Dificultad**: Sistema de dificultad integrado
4. **Solución**: Camino completo proporcionado

## 🔄 Características de Producción

| Aspecto | Característica |
|---------|----------------|
| Velocidad | Rápida (<1s por puzzle) |
| Calidad | Alta y consistente |
| Integración | Firebase automática |
| Numeración | Secuencial automática |
| Validación | Completa y robusta |
| Costo | Gratis (sin APIs externas) |

## 📄 Licencia

Este proyecto está bajo la licencia MIT. 