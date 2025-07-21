import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Dimensions,
    Pressable,
    PanResponder,
} from 'react-native';

// Tipos para las celdas del grid
export interface Cell {
    value: number | null;
    x: number;
    y: number;
}

export interface GridProps {
    grid: Cell[][];
    solution?: Array<{ x: number; y: number }>;
    onPathChange?: (path: Cell[]) => void;
    onReset?: () => void;
    onHint?: (hint: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const GRID_MARGIN = 20;
const getCellSize = (gridSize: number) => Math.min((screenWidth - GRID_MARGIN * 2) / gridSize, 60);

const Grid: React.FC<GridProps> = ({ grid, solution, onPathChange, onReset, onHint }) => {
    const [path, setPath] = useState<Cell[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [hoveredCell, setHoveredCell] = useState<Cell | null>(null);
    const [hintCell, setHintCell] = useState<Cell | null>(null);
    const gridRef = useRef<View>(null);

    // Encontrar el número 1 (punto de partida)
    const startCell = grid.flat().find(cell => cell.value === 1);
    // Encontrar el número 4 (punto final)
    const endCell = grid.flat().find(cell => cell.value === 4);

    const resetPath = () => {
        setPath([]);
        setIsDrawing(false);
        setIsDragging(false);
        setHoveredCell(null);
        setHintCell(null);
        onPathChange?.([]);
    };

    const handleReset = () => {
        resetPath();
        onReset?.();
    };

    const isCellAdjacent = (cell1: Cell, cell2: Cell): boolean => {
        return (
            (Math.abs(cell1.x - cell2.x) === 1 && cell1.y === cell2.y) ||
            (Math.abs(cell1.y - cell2.y) === 1 && cell1.x === cell2.x)
        );
    };

    const isCellValidNext = (cell: Cell): boolean => {
        if (path.length === 0) {
            return cell.value === 1; // Solo puede empezar en el número 1
        }

        const lastCell = path[path.length - 1];

        // Verificar si ya está en el camino (para retroceder)
        const cellIndex = path.findIndex(pathCell =>
            pathCell.x === cell.x && pathCell.y === cell.y
        );
        if (cellIndex !== -1) {
            return true; // Permite retroceder
        }

        // Verificar si es adyacente
        if (!isCellAdjacent(cell, lastCell)) {
            return false;
        }

        // Obtener todos los números del grid
        const numberedCells = grid.flat().filter(cell => cell.value !== null && cell.value > 0);
        const maxNumber = Math.max(...numberedCells.map(cell => cell.value || 0));

        // Verificar si es el siguiente número en secuencia
        const numberedCellsInPath = path.filter(c => c.value !== null);
        const nextExpectedNumber = numberedCellsInPath.length + 1;

        // Si la celda tiene un número, debe ser el siguiente en secuencia
        if (cell.value !== null) {
            if (cell.value !== nextExpectedNumber) {
                return false; // No es el siguiente número en secuencia
            }
        }

        // ARREGLADO: Permitir continuar después del último número
        // El jugador debe completar todo el grid, no solo conectar los números
        return true;

        return true;
    };

    const addCellToPath = (cell: Cell) => {
        // Verificar si ya está en el camino (retroceder)
        const cellIndex = path.findIndex(pathCell =>
            pathCell.x === cell.x && pathCell.y === cell.y
        );

        if (cellIndex !== -1) {
            // Retroceder hasta ese punto
            const newPath = path.slice(0, cellIndex + 1);
            setPath(newPath);
            onPathChange?.(newPath);
            return;
        }

        // Verificar si es válido para añadir
        if (!isCellValidNext(cell)) {
            console.log('❌ Celda no válida:', cell);
            return;
        }

        // Añadir celda al camino
        const newPath = [...path, cell];
        setPath(newPath);
        onPathChange?.(newPath);

        // Debug: Mostrar información del camino
        const numberedCellsInPath = newPath.filter(c => c.value !== null);
        const totalCells = grid.length * grid.length;
        console.log(`✅ Celda añadida: (${cell.x}, ${cell.y}) - Valor: ${cell.value}`);
        console.log(`📊 Camino: ${newPath.length}/${totalCells} celdas, ${numberedCellsInPath.length} números`);

        // Forzar re-render para actualizar las líneas de todas las celdas
        setTimeout(() => {
            setPath([...newPath]);
        }, 0);
    };



    const getCellFromPosition = (x: number, y: number): Cell | null => {
        if (!gridRef.current) return null;

        const gridSize = grid.length;
        const cellSize = getCellSize(gridSize);

        // Calcular la posición relativa al grid
        const gridX = Math.floor((x - GRID_MARGIN) / cellSize);
        const gridY = Math.floor((y - GRID_MARGIN) / cellSize);

        // Verificar que esté dentro del grid
        if (gridX < 0 || gridX >= gridSize || gridY < 0 || gridY >= gridSize) {
            return null;
        }

        return grid[gridY][gridX];
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                const { locationX, locationY } = evt.nativeEvent;
                const cell = getCellFromPosition(locationX, locationY);

                if (cell) {
                    if (cell.value === 1) {
                        // Iniciar nuevo camino desde el número 1
                        setPath([cell]);
                        setIsDrawing(true);
                        setIsDragging(true);
                        onPathChange?.([cell]);
                    } else if (path.length > 0) {
                        // Continuar camino existente
                        setIsDragging(true);
                        addCellToPath(cell);
                    }
                }
            },
            onPanResponderMove: (evt) => {
                if (!isDragging) return;

                const { locationX, locationY } = evt.nativeEvent;
                const cell = getCellFromPosition(locationX, locationY);

                if (cell) {
                    setHoveredCell(cell);
                    addCellToPath(cell);
                }
            },
            onPanResponderRelease: () => {
                setIsDragging(false);
                setHoveredCell(null);
            },
        })
    ).current;

