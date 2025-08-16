import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import {
    loadLevelFromFirestore,
    loadLevelByNumber,
    getPlayedLevelsCount,
    getMaxLevelNumber,
    resetGameProgress,
    loadLevelsOptimized,
    getOptimalLevelRange,
    preloadNearbyLevels
} from '../services/levelService';
import { Level as FirestoreLevel, Difficulty } from '../types/level';
import {
    getCompletedLevelsCount,
    getHighestCompletedLevel,
    isLevelCompleted,
    getLastLevelPlayed,
} from '../services';
import LivesDisplay from '../components/LivesDisplay';
import LivesModal from '../components/LivesModal';
import { useLives } from '../utils/useLives';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LevelDisplay {
    id: string;
    difficulty: Difficulty;
    isUnlocked: boolean;
    isCompleted: boolean;
    isCurrent: boolean;
    gridSize: number;
    isComingSoon?: boolean;
    levelNumber: number; // Número real del nivel
}

interface LevelSelectScreenProps {
    onLevelSelect: (level: FirestoreLevel) => void;
    onBack: () => void;
    onShowAudioSettings?: () => void;
}

const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({ onLevelSelect, onBack, onShowAudioSettings }) => {
    const [levels, setLevels] = useState<LevelDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [localProgressStats, setLocalProgressStats] = useState({
        totalCompleted: 0,
        highestCompleted: 0,
        lastLevelPlayed: null as string | null,
    });

    // Estados para navegación optimizada
    const [currentRange, setCurrentRange] = useState({ start: 1, end: 20 });
    const [hasMoreLevels, setHasMoreLevels] = useState(true);
    const [maxLevelAvailable, setMaxLevelAvailable] = useState(0);

    // Estados para el sistema de vidas
    const [showLivesModal, setShowLivesModal] = useState(false);

    // Hook para manejar vidas
    const { canPlay } = useLives();

    const PAGE_SIZE = 20;

    // Cargar niveles iniciales
    useEffect(() => {
        loadInitialLevels();
    }, []);

    // Precargar niveles cercanos cuando cambie el progreso
    useEffect(() => {
        if (localProgressStats.highestCompleted > 0) {
            preloadNearbyLevels(localProgressStats.highestCompleted);
        }
    }, [localProgressStats.highestCompleted]);

    const loadInitialLevels = async () => {
        setLoading(true);
        setError(null);

        try {
            // Cargar progreso local primero
            const [localCompletedCount, highestCompleted, lastLevelPlayed] = await Promise.all([
                getCompletedLevelsCount(),
                getHighestCompletedLevel(),
                getLastLevelPlayed(),
            ]);

            setLocalProgressStats({
                totalCompleted: localCompletedCount,
                highestCompleted,
                lastLevelPlayed,
            });

            console.log(`📊 Progreso local: ${localCompletedCount} niveles completados, nivel más alto: ${highestCompleted}`);

            // Obtener el nivel máximo disponible
            const maxLevel = await getMaxLevelNumber();
            setMaxLevelAvailable(maxLevel);
            console.log(`📊 Nivel máximo disponible: ${maxLevel}`);

            // Calcular rango óptimo de niveles a cargar
            const { start, end, shouldLoadMore } = getOptimalLevelRange(highestCompleted, maxLevel, PAGE_SIZE);
            setCurrentRange({ start, end });
            setHasMoreLevels(shouldLoadMore);

            console.log(`📊 Cargando niveles ${start} a ${end} (${end - start + 1} niveles)`);

            // Cargar niveles optimizados
            const { levels: loadedLevels, totalAvailable, currentLevel } = await loadLevelsOptimized(start, end - start + 1, highestCompleted);

            if (loadedLevels.length === 0) {
                setError('No hay niveles disponibles en la base de datos.');
                setLoading(false);
                return;
            }

            // Convertir niveles de Firestore a LevelDisplay
            const displayLevels: LevelDisplay[] = await Promise.all(
                loadedLevels.map(async (level, index) => {
                    // Extraer número del nivel del ID o calcular basado en el índice
                    const levelNumber = parseInt(level.id.match(/level_(\d+)/)?.[1] || '0', 10) || (start + index);
                    const isCompleted = await isLevelCompleted(level.id);
                    const isUnlocked = isCompleted || levelNumber === highestCompleted + 1;
                    const isCurrent = levelNumber === highestCompleted + 1;

                    return {
                        id: level.id,
                        difficulty: level.difficulty,
                        gridSize: level.gridSize,
                        isUnlocked,
                        isCompleted,
                        isCurrent,
                        levelNumber,
                    };
                })
            );

            // Ordenar por número de nivel
            displayLevels.sort((a, b) => a.levelNumber - b.levelNumber);

            // Agregar nivel "Próximamente" si es necesario
            if (end >= totalAvailable && totalAvailable < maxLevel) {
                displayLevels.push({
                    id: `coming_soon_${end + 1}`,
                    difficulty: 'normal',
                    gridSize: 5,
                    isUnlocked: false,
                    isCompleted: false,
                    isCurrent: false,
                    isComingSoon: true,
                    levelNumber: end + 1,
                });
            }

            console.log(`✅ Niveles cargados: ${displayLevels.length} niveles`);
            setLevels(displayLevels);

        } catch (error) {
            console.error('Error cargando niveles iniciales:', error);
            setError('Error al cargar los niveles. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const loadLevelsInRange = async (start: number, end: number) => {
        try {
            console.log(`🔄 Cargando rango ${start}-${end}`);

            const { levels: loadedLevels, totalAvailable, currentLevel } = await loadLevelsOptimized(start, end - start + 1, localProgressStats.highestCompleted);

            if (loadedLevels.length === 0) {
                console.log('❌ No se encontraron niveles en el rango especificado');
                return;
            }

            // Convertir y ordenar niveles
            const displayLevels: LevelDisplay[] = await Promise.all(
                loadedLevels.map(async (level, index) => {
                    // Extraer número del nivel del ID o calcular basado en el índice
                    const levelNumber = parseInt(level.id.match(/level_(\d+)/)?.[1] || '0', 10) || (start + index);
                    const isCompleted = await isLevelCompleted(level.id);
                    const isUnlocked = isCompleted || levelNumber === localProgressStats.highestCompleted + 1;
                    const isCurrent = levelNumber === localProgressStats.highestCompleted + 1;

                    return {
                        id: level.id,
                        difficulty: level.difficulty,
                        gridSize: level.gridSize,
                        isUnlocked,
                        isCompleted,
                        isCurrent,
                        levelNumber,
                    };
                })
            );

            displayLevels.sort((a, b) => a.levelNumber - b.levelNumber);

            // Agregar nivel "Próximamente" si es necesario
            if (end >= totalAvailable && totalAvailable < maxLevelAvailable) {
                displayLevels.push({
                    id: `coming_soon_${end + 1}`,
                    difficulty: 'normal',
                    gridSize: 5,
                    isUnlocked: false,
                    isCompleted: false,
                    isCurrent: false,
                    isComingSoon: true,
                    levelNumber: end + 1,
                });
            }

            setLevels(displayLevels);
            setCurrentRange({ start, end });
            setHasMoreLevels(end < maxLevelAvailable);

        } catch (error) {
            console.error('Error cargando rango de niveles:', error);
            Alert.alert('Error', 'No se pudieron cargar los niveles. Intenta de nuevo.');
        }
    };

    const navigateToLevel = useCallback(async (targetLevel: number) => {
        const { start, end } = currentRange;

        // Si el nivel objetivo está en el rango actual, no hacer nada
        if (targetLevel >= start && targetLevel <= end) {
            console.log(`📍 Nivel ${targetLevel} ya está en el rango actual (${start}-${end})`);
            return;
        }

        // Calcular nuevo rango centrado en el nivel objetivo
        const halfPage = Math.floor(PAGE_SIZE / 2);
        let newStart = Math.max(1, targetLevel - halfPage);
        let newEnd = Math.min(maxLevelAvailable, newStart + PAGE_SIZE - 1);

        // Ajustar si llegamos al final
        if (newEnd === maxLevelAvailable && newStart > 1) {
            newStart = Math.max(1, newEnd - PAGE_SIZE + 1);
        }

        console.log(`🧭 Navegando al nivel ${targetLevel}: nuevo rango ${newStart}-${newEnd}`);
        await loadLevelsInRange(newStart, newEnd);
    }, [currentRange, maxLevelAvailable]);

    const loadNextPage = useCallback(async () => {
        if (!hasMoreLevels) return;

        const nextStart = currentRange.end + 1;
        const nextEnd = Math.min(maxLevelAvailable, nextStart + PAGE_SIZE - 1);

        console.log(`➡️ Cargando siguiente página: ${nextStart}-${nextEnd}`);
        await loadLevelsInRange(nextStart, nextEnd);
    }, [currentRange, hasMoreLevels, maxLevelAvailable]);

    const loadPreviousPage = useCallback(async () => {
        const prevEnd = currentRange.start - 1;
        const prevStart = Math.max(1, prevEnd - PAGE_SIZE + 1);

        console.log(`⬅️ Cargando página anterior: ${prevStart}-${prevEnd}`);
        await loadLevelsInRange(prevStart, prevEnd);
    }, [currentRange]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadInitialLevels();
        setRefreshing(false);
    }, []);

    const handleLevelPress = async (level: LevelDisplay) => {
        if (level.isComingSoon) {
            Alert.alert(
                '⏳ Próximamente',
                'Este nivel estará disponible en una próxima actualización.',
                [{ text: 'OK' }]
            );
            return;
        }

        if (!level.isUnlocked) {
            Alert.alert(
                'Nivel Bloqueado',
                'Completa el nivel anterior para desbloquear este nivel.',
                [{ text: 'OK' }]
            );
            return;
        }

        // Verificar si el usuario tiene vidas para jugar
        if (!canPlay) {
            setShowLivesModal(true);
            return;
        }

        try {
            console.log(`🎮 Intentando cargar nivel ${level.levelNumber} desde ID: ${level.id}`);
            const firestoreLevel = await loadLevelByNumber(level.levelNumber);
            onLevelSelect(firestoreLevel);
        } catch (error) {
            console.error('Error cargando nivel:', error);
            Alert.alert(
                'Error',
                'No se pudo cargar el nivel. Intenta de nuevo.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleResetProgress = async () => {
        Alert.alert(
            '🔄 Resetear Progreso',
            '¿Estás seguro de que quieres resetear todo el progreso? Esto te llevará de vuelta al nivel 1.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Resetear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await resetGameProgress();
                            Alert.alert(
                                '✅ Progreso Reseteado',
                                'Puedes empezar desde el nivel 1',
                                [{ text: 'OK', onPress: () => loadInitialLevels() }]
                            );
                        } catch (error) {
                            Alert.alert('❌ Error', 'No se pudo resetear el progreso');
                        }
                    }
                }
            ]
        );
    };

    const getDifficultyColor = (difficulty: Difficulty) => {
        switch (difficulty) {
            case 'muy_facil': return '#22C55E'; // Verde
            case 'facil': return '#10B981'; // Verde claro
            case 'normal': return '#3B82F6'; // Azul
            case 'dificil': return '#F59E0B'; // Naranja
            case 'extremo': return '#EF4444'; // Rojo
            default: return '#6B7280'; // Gris
        }
    };

    const getDifficultyEmoji = (difficulty: Difficulty) => {
        switch (difficulty) {
            case 'muy_facil': return '🟢';
            case 'facil': return '🟩';
            case 'normal': return '🔵';
            case 'dificil': return '🟡';
            case 'extremo': return '🔴';
            default: return '⚪';
        }
    };

    const getDifficultyText = (difficulty: Difficulty) => {
        switch (difficulty) {
            case 'muy_facil': return 'Muy Fácil';
            case 'facil': return 'Fácil';
            case 'normal': return 'Normal';
            case 'dificil': return 'Difícil';
            case 'extremo': return 'Extremo';
            default: return 'Desconocido';
        }
    };

    const renderLevel = (level: LevelDisplay, index: number) => {
        const isLast = index === levels.length - 1;
        const difficultyColor = getDifficultyColor(level.difficulty);

        return (
            <View key={`level-${level.levelNumber}`} style={styles.levelContainer}>
                {/* Línea del camino (excepto para el último nivel) */}
                {!isLast && (
                    <View style={[styles.pathLine, { backgroundColor: difficultyColor }]} />
                )}

                {/* Círculo del nivel */}
                <TouchableOpacity
                    style={[
                        styles.levelCircle,
                        { borderColor: difficultyColor },
                        level.isCurrent && [styles.currentLevel, { backgroundColor: difficultyColor }],
                        !level.isUnlocked && styles.lockedLevel,
                        level.isComingSoon && styles.comingSoonLevel,
                    ]}
                    onPress={() => handleLevelPress(level)}
                    disabled={!level.isUnlocked || level.isComingSoon}
                    activeOpacity={0.7}
                >
                    {/* Emoji de dificultad */}
                    <Text style={styles.difficultyEmoji}>
                        {level.isComingSoon ? '⏳' : getDifficultyEmoji(level.difficulty)}
                    </Text>

                    {/* Número del nivel */}
                    <Text style={[
                        styles.levelNumber,
                        level.isCurrent && styles.currentLevelText,
                        !level.isUnlocked && styles.lockedLevelText,
                        level.isComingSoon && styles.comingSoonText,
                    ]}>
                        {level.isComingSoon ? '?' : level.levelNumber}
                    </Text>

                    {/* Tick de completado */}
                    {level.isCompleted && (
                        <View style={styles.completedTick}>
                            <Text style={styles.tickText}>✓</Text>
                        </View>
                    )}

                    {/* Cartel de bloqueado */}
                    {!level.isUnlocked && !level.isComingSoon && (
                        <View style={styles.lockedBadge}>
                            <Text style={styles.lockedText}>🔒</Text>
                        </View>
                    )}

                    {/* Cartel de próximamente */}
                    {level.isComingSoon && (
                        <View style={styles.comingSoonBadge}>
                            <Text style={styles.comingSoonText}>⏳</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Información de dificultad */}
                <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                    {level.isComingSoon ? 'Próximamente' : getDifficultyText(level.difficulty)}
                </Text>
                <Text style={styles.gridSizeText}>
                    {level.isComingSoon ? 'Nuevo nivel' : `${level.gridSize}x${level.gridSize}`}
                </Text>
            </View>
        );
    };

    // Mostrar loading
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>🎮 Pathly</Text>
                    <View style={styles.headerRight} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Cargando niveles...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Mostrar error
    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>🎮 Pathly</Text>
                    <View style={styles.headerRight} />
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadInitialLevels}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>🎮 Pathly</Text>
                <View style={styles.headerRight}>
                    {/* Display de vidas */}
                    <LivesDisplay
                        onShowLivesModal={() => setShowLivesModal(true)}
                        compact={true}
                    />

                    {/* Botón de ajustes de audio */}
                    {onShowAudioSettings && (
                        <TouchableOpacity
                            style={styles.audioButton}
                            onPress={onShowAudioSettings}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.audioButtonText}>🔊</Text>
                        </TouchableOpacity>
                    )}
                    <Text style={styles.statsText}>
                        {localProgressStats.totalCompleted} niveles completados
                    </Text>
                    {localProgressStats.lastLevelPlayed && (
                        <Text style={styles.lastPlayedText}>
                            Último: {localProgressStats.lastLevelPlayed.slice(-3)}
                        </Text>
                    )}
                </View>
            </View>

            {/* Controles de navegación optimizados */}
            <View style={styles.navigationContainer}>
                {/* Información del rango actual */}
                <Text style={styles.rangeInfo}>
                    Niveles {currentRange.start}-{currentRange.end} de {maxLevelAvailable}
                </Text>

                {/* Botones de navegación */}
                <View style={styles.navigationButtons}>
                    <TouchableOpacity
                        style={[
                            styles.navButton,
                            currentRange.start <= 1 && styles.navButtonDisabled
                        ]}
                        onPress={loadPreviousPage}
                        disabled={loading || currentRange.start <= 1}
                    >
                        <Text style={[
                            styles.navButtonText,
                            currentRange.start <= 1 && styles.navButtonTextDisabled
                        ]}>
                            ← Anteriores
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => navigateToLevel(localProgressStats.highestCompleted + 1)}
                        disabled={loading}
                    >
                        <Text style={styles.navButtonText}>
                            Nivel {localProgressStats.highestCompleted + 1}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.navButton,
                            !hasMoreLevels && styles.navButtonDisabled
                        ]}
                        onPress={loadNextPage}
                        disabled={loading || !hasMoreLevels}
                    >
                        <Text style={[
                            styles.navButtonText,
                            !hasMoreLevels && styles.navButtonTextDisabled
                        ]}>
                            {loading ? 'Cargando...' : 'Siguientes →'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Mapa de niveles */}
            <ScrollView
                style={styles.mapContainer}
                contentContainerStyle={styles.mapContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Fondo del mapa */}
                <View style={styles.mapBackground}>
                    {/* Contenedor de niveles */}
                    <View style={styles.levelsContainer}>
                        {levels.map((level, index) => renderLevel(level, index))}

                        {/* Indicador de fin de niveles */}
                        {!hasMoreLevels && levels.length > 0 && (
                            <View style={styles.endOfLevelsContainer}>
                                <Text style={styles.endOfLevelsText}>
                                    🎉 ¡Has llegado al final! Más niveles próximamente.
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Footer con información */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Conecta los números en orden para completar cada nivel
                </Text>
                <Text style={styles.footerSubText}>
                    Los niveles se desbloquean progresivamente según tu progreso
                </Text>

                {/* Botón temporal de reset - Comentado para MVP */}
                {/* 
                <TouchableOpacity
                    style={styles.resetButton}
                    onPress={handleResetProgress}
                >
                    <Text style={styles.resetButtonText}>🔄 Resetear Progreso</Text>
                </TouchableOpacity>
                */}
            </View>

            {/* Modal de vidas */}
            <LivesModal
                visible={showLivesModal}
                onClose={() => setShowLivesModal(false)}
                onLivesRestored={() => {
                    // Recargar el estado de vidas en el display
                    setShowLivesModal(false);
                }}
            />
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
        paddingVertical: 20, // Aumentado de 15 a 20
        paddingTop: 30, // Añadir padding superior adicional
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
    audioButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    audioButtonText: {
        fontSize: 18,
        color: '#3B82F6',
    },
    statsText: {
        fontSize: 14,
        color: '#6B7280',
    },
    lastPlayedText: {
        fontSize: 12,
        color: '#3B82F6',
        marginTop: 2,
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
    comingSoonLevel: {
        backgroundColor: '#F3F4F6',
        borderColor: '#9CA3AF',
        opacity: 0.7,
    },
    footer: {
        padding: 20,
        paddingBottom: 70, // Aumentar padding inferior
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    footerSubText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 5,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    loadingText: {
        fontSize: 18,
        color: '#6B7280',
        marginTop: 20,
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    errorText: {
        fontSize: 18,
        color: '#EF4444',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    difficultyEmoji: {
        fontSize: 16,
        position: 'absolute',
        top: 5,
        right: 5,
    },
    lockedBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        backgroundColor: '#6B7280',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    lockedText: {
        fontSize: 12,
        color: '#FFFFFF',
    },
    difficultyText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 8,
        textAlign: 'center',
    },
    gridSizeText: {
        fontSize: 10,
        color: '#9CA3AF',
        marginTop: 2,
        textAlign: 'center',
    },
    resetButton: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 15,
        alignSelf: 'center',
    },
    resetButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    loadMoreContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        marginTop: 10,
    },
    loadMoreText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 10,
        textAlign: 'center',
    },
    endOfLevelsContainer: {
        alignItems: 'center',
        paddingVertical: 30,
        marginTop: 20,
    },
    endOfLevelsText: {
        fontSize: 16,
        color: '#22C55E',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#F9FAFB',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    paginationButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        minWidth: 100,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    paginationButtonDisabled: {
        backgroundColor: '#E5E7EB',
        shadowOpacity: 0,
        elevation: 0,
    },
    paginationButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    paginationButtonTextDisabled: {
        color: '#9CA3AF',
    },
    navigationContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#F9FAFB',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    rangeInfo: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: '500',
    },
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: 10,
    },
    navButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 25,
        minWidth: 90,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    navButtonDisabled: {
        backgroundColor: '#E5E7EB',
        shadowOpacity: 0,
        elevation: 0,
    },
    navButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: 'bold',
    },
    navButtonTextDisabled: {
        color: '#9CA3AF',
    },
});

export default LevelSelectScreen; 