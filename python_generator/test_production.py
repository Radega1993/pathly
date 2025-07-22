#!/usr/bin/env python3
"""
Script de prueba para el generador de producción
"""

import json
from production_generator import ProductionPuzzleGenerator

def test_generator():
    """Prueba el generador de producción"""
    
    print("🧪 Probando generador de producción...")
    
    generator = ProductionPuzzleGenerator()
    
    # Probar generación de puzzle
    print("\n🎯 Generando puzzle de prueba...")
    puzzle = generator.generate_puzzle(4, 4)
    
    if puzzle:
        print("✅ Puzzle generado exitosamente:")
        print(f"   Dificultad: {puzzle['difficulty']}")
        print(f"   Tamaño: {puzzle['gridSize']}x{puzzle['gridSize']}")
        print(f"   Nivel: {puzzle['level']}")
        print(f"   Puzzle:")
        for row in puzzle['grid']:
            print(f"     {row}")
        
        # Validar el puzzle
        validate_puzzle(puzzle)
        
        return puzzle
    else:
        print("❌ Error generando puzzle")
        return None

def validate_puzzle(puzzle: dict):
    """Valida que un puzzle sea correcto"""
    
    print(f"🔍 Validando puzzle...")
    
    grid_size = puzzle['gridSize']
    puzzle_matrix = puzzle['grid']
    solution = puzzle['solution']
    
    # Verificar tamaño
    if len(puzzle_matrix) != grid_size:
        print(f"❌ Tamaño de matriz incorrecto")
        return False
    
    # Verificar que la solución use todas las celdas
    if len(solution) != grid_size * grid_size:
        print(f"❌ Solución incompleta: {len(solution)} vs {grid_size * grid_size}")
        return False
    
    # Verificar que no haya celdas repetidas
    unique_cells = set(tuple(cell) for cell in solution)
    if len(unique_cells) != len(solution):
        print(f"❌ Celdas repetidas en la solución")
        return False
    
    # Verificar que el camino sea continuo
    for i in range(len(solution) - 1):
        x1, y1 = solution[i]
        x2, y2 = solution[i + 1]
        if abs(x1 - x2) + abs(y1 - y2) != 1:
            print(f"❌ Camino no continuo: [{x1},{y1}] -> [{x2},{y2}]")
            return False
    
    # Verificar números en orden
    numbers_in_path = []
    for x, y in solution:
        if puzzle_matrix[x][y] > 0:
            numbers_in_path.append(puzzle_matrix[x][y])
    
    if not numbers_in_path:
        print(f"❌ No hay números en el puzzle")
        return False
    
    # Verificar que empiece en 1 y termine en el máximo
    if numbers_in_path[0] != 1:
        print(f"❌ No empieza en 1: {numbers_in_path}")
        return False
    
    max_num = max(numbers_in_path)
    if numbers_in_path[-1] != max_num:
        print(f"❌ No termina en el número máximo: {numbers_in_path}")
        return False
    
    # Verificar que estén en orden
    expected = list(range(1, max_num + 1))
    if numbers_in_path != expected:
        print(f"❌ Números no están en orden: {numbers_in_path} vs {expected}")
        return False
    
    print(f"✅ Puzzle válido: {len(numbers_in_path)} números en orden")
    return True

def test_firebase_integration():
    """Prueba la integración con Firebase"""
    
    print("\n🔥 Probando integración con Firebase...")
    
    generator = ProductionPuzzleGenerator()
    
    # Obtener siguiente número de nivel
    next_level = generator.get_next_level_number()
    print(f"   Siguiente nivel disponible: {next_level}")
    
    return next_level

def main():
    """Función principal"""
    
    # Probar generación
    puzzle = test_generator()
    
    if puzzle:
        # Probar integración Firebase
        next_level = test_firebase_integration()
        
        print(f"\n🎉 Pruebas completadas exitosamente!")
        print(f"   Puzzle generado: Nivel {puzzle['level']}")
        print(f"   Siguiente nivel disponible: {next_level}")
        
        # Guardar puzzle de prueba
        with open('test_puzzle.json', 'w') as f:
            json.dump(puzzle, f, indent=2)
        print(f"   💾 Puzzle guardado en: test_puzzle.json")
    
    else:
        print(f"\n❌ Pruebas fallidas")

if __name__ == "__main__":
    main() 