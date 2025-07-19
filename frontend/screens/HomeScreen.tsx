import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface HomeScreenProps {
    navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bienvenido a Pathly</Text>

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

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => navigation.navigate('Login')}
            >
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#3B82F6',
        marginBottom: 50,
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
    logoutButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    logoutText: {
        fontSize: 16,
        color: '#6B7280',
        textDecorationLine: 'underline',
    },
}); 