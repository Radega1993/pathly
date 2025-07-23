import React, { useState, useEffect } from 'react';
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
    isLevelCompleted,
    getLastLevelPlayed,
} from '../services';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LevelDisplay {
    id: string;
    difficulty: Difficulty;
    isUnlocked: boolean;
    isCompleted: boolean;
    isCurrent: boolean;
    gridSize: number;
    isComingSoon?: boolean;
}

interface LevelSelectScreenProps {
    onLevelSelect: (level: FirestoreLevel) => void;
    onBack: () => void;
}

const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({ onLevelSelect, onBack }) => {
    const [levels, setLevels] = useState<LevelDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completedLevels, setCompletedLevels] = useState<string[]>([]);
    const [localProgressStats, setLocalProgressStats] = useState({
        totalCompleted: 0,
        lastLevelPlayed: null as string | null,
    });

    // Estados para paginación optimizada
    const [currentPage, setCurrentPage] = useState(0);
    const [totalLevels, setTotalLevels] = useState(0);
    const [hasMoreLevels, setHasMoreLevels] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const PAGE_SIZE = 20; // Cargar 20 niveles por página

    // Cargar niveles desde Firestore
    useEffect(() => {
        loadLevelsFromFirestore();
    }, []);

    // Precargar niveles cercanos cuando cambie el progreso
    useEffect(() => {
        if (localProgressStats.totalCompleted > 0) {
            preloadNearbyLevels(localProgressStats.totalCompleted);
        }
    }, [localProgressStats.totalCompleted]);

    // Función para cargar más niveles
    const loadMoreLevels = async () => {
        if (loadingMore || !hasMoreLevels) return;

        setLoadingMore(true);
        try {
            // Obtener el nivel máximo disponible
            const maxLevel = await getMaxLevelNumber();

            // Calcular el siguiente rango de niveles a cargar
            const currentLevelsCount = levels.length;
            const nextStart = currentLevelsCount + 1;
            const nextEnd = Math.min(nextStart + PAGE_SIZE - 1, maxLevel);

            if (nextStart > maxLevel) {
                setHasMoreLevels(false);
                return;
            }

            console.log(`📄 Cargando más niveles: ${nextStart} a ${nextEnd}`);

            const { levels: newLevels } = await loadLevelsOptimized(nextStart, nextEnd - nextStart + 1, localProgressStats.totalCompleted);

            // Convertir a LevelDisplay
            const newDisplayLevels: LevelDisplay[] = [];
            for (let i = 0; i < newLevels.length; i++) {
                const level = newLevels[i];
                const actualLevelNumber = nextStart + i;

                const isCompleted = await isLevelCompleted(level.id);
                const isUnlocked = isCompleted || actualLevelNumber === localProgressStats.totalCompleted + 1;
                const isCurrent = actualLevelNumber === localProgressStats.totalCompleted + 1;

                newDisplayLevels.push({
                    id: level.id,
                    difficulty: level.difficulty,
                    gridSize: level.gridSize,
                    isUnlocked,
                    isCompleted,
                    isCurrent,
                });
            }

            // No agregar "Próximamente" en loadMoreLevels
            // Solo se agrega en la carga inicial si es necesario

            setLevels(prev => [...prev, ...newDisplayLevels]);
            setHasMoreLevels(nextEnd < maxLevel);

        } catch (error) {
            console.error('Error cargando más niveles:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const loadLevelsFromFirestore = async () => {
        setLoading(true);
        setError(null);

        try {
            // Cargar progreso local primero
            const [localCompletedCount, lastLevelPlayed] = await Promise.all([
                getCompletedLevelsCount(),
                getLastLevelPlayed(),
            ]);

            setLocalProgressStats({
                totalCompleted: localCompletedCount,
                lastLevelPlayed,
            });

            console.log(`Progreso local: ${localCompletedCount} niveles completados, último jugado: ${lastLevelPlayed}`);

            // Obtener el nivel máximo disponible
            const maxLevel = await getMaxLevelNumber();
            console.log(`Nivel máximo disponible: ${maxLevel}`);

            // Calcular rango óptimo de niveles a cargar
            const { start, end, shouldLoadMore } = getOptimalLevelRange(localCompletedCount, maxLevel, PAGE_SIZE);

            console.log(`📊 Cargando niveles ${start} a ${end} (${end - start + 1} niveles)`);

            // Cargar niveles optimizados
            const { levels: loadedLevels, totalAvailable } = await loadLevelsOptimized(start, end - start + 1, localCompletedCount);

            if (loadedLevels.length === 0) {
                setError('No hay niveles disponibles en la base de datos.');
                setLoading(false);
                return;
            }

            // Convertir niveles de Firestore a LevelDisplay
            const displayLevels: LevelDisplay[] = [];

            // Agregar niveles normales
            for (let i = 0; i < loadedLevels.length; i++) {
                const level = loadedLevels[i];
                const actualLevelNumber = start + i;

                // Verificar si está completado usando el almacenamiento local
                const isCompleted = await isLevelCompleted(level.id);
                const isUnlocked = isCompleted || actualLevelNumber === localCompletedCount + 1;
                const isCurrent = actualLevelNumber === localCompletedCount + 1;

                displayLevels.push({
                    id: level.id,
                    difficulty: level.difficulty,
                    gridSize: level.gridSize,
                    isUnlocked,
                    isCompleted,
                    isCurrent,
                });
            }

            // Agregar nivel "Próximamente" solo si hemos llegado al final de todos los niveles disponibles
            // y hay niveles futuros disponibles (totalAvailable < maxLevel)
            if (end >= totalAvailable && totalAvailable < maxLevel) {
                displayLevels.push({
                    id: `coming_soon_${end + 1}`,
                    difficulty: 'normal',
                    gridSize: 5,
                    isUnlocked: false,
                    isCompleted: false,
                    isCurrent: false,
                    isComingSoon: true,
                });
            }

            setLevels(displayLevels);
            setCompletedLevels(displayLevels.filter(l => l.isCompleted).map(l => l.id));
            setTotalLevels(totalAvailable);
            setHasMoreLevels(shouldLoadMore);
            setCurrentPage(0);

        } catch (error) {
            console.error('Error cargando niveles:', error);
            setError('Error al cargar los niveles. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

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

        try {
            // Cargar el nivel específico por número (índice + 1)
            const levelNumber = levels.indexOf(level) + 1;
            const firestoreLevel = await loadLevelByNumber(levelNumber);
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
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Resetear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await resetGameProgress();
                            Alert.alert(
                                '✅ Progreso Reseteado',
                                'Puedes empezar desde el nivel 1',
                                [{ text: 'OK', onPress: () => loadLevelsFromFirestore() }]
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
            <View key={`level-${index + 1}`} style={styles.levelContainer}>
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
                        {level.isComingSoon ? '?' : index + 1}
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
                    <TouchableOpacity style={styles.retryButton} onPress={loadLevelsFromFirestore}>
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
                    <Text style={styles.statsText}>
                        {localProgressStats.totalCompleted}/{levels.length} completados
                    </Text>
                    {localProgressStats.lastLevelPlayed && (
                        <Text style={styles.lastPlayedText}>
                            Último: {localProgressStats.lastLevelPlayed.slice(-3)}
                        </Text>
                    )}
                </View>
            </View>

            {/* Mapa de niveles */}
            <ScrollView
                style={styles.mapContainer}
                contentContainerStyle={styles.mapContent}
                showsVerticalScrollIndicator={false}
                onScroll={({ nativeEvent }) => {
                    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                    const paddingToBottom = 20;

                    // Cargar más niveles cuando el usuario está cerca del final
                    if (layoutMeasurement.height + contentOffset.y >=
                        contentSize.height - paddingToBottom) {
                        loadMoreLevels();
                    }
                }}
                scrollEventThrottle={400}
            >
                {/* Fondo del mapa */}
                <View style={styles.mapBackground}>
                    {/* Contenedor de niveles */}
                    <View style={styles.levelsContainer}>
                        {levels.map((level, index) => renderLevel(level, index))}

                        {/* Indicador de carga de más niveles */}
                        {loadingMore && (
                            <View style={styles.loadMoreContainer}>
                                <ActivityIndicator size="small" color="#3B82F6" />
                                <Text style={styles.loadMoreText}>Cargando más niveles...</Text>
                            </View>
                        )}

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
});

export default LevelSelectScreen; 