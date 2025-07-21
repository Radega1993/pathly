import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import LevelSelectScreen from './screens/LevelSelectScreen';
import GameScreen from './screens/GameScreen';

type Screen = 'menu' | 'levelSelect' | 'game';

interface Level {
  id: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [levels, setLevels] = useState<Level[]>([
    { id: 1, isUnlocked: true, isCompleted: true, isCurrent: false },
    { id: 2, isUnlocked: true, isCompleted: false, isCurrent: false },
    { id: 3, isUnlocked: true, isCompleted: false, isCurrent: true },
    { id: 4, isUnlocked: true, isCompleted: false, isCurrent: false },
    { id: 5, isUnlocked: true, isCompleted: false, isCurrent: false },
    { id: 6, isUnlocked: true, isCompleted: false, isCurrent: false },
    { id: 7, isUnlocked: true, isCompleted: false, isCurrent: false },
    { id: 8, isUnlocked: false, isCompleted: false, isCurrent: false }, // Próximamente
  ]);

  const handleLevelSelect = (levelId: number) => {
    // Solo permitir seleccionar niveles desbloqueados y existentes
    const level = levels.find(l => l.id === levelId);
    if (level && level.isUnlocked && levelId <= 7) {
      setSelectedLevel(levelId);
      setCurrentScreen('game');
    }
  };

  const handleLevelComplete = (levelId: number) => {
    // Marcar el nivel como completado
    setLevels(prevLevels =>
      prevLevels.map(level =>
        level.id === levelId
          ? { ...level, isCompleted: true, isCurrent: false }
          : level
      )
    );

    // Desbloquear el siguiente nivel si existe y no es el nivel 8
    const nextLevelId = levelId + 1;
    if (nextLevelId <= 7) {
      const nextLevel = levels.find(level => level.id === nextLevelId);
      if (nextLevel && !nextLevel.isUnlocked) {
        setLevels(prevLevels =>
          prevLevels.map(level =>
            level.id === nextLevelId
              ? { ...level, isUnlocked: true, isCurrent: true }
              : level
          )
        );
      }
    }

    // Volver a la selección de niveles
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

                <TouchableOpacity style={styles.menuButton}>
                  <Text style={styles.menuButtonText}>⚙️ Configuración</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuButton}>
                  <Text style={styles.menuButtonText}>📊 Estadísticas</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.stats}>
                <Text style={styles.statsText}>
                  Niveles completados: {levels.filter(l => l.isCompleted).length}/{levels.filter(l => l.isUnlocked && l.id <= 7).length}
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
        return (
          <GameScreen
            levelId={selectedLevel}
            onBack={handleBack}
            onLevelComplete={handleLevelComplete}
          />
        );

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
});