    const handleCellPress = (cell: Cell) => {
        // Si es el número 1, iniciar nuevo camino
        if (cell.value === 1) {
            setPath([cell]);
            setIsDrawing(true);
            onPathChange?.([cell]);
            return;
        }

        // Si no hay camino iniciado, no hacer nada
        if (path.length === 0) {
            return;
        }

        addCellToPath(cell);
    };

    const getCellPathIndex = (cell: Cell): number => {
        return path.findIndex(pathCell => pathCell.x === cell.x && pathCell.y === cell.y);
    };

    const getCellStyle = (cell: Cell) => {
        const pathIndex = getCellPathIndex(cell);
        const isInPath = pathIndex !== -1;
        const isHovered = hoveredCell && hoveredCell.x === cell.x && hoveredCell.y === cell.y;
        const isHintCell = hintCell && hintCell.x === cell.x && hintCell.y === cell.y;
        const isValidNext = isCellValidNext(cell);

        return [
            cell.value !== null && styles.cellWithNumber,
            cell.value === 1 && styles.startCell,
            isHovered && !isInPath && isValidNext && styles.cellHovered,
            isHovered && !isInPath && !isValidNext && styles.cellInvalid,
            isHintCell && !isInPath && styles.cellHint,
        ].filter(Boolean);
    };

    const getCellTextStyle = (cell: Cell) => {
        const pathIndex = getCellPathIndex(cell);
        const isInPath = pathIndex !== -1;

        return [
            styles.cellText,
            cell.value === 1 && styles.startText,
            isInPath && styles.pathText,
        ].filter(Boolean);
    };



