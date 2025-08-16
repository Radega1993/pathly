import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    showLivesRewardedAd,
    LIVES_CONFIG,
} from '../services/livesService';

interface GameOverModalProps {
    visible: boolean;
    onClose: () => void;
    onLivesRestored: () => void;
    onExitLevel: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
    visible,
    onClose,
    onLivesRestored,
    onExitLevel
}) => {
    const [loading, setLoading] = useState(false);

    const handleWatchAd = async () => {
        try {
            setLoading(true);
            const success = await showLivesRewardedAd();

            if (success) {
                Alert.alert(
                    '❤️ ¡Vidas Restauradas!',
                    'Has recuperado todas tus vidas. ¡Continúa jugando!',
                    [
                        {
                            text: '¡Continuar!',
                            onPress: () => {
                                onLivesRestored();
                                onClose();
                            }
                        }
                    ]
                );
            } else {
                Alert.alert(
                    '❌ Error',
                    'No se pudo mostrar el anuncio. Inténtalo de nuevo más tarde.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error mostrando anuncio de vidas:', error);
            Alert.alert(
                '❌ Error',
                'Ocurrió un error al mostrar el anuncio. Inténtalo de nuevo.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleExitLevel = () => {
        Alert.alert(
            '🚪 Salir del Nivel',
            '¿Estás seguro de que quieres salir? Perderás el progreso actual.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Salir',
                    style: 'destructive',
                    onPress: () => {
                        onExitLevel();
                        onClose();
                    }
                }
            ]
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <SafeAreaView style={styles.content}>
                        {/* Header con icono de Game Over */}
                        <View style={styles.header}>
                            <View style={styles.gameOverIcon}>
                                <Ionicons name="skull" size={48} color="#EF4444" />
                            </View>
                            <Text style={styles.title}>💔 Game Over</Text>
                            <Text style={styles.subtitle}>
                                Te has quedado sin vidas
                            </Text>
                        </View>

                        {/* Mensaje explicativo */}
                        <View style={styles.messageContainer}>
                            <Text style={styles.message}>
                                No puedes continuar jugando sin vidas.
                                Las vidas se regeneran automáticamente cada {LIVES_CONFIG.REGEN_TIME_MINUTES} minutos.
                            </Text>
                        </View>

                        {/* Opciones */}
                        <View style={styles.optionsContainer}>
                            {/* Opción 1: Ver anuncio para recuperar vidas */}
                            <TouchableOpacity
                                style={[styles.watchAdButton, loading && styles.disabledButton]}
                                onPress={handleWatchAd}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" size="small" />
                                ) : (
                                    <>
                                        <Ionicons name="play-circle" size={24} color="#FFF" />
                                        <Text style={styles.watchAdText}>Ver Anuncio</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            <Text style={styles.watchAdSubtext}>
                                Recupera todas tus vidas y continúa jugando
                            </Text>

                            {/* Separador */}
                            <View style={styles.separator}>
                                <View style={styles.separatorLine} />
                                <Text style={styles.separatorText}>o</Text>
                                <View style={styles.separatorLine} />
                            </View>

                            {/* Opción 2: Salir del nivel */}
                            <TouchableOpacity
                                style={styles.exitButton}
                                onPress={handleExitLevel}
                                disabled={loading}
                            >
                                <Ionicons name="exit-outline" size={24} color="#6B7280" />
                                <Text style={styles.exitText}>Salir del Nivel</Text>
                            </TouchableOpacity>
                            <Text style={styles.exitSubtext}>
                                Vuelve a la selección de niveles
                            </Text>
                        </View>

                        {/* Información adicional */}
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoText}>
                                💡 Consejo: Las vidas se regeneran automáticamente cada {LIVES_CONFIG.REGEN_TIME_MINUTES} minutos
                            </Text>
                        </View>
                    </SafeAreaView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: '#FFF',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    content: {
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    gameOverIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FEF2F2',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 3,
        borderColor: '#FECACA',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#EF4444',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    messageContainer: {
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    message: {
        fontSize: 16,
        color: '#374151',
        textAlign: 'center',
        lineHeight: 24,
    },
    optionsContainer: {
        marginBottom: 20,
    },
    watchAdButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3B82F6',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#3B82F6',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    disabledButton: {
        backgroundColor: '#CBD5E0',
        shadowOpacity: 0,
        elevation: 0,
    },
    watchAdText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    watchAdSubtext: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 20,
    },
    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    separatorText: {
        marginHorizontal: 16,
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    exitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    exitText: {
        color: '#6B7280',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    exitSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    infoContainer: {
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
    },
    infoText: {
        fontSize: 14,
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default GameOverModal; 