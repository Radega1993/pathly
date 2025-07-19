import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ProfileScreenProps {
    navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
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

            <View style={styles.menuContainer}>
                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuText}>Configuración</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuText}>Ayuda</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuText}>Acerca de</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
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
    headerTitle: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
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
        marginBottom: 30,
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
    menuContainer: {
        padding: 20,
    },
    menuItem: {
        backgroundColor: '#E5E7EB',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 10,
    },
    menuText: {
        fontSize: 16,
        color: '#374151',
    },
}); 