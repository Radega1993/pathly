import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LevelSelectScreen from './screens/LevelSelectScreen';
import GameScreen from './screens/GameScreen';
import Logo from './components/Logo';
import AudioSettings from './components/AudioSettings';
import AuthModal from './components/AuthModal';
import { Level } from './types/level';
import { adsManager } from './services/ads';
import { audioService } from './services/audio';
import { authService, User, AuthState } from './services/auth';
import { cleanupExpiredCache } from './services/levelService';

type AppScreen = 'menu' | 'levelSelect' | 'game';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('menu');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Inicializar sistemas al cargar la app
  useEffect(() => {
    const initializeServices = async () => {
      try {
        await adsManager.initialize();
        await audioService.initialize();
        // Limpiar cache expirado de niveles
        await cleanupExpiredCache();
        // Reproducir música de menú al inicio
        await audioService.playBackgroundMusic('menu');
      } catch (error) {
        console.error('Error initializing services:', error);
      }
    };

    initializeServices();

    // Suscribirse a cambios de estado de autenticación
    const unsubscribe = authService.subscribeToAuthState((state) => {
      setAuthState(state);
    });

    // Cleanup al desmontar la app
    return () => {
      audioService.cleanup();
      unsubscribe();
    };
  }, []);

  const handleLevelSelect = (level: Level) => {
    setSelectedLevel(level);
    setCurrentScreen('game');
    // Cambiar a música de juego
    audioService.playBackgroundMusic('maze');
  };

  const handleLevelComplete = (level: Level) => {
    // El progreso se maneja automáticamente en LevelSelectScreen
    // Solo volver a la selección de niveles
    setCurrentScreen('levelSelect');
    // Cambiar a música de menú
    audioService.playBackgroundMusic('menu');
  };

  const handleBack = () => {
    if (currentScreen === 'game') {
      setCurrentScreen('levelSelect');
      // Cambiar a música de menú
      audioService.playBackgroundMusic('menu');
    } else if (currentScreen === 'levelSelect') {
      setCurrentScreen('menu');
      // Cambiar a música de menú
      audioService.playBackgroundMusic('menu');
    }
  };

  const handleUserAuthenticated = (user: User) => {
    console.log('✅ User authenticated:', user.displayName);
    setShowAuthModal(false);
  };

  const handleShowAuthModal = () => {
    setShowAuthModal(true);
  };



  const renderScreen = () => {
    switch (currentScreen) {
      case 'menu':
        return (
          <SafeAreaView style={styles.container}>
            <View style={styles.header}>
              <AudioSettings />
              <TouchableOpacity
                style={styles.authButton}
                onPress={handleShowAuthModal}
                activeOpacity={0.8}
              >
                {authState.isAuthenticated ? (
                  <Ionicons name="person" size={24} color="#22C55E" />
                ) : (
                  <Ionicons name="person-outline" size={24} color="#3B82F6" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.menuContainer}>
              {/* Logo principal */}
              <View style={styles.logoContainer}>
                <Logo size="medium" showTitle={false} showSubtitle={false} />
              </View>

              {/* Botón de jugar */}
              <View style={styles.menuButtons}>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setCurrentScreen('levelSelect')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.menuButtonText}>🎯 Jugar</Text>
                </TouchableOpacity>

                {/* Botón de premium - Comentado por ahora */}
                {/*
                <TouchableOpacity
                  style={[styles.menuButton, styles.premiumButton]}
                  onPress={() => console.log('🚀 Premium features coming soon!')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.premiumButtonText}>
                    🚀 Ir Premium
                  </Text>
                </TouchableOpacity>
                */}

                {/* Botones para futuras versiones - Comentados para MVP */}
                {/*
                <TouchableOpacity style={styles.menuButton}>
                  <Text style={styles.menuButtonText}>⚙️ Configuración</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuButton}>
                  <Text style={styles.menuButtonText}>📊 Estadísticas</Text>
                </TouchableOpacity>
                */}
              </View>

              {/* Información del juego */}
              <View style={styles.gameInfo}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoTitle}>🎮 Cómo jugar</Text>
                  <Text style={styles.infoText}>
                    Conecta los números en orden para completar cada nivel
                  </Text>
                </View>

                <View style={styles.infoCard}>
                  <Text style={styles.infoTitle}>🚀 Nuevos niveles</Text>
                  <Text style={styles.infoText}>
                    ¡Nuevos niveles disponibles cada semana!
                  </Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Versión 1.0.0</Text>
              </View>
            </View>
          </SafeAreaView>
        );

      case 'levelSelect':
        return (
          <>
            <AudioSettings />
            <LevelSelectScreen
              onLevelSelect={handleLevelSelect}
              onBack={handleBack}
            />
          </>
        );

      case 'game':
        return selectedLevel ? (
          <>
            <AudioSettings />
            <GameScreen
              level={selectedLevel}
              onBack={handleBack}
              onLevelComplete={handleLevelComplete}
            />
          </>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <>
      {renderScreen()}
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onUserAuthenticated={handleUserAuthenticated}
        authState={authState}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    position: 'relative',
    height: 100,
  },
  authButton: {
    position: 'absolute',
    top: 50,
    right: 80,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },

  menuContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  menuButtons: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 40,
  },
  menuButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gameInfo: {
    width: '100%',
    maxWidth: 350,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  secondaryButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  premiumButton: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  premiumButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
