import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import LevelSelectScreen from './screens/LevelSelectScreen';
import GameScreen from './screens/GameScreen';
import { Level } from './types/level';

type AppScreen = 'menu' | 'levelSelect' | 'game';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('menu');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

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
              <Text style={styles.title}>🎮 Pathly</Text>
              <Text style={styles.subtitle}>Conecta los números en orden</Text>

              <View style={styles.menuButtons}>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setCurrentScreen('levelSelect')}
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

              <View style={styles.stats}>
                <Text style={styles.statsText}>
                  🎮 Conecta los números en orden para completar cada nivel
                </Text>
                <Text style={styles.statsSubText}>
                  ¡Nuevos niveles disponibles cada semana!
                </Text>
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
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 60,
    textAlign: 'center',
  },
  menuButtons: {
    width: '100%',
    maxWidth: 300,
  },
  menuButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  stats: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
  },
  statsText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  statsSubText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
});