    const renderPathLine = (cell: Cell) => {
        const pathIndex = getCellPathIndex(cell);
        if (pathIndex === -1) return null;

        const currentCell = cell;
        const prevCell = pathIndex > 0 ? path[pathIndex - 1] : null;
        const nextCell = pathIndex < path.length - 1 ? path[pathIndex + 1] : null;

        // Si es la primera celda, mostrar línea hacia la siguiente
        if (pathIndex === 0 && nextCell) {
            return renderLineToCell(currentCell, nextCell);
        }

        // Si es la última celda, mostrar línea desde la anterior
        if (pathIndex === path.length - 1 && prevCell) {
            return renderLineFromCell(prevCell, currentCell);
        }

        // Si es una celda intermedia, mostrar líneas desde la anterior y hacia la siguiente
        return (
            <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
                {prevCell && renderLineFromCell(prevCell, currentCell)}
                {nextCell && renderLineToCell(currentCell, nextCell)}
            </View>
        );
    };

    const renderLineToCell = (fromCell: Cell, toCell: Cell) => {
        const direction = getDirection(fromCell, toCell);

        switch (direction) {
            case 'right':
                return (
                    <View style={[
                        styles.pathLine,
                        dynamicStyles.horizontalLine,
                        dynamicStyles.lineRight
                    ]} />
                );
            case 'left':
                return (
                    <View style={[
                        styles.pathLine,
                        dynamicStyles.horizontalLine,
                        dynamicStyles.lineLeft
                    ]} />
                );
            case 'down':
                return (
                    <View style={[
                        styles.pathLine,
                        dynamicStyles.verticalLine,
                        dynamicStyles.lineDown
                    ]} />
                );
            case 'up':
                return (
                    <View style={[
                        styles.pathLine,
                        dynamicStyles.verticalLine,
                        dynamicStyles.lineUp
                    ]} />
                );
            default:
                return null;
        }
    };

    const renderLineFromCell = (fromCell: Cell, toCell: Cell) => {
        const direction = getDirection(fromCell, toCell);

        switch (direction) {
            case 'right':
                return (
                    <View style={[
                        styles.pathLine,
                        dynamicStyles.horizontalLine,
                        dynamicStyles.lineLeft
                    ]} />
                );
            case 'left':
                return (
                    <View style={[
                        styles.pathLine,
                        dynamicStyles.horizontalLine,
                        dynamicStyles.lineRight
                    ]} />
                );
            case 'down':
                return (
                    <View style={[
                        styles.pathLine,
                        dynamicStyles.verticalLine,
                        dynamicStyles.lineUp
                    ]} />
                );
            case 'up':
                return (
                    <View style={[
                        styles.pathLine,
                        dynamicStyles.verticalLine,
                        dynamicStyles.lineDown
                    ]} />
                );
            default:
                return null;
        }
    };

    const getDirection = (fromCell: Cell, toCell: Cell): string => {
        if (fromCell.x === toCell.x) {
            return fromCell.y < toCell.y ? 'down' : 'up';
        } else if (fromCell.y === toCell.y) {
            return fromCell.x < toCell.x ? 'right' : 'left';
        }
        return 'none';
    };

