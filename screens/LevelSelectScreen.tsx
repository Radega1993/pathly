import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    SafeAreaView,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Level {
    id: number;
    isUnlocked: boolean;
    isCompleted: boolean;
    isCurrent: boolean;
}

interface LevelSelectScreenProps {
    onLevelSelect: (levelId: number) => void;
    onBack: () => void;
}

const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({ onLevelSelect, onBack }) => {
    // Estado de los niveles (solo 7 niveles existentes, el 8 sería próximo)
    const [levels] = useState<Level[]>([
        { id: 1, isUnlocked: true, isCompleted: true, isCurrent: false },
        { id: 2, isUnlocked: true, isCompleted: false, isCurrent: false },
        { id: 3, isUnlocked: true, isCompleted: false, isCurrent: true },
        { id: 4, isUnlocked: true, isCompleted: false, isCurrent: false },
        { id: 5, isUnlocked: true, isCompleted: false, isCurrent: false },
        { id: 6, isUnlocked: true, isCompleted: false, isCurrent: false },
        { id: 7, isUnlocked: true, isCompleted: false, isCurrent: false },
        { id: 8, isUnlocked: false, isCompleted: false, isCurrent: false }, // Próximamente
    ]);

    const handleLevelPress = (level: Level) => {
        if (level.isUnlocked) {
            onLevelSelect(level.id);
        }
    };

    const renderLevel = (level: Level, index: number) => {
        const isLast = index === levels.length - 1;

        return (
            <View key={level.id} style={styles.levelContainer}>
                {/* Línea del camino (excepto para el último nivel) */}
                {!isLast && (
                    <View style={styles.pathLine} />
                )}

                {/* Círculo del nivel */}
                <TouchableOpacity
                    style={[
                        styles.levelCircle,
                        level.isCurrent && styles.currentLevel,
                        !level.isUnlocked && styles.lockedLevel,
                    ]}
                    onPress={() => handleLevelPress(level)}
                    disabled={!level.isUnlocked}
                >
                    {/* Número del nivel */}
                    <Text style={[
                        styles.levelNumber,
                        level.isCurrent && styles.currentLevelText,
                        !level.isUnlocked && styles.lockedLevelText,
                    ]}>
                        {level.id}
                    </Text>

                    {/* Tick de completado */}
                    {level.isCompleted && (
                        <View style={styles.completedTick}>
                            <Text style={styles.tickText}>✓</Text>
                        </View>
                    )}

                    {/* Cartel de próximamente */}
                    {!level.isUnlocked && (
                        <View style={styles.comingSoonBadge}>
                            <Text style={styles.comingSoonText}>Próximamente</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>🎮 Pathly</Text>
                <View style={styles.headerRight}>
                    <Text style={styles.statsText}>Niveles: {levels.filter(l => l.isCompleted).length}/{levels.filter(l => l.isUnlocked).length}</Text>
                </View>
            </View>

            {/* Mapa de niveles */}
            <ScrollView
                style={styles.mapContainer}
                contentContainerStyle={styles.mapContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Fondo del mapa */}
                <View style={styles.mapBackground}>
                    {/* Contenedor de niveles */}
                    <View style={styles.levelsContainer}>
                        {levels.map((level, index) => renderLevel(level, index))}
                    </View>
                </View>
            </ScrollView>

            {/* Footer con información */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Conecta los números en orden para completar cada nivel
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    statsText: {
        fontSize: 14,
        color: '#6B7280',
    },
    mapContainer: {
        flex: 1,
    },
    mapContent: {
        paddingBottom: 20,
    },
    mapBackground: {
        backgroundColor: '#F9FAFB',
        minHeight: screenHeight * 0.8,
        position: 'relative',
        borderRadius: 20,
        margin: 10,
        padding: 20,
    },
    levelsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 40,
        zIndex: 2,
    },
    levelContainer: {
        alignItems: 'center',
        marginVertical: 20,
        position: 'relative',
    },
    pathLine: {
        position: 'absolute',
        width: 2,
        height: 40,
        backgroundColor: '#E5E7EB',
        top: -20,
        zIndex: 1,
    },
    levelCircle: {
        width: 70,
        height: 70,
        backgroundColor: '#FFFFFF',
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        position: 'relative',
        zIndex: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    currentLevel: {
        borderColor: '#3B82F6',
        borderWidth: 3,
        backgroundColor: '#3B82F6',
        transform: [{ scale: 1.1 }],
    },
    lockedLevel: {
        backgroundColor: '#F3F4F6',
        borderColor: '#D1D5DB',
    },
    levelNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#374151',
    },
    currentLevelText: {
        color: '#FFFFFF',
    },
    lockedLevelText: {
        color: '#9CA3AF',
    },
    completedTick: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        backgroundColor: '#22C55E',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    tickText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    comingSoonBadge: {
        position: 'absolute',
        top: -12,
        backgroundColor: '#6B7280',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    comingSoonText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    footer: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
});

export default LevelSelectScreen; 