import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import Grid, { Cell } from '../components/Grid';
import { validatePath } from '../utils/validatePath';
import { Level } from '../types/level';

interface GameScreenProps {
    level: Level;
    onBack: () => void;
    onLevelComplete: (level: Level) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ level, onBack, onLevelComplete }) => {
    const [currentPath, setCurrentPath] = useState<Cell[]>([]);
    const [resetCount, setResetCount] = useState(0);
    const [currentHint, setCurrentHint] = useState<string>('');

    // Usar el grid del nivel de Firestore
    const [gridData] = useState<Cell[][]>(() => level.grid);

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
        return validatePath(gridData, currentPath);
    };

    const handleLevelComplete = () => {
        if (isPathComplete()) {
            onLevelComplete(level);
        }
    };

    const getPathStatus = () => {
        if (currentPath.length === 0) return '🟡 Toca el número 1 para empezar';
        if (isPathComplete()) return '✅ ¡Nivel completado!';

        const totalCells = gridData.length * gridData[0].length;
        const remainingCells = totalCells - currentPath.length;

        if (remainingCells > 0) {
            return `🔄 Trazando camino... (${remainingCells} celdas restantes)`;
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
                </View>
            </View>

            {/* Grid del juego */}
            <View style={styles.gameContainer}>
                <Grid
                    grid={gridData}
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
                <Text style={styles.infoText}>
                    Progreso: {getProgressPercentage()}% ({currentPath.length}/25 celdas)
                </Text>
                <Text style={styles.infoText}>
                    Camino: {currentPath.map(cell => cell.value || '·').join(' → ')}
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