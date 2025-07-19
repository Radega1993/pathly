# Pathly Frontend

## 🎮 Estructura del Proyecto

```
frontend/
├── components/          # Componentes reutilizables
│   ├── Button.tsx      # Botón personalizado
│   └── index.ts        # Exportaciones de componentes
├── screens/            # Pantallas principales
│   ├── LoginScreen.tsx # Pantalla de inicio de sesión
│   ├── HomeScreen.tsx  # Pantalla principal
│   ├── LevelScreen.tsx # Pantalla de juego
│   └── ProfileScreen.tsx # Pantalla de perfil
├── types/              # Tipos TypeScript
│   └── navigation.ts   # Tipos de navegación
├── utils/              # Utilidades
│   └── colors.ts       # Paleta de colores
├── App.tsx             # Componente principal con navegación
├── package.json        # Dependencias del proyecto
└── README.md           # Este archivo
```

## 🚀 Rutas Principales

1. **Login** - Pantalla de inicio de sesión
2. **Home** - Menú principal con opciones
3. **Level** - Pantalla de juego con tablero
4. **Profile** - Perfil del usuario y estadísticas

## 🎨 Paleta de Colores

- **Primario**: `#3B82F6` (Azul Puzzle)
- **Neutro**: `#E5E7EB` (Gris Claro)
- **Éxito**: `#22C55E` (Verde Neón)
- **Blanco**: `#FFFFFF`

## 📱 Cómo Ejecutar

```bash
cd frontend
npm install
npm start
```

## 🔧 Estado Actual

✅ **Sprint 1 Completado**:
- Estructura de directorios creada
- Rutas principales definidas (Login, Home, Level, Profile)
- Navegación entre pantallas implementada
- Componentes básicos creados
- Paleta de colores definida

⏳ **Próximos Pasos**:
- Implementar lógica de autenticación
- Crear tablero de juego
- Integrar con backend
- Añadir animaciones y efectos 