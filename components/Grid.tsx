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
    onPathChange?: (path: Cell[]) => void;
    onReset?: () => void;
    onHint?: (hint: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const GRID_MARGIN = 20;
const CELL_SIZE = Math.min((screenWidth - GRID_MARGIN * 2) / 5, 60);

const Grid: React.FC<GridProps> = ({ grid, onPathChange, onReset, onHint }) => {
    const [path, setPath] = useState<Cell[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [hoveredCell, setHoveredCell] = useState<Cell | null>(null);
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

        // Verificar si es el siguiente número en secuencia
        const numberedCellsInPath = path.filter(c => c.value !== null);
        const nextExpectedNumber = numberedCellsInPath.length + 1;

        if (cell.value !== null && cell.value !== nextExpectedNumber) {
            return false; // No es el siguiente número en secuencia
        }

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
            return;
        }

        // Añadir celda al camino
        const newPath = [...path, cell];
        setPath(newPath);
        onPathChange?.(newPath);

        // Forzar re-render para actualizar las líneas de todas las celdas
        setTimeout(() => {
            setPath([...newPath]);
        }, 0);
    };



    const getCellFromPosition = (x: number, y: number): Cell | null => {
        if (!gridRef.current) return null;

        // Calcular la posición relativa al grid
        const gridX = Math.floor((x - GRID_MARGIN) / CELL_SIZE);
        const gridY = Math.floor((y - GRID_MARGIN) / CELL_SIZE);

        // Verificar que esté dentro del grid
        if (gridX < 0 || gridX >= 5 || gridY < 0 || gridY >= 5) {
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
        const isValidNext = isCellValidNext(cell);

        return [
            styles.cell,
            cell.value !== null && styles.cellWithNumber,
            cell.value === 1 && styles.startCell,
            cell.value === 4 && styles.endCell,
            isHovered && !isInPath && isValidNext && styles.cellHovered,
            isHovered && !isInPath && !isValidNext && styles.cellInvalid,
        ].filter(Boolean);
    };

    const getCellTextStyle = (cell: Cell) => {
        const pathIndex = getCellPathIndex(cell);
        const isInPath = pathIndex !== -1;

        return [
            styles.cellText,
            cell.value === 1 && styles.startText,
            cell.value === 4 && styles.endText,
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
                        styles.horizontalLine,
                        styles.lineRight
                    ]} />
                );
            case 'left':
                return (
                    <View style={[
                        styles.pathLine,
                        styles.horizontalLine,
                        styles.lineLeft
                    ]} />
                );
            case 'down':
                return (
                    <View style={[
                        styles.pathLine,
                        styles.verticalLine,
                        styles.lineDown
                    ]} />
                );
            case 'up':
                return (
                    <View style={[
                        styles.pathLine,
                        styles.verticalLine,
                        styles.lineUp
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
                        styles.horizontalLine,
                        styles.lineLeft
                    ]} />
                );
            case 'left':
                return (
                    <View style={[
                        styles.pathLine,
                        styles.horizontalLine,
                        styles.lineRight
                    ]} />
                );
            case 'down':
                return (
                    <View style={[
                        styles.pathLine,
                        styles.verticalLine,
                        styles.lineUp
                    ]} />
                );
            case 'up':
                return (
                    <View style={[
                        styles.pathLine,
                        styles.verticalLine,
                        styles.lineDown
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
                return `Error: Las celdas (${currentCell.x},${currentCell.y}) y (${nextCell.x},${nextCell.y}) no son adyacentes`;
            }
        }

        // Verificar si hay celdas repetidas
        const uniqueCells = new Set(path.map(cell => `${cell.x},${cell.y}`));
        if (uniqueCells.size !== path.length) {
            return "Error: Has pasado por la misma celda más de una vez";
        }

        // Si el camino está completo, verificar si termina en 4
        if (path.length === 25) {
            if (path[24].value !== 4) {
                return "El camino debe terminar en el número 4";
            }
            return "¡Camino completado correctamente!";
        }

        // Buscar la siguiente celda correcta
        const lastCell = path[path.length - 1];
        const adjacentCells = [];

        // Buscar celdas adyacentes no visitadas
        for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 5; x++) {
                const cell = grid[y][x];
                const isVisited = path.some(pathCell => pathCell.x === cell.x && pathCell.y === cell.y);

                if (isCellAdjacent(cell, lastCell) && !isVisited) {
                    adjacentCells.push(cell);
                }
            }
        }

        if (adjacentCells.length === 0) {
            return "No hay celdas adyacentes disponibles. Debes retroceder";
        }

        // Priorizar celdas con números en orden
        const numberedCells = adjacentCells.filter(cell => cell.value !== null);
        if (numberedCells.length > 0) {
            const numberedCellsInPath = path.filter(cell => cell.value !== null);
            const expectedNumber = numberedCellsInPath.length + 1;
            const correctCell = numberedCells.find(cell => cell.value === expectedNumber);
            if (correctCell) {
                return `Siguiente: Toca la celda (${correctCell.x},${correctCell.y}) con el número ${correctCell.value}`;
            }
        }

        // Si no hay números específicos, sugerir cualquier celda adyacente
        const suggestedCell = adjacentCells[0];
        return `Siguiente: Puedes tocar la celda (${suggestedCell.x},${suggestedCell.y})`;

    };

    const handleHint = () => {
        const hint = getHint();
        onHint?.(hint);
    };

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
                                style={getCellStyle(cell)}
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
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 1,
        position: 'relative',
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
    horizontalLine: {
        height: 6,
        width: CELL_SIZE / 2 + 3,
    },
    verticalLine: {
        width: 6,
        height: CELL_SIZE / 2 + 3,
    },
    lineRight: {
        left: CELL_SIZE / 2 - 3,
        top: (CELL_SIZE - 6) / 2,
    },
    lineLeft: {
        right: CELL_SIZE / 2 - 3,
        top: (CELL_SIZE - 6) / 2,
    },
    lineDown: {
        top: CELL_SIZE / 2 - 3,
        left: (CELL_SIZE - 6) / 2,
    },
    lineUp: {
        bottom: CELL_SIZE / 2 - 3,
        left: (CELL_SIZE - 6) / 2,
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