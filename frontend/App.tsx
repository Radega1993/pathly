import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'home' | 'level' | 'profile'>('login');

  const renderLoginScreen = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Pathly</Text>
      <Text style={styles.subtitle}>Conecta los números en orden</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setCurrentScreen('home')}
      >
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHomeScreen = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a Pathly</Text>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setCurrentScreen('level')}
        >
          <Text style={styles.menuText}>Jugar Nivel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setCurrentScreen('profile')}
        >
          <Text style={styles.menuText}>Mi Perfil</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => setCurrentScreen('login')}
      >
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLevelScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('home')}
        >
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.levelTitle}>Nivel 1</Text>
      </View>

      <View style={styles.gameContainer}>
        <Text style={styles.instruction}>
          Conecta los números del 1 al 9 en orden
        </Text>

        <View style={styles.board}>
          <Text style={styles.boardText}>Tablero del juego aquí</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Pista</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Reiniciar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProfileScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('home')}
        >
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>

        <Text style={styles.userName}>Usuario</Text>
        <Text style={styles.userEmail}>usuario@ejemplo.com</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Niveles Completados</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Puntuación Total</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <StatusBar style="light" />
      {currentScreen === 'login' && renderLoginScreen()}
      {currentScreen === 'home' && renderHomeScreen()}
      {currentScreen === 'level' && renderLevelScreen()}
      {currentScreen === 'profile' && renderProfileScreen()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 50,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  menuContainer: {
    width: '100%',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  menuItem: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  menuText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#3B82F6',
  },
  backButton: {
    marginRight: 20,
  },
  backText: {
    color: '#ffffff',
    fontSize: 16,
  },
  levelTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  gameContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instruction: {
    fontSize: 18,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 30,
  },
  board: {
    width: 300,
    height: 300,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  boardText: {
    fontSize: 16,
    color: '#6B7280',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    paddingBottom: 40,
  },
  profileContainer: {
    alignItems: 'center',
    padding: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
