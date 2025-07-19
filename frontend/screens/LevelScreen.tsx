import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface LevelScreenProps {
    navigation: any;
}

export const LevelScreen: React.FC<LevelScreenProps> = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
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
    levelTitle: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    gameContainer: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
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
    button: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 10,
        minWidth: 120,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
}); 