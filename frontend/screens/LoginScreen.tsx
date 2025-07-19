import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface LoginScreenProps {
    navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pathly</Text>
            <Text style={styles.subtitle}>Conecta los números en orden</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Home')}
            >
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
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
        fontSize: 48,
        fontWeight: 'bold',
        color: '#3B82F6',
        marginBottom: 10,
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
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
}); 