    const getHint = (): string => {
        console.log('🔍 GETTING HINT - Path length:', path.length);
        console.log('🔍 GETTING HINT - Solution:', solution);

        if (!solution || solution.length === 0) {
            console.log('❌ No hay solución disponible');
            return "No hay solución disponible para este nivel";
        }

        if (path.length === 0) {
            return "Toca el número 1 para empezar el camino";
        }

        // Verificar si el camino empieza correctamente
        if (path[0].value !== 1) {
            return "El camino debe empezar en el número 1";
        }

        // Verificar si hay celdas no adyacentes
        for (let i = 0; i < path.length - 1; i++) {
            const currentCell = path[i];
            const nextCell = path[i + 1];

            if (!isCellAdjacent(currentCell, nextCell)) {
                return "Error: Has saltado celdas. El camino debe ser continuo";
            }
        }

        // Verificar si hay celdas repetidas
        const uniqueCells = new Set(path.map(cell => `${cell.x},${cell.y}`));
        if (uniqueCells.size !== path.length) {
            return "Error: Has pasado por la misma celda más de una vez";
        }

        // SOLUCIÓN TEMPORAL: En lugar de comparar con la solución exacta,
        // vamos a guiar al usuario basándonos en los números en el grid
        const numberedCells = grid.flat().filter(cell => cell.value !== null).sort((a, b) => (a.value || 0) - (b.value || 0));
        const maxNumber = Math.max(...numberedCells.map(cell => cell.value || 0));

        // Verificar si el camino está completo (todos los números conectados)
        const numbersInPath = path.filter(cell => cell.value !== null).sort((a, b) => (a.value || 0) - (b.value || 0));
        const expectedNumbers = numberedCells.slice(0, numbersInPath.length);

        const pathIsCorrect = numbersInPath.every((cell, index) => {
            const expectedCell = expectedNumbers[index];
            return cell.value === expectedCell.value;
        });

        if (!pathIsCorrect) {
            return "Has tomado un camino incorrecto. Retrocede y prueba otra dirección";
        }

        // Si el camino es correcto hasta ahora, sugerir el siguiente número
        const nextExpectedNumber = numbersInPath.length + 1;
        if (nextExpectedNumber <= maxNumber) {
            return `Siguiente: Busca y toca el número ${nextExpectedNumber}`;
        }

        // Si ya conectó todos los números, verificar si completó el grid
        const totalCells = grid.length * grid.length;
        if (path.length === totalCells) {
            // Verificar si termina en el último número
            const lastCell = path[path.length - 1];
            const lastNumberCell = numberedCells.find(cell => cell.value === maxNumber);

            if (lastCell.x === lastNumberCell?.x && lastCell.y === lastNumberCell?.y) {
                return "¡Nivel completado! Has usado todas las celdas y conectado todos los números.";
            } else {
                return `Has usado todas las celdas, pero el camino debe terminar en el número ${maxNumber} (${lastNumberCell?.x},${lastNumberCell?.y}).`;
            }
        }

        // Si ya conectó todos los números pero no completó el grid
        if (nextExpectedNumber > maxNumber) {
            const remainingCells = totalCells - path.length;
            return `Has conectado todos los números. Ahora completa el grid visitando las ${remainingCells} celdas restantes.`;
        }

        return "Continúa conectando los números en orden";
    };

    const handleHint = () => {
        const hint = getHint();
        onHint?.(hint);

        // Iluminar la celda sugerida si es posible
        const suggestedCell = getSuggestedCell();
        setHintCell(suggestedCell);

        // Quitar la iluminación después de 3 segundos
        setTimeout(() => {
            setHintCell(null);
        }, 3000);
    };

    const getSuggestedCell = (): Cell | null => {
        if (path.length === 0) {
            // Si no hay camino, sugerir el número 1
            return grid.flat().find(cell => cell.value === 1) || null;
        }

        // SOLUCIÓN TEMPORAL: Buscar el siguiente número en secuencia
        const numberedCells = grid.flat().filter(cell => cell.value !== null).sort((a, b) => (a.value || 0) - (b.value || 0));
        const numbersInPath = path.filter(cell => cell.value !== null).sort((a, b) => (a.value || 0) - (b.value || 0));
        const nextExpectedNumber = numbersInPath.length + 1;
        const maxNumber = Math.max(...numberedCells.map(cell => cell.value || 0));

        // Verificar si el camino actual es correcto
        const pathIsCorrect = numbersInPath.every((cell, index) => {
            const expectedCell = numberedCells[index];
            return cell.value === expectedCell.value;
        });

        if (!pathIsCorrect) {
            return null; // No sugerir si el camino es incorrecto
        }

        // Buscar el siguiente número
        const nextNumberCell = numberedCells.find(cell => cell.value === nextExpectedNumber);
        if (nextNumberCell) {
            return nextNumberCell;
        }

        // Si ya conectó todos los números, sugerir celdas adyacentes vacías
        if (nextExpectedNumber > maxNumber) {
            const lastCell = path[path.length - 1];
            const adjacentCells = [];
            const gridSize = grid.length;

            for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                    const cell = grid[y][x];
                    const isVisited = path.some(pathCell => pathCell.x === cell.x && pathCell.y === cell.y);

                    if (isCellAdjacent(cell, lastCell) && !isVisited) {
                        adjacentCells.push(cell);
                    }
                }
            }

