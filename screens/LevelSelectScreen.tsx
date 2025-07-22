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
import { loadLevelFromFirestore, loadLevelByNumber, getPlayedLevelsCount, getMaxLevelNumber, resetGameProgress } from '../services/levelService';
import { Level as FirestoreLevel, Difficulty } from '../types/level';
import {
    getCompletedLevelsCount,
    isLevelCompleted,
    getLastLevelPlayed,
} from '../services';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Level {
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
    const [levels, setLevels] = useState<Level[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completedLevels, setCompletedLevels] = useState<string[]>([]);
    const [localProgressStats, setLocalProgressStats] = useState({
        totalCompleted: 0,
        lastLevelPlayed: null as string | null,
    });

    // Cargar niveles desde Firestore
    useEffect(() => {
        loadLevelsFromFirestore();
    }, []);

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

            // Cargar niveles de forma optimizada
            const loadedLevels: Level[] = [];
            const levelsToLoad = 12; // Cargar solo 12 niveles para mostrar
            const startLevel = Math.max(1, localCompletedCount - 2); // Empezar 2 niveles antes del progreso

            // Obtener el nivel máximo disponible de forma eficiente
            const maxLevel = await getMaxLevelNumber();
            console.log(`Nivel máximo disponible: ${maxLevel}`);

            // Determinar hasta qué nivel cargar
            const endLevel = Math.min(startLevel + levelsToLoad - 1, maxLevel);
            const actualLevelsToLoad = endLevel - startLevel + 1;

            if (actualLevelsToLoad > 0) {
                // Cargar niveles en paralelo para mejor performance
                const levelPromises = [];
                for (let i = 0; i < actualLevelsToLoad; i++) {
                    const levelNumber = startLevel + i;
                    levelPromises.push(
                        loadLevelByNumber(levelNumber)
                            .then(level => ({
                                level,
                                index: i,
                                levelNumber
                            }))
                            .catch(error => ({
                                error,
                                index: i,
                                levelNumber
                            }))
                    );
                }

                const results = await Promise.all(levelPromises);

                // Procesar resultados
                for (let i = 0; i < results.length; i++) {
                    const result = results[i];

                    if ('level' in result) {
                        // Nivel válido encontrado
                        loadedLevels.push({
                            id: result.level.id,
                            difficulty: result.level.difficulty,
                            gridSize: result.level.gridSize,
                            isUnlocked: true, // Se determinará después
                            isCompleted: false, // Se determinará después
                            isCurrent: false, // Se determinará después
                        });
                    }
                }
            }

            // Agregar nivel "Próximamente" si hay niveles cargados y no estamos en el máximo
            if (loadedLevels.length > 0 && endLevel < maxLevel) {
                loadedLevels.push({
                    id: `coming_soon_${endLevel + 1}`,
                    difficulty: 'normal',
                    gridSize: 5,
                    isUnlocked: false,
                    isCompleted: false,
                    isCurrent: false,
                    isComingSoon: true,
                });
            }

            if (loadedLevels.length === 0) {
                setError('No hay niveles disponibles en la base de datos.');
                setLoading(false);
                return;
            }

            // Obtener niveles completados desde Firestore (para compatibilidad)
            const playedCount = await getPlayedLevelsCount();
            console.log(`Niveles jugados (Firestore): ${playedCount}`);

            // Determinar estado de cada nivel usando progreso local
            const updatedLevels = await Promise.all(
                loadedLevels.map(async (level, index) => {
                    if (level.isComingSoon) {
                        return level; // Mantener nivel "Próximamente" como está
                    }

                    // Verificar si está completado usando el almacenamiento local
                    const isCompleted = await isLevelCompleted(level.id);
                    const isUnlocked = isCompleted || index === localCompletedCount; // Solo el siguiente nivel está desbloqueado
                    const isCurrent = index === localCompletedCount; // El nivel actual es el siguiente a completar

                    return {
                        ...level,
                        isUnlocked,
                        isCompleted,
                        isCurrent,
                    };
                })
            );

            setLevels(updatedLevels);
            setCompletedLevels(updatedLevels.filter(l => l.isCompleted).map(l => l.id));

        } catch (error) {
            console.error('Error cargando niveles:', error);
            setError('Error al cargar los niveles. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleLevelPress = async (level: Level) => {
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
            case 'easy': return '#22C55E'; // Verde
            case 'normal': return '#3B82F6'; // Azul
            case 'hard': return '#F59E0B'; // Amarillo/Naranja
            case 'extreme': return '#EF4444'; // Rojo
            default: return '#6B7280'; // Gris
        }
    };

    const getDifficultyEmoji = (difficulty: Difficulty) => {
        switch (difficulty) {
            case 'easy': return '🟢';
            case 'normal': return '🔵';
            case 'hard': return '🟡';
            case 'extreme': return '🔴';
            default: return '⚪';
        }
    };

    const getDifficultyText = (difficulty: Difficulty) => {
        switch (difficulty) {
            case 'easy': return 'Fácil';
            case 'normal': return 'Normal';
            case 'hard': return 'Difícil';
            case 'extreme': return 'Extremo';
            default: return 'Desconocido';
        }
    };

    const renderLevel = (level: Level, index: number) => {
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
});

export default LevelSelectScreen; 