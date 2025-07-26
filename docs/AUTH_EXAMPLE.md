# 🔐 Ejemplo de Uso - Sistema de Autenticación

## 📱 Implementación Básica

### 1. Configurar el Componente Principal

```typescript
// App.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AuthModal from './components/AuthModal';
import { 
  subscribeToAuthState, 
  User, 
  AuthState 
} from './services/auth';

export default function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    // Suscribirse a cambios de autenticación
    const unsubscribe = subscribeToAuthState(setAuthState);
    return unsubscribe;
  }, []);

  const handleUserAuthenticated = (user: User) => {
    console.log('Usuario autenticado:', user.displayName);
    setShowAuthModal(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pathly Game</Text>
      
      {authState.isAuthenticated ? (
        <View>
          <Text style={styles.welcome}>
            ¡Bienvenido, {authState.user?.displayName}!
          </Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => setShowAuthModal(true)}
          >
            <Text style={styles.buttonText}>Gestionar Cuenta</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setShowAuthModal(true)}
        >
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      )}

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onUserAuthenticated={handleUserAuthenticated}
        authState={authState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#1F2937',
  },
  welcome: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#374151',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### 2. Uso Directo del Servicio

```typescript
// Ejemplo de uso directo sin el modal
import { 
  register, 
  login, 
  resetPassword, 
  signOut,
  getCurrentUser,
  isPremium 
} from './services/auth';

// Registrar un nuevo usuario
const handleRegister = async () => {
  try {
    const user = await register({
      email: 'usuario@ejemplo.com',
      password: 'contraseña123',
      displayName: 'Usuario Ejemplo'
    });
    console.log('Usuario registrado:', user);
  } catch (error) {
    console.error('Error en registro:', error);
  }
};

// Iniciar sesión
const handleLogin = async () => {
  try {
    const user = await login({
      email: 'usuario@ejemplo.com',
      password: 'contraseña123'
    });
    console.log('Usuario logueado:', user);
  } catch (error) {
    console.error('Error en login:', error);
  }
};

// Recuperar contraseña
const handleResetPassword = async () => {
  try {
    await resetPassword('usuario@ejemplo.com');
    console.log('Email de recuperación enviado');
  } catch (error) {
    console.error('Error enviando email:', error);
  }
};

// Cerrar sesión
const handleSignOut = async () => {
  try {
    await signOut();
    console.log('Sesión cerrada');
  } catch (error) {
    console.error('Error cerrando sesión:', error);
  }
};

// Verificar usuario actual
const checkCurrentUser = () => {
  const user = getCurrentUser();
  if (user) {
    console.log('Usuario actual:', user.displayName);
    console.log('Es premium:', isPremium());
  } else {
    console.log('No hay usuario autenticado');
  }
};
```

## 🎯 Casos de Uso Comunes

### 1. Proteger Rutas

```typescript
// ProtectedRoute.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from './hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { authState } = useAuth();

  if (authState.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (!authState.isAuthenticated) {
    return fallback || (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Debes iniciar sesión para acceder</Text>
      </View>
    );
  }

  return <>{children}</>;
};
```

### 2. Hook Personalizado

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { subscribeToAuthState, AuthState } from '../services/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(setAuthState);
    return unsubscribe;
  }, []);

  return { authState };
};
```

### 3. Sincronización de Progreso

```typescript
// services/progressSync.ts
import { getCurrentUser } from './auth';
import { getProgress, saveProgress } from './storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export const syncProgressToCloud = async () => {
  const user = getCurrentUser();
  if (!user) return;

  try {
    const localProgress = await getProgress();
    const userRef = doc(db, 'users', user.uid);
    
    await setDoc(userRef, {
      progress: localProgress
    }, { merge: true });
    
    console.log('Progreso sincronizado a la nube');
  } catch (error) {
    console.error('Error sincronizando progreso:', error);
  }
};

export const loadProgressFromCloud = async () => {
  const user = getCurrentUser();
  if (!user) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const cloudProgress = userData.progress;
      
      if (cloudProgress) {
        await saveProgress(cloudProgress);
        console.log('Progreso cargado desde la nube');
      }
    }
  } catch (error) {
    console.error('Error cargando progreso:', error);
  }
};
```

## 🔧 Configuración Avanzada

### 1. Personalizar Validaciones

```typescript
// utils/validation.ts
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una mayúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

### 2. Manejo de Errores Personalizado

```typescript
// utils/errorHandler.ts
export const handleAuthError = (error: any): string => {
  if (error.code === 'auth/email-already-in-use') {
    return 'Este email ya está registrado. ¿Quieres iniciar sesión?';
  }
  
  if (error.code === 'auth/weak-password') {
    return 'La contraseña es muy débil. Usa al menos 6 caracteres.';
  }
  
  if (error.code === 'auth/invalid-email') {
    return 'El formato del email no es válido.';
  }
  
  if (error.code === 'auth/user-not-found') {
    return 'No existe una cuenta con este email.';
  }
  
  if (error.code === 'auth/wrong-password') {
    return 'Contraseña incorrecta.';
  }
  
  if (error.code === 'auth/too-many-requests') {
    return 'Demasiados intentos fallidos. Intenta más tarde.';
  }
  
  return 'Ha ocurrido un error inesperado. Intenta de nuevo.';
};
```

### 3. Componente de Formulario Personalizado

```typescript
// components/CustomAuthForm.tsx
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { validateEmail, validatePassword } from '../utils/validation';
import { handleAuthError } from '../utils/errorHandler';
import { register, login } from '../services/auth';

export const CustomAuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async () => {
    // Validaciones
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Email no válido');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      Alert.alert('Error', passwordValidation.errors.join('\n'));
      return;
    }

    try {
      if (isRegistering) {
        await register({ email, password, displayName });
        Alert.alert('Éxito', 'Cuenta creada correctamente');
      } else {
        await login({ email, password });
        Alert.alert('Éxito', 'Sesión iniciada correctamente');
      }
    } catch (error) {
      const errorMessage = handleAuthError(error);
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View>
      {isRegistering && (
        <TextInput
          placeholder="Nombre completo"
          value={displayName}
          onChangeText={setDisplayName}
          style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        />
      )}
      
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      
      <TouchableOpacity onPress={handleSubmit}>
        <Text>{isRegistering ? 'Registrarse' : 'Iniciar Sesión'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
        <Text>
          {isRegistering ? '¿Ya tienes cuenta?' : '¿Crear cuenta nueva?'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

## 🚀 Próximos Pasos

1. **Implementar verificación de email** automática
2. **Añadir autenticación biométrica** para mayor seguridad
3. **Crear sistema de sincronización** de progreso en tiempo real
4. **Implementar analytics** de uso por usuario
5. **Añadir sistema de amigos** y rankings

## 📚 Recursos Adicionales

- [Documentación del Sistema de Autenticación](./AUTH_SYSTEM.md)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/) 