import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Alert,
} from 'react-native';
import Grid, { Cell } from '../components/Grid';
import { validatePath } from '../utils/validatePath';
import { Level } from '../types/level';
import {
    setLastLevelPlayed,
    markLevelCompleted,
    isLevelCompleted,
    getCompletedLevelsCount,
} from '../services';

interface GameScreenProps {
    level: Level;
    onBack: () => void;
    onLevelComplete: (level: Level) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ level, onBack, onLevelComplete }) => {
    const [currentPath, setCurrentPath] = useState<Cell[]>([]);
    const [resetCount, setResetCount] = useState(0);
    const [currentHint, setCurrentHint] = useState<string>('');
    const [isLevelAlreadyCompleted, setIsLevelAlreadyCompleted] = useState(false);
    const [totalCompletedLevels, setTotalCompletedLevels] = useState(0);

    // Usar el grid del nivel de Firestore
    const [gridData] = useState<Cell[][]>(() => level.grid);

    // Log de la solución al cargar el nivel
    useEffect(() => {
        console.log('🔍 SOLUCIÓN DEL NIVEL:', level.solution);
        console.log('📊 Grid del nivel:', level.gridSize, 'x', level.gridSize);
        console.log('🎯 Números en el grid:', level.grid.flat().filter(cell => cell.value !== null).map(cell => cell.value));

        // Mostrar dónde están los números en el grid
        const numberedCells = level.grid.flat().filter(cell => cell.value !== null);
        console.log('📍 Posiciones de números:');
        numberedCells.forEach(cell => {
            console.log(`   Número ${cell.value} en posición (${cell.x}, ${cell.y})`);
        });

        // Verificar si el número 1 está en la primera posición de la solución
        const firstSolutionCell = level.solution[0];
        const numberOneCell = numberedCells.find(cell => cell.value === 1);
        console.log('🔍 Primera celda de solución:', firstSolutionCell);
        console.log('🔍 Celda con número 1:', numberOneCell);
        console.log('🔍 ¿Coinciden?:', numberOneCell && numberOneCell.x === firstSolutionCell.x && numberOneCell.y === firstSolutionCell.y);
    }, [level]);

    // Inicializar progreso al cargar el nivel
    useEffect(() => {
        initializeLevelProgress();
    }, [level.id]);

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

            console.log(`Nivel ${level.id} - Ya completado: ${wasCompleted}, Total completados: ${completedCount}`);
        } catch (error) {
            console.error('Error inicializando progreso del nivel:', error);
        }
    };

    const handlePathChange = (path: Cell[]) => {
        setCurrentPath(path);
        console.log('Camino actual:', path.map(cell => `(${cell.x},${cell.y})`).join(' -> '));
    };

    const handleReset = () => {
        setResetCount(prev => prev + 1);
        setCurrentHint('');
        console.log('Nivel reiniciado');
    };

    const handleHint = (hint: string) => {
        setCurrentHint(hint);
        console.log('Pista:', hint);
    };

    const isPathComplete = () => {
        if (currentPath.length === 0) return false;

        // Debug: Mostrar información de validación
        const lastCell = currentPath[currentPath.length - 1];
        const numberedCells = gridData.flat().filter(cell => cell.value !== null && cell.value > 0);
        const maxNumber = Math.max(...numberedCells.map(cell => cell.value || 0));
        const lastNumberCell = numberedCells.find(cell => cell.value === maxNumber);

        console.log('🔍 VALIDACIÓN DEL CAMINO:');
        console.log('   Última celda del camino:', lastCell);
        console.log('   Último número esperado:', maxNumber);
        console.log('   Celda del último número:', lastNumberCell);
        console.log('   ¿Coinciden?:', lastCell.x === lastNumberCell?.x && lastCell.y === lastNumberCell?.y);
        console.log('   ¿Valor de última celda es correcto?:', lastCell.value === maxNumber);

        const isValid = validatePath(gridData, currentPath);
        console.log('   Resultado de validación:', isValid);

        return isValid;
    };

    const handleLevelComplete = async () => {
        if (isPathComplete()) {
            try {
                // Marcar el nivel como completado en el almacenamiento local
                await markLevelCompleted(level.id);

                // Actualizar estadísticas locales
                const newCompletedCount = await getCompletedLevelsCount();
                setTotalCompletedLevels(newCompletedCount);
                setIsLevelAlreadyCompleted(true);

                console.log(`¡Nivel ${level.id} completado! Total completados: ${newCompletedCount}`);

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
                    <Text style={styles.title}>Nivel {level.difficulty}</Text>
                    <Text style={styles.subtitle}>{getDifficultyText(level.difficulty)} • {level.gridSize}x{level.gridSize}</Text>
                </View>
                <View style={styles.headerRight}>
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
});

export default GameScreen; 