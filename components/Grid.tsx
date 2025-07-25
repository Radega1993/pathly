import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Dimensions,
    Pressable,
    Alert,
    PanResponder,
} from 'react-native';
import { audioService } from '../services/audio';

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
const GRID_MARGIN = 80; // Aumentado de 20 a 40
const getCellSize = (gridSize: number) => Math.min((screenWidth - GRID_MARGIN * 2) / gridSize, 60);

const Grid: React.FC<GridProps> = ({ grid, solution, onPathChange, onReset, onHint }) => {
    const [path, setPath] = useState<Cell[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hintCell, setHintCell] = useState<Cell | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [lastProcessedCell, setLastProcessedCell] = useState<Cell | null>(null);

    // Referencias para el mapeo de coordenadas
    const gridRef = useRef<View>(null);
    const cellRefs = useRef<{ [key: string]: View }>({});

    // Referencia para isDragging para evitar problemas de timing
    const isDraggingRef = useRef(false);

    // Referencia para el path actual para evitar problemas de closure
    const pathRef = useRef<Cell[]>([]);

    // Validar que la solución sea válida al cargar
    useEffect(() => {
        // Validación silenciosa de la solución
    }, [solution, grid]);

    // Encontrar el número 1 (punto de partida)
    const startCell = grid.flat().find(cell => cell.value === 1);
    // Encontrar el número 4 (punto final)
    const endCell = grid.flat().find(cell => cell.value === 4);

    const resetPath = () => {
        setPath([]);
        pathRef.current = [];
        setIsDrawing(false);
        setHintCell(null);
        setIsDragging(false);
        isDraggingRef.current = false;
        setLastProcessedCell(null);
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
        if (pathRef.current.length === 0) {
            return cell.value === 1; // Solo puede empezar en el número 1
        }

        const lastCell = pathRef.current[pathRef.current.length - 1];

        // Verificar si ya está en el camino (para retroceder)
        const cellIndex = pathRef.current.findIndex(pathCell =>
            pathCell.x === cell.x && pathCell.y === cell.y
        );
        if (cellIndex !== -1) {
            return true; // Permite retroceder
        }

        // Verificar si es adyacente
        const isAdjacent = isCellAdjacent(cell, lastCell);
        if (!isAdjacent) {
            return false;
        }

        // Obtener todos los números del grid
        const numberedCells = grid.flat().filter(cell => cell.value !== null && cell.value > 0);
        const maxNumber = Math.max(...numberedCells.map(cell => cell.value || 0));

        // Verificar si es el siguiente número en secuencia
        const numberedCellsInPath = pathRef.current.filter(c => c.value !== null);
        const nextExpectedNumber = numberedCellsInPath.length + 1;

        // Si la celda tiene un número, debe ser el siguiente en secuencia
        if (cell.value !== null) {
            if (cell.value !== nextExpectedNumber) {
                return false; // No es el siguiente número en secuencia
            }
        }

        // Permitir continuar después del último número
        // El jugador debe completar todo el grid, no solo conectar los números
        return true;
    };

    const addCellToPath = (cell: Cell) => {
        const path = pathRef.current;
        // Si el path está vacío, solo permite empezar en el número 1
        if (path.length === 0) {
            if (cell.value === 1) {
                setPath([cell]);
                pathRef.current = [cell];
                onPathChange?.([cell]);
                audioService.playForwardSound();
            }
            return;
        }

        // Si la celda es la última del path, no hacer nada
        const lastCell = path[path.length - 1];
        if (lastCell.x === cell.x && lastCell.y === cell.y) {
            return;
        }

        // Si la celda ya está en el path (retroceso)
        const cellIndex = path.findIndex(c => c.x === cell.x && c.y === cell.y);
        if (cellIndex !== -1) {
            const newPath = path.slice(0, cellIndex + 1);
            setPath(newPath);
            pathRef.current = newPath;
            onPathChange?.(newPath);
            audioService.playBackSound();
            return;
        }

        // Solo añadir si es adyacente y no está en el path
        if (isCellAdjacent(cell, lastCell)) {
            // Validar si es el siguiente número correcto
            if (isCellValidNext(cell)) {
                const newPath = [...path, cell];
                setPath(newPath);
                pathRef.current = newPath;
                onPathChange?.(newPath);
                audioService.playForwardSound();
            }
        }
    };

    // Función para obtener la celda en una posición específica
    const getCellAtPosition = (x: number, y: number): Cell | null => {
        if (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length) {
            return null;
        }
        return grid[y][x];
    };





    // Función para procesar el arrastre
    const processDrag = (screenX: number, screenY: number) => {
        // Usar gridRef.current.measure directamente para evitar problemas de timing
        if (!gridRef.current) {
            return;
        }

        gridRef.current.measure((x, y, width, height, pageX, pageY) => {

            const relativeX = screenX - pageX;
            const relativeY = screenY - pageY;

            // Verificar si el toque está dentro del grid
            if (relativeX < 0 || relativeX > width || relativeY < 0 || relativeY > height) {
                return;
            }

            const cellSize = getCellSize(grid.length);
            const cellMargin = 1; // Margen entre celdas
            const gridPadding = 4; // Padding del grid

            // Ajustar coordenadas considerando padding y márgenes
            const adjustedX = relativeX - gridPadding;
            const adjustedY = relativeY - gridPadding;

            // Calcular coordenadas de celda considerando márgenes
            const cellX = Math.floor(adjustedX / (cellSize + cellMargin * 2));
            const cellY = Math.floor(adjustedY / (cellSize + cellMargin * 2));

            // Verificar que las coordenadas estén dentro del rango del grid
            if (cellX < 0 || cellX >= grid[0].length || cellY < 0 || cellY >= grid.length) {
                return;
            }

            const cell = getCellAtPosition(cellX, cellY);
            if (!cell) {
                return;
            }

            // Evitar procesar la misma celda múltiples veces
            if (lastProcessedCell &&
                lastProcessedCell.x === cell.x &&
                lastProcessedCell.y === cell.y) {
                return;
            }

            setLastProcessedCell(cell);

            // Si no hay camino iniciado y es el número 1, iniciar
            if (pathRef.current.length === 0 && cell.value === 1) {
                const newPath = [cell];
                setPath(newPath);
                pathRef.current = newPath;
                setIsDrawing(true);
                onPathChange?.(newPath);
                audioService.playForwardSound();
                return;
            }

            // Si hay un camino iniciado, intentar añadir la celda
            if (pathRef.current.length > 0) {
                addCellToPath(cell);
            }
        });
    };

    // Configurar PanResponder para el arrastre
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => {
                return false; // No capturar inmediatamente
            },
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                // Solo capturar si hay movimiento significativo (más de 5 píxeles)
                const distance = Math.sqrt(gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy);
                return distance > 5;
            },
            onPanResponderGrant: (evt) => {
                setIsDragging(true);
                isDraggingRef.current = true;
                setLastProcessedCell(null);

                // Procesar el toque inicial
                const { pageX, pageY } = evt.nativeEvent;
                processDrag(pageX, pageY);
            },
            onPanResponderMove: (evt) => {
                if (!isDraggingRef.current) {
                    return;
                }

                const { pageX, pageY } = evt.nativeEvent;
                processDrag(pageX, pageY);
            },
            onPanResponderRelease: () => {
                setIsDragging(false);
                isDraggingRef.current = false;
                setLastProcessedCell(null);
            },
            onPanResponderTerminate: () => {
                setIsDragging(false);
                isDraggingRef.current = false;
                setLastProcessedCell(null);
            },
        })
    ).current;



    const handleCellPress = (cell: Cell) => {
        // Si es el número 1, iniciar nuevo camino
        if (cell.value === 1) {
            const newPath = [cell];
            setPath(newPath);
            pathRef.current = newPath;
            setIsDrawing(true);
            onPathChange?.(newPath);
            audioService.playForwardSound();
            return;
        }

        // Si no hay camino iniciado, no hacer nada
        if (path.length === 0) {
            return;
        }

        addCellToPath(cell);
    };

    const handleCellLongPress = (cell: Cell) => {
        // Permitir iniciar desde cualquier celda con long press
        if (path.length === 0) {
            const newPath = [cell];
            setPath(newPath);
            pathRef.current = newPath;
            setIsDrawing(true);
            onPathChange?.(newPath);
            audioService.playForwardSound();
        } else {
            addCellToPath(cell);
        }
    };

    const getCellPathIndex = (cell: Cell): number => {
        return path.findIndex(pathCell => pathCell.x === cell.x && pathCell.y === cell.y);
    };

    const getCellStyle = (cell: Cell) => {
        const pathIndex = getCellPathIndex(cell);
        const isInPath = pathIndex !== -1;
        const isHintCell = hintCell && hintCell.x === cell.x && hintCell.y === cell.y;

        return [
            cell.value !== null && styles.cellWithNumber,
            cell.value === 1 && styles.startCell,
            // La pista tiene prioridad sobre otros estilos
            isHintCell && styles.cellHint,
            // Solo aplicar estilo especial si está en el camino (pero sin cambiar el fondo)
            isInPath && styles.cellInPath,
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
                        {
                            width: cellSize / 2 + 3,
                            height: 6,
                            left: cellSize / 2 - 3,
                            top: (cellSize - 6) / 2,
                            backgroundColor: '#3B82F6',
                            borderRadius: 3,
                            zIndex: 10,
                        }
                    ]} />
                );
            case 'left':
                return (
                    <View style={[
                        styles.pathLine,
                        {
                            width: cellSize / 2 + 3,
                            height: 6,
                            right: cellSize / 2 - 3,
                            top: (cellSize - 6) / 2,
                            backgroundColor: '#3B82F6',
                            borderRadius: 3,
                            zIndex: 10,
                        }
                    ]} />
                );
            case 'down':
                return (
                    <View style={[
                        styles.pathLine,
                        {
                            width: 6,
                            height: cellSize / 2 + 3,
                            top: cellSize / 2 - 3,
                            left: (cellSize - 6) / 2,
                            backgroundColor: '#3B82F6',
                            borderRadius: 3,
                            zIndex: 10,
                        }
                    ]} />
                );
            case 'up':
                return (
                    <View style={[
                        styles.pathLine,
                        {
                            width: 6,
                            height: cellSize / 2 + 3,
                            bottom: cellSize / 2 - 3,
                            left: (cellSize - 6) / 2,
                            backgroundColor: '#3B82F6',
                            borderRadius: 3,
                            zIndex: 10,
                        }
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
                        {
                            width: cellSize / 2 + 3,
                            height: 6,
                            right: cellSize / 2 - 3,
                            top: (cellSize - 6) / 2,
                            backgroundColor: '#3B82F6',
                            borderRadius: 3,
                            zIndex: 10,
                        }
                    ]} />
                );
            case 'left':
                return (
                    <View style={[
                        styles.pathLine,
                        {
                            width: cellSize / 2 + 3,
                            height: 6,
                            left: cellSize / 2 - 3,
                            top: (cellSize - 6) / 2,
                            backgroundColor: '#3B82F6',
                            borderRadius: 3,
                            zIndex: 10,
                        }
                    ]} />
                );
            case 'down':
                return (
                    <View style={[
                        styles.pathLine,
                        {
                            width: 6,
                            height: cellSize / 2 + 3,
                            bottom: cellSize / 2 - 3,
                            left: (cellSize - 6) / 2,
                            backgroundColor: '#3B82F6',
                            borderRadius: 3,
                            zIndex: 10,
                        }
                    ]} />
                );
            case 'up':
                return (
                    <View style={[
                        styles.pathLine,
                        {
                            width: 6,
                            height: cellSize / 2 + 3,
                            top: cellSize / 2 - 3,
                            left: (cellSize - 6) / 2,
                            backgroundColor: '#3B82F6',
                            borderRadius: 3,
                            zIndex: 10,
                        }
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
        if (!solution || solution.length === 0) {
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

        // Comparar el camino actual con la solución
        const lastCorrectIndex = findLastCorrectIndex();

        if (lastCorrectIndex === -1) {
            return "El camino es incorrecto desde el inicio. Empieza de nuevo desde el número 1";
        }

        if (lastCorrectIndex < path.length - 1) {
            // Hay un error en el camino - el usuario se equivocó
            return `El camino es correcto hasta el paso ${lastCorrectIndex + 1}. Retrocede hasta esa posición y prueba otra dirección`;
        }

        // El camino es correcto hasta ahora, sugerir la siguiente celda
        if (path.length < solution.length) {
            const nextSolutionCell = solution[path.length];
            return `Siguiente paso: Ve a la celda (${nextSolutionCell.x}, ${nextSolutionCell.y})`;
        }

        return "¡Camino completado! Has seguido la solución correcta";
    };

    // Función para normalizar el formato de coordenadas
    const normalizeCoordinates = (cell: Cell | { x: number; y: number }): { x: number; y: number } => {
        return {
            x: cell.x,
            y: cell.y
        };
    };

    const findLastCorrectIndex = (): number => {
        if (!solution || path.length === 0) return -1;

        let lastCorrectIndex = -1;

        for (let i = 0; i < Math.min(path.length, solution.length); i++) {
            const pathCell = normalizeCoordinates(path[i]);
            const solutionCell = normalizeCoordinates(solution[i]);

            // Invertir x,y del camino para comparar con la solución
            const pathX = pathCell.y; // Usar y como x
            const pathY = pathCell.x; // Usar x como y

            if (pathX === solutionCell.x && pathY === solutionCell.y) {
                lastCorrectIndex = i;
            } else {
                break; // Encontró el primer error
            }
        }

        return lastCorrectIndex;
    };

    const handleHint = () => {
        const hint = getHint();
        onHint?.(hint);

        // Iluminar la celda sugerida si es posible
        const suggestedCell = getSuggestedCell();
        setHintCell(suggestedCell);

        // Quitar la iluminación después de 5 segundos para dar más tiempo al usuario
        setTimeout(() => {
            setHintCell(null);
        }, 5000);
    };

    const getSuggestedCell = (): Cell | null => {
        if (!solution || solution.length === 0) {
            return null;
        }

        if (path.length === 0) {
            // Si no hay camino, sugerir el número 1
            return grid.flat().find(cell => cell.value === 1) || null;
        }

        // Comparar el camino actual con la solución
        const lastCorrectIndex = findLastCorrectIndex();

        if (lastCorrectIndex === -1) {
            // El camino es incorrecto desde el inicio, sugerir el número 1
            return grid.flat().find(cell => cell.value === 1) || null;
        }

        if (lastCorrectIndex < path.length - 1) {
            // Hay un error en el camino - iluminar la última celda correcta para que retroceda
            const lastCorrectCell = path[lastCorrectIndex];
            return lastCorrectCell;
        }

        // El camino es correcto hasta ahora - iluminar la siguiente celda de la solución
        if (path.length < solution.length) {
            const nextSolutionCell = solution[path.length];

            // Invertir coordenadas para acceso al grid
            const gridY = nextSolutionCell.x; // Usar x de solución como y del grid
            const gridX = nextSolutionCell.y; // Usar y de solución como x del grid

            // Verificar que las coordenadas estén dentro del grid
            if (gridY >= 0 && gridY < grid.length &&
                gridX >= 0 && gridX < grid[0].length) {
                const nextCell = grid[gridY][gridX];
                return nextCell;
            } else {
                return null;
            }
        }

        return null; // Ya completó el camino
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
                                onPress={() => {
                                    handleCellPress(cell);
                                }}
                                onLongPress={() => {
                                    handleCellLongPress(cell);
                                }}
                                activeOpacity={0.7}
                                delayLongPress={300}
                                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                                ref={(ref) => {
                                    if (ref) {
                                        cellRefs.current[`${rowIndex}-${colIndex}`] = ref;
                                    }
                                }}
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
    cellInPath: {
        borderColor: '#3B82F6',
        borderWidth: 2,
    },
    cellHint: {
        backgroundColor: '#FEF3C7',
        borderColor: '#F59E0B',
        borderWidth: 4,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 12,
        elevation: 8,
        transform: [{ scale: 1.05 }], // Hacer la celda ligeramente más grande
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
        fontWeight: 'bold',
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