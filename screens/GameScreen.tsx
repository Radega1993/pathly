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

interface GameScreenProps {
    levelId: number;
    onBack: () => void;
    onLevelComplete: (levelId: number) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ levelId, onBack, onLevelComplete }) => {
    const [currentPath, setCurrentPath] = useState<Cell[]>([]);
    const [resetCount, setResetCount] = useState(0);
    const [currentHint, setCurrentHint] = useState<string>('');

    // Generar grid específico para cada nivel
    const generateLevelGrid = (level: number): Cell[][] => {
        const grid: Cell[][] = [];

        // Crear grid 5x5 base
        for (let y = 0; y < 5; y++) {
            grid[y] = [];
            for (let x = 0; x < 5; x++) {
                grid[y][x] = { value: null, x, y };
            }
        }

        // Configuraciones específicas para cada nivel (solo 7 niveles existentes)
        const levelConfigs: { [key: number]: Array<{ x: number; y: number; value: number }> } = {
            1: [
                { x: 0, y: 0, value: 1 },
                { x: 2, y: 1, value: 2 },
                { x: 3, y: 3, value: 3 },
                { x: 4, y: 4, value: 4 },
            ],
            2: [
                { x: 1, y: 0, value: 1 },
                { x: 3, y: 1, value: 2 },
                { x: 0, y: 3, value: 3 },
                { x: 4, y: 2, value: 4 },
            ],
            3: [
                { x: 2, y: 0, value: 1 },
                { x: 0, y: 2, value: 2 },
                { x: 4, y: 1, value: 3 },
                { x: 1, y: 4, value: 4 },
            ],
            4: [
                { x: 0, y: 1, value: 1 },
                { x: 4, y: 0, value: 2 },
                { x: 1, y: 3, value: 3 },
                { x: 3, y: 4, value: 4 },
            ],
            5: [
                { x: 1, y: 1, value: 1 },
                { x: 3, y: 0, value: 2 },
                { x: 0, y: 4, value: 3 },
                { x: 4, y: 3, value: 4 },
            ],
            6: [
                { x: 2, y: 2, value: 1 },
                { x: 0, y: 0, value: 2 },
                { x: 4, y: 0, value: 3 },
                { x: 2, y: 4, value: 4 },
            ],
            7: [
                { x: 0, y: 2, value: 1 },
                { x: 2, y: 0, value: 2 },
                { x: 4, y: 2, value: 3 },
                { x: 2, y: 4, value: 4 },
            ],
        };

        // Aplicar configuración del nivel
        const config = levelConfigs[level];
        if (!config) {
            // Si el nivel no existe, usar el nivel 1 como fallback
            levelConfigs[1].forEach(({ x, y, value }) => {
                grid[y][x].value = value;
            });
            return grid;
        }

        config.forEach(({ x, y, value }) => {
            grid[y][x].value = value;
        });

        return grid;
    };

    const [gridData] = useState<Cell[][]>(() => generateLevelGrid(levelId));

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
            onLevelComplete(levelId);
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

    // Verificar si el nivel existe
    const levelExists = levelId >= 1 && levelId <= 7;

    if (!levelExists) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Nivel {levelId}</Text>
                    <View style={styles.headerRight} />
                </View>

                <View style={styles.errorContainer}>
                    <Text style={styles.errorTitle}>🚧 Nivel en Desarrollo</Text>
                    <Text style={styles.errorText}>
                        Este nivel aún no está disponible. ¡Vuelve pronto!
                    </Text>
                    <TouchableOpacity style={styles.backToMenuButton} onPress={onBack}>
                        <Text style={styles.backToMenuButtonText}>Volver a Selección</Text>
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
                <Text style={styles.title}>Nivel {levelId}</Text>
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
});

export default GameScreen; 