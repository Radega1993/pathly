import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';

interface HomeScreenProps {
    navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const { user, signOut } = useAuthStore();

    // Redirigir si no hay usuario autenticado
    useEffect(() => {
        if (!user) {
            navigation.navigate('Login');
        }
    }, [user, navigation]);

    const handleLogout = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que quieres cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: () => signOut()
                }
            ]
        );
    };

    if (!user) {
        return null; // No mostrar nada mientras redirige
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcomeText}>
                    ¡Hola, {user.displayName || user.email}!
                </Text>
                <Text style={styles.subtitle}>Bienvenido a Pathly</Text>
            </View>

            <View style={styles.menuContainer}>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('Level')}
                >
                    <Text style={styles.menuText}>Jugar Nivel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Text style={styles.menuText}>Mi Perfil</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.userInfo}>
                <Text style={styles.userInfoText}>
                    Email: {user.email}
                </Text>
                {user.displayName && (
                    <Text style={styles.userInfoText}>
                        Nombre: {user.displayName}
                    </Text>
                )}
            </View>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 60,
        marginBottom: 50,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#3B82F6',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#6B7280',
        textAlign: 'center',
    },
    menuContainer: {
        width: '100%',
        marginBottom: 50,
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
    userInfo: {
        backgroundColor: '#F9FAFB',
        padding: 20,
        borderRadius: 10,
        marginBottom: 30,
    },
    userInfoText: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 5,
    },
    logoutButton: {
        backgroundColor: '#EF4444',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        alignItems: 'center',
    },
    logoutText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
}); 