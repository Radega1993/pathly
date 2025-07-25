import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LevelSelectScreen from './screens/LevelSelectScreen';
import GameScreen from './screens/GameScreen';
import TutorialScreen from './screens/TutorialScreen';
import Logo from './components/Logo';
import AudioSettings from './components/AudioSettings';
import AuthModal from './components/AuthModal';
import { Level } from './types/level';
import { adsManager } from './services/ads';
import { audioService } from './services/audio';
import { authService, User, AuthState } from './services/auth';
import { cleanupExpiredCache } from './services/levelService';

type AppScreen = 'menu' | 'levelSelect' | 'game' | 'tutorial';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('menu');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);

  // Inicializar sistemas al cargar la app
  useEffect(() => {
    const initializeServices = async () => {
      try {
        console.log('🔄 Initializing app services...');

        // Inicializar AdMob
        await adsManager.initialize();
        console.log('✅ AdMob initialized');

        // Inicializar audio con retry
        let audioInitialized = false;
        let retryCount = 0;
        const maxRetries = 3;

        while (!audioInitialized && retryCount < maxRetries) {
          try {
            await audioService.initialize();
            audioInitialized = true;
            console.log('✅ Audio service initialized');
          } catch (error) {
            retryCount++;
            console.error(`❌ Audio initialization attempt ${retryCount} failed:`, error);
            if (retryCount < maxRetries) {
              console.log(`🔄 Retrying audio initialization in 1 second...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }

        if (!audioInitialized) {
          console.error('❌ Failed to initialize audio service after all retries');
        }

        // Limpiar cache expirado de niveles
        await cleanupExpiredCache();
        console.log('✅ Cache cleaned');

        // Reproducir música de menú al inicio (solo si el audio se inicializó correctamente)
        if (audioInitialized) {
          try {
            await audioService.playBackgroundMusic('menu');
            console.log('✅ Menu music started');
          } catch (error) {
            console.error('❌ Error playing menu music:', error);
          }
        }

        console.log('✅ All services initialized');
      } catch (error) {
        console.error('❌ Error initializing services:', error);
      }
    };

    initializeServices();

    // Suscribirse a cambios de estado de autenticación
    const unsubscribe = authService.subscribeToAuthState((state) => {
      setAuthState(state);
    });

    // Manejar cambios de estado de la app (minimizar/maximizar)
    const handleAppStateChange = async (nextAppState: string) => {
      try {
        if (nextAppState === 'active') {
          // App vuelve a estar activa - reanudar música si estaba habilitada
          console.log('🔄 App became active, resuming music...');
          if (audioService.getSettings().musicEnabled) {
            // Determinar qué música reproducir según la pantalla actual
            if (currentScreen === 'game') {
              await audioService.playBackgroundMusic('maze');
            } else {
              await audioService.playBackgroundMusic('menu');
            }
          }
        } else if (nextAppState === 'background' || nextAppState === 'inactive') {
          // App se minimiza - pausar música
          console.log('🔄 App went to background, pausing music...');
          await audioService.stopBackgroundMusic();
        }
      } catch (error) {
        console.error('❌ Error handling app state change:', error);
      }
    };

    // Suscribirse a cambios de estado de la app
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup al desmontar la app
    return () => {
      try {
        audioService.cleanup();
        unsubscribe();
        appStateSubscription?.remove();
      } catch (error) {
        console.error('❌ Error during cleanup:', error);
      }
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

  const handleShowAudioSettings = () => {
    setShowAudioSettings(true);
  };

  const handleCloseAudioSettings = () => {
    setShowAudioSettings(false);
  };

  const handleShowTutorial = () => {
    console.log('🔍 handleShowTutorial called');
    setCurrentScreen('tutorial');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'menu':
        return (
          <SafeAreaView style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.audioButton}
                onPress={handleShowAudioSettings}
                activeOpacity={0.8}
              >
                <Ionicons name="settings-outline" size={24} color="#3B82F6" />
              </TouchableOpacity>
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
                <TouchableOpacity style={styles.tutorialCard} onPress={handleShowTutorial}>
                  <View style={styles.tutorialIcon}>
                    <Text style={styles.tutorialIconText}>📚</Text>
                  </View>
                  <View style={styles.tutorialContent}>
                    <Text style={styles.tutorialTitle}>🎮 Cómo jugar</Text>
                    <Text style={styles.tutorialText}>
                      Aprende las reglas y estrategias del juego
                    </Text>
                    <Text style={styles.tutorialButton}>Toca para ver el tutorial →</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.infoCard}>
                  <Text style={styles.infoTitle}>🚀 Nuevos niveles</Text>
                  <Text style={styles.infoText}>
                    ¡Nuevos niveles disponibles cada semana!
                  </Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Versión 1.0.3</Text>
              </View>
            </View>
          </SafeAreaView>
        );

      case 'levelSelect':
        return (
          <LevelSelectScreen
            onLevelSelect={handleLevelSelect}
            onBack={handleBack}
            onShowAudioSettings={handleShowAudioSettings}
          />
        );

      case 'game':
        return selectedLevel ? (
          <GameScreen
            level={selectedLevel}
            onBack={handleBack}
            onLevelComplete={handleLevelComplete}
            onShowAudioSettings={handleShowAudioSettings}
          />
        ) : null;

      case 'tutorial':
        return (
          <TutorialScreen
            onBack={handleBack}
          />
        );

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
      <AudioSettings
        visible={showAudioSettings}
        onClose={handleCloseAudioSettings}
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
    height: 120, // Aumentado de 100 a 120
    paddingTop: 20, // Añadir padding superior
    paddingHorizontal: 20, // Añadir padding horizontal
  },
  audioButton: {
    position: 'absolute',
    top: 60, // Aumentado de 50 a 60
    left: 20, // Reducido de 80 a 20 para usar el padding del header
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
  authButton: {
    position: 'absolute',
    top: 60, // Aumentado de 50 a 60
    right: 20, // Reducido de 80 a 20 para usar el padding del header
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
    paddingHorizontal: 20,
    paddingTop: 20, // Añadir padding superior
    paddingBottom: 40, // Aumentar padding inferior
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20, // Reducido de 40 a 20
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
  tutorialCard: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tutorialIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  tutorialIconText: {
    fontSize: 24,
  },
  tutorialContent: {
    flex: 1,
  },
  tutorialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  tutorialText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  tutorialButton: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 40, // Aumentado de 20 a 40
    paddingBottom: 20, // Añadir padding inferior adicional
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
