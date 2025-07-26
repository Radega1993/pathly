# 🔐 Sistema de Autenticación - Pathly Game

## 📋 Resumen

El sistema de autenticación de Pathly Game utiliza Firebase Auth con email/contraseña para proporcionar una experiencia de usuario segura y persistente. El sistema reemplaza la autenticación de Google que no funcionaba correctamente.

## 🎯 Características Principales

### ✅ Funcionalidades Implementadas

- **Registro de usuarios** con validación de datos
- **Inicio de sesión** con manejo de errores
- **Recuperación de contraseña** por email
- **Persistencia de sesión** automática
- **Logout seguro** con confirmación
- **Validaciones robustas** de seguridad
- **Manejo de errores** específicos de Firebase

### 🔒 Políticas de Seguridad

- **Contraseñas mínimas**: 6 caracteres
- **Validación de email**: Formato correcto requerido
- **Límite de intentos**: Protección contra ataques de fuerza bruta
- **Tokens seguros**: Firebase maneja la seguridad de tokens
- **Persistencia local**: Sesión mantenida hasta logout explícito
- **Validación de datos**: Sanitización de inputs

## 🏗️ Arquitectura del Sistema

### Servicio de Autenticación (`services/auth.ts`)

```typescript
class AuthService {
  // Singleton pattern para instancia única
  private static instance: AuthService;
  
  // Estado interno
  private currentUser: User | null = null;
  private authStateListeners: ((state: AuthState) => void)[] = [];
  private isInitialized = false;
}
```

### Interfaces Principales

```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  userType: 'free' | 'monthly' | 'lifetime';
  createdAt: number;
  lastLoginAt: number;
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  displayName: string;
}
```

## 🚀 Funciones Principales

### Registro de Usuario

```typescript
async register(credentials: RegisterCredentials): Promise<User>
```

**Validaciones:**
- Email válido con formato correcto
- Contraseña mínima de 6 caracteres
- Nombre de usuario mínimo de 2 caracteres

**Proceso:**
1. Validar credenciales
2. Crear usuario en Firebase Auth
3. Crear documento en Firestore
4. Actualizar estado local
5. Notificar cambios

### Inicio de Sesión

```typescript
async login(credentials: LoginCredentials): Promise<User>
```

**Validaciones:**
- Email válido
- Contraseña no vacía

**Proceso:**
1. Validar credenciales
2. Autenticar con Firebase
3. Cargar datos desde Firestore
4. Actualizar último login
5. Actualizar estado local

### Recuperación de Contraseña

```typescript
async resetPassword(email: string): Promise<void>
```

**Proceso:**
1. Validar email
2. Enviar email de recuperación
3. Notificar al usuario

### Cerrar Sesión

```typescript
async signOut(): Promise<void>
```

**Proceso:**
1. Cerrar sesión de Firebase
2. Limpiar datos locales
3. Notificar cambios

## 🎨 Componente de UI (`components/AuthModal.tsx`)

### Modos de Operación

- **Login**: Formulario de inicio de sesión
- **Register**: Formulario de registro
- **ResetPassword**: Formulario de recuperación
- **UserProfile**: Perfil del usuario autenticado

### Características de UI

- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Accesible**: Soporte para teclado y lectores de pantalla
- **Validación en tiempo real**: Feedback inmediato al usuario
- **Estados de carga**: Indicadores visuales durante operaciones
- **Manejo de errores**: Mensajes claros y específicos

## 💾 Persistencia de Datos

### AsyncStorage

```typescript
// Guardar sesión
await AsyncStorage.setItem('user_session', JSON.stringify(user));

// Cargar sesión
const sessionData = await AsyncStorage.getItem('user_session');

// Limpiar sesión
await AsyncStorage.removeItem('user_session');
```

### Firestore

```typescript
// Estructura del documento de usuario
{
  uid: string;
  email: string;
  displayName: string;
  userType: 'free' | 'monthly' | 'lifetime';
  createdAt: number;
  lastLoginAt: number;
  isEmailVerified: boolean;
  progress: {
    completedLevels: string[];
    lastPlayedLevel: string | null;
    totalLevelsCompleted: number;
  }
}
```

## 🔄 Flujo de Autenticación

### 1. Inicialización de la App

```typescript
// El servicio se inicializa automáticamente
const authService = AuthService.getInstance();

// Se configura el listener de Firebase
onAuthStateChanged(auth, async (firebaseUser) => {
  // Manejar cambios de estado
});
```

### 2. Persistencia de Sesión

```typescript
// Al iniciar la app, verificar si hay sesión guardada
const savedUser = await loadSessionFromStorage();
if (savedUser) {
  // Restaurar sesión
}
```

### 3. Cambios de Estado

```typescript
// Suscribirse a cambios
const unsubscribe = subscribeToAuthState((state) => {
  // Actualizar UI según el estado
  if (state.isAuthenticated) {
    // Usuario autenticado
  } else {
    // Usuario no autenticado
  }
});
```

## 🛡️ Manejo de Errores

### Errores de Firebase

```typescript
// Errores específicos manejados
const errorMessages = {
  'auth/email-already-in-use': 'El email ya está registrado',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
  'auth/invalid-email': 'El email no es válido',
  'auth/user-not-found': 'Usuario no encontrado',
  'auth/wrong-password': 'Contraseña incorrecta',
  'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde'
};
```

### Validaciones del Cliente

```typescript
private validateCredentials(credentials: LoginCredentials | RegisterCredentials): void {
  if (!credentials.email || !credentials.email.includes('@')) {
    throw new Error('Email no válido');
  }

  if (!credentials.password || credentials.password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }

  if ('displayName' in credentials && (!credentials.displayName || credentials.displayName.trim().length < 2)) {
    throw new Error('El nombre debe tener al menos 2 caracteres');
  }
}
```

## 📱 Integración con la App

### Uso en Componentes

```typescript
import { authService, subscribeToAuthState } from '../services/auth';

function App() {
  const [authState, setAuthState] = useState({ isAuthenticated: false, user: null });

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(setAuthState);
    return unsubscribe;
  }, []);

  return (
    <AuthModal
      visible={showAuthModal}
      onClose={() => setShowAuthModal(false)}
      onUserAuthenticated={(user) => {
        console.log('Usuario autenticado:', user);
      }}
      authState={authState}
    />
  );
}
```

## 🔧 Configuración Requerida

### Variables de Entorno

```bash
# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### Firebase Console

1. **Habilitar Authentication** con Email/Password
2. **Configurar Firestore** con reglas de seguridad
3. **Configurar plantillas de email** para recuperación de contraseña

## 🚀 Próximos Pasos

### Funcionalidades Futuras

- [ ] **Verificación de email** automática
- [ ] **Autenticación biométrica** (Face ID, Touch ID)
- [ ] **Sincronización de progreso** en tiempo real
- [ ] **Múltiples dispositivos** con sincronización
- [ ] **Analytics de uso** por usuario
- [ ] **Sistema de amigos** y rankings

### Mejoras de Seguridad

- [ ] **Autenticación de dos factores** (2FA)
- [ ] **Detección de dispositivos** sospechosos
- [ ] **Límites de rate** más estrictos
- [ ] **Auditoría de sesiones** detallada

## 📚 Referencias

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [OWASP Authentication Guidelines](https://owasp.org/www-project-authentication-cheat-sheet/) 