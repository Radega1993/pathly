# 🧩 Pathly

**Piensa. Conecta. Gana.**

Pathly es un juego de lógica minimalista donde tu objetivo es conectar los números en el orden correcto, usando todas las celdas del tablero… y sin equivocarte.

## 🎮 Concepto del Juego

- **Tablero con celdas numéricas** (1 → 2 → 3 → 4)
- **Solo hay un camino correcto**
- **Cada celda debe ser usada exactamente una vez**
- **Niveles infinitos** gracias a un generador automático con IA
- **Cuatro niveles de dificultad**: Fácil, Normal, Difícil, Extremo

## 🚀 Stack Tecnológico Completo

### Frontend
- **Framework**: React Native + Expo
- **Estado**: Zustand
- **Navegación**: React Navigation
- **Autenticación**: Firebase Auth

### Backend
- **Framework**: NestJS (API REST)
- **Base de datos**: Firebase Firestore
- **Autenticación**: Firebase Admin
- **Documentación**: Swagger

### Generador de Niveles
- **Framework**: FastAPI (Python)
- **IA**: OpenAI GPT-3.5-turbo
- **Base de datos**: Firebase Firestore
- **Autenticación**: Firebase Admin

### Infraestructura
- **Base de datos**: Firebase Firestore (NoSQL)
- **Autenticación**: Firebase Auth (Google + Email)
- **Anuncios y pagos**: AdMob + RevenueCat (próximamente)
- **Deployment**: Expo + Google Play Console + App Store Connect

## 📱 Características Destacadas

- 🎮 **Juego sin distracciones**: limpio, elegante y desafiante
- 🧠 **Entrena tu lógica y concentración**
- 🔄 **Niveles nuevos cada semana** (generados por IA)
- 📈 **Guarda tu progreso** con login
- 🆓 **1 pista gratis por nivel** (más a cambio de anuncios)
- 🚫 **Suscripción opcional** sin anuncios y con pistas ilimitadas

## 🎨 Diseño y UX

- **Estilo minimalista moderno** con fondo blanco y líneas grises
- **Paleta de 3 colores**:
  - Primario: Azul Puzzle `#3B82F6`
  - Neutro: Gris Claro `#E5E7EB`
  - Éxito: Verde Neón `#22C55E`
- **Modo oscuro opcional** para accesibilidad
- **Layout mobile-only** (no responsive necesario)
- **Animaciones suaves** al conectar celdas
- **Accesibilidad mínima**: fuente ≥ 14px, botones grandes y contrastes WCAG AA

## 💰 Plan de Monetización

- **Versión gratuita** con anuncios
- **1,99€/mes** o **10€ único** para eliminar anuncios y desbloquear pistas ilimitadas

## 🏗️ Estructura del Proyecto

```
Pathly/
├── frontend/                 # React Native + Expo
│   ├── components/          # Elementos UI reutilizables
│   ├── screens/            # Pantallas de la aplicación
│   ├── services/           # Firebase y servicios externos
│   ├── store/              # Estado global (Zustand)
│   ├── utils/              # Colores y utilidades
│   └── types/              # Tipos TypeScript
│
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Autenticación y JWT
│   │   ├── user/           # Gestión de usuarios
│   │   ├── levels/         # Endpoints de niveles
│   │   └── shared/         # Pipes, DTOs, interceptors
│   └── package.json
│
├── generator/               # FastAPI + Python + IA
│   ├── main.py             # Servidor principal
│   ├── level_generator.py  # Lógica de generación con IA
│   ├── auth_middleware.py  # Autenticación Firebase
│   ├── requirements.txt    # Dependencias Python
│   └── venv/              # Entorno virtual
│
└── README.md              # Documentación
```

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Node.js (versión 18 o superior)
- Python 3.8+
- npm o yarn
- Expo CLI
- Cuenta de Firebase
- Cuenta de OpenAI (para el generador de niveles)

### 1. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un proyecto llamado `pathly-game`
3. Habilita Authentication (Google + Email)
4. Habilita Firestore Database
5. Crea una app web y copia las credenciales
6. Descarga la clave de servicio para el backend y generador

### 2. Configurar Frontend

