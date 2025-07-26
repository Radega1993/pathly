import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Alert,
} from 'react-native';
import { audioService } from '../services/audio';
import Grid, { Cell } from '../components/Grid';
import { validatePath } from '../utils/validatePath';
import { Level } from '../types/level';
import {
    setLastLevelPlayed,
    markLevelCompleted,
    isLevelCompleted,
    getCompletedLevelsCount,
} from '../services';
import {
    incrementLevelsCompleted,
    shouldShowInterstitialAd,
    showInterstitialAd,
    canUseFreeHint,
    incrementHintsUsedInLevel,
    showRewardedAd,
    resetHintsForLevel,
    adsManager,
} from '../services/ads';

interface GameScreenProps {
    level: Level;
    onBack: () => void;
    onLevelComplete: (level: Level) => void;
    onShowAudioSettings?: () => void; // Nueva prop opcional
}

const GameScreen: React.FC<GameScreenProps> = ({ level, onBack, onLevelComplete, onShowAudioSettings }) => {
    const [currentPath, setCurrentPath] = useState<Cell[]>([]);
    const [resetCount, setResetCount] = useState(0);
    const [currentHint, setCurrentHint] = useState<string>('');
    const [isLevelAlreadyCompleted, setIsLevelAlreadyCompleted] = useState(false);
    const [totalCompletedLevels, setTotalCompletedLevels] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(0);

    // Usar el grid del nivel de Firestore
    const [gridData] = useState<Cell[][]>(() => level.grid);

    // Validar la solución al cargar el nivel
    useEffect(() => {
        // Verificar si el número 1 está en la primera posición de la solución
        const numberedCells = level.grid.flat().filter(cell => cell.value !== null);
        const firstSolutionCell = level.solution[0];
        const numberOneCell = numberedCells.find(cell => cell.value === 1);

        if (numberOneCell && (numberOneCell.x !== firstSolutionCell.x || numberOneCell.y !== firstSolutionCell.y)) {
            console.warn('⚠️ El número 1 no coincide con la primera celda de la solución');
        }
    }, [level]);

    // Inicializar progreso al cargar el nivel
    useEffect(() => {
        initializeLevelProgress();
    }, [level.id]);

    // Verificar si el nivel se completó y reproducir sonido
    useEffect(() => {
        if (isPathComplete()) {
            handleLevelComplete();
        }
    }, [currentPath]);

    const initializeLevelProgress = async () => {
        try {
            // Guardar que el usuario está jugando este nivel
            await setLastLevelPlayed(level.id);

            // Verificar si ya completó este nivel
            const wasCompleted = await isLevelCompleted(level.id);
            setIsLevelAlreadyCompleted(wasCompleted);

            // Obtener estadísticas de progreso
            const completedCount = await getCompletedLevelsCount();
            setTotalCompletedLevels(completedCount);

            // Obtener pistas usadas en este nivel
            const hintsUsedCount = await adsManager.getHintsUsedInLevel(level.id);
            setHintsUsed(hintsUsedCount);

        } catch (error) {
            console.error('Error inicializando progreso del nivel:', error);
        }
    };

    const handlePathChange = (path: Cell[]) => {
        setCurrentPath(path);
    };

    const handleReset = async () => {
        setResetCount(prev => prev + 1);
        setCurrentHint('');

        // Resetear contador de pistas para este nivel
        await resetHintsForLevel(level.id);
        setHintsUsed(0);
    };

    const handleHint = async (hint: string) => {
        // La lógica de pistas ahora se maneja en el componente Grid
        // Este callback solo se ejecuta si la pista fue otorgada exitosamente
        setCurrentHint(hint);

        // Actualizar el contador de pistas usadas
        const newHintsUsed = hintsUsed + 1;
        setHintsUsed(newHintsUsed);

        // Reproducir sonido de pista
        try {
            await audioService.playForwardSound();
        } catch (error) {
            console.error('Error playing hint sound:', error);
        }
    };

    const isPathComplete = () => {
        if (currentPath.length === 0) return false;

        const isValid = validatePath(gridData, currentPath);
        return isValid;
    };

    const handleLevelComplete = async () => {
        if (isPathComplete()) {
            try {
                // Reproducir sonido de victoria
                await audioService.playWinSound();

                // Marcar el nivel como completado en el almacenamiento local
                await markLevelCompleted(level.id);

                // Incrementar contador de niveles completados para anuncios
                await incrementLevelsCompleted();

                // Verificar si debe mostrar anuncio intersticial
                const shouldShowAd = await shouldShowInterstitialAd();

                // Actualizar estadísticas locales
                const newCompletedCount = await getCompletedLevelsCount();
                setTotalCompletedLevels(newCompletedCount);
                setIsLevelAlreadyCompleted(true);

                // Mostrar anuncio intersticial si corresponde
                if (shouldShowAd) {
                    await showInterstitialAd();
                }

                // Mostrar alerta de éxito
                Alert.alert(
                    '🎉 ¡Nivel Completado!',
                    `¡Excelente trabajo! Has completado ${newCompletedCount} niveles en total.`,
                    [
                        {
                            text: 'Continuar',
                            onPress: () => onLevelComplete(level)
                        }
                    ]
                );
            } catch (error) {
                console.error('Error guardando progreso:', error);
                Alert.alert(
                    'Error',
                    'No se pudo guardar el progreso, pero el nivel se completó correctamente.',
                    [
                        {
                            text: 'Continuar',
                            onPress: () => onLevelComplete(level)
                        }
                    ]
                );
            }
        }
    };

    const getPathStatus = () => {
        if (currentPath.length === 0) return '🟡 Toca el número 1 para empezar';
        if (isPathComplete()) return '✅ ¡Nivel completado!';

        const totalCells = gridData.length * gridData[0].length;
        const remainingCells = totalCells - currentPath.length;

        // Contar números conectados vs total de números
        const numberedCells = gridData.flat().filter(cell => cell.value !== null && cell.value > 0);
        const numbersInPath = currentPath.filter(cell => cell.value !== null && cell.value > 0);
        const remainingNumbers = numberedCells.length - numbersInPath.length;

        if (remainingNumbers > 0) {
            return `🔄 Conectando números... (${remainingNumbers} números restantes)`;
        }

        if (remainingCells > 0) {
            return `🔄 Completando grid... (${remainingCells} celdas restantes)`;
        }

        // ARREGLADO: Si usó todas las celdas pero no termina en el último número
        const lastCell = currentPath[currentPath.length - 1];
        const maxNumber = Math.max(...numberedCells.map(cell => cell.value || 0));
        const lastNumberCell = numberedCells.find(cell => cell.value === maxNumber);

        if (lastCell.x !== lastNumberCell?.x || lastCell.y !== lastNumberCell?.y) {
            return `❌ El camino debe terminar en el número ${maxNumber} (${lastNumberCell?.x},${lastNumberCell?.y})`;
        }

        return '❌ Camino incompleto - debe usar todas las celdas';
    };

    const getProgressPercentage = () => {
        const totalCells = gridData.length * gridData[0].length;
        return Math.round((currentPath.length / totalCells) * 100);
    };

    const getDifficultyText = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'Fácil';
            case 'normal': return 'Normal';
            case 'hard': return 'Difícil';
            case 'extreme': return 'Extremo';
            default: return difficulty;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Nivel {level.id.replace(/^level_/i, '').replace(/^0+/, '')}</Text>
                    <Text style={styles.subtitle}>{getDifficultyText(level.difficulty)} • {level.gridSize}x{level.gridSize}</Text>
                </View>
                <View style={styles.headerRight}>
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
                    <Text style={styles.statsText}>Reinicios: {resetCount}</Text>
                    <Text style={styles.progressText}>Completados: {totalCompletedLevels}</Text>
                </View>
            </View>

            {/* Grid del juego */}
            <View style={styles.gameContainer}>
                <Grid
                    grid={gridData}
                    solution={level.solution}
                    onPathChange={handlePathChange}
                    onReset={handleReset}
                    onHint={handleHint}
                    levelId={level.id}
                    hintsUsed={hintsUsed}
                />
            </View>

            {/* Información del juego */}
            <View style={styles.info}>
                <Text style={styles.statusText}>
                    {getPathStatus()}
                </Text>
                {isLevelAlreadyCompleted && (
                    <Text style={styles.completedBadge}>
                        ✅ Ya completaste este nivel anteriormente
                    </Text>
                )}
                <Text style={styles.infoText}>
                    Progreso: {getProgressPercentage()}% ({currentPath.length}/{gridData.length * gridData[0].length} celdas)
                </Text>

                {/* Indicador de pistas */}
                <View style={styles.hintsInfo}>
                    <Text style={styles.hintsText}>
                        💡 Pistas usadas: {hintsUsed}
                    </Text>
                </View>

                {/* Pista actual */}
                {currentHint && (
                    <View style={styles.hintContainer}>
                        <Text style={styles.hintLabel}>💡 Pista:</Text>
                        <Text style={styles.hintText}>{currentHint}</Text>
                    </View>
                )}

                {/* Botón de completar nivel */}
                {isPathComplete() && (
                    <TouchableOpacity style={styles.completeButton} onPress={handleLevelComplete}>
                        <Text style={styles.completeButtonText}>🎉 ¡Completar Nivel!</Text>
                    </TouchableOpacity>
                )}
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
    progressText: {
        fontSize: 12,
        color: '#22C55E',
        fontWeight: 'bold',
        marginTop: 2,
    },
    completedBadge: {
        fontSize: 14,
        color: '#22C55E',
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#22C55E',
    },
    gameContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        padding: 20,
        paddingBottom: 60, // Aumentar padding inferior
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    statusText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 10,
        textAlign: 'center',
    },
    infoText: {
        fontSize: 16,
        color: '#374151',
        marginBottom: 5,
        textAlign: 'center',
    },
    hintContainer: {
        backgroundColor: '#EFF6FF',
        padding: 15,
        borderRadius: 10,
        marginTop: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
        width: '100%',
    },
    hintLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3B82F6',
        marginBottom: 5,
    },
    hintText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    completeButton: {
        backgroundColor: '#22C55E',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        marginTop: 15,
    },
    completeButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    errorTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#6B7280',
        marginBottom: 20,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 18,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 26,
    },
    backToMenuButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    backToMenuButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    titleContainer: {
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    hintsInfo: {
        marginTop: 10,
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: '#FEF3C7',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F59E0B',
    },
    hintsText: {
        fontSize: 14,
        color: '#92400E',
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default GameScreen; 