            return adjacentCells[0] || null;
        }

        return null;
    };

    const gridSize = grid.length;
    const cellSize = getCellSize(gridSize);

    const dynamicStyles = StyleSheet.create({
        cell: {
            width: cellSize,
            height: cellSize,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 1,
            position: 'relative',
        },
        horizontalLine: {
            height: 6,
            width: cellSize / 2 + 3,
        },
        verticalLine: {
            width: 6,
            height: cellSize / 2 + 3,
        },
        lineRight: {
            left: cellSize / 2 - 3,
            top: (cellSize - 6) / 2,
        },
        lineLeft: {
            right: cellSize / 2 - 3,
            top: (cellSize - 6) / 2,
        },
        lineDown: {
            top: cellSize / 2 - 3,
            left: (cellSize - 6) / 2,
        },
        lineUp: {
            bottom: cellSize / 2 - 3,
            left: (cellSize - 6) / 2,
        },
    });

    return (
        <View style={styles.container}>
            <View
                ref={gridRef}
                style={styles.grid}
                {...panResponder.panHandlers}
            >
                {grid.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {row.map((cell, colIndex) => (
                            <TouchableOpacity
                                key={`${rowIndex}-${colIndex}`}
                                style={[dynamicStyles.cell, ...getCellStyle(cell)]}
                                onPress={() => handleCellPress(cell)}
                                activeOpacity={0.7}
                                disabled={isDragging} // Deshabilitar durante el drag
                            >
                                {renderPathLine(cell)}
                                {cell.value !== null && (
                                    <View style={styles.numberContainer}>
                                        <Text style={getCellTextStyle(cell)}>
                                            {cell.value}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>

            <View style={styles.buttonContainer}>
                <Pressable style={styles.resetButton} onPress={handleReset}>
                    <Text style={styles.resetButtonText}>🔄 Reiniciar</Text>
                </Pressable>

                <Pressable style={styles.hintButton} onPress={handleHint}>
                    <Text style={styles.hintButtonText}>💡 Pista</Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: GRID_MARGIN,
    },
    grid: {
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
        padding: 4,
        position: 'relative',
    },
    row: {
        flexDirection: 'row',
    },
    cellWithNumber: {
        backgroundColor: '#F3F4F6',
    },
    startCell: {
        backgroundColor: '#22C55E',
    },
    endCell: {
        backgroundColor: '#F59E0B',
    },
    cellHovered: {
        backgroundColor: '#DBEAFE',
        borderColor: '#3B82F6',
        borderWidth: 2,
    },
    cellInvalid: {
        backgroundColor: '#FEE2E2',
        borderColor: '#EF4444',
        borderWidth: 2,
    },
    cellHint: {
        backgroundColor: '#FEF3C7',
        borderColor: '#F59E0B',
        borderWidth: 3,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 5,
    },
    numberContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20, // Asegurar que esté por encima de todo
    },
    cellText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
    },
    startText: {
        color: '#FFFFFF',
    },
    endText: {
        color: '#FFFFFF',
    },
    pathText: {
        color: '#3B82F6',
    },
    pathLine: {
        position: 'absolute',
        backgroundColor: '#3B82F6',
        zIndex: 1,
        borderRadius: 2,
    },

    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    },
    resetButton: {
        backgroundColor: '#6B7280',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    resetButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    hintButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    hintButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Grid; 