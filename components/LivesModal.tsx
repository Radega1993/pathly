import React, { useState, useEffect } from 'react';
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
    getCurrentLivesState,
    getTimeUntilNextLife,
    showLivesRewardedAd,
    formatTimeRemaining,
    LIVES_CONFIG,
    LivesState,
} from '../services/livesService';

interface LivesModalProps {
    visible: boolean;
    onClose: () => void;
    onLivesRestored?: () => void;
}

const LivesModal: React.FC<LivesModalProps> = ({ visible, onClose, onLivesRestored }) => {
    const [livesState, setLivesState] = useState<LivesState>({
        currentLives: LIVES_CONFIG.MAX_LIVES,
        lastRegenerationTime: Date.now(),
    });
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Cargar estado de vidas cuando se abre el modal
    useEffect(() => {
        if (visible) {
            loadLivesState();
        }
    }, [visible]);

    // Actualizar tiempo restante cada segundo
    useEffect(() => {
        if (!visible) return;

        const interval = setInterval(async () => {
            try {
                const timeRemaining = await getTimeUntilNextLife();
                setTimeRemaining(timeRemaining);

                // Si hay tiempo restante 0, recargar estado de vidas
                if (timeRemaining === 0) {
                    loadLivesState();
                }
            } catch (error) {
                console.error('Error actualizando tiempo restante:', error);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [visible]);

    const loadLivesState = async () => {
        try {
            setRefreshing(true);
            const [state, timeRemaining] = await Promise.all([
                getCurrentLivesState(),
                getTimeUntilNextLife(),
            ]);
            setLivesState(state);
            setTimeRemaining(timeRemaining);
        } catch (error) {
            console.error('Error cargando estado de vidas:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleWatchAd = async () => {
        try {
            setLoading(true);
            const success = await showLivesRewardedAd();

            if (success) {
                Alert.alert(
                    '❤️ ¡Vidas Restauradas!',
                    'Has recuperado todas tus vidas. ¡Disfruta jugando!',
                    [
                        {
                            text: '¡Genial!',
                            onPress: () => {
                                loadLivesState();
                                onLivesRestored?.();
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

    const renderHeart = (index: number) => {
        const isFilled = index < livesState.currentLives;
        return (
            <View key={index} style={styles.heartContainer}>
                <Ionicons
                    name={isFilled ? 'heart' : 'heart-outline'}
                    size={32}
                    color={isFilled ? '#E53E3E' : '#CBD5E0'}
                />
            </View>
        );
    };

    const renderRegenerationInfo = () => {
        if (livesState.currentLives >= LIVES_CONFIG.MAX_LIVES) {
            return (
                <View style={styles.regenerationInfo}>
                    <Text style={styles.regenerationText}>
                        ❤️ Tienes todas las vidas disponibles
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.regenerationInfo}>
                <Text style={styles.regenerationText}>
                    ⏰ Próxima vida en: {formatTimeRemaining(timeRemaining)}
                </Text>
                <Text style={styles.regenerationSubtext}>
                    Las vidas se regeneran cada {LIVES_CONFIG.REGEN_TIME_MINUTES} minutos
                </Text>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <SafeAreaView style={styles.content}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>💔 Sin Vidas</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Hearts Display */}
                        <View style={styles.heartsContainer}>
                            <Text style={styles.heartsLabel}>Tus Vidas:</Text>
                            <View style={styles.heartsRow}>
                                {Array.from({ length: LIVES_CONFIG.MAX_LIVES }, (_, i) => renderHeart(i))}
                            </View>
                            <Text style={styles.livesCount}>
                                {livesState.currentLives} / {LIVES_CONFIG.MAX_LIVES}
                            </Text>
                        </View>

                        {/* Regeneration Info */}
                        {renderRegenerationInfo()}

                        {/* Action Buttons */}
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity
                                style={[styles.watchAdButton, loading && styles.disabledButton]}
                                onPress={handleWatchAd}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" size="small" />
                                ) : (
                                    <>
                                        <Ionicons name="play-circle" size={20} color="#FFF" />
                                        <Text style={styles.watchAdText}>Ver Anuncio</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            <Text style={styles.watchAdSubtext}>
                                Recupera todas tus vidas
                            </Text>
                        </View>

                        {/* Refresh Button */}
                        <TouchableOpacity
                            style={styles.refreshButton}
                            onPress={loadLivesState}
                            disabled={refreshing}
                        >
                            {refreshing ? (
                                <ActivityIndicator color="#3B82F6" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="refresh" size={16} color="#3B82F6" />
                                    <Text style={styles.refreshText}>Actualizar</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: '#FFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    content: {
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A202C',
    },
    closeButton: {
        padding: 4,
    },
    heartsContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    heartsLabel: {
        fontSize: 16,
        color: '#4A5568',
        marginBottom: 12,
    },
    heartsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 8,
    },
    heartContainer: {
        marginHorizontal: 4,
    },
    livesCount: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3748',
    },
    regenerationInfo: {
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    regenerationText: {
        fontSize: 16,
        color: '#2D3748',
        textAlign: 'center',
        marginBottom: 4,
    },
    regenerationSubtext: {
        fontSize: 14,
        color: '#718096',
        textAlign: 'center',
    },
    actionsContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    watchAdButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3B82F6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    disabledButton: {
        backgroundColor: '#CBD5E0',
    },
    watchAdText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    watchAdSubtext: {
        fontSize: 14,
        color: '#718096',
        textAlign: 'center',
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    refreshText: {
        color: '#3B82F6',
        fontSize: 14,
        marginLeft: 4,
    },
});

export default LivesModal; 