```bash
cd frontend
cp env.example .env
# Editar .env con tus credenciales de Firebase
npm install
```

### 3. Configurar Backend

```bash
cd backend
cp env.example .env
# Editar .env con tus credenciales de Firebase
npm install
```

### 4. Configurar Generador

```bash
cd generator
cp env.example .env
# Editar .env con tus credenciales de OpenAI y Firebase
source venv/bin/activate
pip install -r requirements.txt
```

### 5. Variables de Entorno Necesarias

#### Frontend (.env)
```env
EXPO_PUBLIC_FIREBASE_API_KEY=tu_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

#### Backend (.env)
```env
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/serviceAccountKey.json
FRONTEND_URL=http://localhost:3000
PORT=3001
```

#### Generador (.env)
```env
OPENAI_API_KEY=tu_openai_api_key
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/serviceAccountKey.json
HOST=0.0.0.0
PORT=8000
```

## 🚀 Ejecutar el Proyecto

### Desarrollo Local

1. **Iniciar Backend:**
```bash
cd backend
npm run start:dev
```

2. **Iniciar Generador:**
```bash
cd generator
source venv/bin/activate
python main.py
```

3. **Iniciar Frontend:**
```bash
cd frontend
npm start
```

### URLs de Desarrollo

- **Frontend**: http://localhost:3000 (Expo)
- **Backend**: http://localhost:3001
- **Generador**: http://localhost:8000
- **Documentación API**: http://localhost:3001/api

## 🔄 Flujo de Trabajo y Git

### Branching Strategy

- `main`: rama estable (solo merge de versiones listas)
- `dev`: rama de desarrollo activa
- `feature/<nombre>`: nuevas funcionalidades
- `fix/<nombre>`: corrección de errores

### Convención de Commits (Semantic Commits)

```bash
feat(game): añade validación de camino
fix(auth): corrige error de logout automático
refactor(ui): simplifica botón de pista
test(level): añade test para generador extremo
```

## 📋 Roadmap

### Sprint 1: Setup técnico y login de usuario ✅
- [x] Stack final: React Native + Firebase
- [x] Crear repositorio y estructura base del proyecto
- [x] Definir rutas principales: Login, Home, Nivel, Perfil
- [x] Backend NestJS configurado
- [x] Generador Python + FastAPI configurado

### Sprint 2: Lógica del juego y tablero
- [ ] Implementar tablero de juego en frontend
- [ ] Lógica de conexión de celdas
- [ ] Validación de caminos
- [ ] Integración con generador de niveles

### Sprint 3: Generador de niveles con IA
- [ ] Integración completa con OpenAI
- [ ] Diferentes niveles de dificultad
- [ ] Cache de niveles generados
- [ ] Validación automática de niveles

### Sprint 4: Monetización y anuncios
- [ ] Integración con AdMob
- [ ] Sistema de pistas
- [ ] Integración con RevenueCat
- [ ] Planes de suscripción

### Sprint 5: Pulido y lanzamiento
- [ ] Testing exhaustivo
- [ ] Optimización de performance
- [ ] Preparación para stores
- [ ] Lanzamiento beta

## 🛡️ Reglas de Seguridad

1. **Backend con validaciones** en `DTO + Pipes` (NestJS)
2. **Escapar siempre los datos** antes de renderizarlos en frontend
3. **Verificación de payloads** del generador IA antes de renderizar
4. **Límite de peticiones**: 5 niveles nuevos por minuto por IP
5. **Solo permitir orígenes** de frontend registrados en producción

## ⚡ Reglas de Performance

1. **Tiempo máximo de carga del nivel**: **300 ms**
2. **Generador de niveles IA** con respuesta en < 1s
3. **Cachear los niveles generados** durante 24h
4. **Lazy loading** de pantallas en React Native
5. **App size < 30 MB**

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Contacto

- **Desarrollador**: [Tu Nombre]
- **Email**: [tu-email@ejemplo.com]
- **Proyecto**: [https://github.com/tu-usuario/Pathly](https://github.com/tu-usuario/Pathly)

---

**"Un solo camino. ¿Podrás encontrarlo?"** 🧩 