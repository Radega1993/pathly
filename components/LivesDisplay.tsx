import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LIVES_CONFIG } from '../services/livesService';
import { useLives } from '../utils/useLives';

interface LivesDisplayProps {
    onShowLivesModal?: () => void;
    compact?: boolean; // Para mostrar versión compacta
    livesState?: {
        currentLives: number;
        lastRegenerationTime: number;
    };
    timeRemaining?: number;
    forceUpdate?: number; // Para forzar re-render
}

const LivesDisplay: React.FC<LivesDisplayProps> = ({
    onShowLivesModal,
    compact = false,
    livesState: propLivesState,
    timeRemaining: propTimeRemaining,
    forceUpdate
}) => {
    // Usar props si están disponibles, sino usar el hook
    const hookLives = useLives();
    const livesState = propLivesState || hookLives.livesState;
    const timeRemaining = propTimeRemaining !== undefined ? propTimeRemaining : hookLives.timeRemaining;
    const formatTimeRemaining = hookLives.formatTimeRemaining;

    const renderHeart = (index: number) => {
        const isFilled = index < livesState.currentLives;
        const size = compact ? 16 : 20;

        return (
            <View key={index} style={styles.heartContainer}>
                <Ionicons
                    name={isFilled ? 'heart' : 'heart-outline'}
                    size={size}
                    color={isFilled ? '#E53E3E' : '#CBD5E0'}
                />
            </View>
        );
    };

    const renderCompactView = () => (
        <TouchableOpacity
            style={styles.compactContainer}
            onPress={onShowLivesModal}
            activeOpacity={0.7}
        >
            <View style={styles.heartsRow}>
                {Array.from({ length: LIVES_CONFIG.MAX_LIVES }, (_, i) => renderHeart(i))}
            </View>
            {livesState.currentLives < LIVES_CONFIG.MAX_LIVES && timeRemaining > 0 && (
                <Text style={styles.timeRemaining}>
                    {formatTimeRemaining(timeRemaining)}
                </Text>
            )}
        </TouchableOpacity>
    );

    const renderFullView = () => (
        <View style={styles.fullContainer}>
            <View style={styles.heartsSection}>
                <Text style={styles.livesLabel}>Vidas:</Text>
                <View style={styles.heartsRow}>
                    {Array.from({ length: LIVES_CONFIG.MAX_LIVES }, (_, i) => renderHeart(i))}
                </View>
                <Text style={styles.livesCount}>
                    {livesState.currentLives} / {LIVES_CONFIG.MAX_LIVES}
                </Text>
            </View>

            {livesState.currentLives < LIVES_CONFIG.MAX_LIVES && timeRemaining > 0 && (
                <View style={styles.regenerationSection}>
                    <Text style={styles.regenerationText}>
                        ⏰ {formatTimeRemaining(timeRemaining)}
                    </Text>
                </View>
            )}

            {onShowLivesModal && (
                <TouchableOpacity
                    style={styles.infoButton}
                    onPress={onShowLivesModal}
                    activeOpacity={0.7}
                >
                    <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
                </TouchableOpacity>
            )}
        </View>
    );

    return compact ? renderCompactView() : renderFullView();
};

const styles = StyleSheet.create({
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    fullContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    heartsSection: {
        alignItems: 'center',
        marginRight: 8,
    },
    livesLabel: {
        fontSize: 12,
        color: '#4A5568',
        marginBottom: 4,
        fontWeight: '500',
    },
    heartsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heartContainer: {
        marginHorizontal: 1,
    },
    livesCount: {
        fontSize: 12,
        color: '#2D3748',
        fontWeight: '600',
        marginTop: 2,
    },
    regenerationSection: {
        marginLeft: 8,
    },
    regenerationText: {
        fontSize: 12,
        color: '#E53E3E',
        fontWeight: '500',
    },
    timeRemaining: {
        fontSize: 10,
        color: '#E53E3E',
        marginLeft: 4,
        fontWeight: '500',
    },
    infoButton: {
        marginLeft: 8,
        padding: 4,
    },
});

export default LivesDisplay; 