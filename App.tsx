import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import LevelSelectScreen from './screens/LevelSelectScreen';
import GameScreen from './screens/GameScreen';
import Logo from './components/Logo';
import { Level } from './types/level';
import { adsManager } from './services/ads';

type AppScreen = 'menu' | 'levelSelect' | 'game';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('menu');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  // Inicializar sistema de anuncios al cargar la app
  useEffect(() => {
    const initializeAds = async () => {
      try {
        await adsManager.initialize();
      } catch (error) {
        console.error('Error initializing ads:', error);
      }
    };

    initializeAds();
  }, []);

  const handleLevelSelect = (level: Level) => {
    setSelectedLevel(level);
    setCurrentScreen('game');
  };

  const handleLevelComplete = (level: Level) => {
    // El progreso se maneja automáticamente en LevelSelectScreen
    // Solo volver a la selección de niveles
    setCurrentScreen('levelSelect');
  };

  const handleBack = () => {
    if (currentScreen === 'game') {
      setCurrentScreen('levelSelect');
    } else if (currentScreen === 'levelSelect') {
      setCurrentScreen('menu');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'menu':
        return (
          <SafeAreaView style={styles.container}>
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
          <LevelSelectScreen
            onLevelSelect={handleLevelSelect}
            onBack={handleBack}
          />
        );

      case 'game':
        return selectedLevel ? (
          <GameScreen
            level={selectedLevel}
            onBack={handleBack}
            onLevelComplete={handleLevelComplete}
          />
        ) : null;

      default:
        return null;
    }
  };

  return renderScreen();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
});
