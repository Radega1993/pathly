# 🎮 Generador de Producción para PuzzlePath

Generador robusto de puzzles tipo Zip para producción, con integración automática a Firebase y numeración secuencial de niveles.

## 🚀 Características Principales

- ✅ **Sin IA** - Algoritmos puros de Python
- ✅ **Integración Firebase** - Subida automática a la base de datos
- ✅ **Numeración automática** - Asigna números de nivel secuenciales
- ✅ **Validación completa** - Verifica que los puzzles sean solucionables
- ✅ **CLI completo** - Interfaz de línea de comandos con opciones
- ✅ **Formato compatible** - Salida estándar para el juego PuzzlePath

## 📋 Requisitos

- Python 3.8+
- Firebase Admin SDK configurado
- Archivo `service-account-key.json` en el directorio

## 🛠️ Instalación Rápida

1. **Configurar entorno:**
```bash
python setup.py
```

2. **Generar un puzzle:**
```bash
python production_generator.py
```

## 🎯 Uso Básico

### Generar y subir un puzzle
```bash
python production_generator.py
```

### Generar múltiples puzzles
```bash
python production_generator.py --count 5
```

### Generar puzzle específico
```bash
python production_generator.py --size 6 --numbers 6
```

### Generar sin subir a Firebase
```bash
python production_generator.py --no-upload
```

## 📊 Opciones Disponibles

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

## 📁 Estructura del Proyecto

```
python_generator/
├── production_generator.py    # Generador principal
├── setup.py                   # Script de configuración
├── test_production.py         # Script de pruebas
├── README_PUZZLE_GENERATOR.md # Documentación completa
├── service-account-key.json   # Credenciales Firebase
├── requirements.txt           # Dependencias
└── venv/                     # Entorno virtual
```

## 🔍 Algoritmo

1. **Creación de Matriz** - Genera matriz NxN vacía
2. **Selección de Puntos** - Punto de inicio y fin aleatorios
3. **Búsqueda de Camino** - Algoritmo de backtracking optimizado
4. **Validación** - Verifica camino continuo y números en orden
5. **Numeración** - Asigna número de nivel secuencial
6. **Subida** - Convierte formato y sube a Firebase

## 📊 Dificultades

| Dificultad | Tamaño | Números | Complejidad |
|------------|--------|---------|-------------|
| Muy Fácil  | 3x3    | 3       | Muy baja     |
| Fácil      | 4x4    | 4       | Baja         |
| Normal     | 5x5    | 5       | Media        |
| Difícil    | 6x6    | 6       | Alta         |
| Extremo    | 7x7+   | 7+      | Muy alta     |

## 🧪 Testing

```bash
# Probar generador
python test_production.py

# Probar sin subir a Firebase
python production_generator.py --no-upload
```

## 📝 Ejemplo de Salida

```json
{
  "difficulty": "normal",
  "gridSize": 4,
  "level": 1,
  "grid": [
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

## 🔥 Integración Firebase

- **Numeración automática**: Obtiene el siguiente número de nivel disponible
- **Formato compatible**: Convierte arrays a formato Firestore
- **Metadatos**: Añade timestamps y estado activo
- **IDs únicos**: Genera IDs con formato `level_XXXX`

## 🚨 Limitaciones

- **Puzzles grandes**: Para matrices 7x7+ puede tardar más tiempo
- **Complejidad**: Algunas configuraciones pueden no tener solución
- **Firebase**: Requiere conexión a internet para subir

## 📄 Documentación Completa

Para más detalles, consulta: [README_PUZZLE_GENERATOR.md](README_PUZZLE_GENERATOR.md)

## 🤝 Integración con el Juego

Los puzzles generados son compatibles directamente con PuzzlePath:

1. **Formato JSON**: Estructura idéntica a la esperada
2. **Validación**: Puzzles verificados como solucionables
3. **Dificultad**: Sistema de dificultad integrado
4. **Solución**: Camino completo proporcionado
5. **Numeración**: Niveles secuenciales automáticos

## 📄 Licencia

Este proyecto está bajo la licencia MIT. 