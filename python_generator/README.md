# 🎮 Generador de Niveles PuzzlePath

Generador de niveles para el juego PuzzlePath usando IA (DeepSeek) que crea niveles NxN con caminos continuos válidos.

## 🚀 Características

- ✅ Generación de niveles usando IA (DeepSeek)
- ✅ Validación automática de caminos continuos
- ✅ Múltiples dificultades (easy, normal, hard, expert)
- ✅ Integración con Firebase Firestore
- ✅ Generador de fallback para casos de error
- ✅ CLI con opciones configurables

## 📋 Requisitos

- Python 3.8+
- API Key de DeepSeek
- Firebase Admin SDK configurado

## 🛠️ Instalación

1. **Clonar y navegar al directorio:**
```bash
cd python_generator
```

2. **Crear entorno virtual:**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate     # Windows
```

3. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

4. **Configurar variables de entorno:**
```bash
cp env.example .env
# Editar .env con tu DEEPSEEK_API_KEY
```

## 🔧 Configuración

### Variables de Entorno (.env)

```bash
# API Key de DeepSeek (requerido)
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Configuración de Firebase
FIREBASE_PROJECT_ID=pathly-68c8a

# Configuración de generación
DEFAULT_DIFFICULTY=normal
DEFAULT_COUNT=1
```

### Firebase Setup

1. Descarga tu `service-account-key.json` desde Firebase Console
2. Colócalo en el directorio `python_generator/`

## 🎯 Uso

### Generar un nivel simple

```bash
python generate_levels.py
```

### Generar múltiples niveles

```bash
python generate_levels.py --count 5 --difficulty normal
```

### Subir a Firebase

```bash
python generate_levels.py --count 3 --difficulty hard --upload
```

### Guardar en archivo

```bash
python generate_levels.py --count 2 --difficulty easy --output levels.json
```

### Opciones disponibles

```bash
python generate_levels.py --help
```

**Opciones:**
- `--count`: Número de niveles a generar (default: 1)
- `--difficulty`: Dificultad (easy, normal, hard, expert)
- `--upload`: Subir niveles a Firebase
- `--output`: Archivo de salida para guardar niveles

## 📊 Dificultades

| Dificultad | Grid | Números | Complejidad |
|------------|------|---------|-------------|
| Easy       | 4x4  | 3-4     | Baja        |
| Normal     | 5x5  | 4-5     | Media       |
| Hard       | 6x6  | 5-6     | Alta        |
| Expert     | 7x7  | 6-7     | Muy alta    |

## 🧪 Testing

Ejecutar pruebas del generador:

```bash
python test_generator.py
```

## 🚨 Solución de Problemas

### Error: "The query requires an index"

Si ves este error en la app, significa que Firestore necesita un índice compuesto. **Solución:**

1. **Opción 1: Crear el índice automáticamente**
   - Haz clic en el enlace que aparece en el error
   - O ve a: https://console.firebase.google.com/v1/r/project/pathly-68c8a/firestore/indexes
   - Crea el índice compuesto para `difficulty` y `createdAt`

2. **Opción 2: Usar el script de configuración rápida**
   ```bash
   python setup_levels.py
   ```
   Este script genera y sube niveles sin requerir índices complejos.

### Error: "Nested arrays are not allowed"

Este error ocurre al subir niveles a Firestore. **Solución:**

El generador ya convierte automáticamente los arrays anidados al formato correcto de Firestore:
- Grid: `[[1,2],[3,4]]` → `{"0": [1,2], "1": [3,4]}`
- Solution: `[[0,0],[1,1]]` → `[{"x": 0, "y": 0}, {"x": 1, "y": 1}]`

## 📁 Estructura del Nivel

```json
{
  "difficulty": "normal",
  "gridSize": 5,
  "grid": [
    [1, 0, 0, 0, 0],
    [0, 2, 0, 0, 0],
    [0, 0, 3, 0, 0],
    [0, 0, 0, 4, 0],
    [0, 0, 0, 0, 5]
  ],
  "solution": [
    [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
    [1, 4], [1, 3], [1, 2], [1, 1], [1, 0],
    [2, 0], [2, 1], [2, 2], [2, 3], [2, 4],
    [3, 4], [3, 3], [3, 2], [3, 1], [3, 0],
    [4, 0], [4, 1], [4, 2], [4, 3], [4, 4]
  ]
}
```

## 🔍 Validación

El generador valida automáticamente:

- ✅ Camino continuo (celdas adyacentes)
- ✅ Uso de todas las celdas del grid
- ✅ Números en orden secuencial (1 → 2 → 3 → ... → N)
- ✅ Número 1 al inicio y N al final
- ✅ Sin bifurcaciones o caminos inválidos

## 🚨 Fallback

Si la IA falla, el generador usa un algoritmo de espiral simple que garantiza niveles válidos.

## 📝 Logs

El generador muestra logs detallados:

```
🎮 Generando 3 nivel(es) de dificultad 'normal'
🔄 Generando nivel 1/3...
✅ Nivel 1 generado exitosamente
✅ Nivel subido: normal_5_1234
🔄 Generando nivel 2/3...
✅ Nivel 2 generado exitosamente
✅ Nivel subido: normal_5_5678
🔄 Generando nivel 3/3...
✅ Nivel 3 generado exitosamente
✅ Nivel subido: normal_5_9012
🎉 Proceso completado: 3 nivel(es) generado(s)
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. 