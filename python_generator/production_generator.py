#!/usr/bin/env python3
"""
Generador de Producción para PuzzlePath
Genera puzzles y los sube automáticamente a Firebase con numeración secuencial
"""

import os
import json
import random
import argparse
from typing import List, Tuple, Optional, Dict
from dataclasses import dataclass
from enum import Enum
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class Difficulty(Enum):
    MUY_FACIL = "muy_facil"
    FACIL = "facil"
    NORMAL = "normal"
    DIFICIL = "dificil"
    EXTREMO = "extremo"

@dataclass
class PuzzleConfig:
    """Configuración para generar puzzles"""
    grid_size: int
    num_numbers: int
    difficulty: Difficulty

class ProductionPuzzleGenerator:
    """Generador de puzzles para producción con integración Firebase"""
    
    def __init__(self):
        self.directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]  # derecha, abajo, izquierda, arriba
        
        # Inicializar Firebase
        if not firebase_admin._apps:
            cred = credentials.Certificate("service-account-key.json")
            firebase_admin.initialize_app(cred)
        
        self.db = firestore.client()
    
    def create_matrix(self, size: int) -> List[List[int]]:
        """Crea una matriz de tamaño NxN"""
        return [[0 for _ in range(size)] for _ in range(size)]
    
    def select_start_end_points(self, size: int) -> Tuple[Tuple[int, int], Tuple[int, int]]:
        """Selecciona puntos de inicio y fin aleatorios diferentes"""
        all_points = [(i, j) for i in range(size) for j in range(size)]
        start_point = random.choice(all_points)
        
        # Asegurar que el punto final sea diferente
        remaining_points = [p for p in all_points if p != start_point]
        end_point = random.choice(remaining_points)
        
        return start_point, end_point
    
    def find_hamiltonian_path(self, size: int, start: Tuple[int, int], end: Tuple[int, int]) -> Optional[List[Tuple[int, int]]]:
        """Busca un camino hamiltoniano (recorre todas las celdas sin repetir)"""
        def is_valid(x: int, y: int) -> bool:
            return 0 <= x < size and 0 <= y < size
        
        def get_neighbors(x: int, y: int) -> List[Tuple[int, int]]:
            neighbors = []
            for dx, dy in self.directions:
                nx, ny = x + dx, y + dy
                if is_valid(nx, ny) and (nx, ny) not in visited:
                    neighbors.append((nx, ny))
            return neighbors
        
        def count_accessible_cells(x: int, y: int) -> int:
            """Cuenta cuántas celdas son accesibles desde una posición"""
            count = 0
            for dx, dy in self.directions:
                nx, ny = x + dx, y + dy
                if is_valid(nx, ny) and (nx, ny) not in visited:
                    count += 1
            return count
        
        def backtrack(current: Tuple[int, int], path: List[Tuple[int, int]]) -> bool:
            if len(path) == size * size:
                return current == end
            
            # Obtener vecinos y ordenarlos por heurística
            neighbors = get_neighbors(*current)
            
            # Heurística: preferir vecinos con menos opciones futuras
            def heuristic_score(pos):
                # Si es el final y estamos cerca del final del camino, dar prioridad
                if pos == end and len(path) == size * size - 1:
                    return -1000
                
                # Contar opciones futuras
                future_options = count_accessible_cells(*pos)
                
                # Penalizar esquinas y bordes si no son el final
                if pos != end:
                    if (pos[0] in [0, size-1] and pos[1] in [0, size-1]):
                        future_options += 2  # Penalizar esquinas
                    elif pos[0] in [0, size-1] or pos[1] in [0, size-1]:
                        future_options += 1  # Penalizar bordes
                
                return future_options
            
            neighbors.sort(key=heuristic_score)
            
            for next_pos in neighbors:
                path.append(next_pos)
                visited.add(next_pos)
                
                if backtrack(next_pos, path):
                    return True
                
                path.pop()
                visited.remove(next_pos)
            
            return False
        
        # Intentar múltiples veces con diferentes estrategias
        max_attempts = 20 if size <= 4 else 30
        
        for attempt in range(max_attempts):
            visited = {start}
            path = [start]
            
            if backtrack(start, path):
                return path
            
            # Si falla, intentar con un orden diferente de direcciones
            random.shuffle(self.directions)
            
            # Para puzzles pequeños, también probar diferentes puntos de inicio/fin
            if size <= 4 and attempt > 10:
                # Generar nuevos puntos de inicio/fin
                all_points = [(i, j) for i in range(size) for j in range(size)]
                start = random.choice(all_points)
                remaining = [p for p in all_points if p != start]
                end = random.choice(remaining)
        
        return None
    
    def validate_and_add_numbers(self, path: List[Tuple[int, int]], num_numbers: int) -> Tuple[List[List[int]], bool]:
        """Valida el camino y añade números secuenciales"""
        if not path:
            return [], False
        
        size = int(len(path) ** 0.5)
        matrix = self.create_matrix(size)
        
        # Verificar que el camino use todas las celdas
        if len(path) != size * size:
            return matrix, False
        
        # Verificar que no haya celdas repetidas
        if len(set(path)) != len(path):
            return matrix, False
        
        # Verificar que el camino sea continuo
        for i in range(len(path) - 1):
            x1, y1 = path[i]
            x2, y2 = path[i + 1]
            if abs(x1 - x2) + abs(y1 - y2) != 1:
                return matrix, False
        
        # Colocar números secuenciales
        if num_numbers > len(path):
            num_numbers = len(path)
        
        # Distribuir números uniformemente
        step = len(path) // (num_numbers - 1) if num_numbers > 1 else 1
        
        for i in range(num_numbers):
            if i == 0:
                # Primer número en el inicio
                pos = 0
            elif i == num_numbers - 1:
                # Último número en el final
                pos = len(path) - 1
            else:
                # Números intermedios distribuidos
                pos = i * step
            
            x, y = path[pos]
            matrix[x][y] = i + 1
        
        return matrix, True
    
    def calculate_difficulty(self, size: int, num_numbers: int, path_length: int) -> Difficulty:
        """Calcula la dificultad del puzzle"""
        # Factores de dificultad
        grid_complexity = size * size
        number_density = num_numbers / grid_complexity
        path_efficiency = path_length / grid_complexity
        
        # Puntuación de dificultad (0-100)
        score = 0
        
        # Factor de tamaño
        if size <= 4:
            score += 10
        elif size <= 5:
            score += 25
        elif size <= 6:
            score += 40
        else:
            score += 60
        
        # Factor de densidad de números
        if number_density <= 0.25:
            score += 30
        elif number_density <= 0.4:
            score += 20
        elif number_density <= 0.6:
            score += 10
        else:
            score += 5
        
        # Factor de eficiencia del camino
        if path_efficiency >= 0.95:
            score += 20
        elif path_efficiency >= 0.9:
            score += 15
        elif path_efficiency >= 0.8:
            score += 10
        else:
            score += 5
        
        # Determinar dificultad
        if score <= 25:
            return Difficulty.MUY_FACIL
        elif score <= 40:
            return Difficulty.FACIL
        elif score <= 60:
            return Difficulty.NORMAL
        elif score <= 80:
            return Difficulty.DIFICIL
        else:
            return Difficulty.EXTREMO
    
    def get_next_level_number(self) -> int:
        """Obtiene el siguiente número de nivel desde Firebase"""
        try:
            # Buscar el nivel con el número más alto
            levels_ref = self.db.collection('levels')
            query = levels_ref.order_by('level', direction=firestore.Query.DESCENDING).limit(1)
            
            docs = query.stream()
            max_level = 0
            
            for doc in docs:
                data = doc.to_dict()
                if 'level' in data:
                    max_level = data['level']
                    break
            
            return max_level + 1
            
        except Exception as e:
            print(f"⚠️  Error obteniendo número de nivel: {e}")
            print("   Usando nivel 1 como fallback")
            return 1
    
    def generate_puzzle(self, size: int, num_numbers: int) -> Optional[Dict]:
        """Genera un puzzle completo"""
        # Validar parámetros
        if size < 3 or size > 8:
            print(f"❌ Tamaño de matriz inválido: {size} (debe ser entre 3 y 8)")
            return None
        
        if num_numbers < 2 or num_numbers > size * size:
            print(f"❌ Número de números inválido: {num_numbers}")
            return None
        
        print(f"🔄 Generando puzzle {size}x{size} con {num_numbers} números...")
        
        # 1. Crear matriz
        matrix = self.create_matrix(size)
        
        # 2. Seleccionar puntos de inicio y fin
        start_point, end_point = self.select_start_end_points(size)
        print(f"📍 Inicio: {start_point}, Fin: {end_point}")
        
        # 3. Buscar camino hamiltoniano
        path = self.find_hamiltonian_path(size, start_point, end_point)
        if not path:
            print(f"❌ No se pudo encontrar un camino válido")
            return None
        
        print(f"✅ Camino encontrado: {len(path)} pasos")
        
        # 4. Validar y añadir números
        puzzle_matrix, is_valid = self.validate_and_add_numbers(path, num_numbers)
        if not is_valid:
            print(f"❌ Camino inválido")
            return None
        
        # 5. Calcular dificultad
        difficulty = self.calculate_difficulty(size, num_numbers, len(path))
        
        # 6. Obtener número de nivel
        level_number = self.get_next_level_number()
        
        # 7. Crear resultado
        result = {
            "difficulty": difficulty.value,
            "gridSize": size,
            "grid": puzzle_matrix,  # Usar 'grid' para compatibilidad con el juego
            "solution": path,
            "level": level_number
        }
        
        print(f"✅ Puzzle generado: {difficulty.value} (Nivel {level_number})")
        return result
    
    def upload_to_firebase(self, puzzle: Dict) -> bool:
        """Sube el puzzle a Firebase"""
        try:
            # Generar ID único para el nivel
            level_id = f"level_{puzzle['level']:04d}"
            
            # Convertir arrays anidados a formato compatible con Firestore
            firestore_puzzle = {
                "difficulty": puzzle["difficulty"],
                "gridSize": puzzle["gridSize"],
                "level": puzzle["level"],
                "id": level_id,
                "createdAt": firestore.SERVER_TIMESTAMP,
                "isActive": True
            }
            
            # Convertir grid a formato Firestore
            grid_data = {}
            for i, row in enumerate(puzzle["grid"]):
                grid_data[str(i)] = row
            firestore_puzzle["grid"] = grid_data
            
            # Convertir solution a formato Firestore
            solution_data = []
            for x, y in puzzle["solution"]:
                solution_data.append({"x": x, "y": y})
            firestore_puzzle["solution"] = solution_data
            
            # Subir a Firestore
            doc_ref = self.db.collection('levels').document(level_id)
            doc_ref.set(firestore_puzzle)
            
            print(f"✅ Nivel {puzzle['level']} subido a Firebase: {level_id}")
            return True
            
        except Exception as e:
            print(f"❌ Error subiendo nivel: {e}")
            return False
    
    def generate_and_upload(self, size: int, num_numbers: int) -> bool:
        """Genera un puzzle y lo sube a Firebase"""
        puzzle = self.generate_puzzle(size, num_numbers)
        
        if puzzle:
            return self.upload_to_firebase(puzzle)
        else:
            return False

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description='Generador de Producción para PuzzlePath')
    
    parser.add_argument('--size', type=int, default=4, 
                       help='Tamaño de la matriz (3-8, default: 4)')
    parser.add_argument('--numbers', type=int, default=4,
                       help='Número de números en el puzzle (2-N², default: 4)')
    parser.add_argument('--count', type=int, default=1,
                       help='Número de puzzles a generar (default: 1)')
    parser.add_argument('--output', type=str, help='Archivo de salida (opcional)')
    parser.add_argument('--no-upload', action='store_true', 
                       help='No subir a Firebase (solo generar)')
    parser.add_argument('--seed', type=int, help='Semilla para reproducibilidad')
    
    args = parser.parse_args()
    
    # Configurar semilla si se proporciona
    if args.seed:
        random.seed(args.seed)
        print(f"🌱 Semilla configurada: {args.seed}")
    
    # Validar parámetros
    if args.size < 3 or args.size > 8:
        print(f"❌ Tamaño inválido: {args.size} (debe ser entre 3 y 8)")
        return
    
    if args.numbers < 2 or args.numbers > args.size * args.size:
        print(f"❌ Número de números inválido: {args.numbers}")
        return
    
    print(f"🎮 Generador de Producción para PuzzlePath")
    print(f"📊 Configuración: {args.size}x{args.size}, {args.numbers} números")
    print(f"🎯 Generando {args.count} puzzle(s)...")
    
    if not args.no_upload:
        print(f"🔥 Los puzzles se subirán automáticamente a Firebase")
    else:
        print(f"💾 Los puzzles NO se subirán a Firebase")
    
    generator = ProductionPuzzleGenerator()
    puzzles = []
    
    for i in range(args.count):
        print(f"\n🔄 Generando puzzle {i + 1}/{args.count}...")
        
        puzzle = generator.generate_puzzle(args.size, args.numbers)
        
        if puzzle:
            puzzles.append(puzzle)
            
            # Subir a Firebase si no se especifica --no-upload
            if not args.no_upload:
                if generator.upload_to_firebase(puzzle):
                    print(f"✅ Puzzle {i + 1} generado y subido: Nivel {puzzle['level']}")
                else:
                    print(f"❌ Error subiendo puzzle {i + 1}")
            else:
                print(f"✅ Puzzle {i + 1} generado: Nivel {puzzle['level']}")
        else:
            print(f"❌ Error generando puzzle {i + 1}")
    
    # Guardar en archivo si se especifica
    if args.output and puzzles:
        with open(args.output, 'w') as f:
            json.dump(puzzles, f, indent=2)
        print(f"\n💾 Puzzles guardados en: {args.output}")
    
    # Mostrar estadísticas
    if puzzles:
        print(f"\n🎉 Proceso completado:")
        print(f"   ✅ Puzzles generados: {len(puzzles)}")
        
        difficulties = {}
        for puzzle in puzzles:
            diff = puzzle['difficulty']
            difficulties[diff] = difficulties.get(diff, 0) + 1
        
        print(f"   📊 Distribución de dificultades:")
        for diff, count in difficulties.items():
            print(f"      {diff}: {count}")
        
        print(f"   🔢 Niveles generados: {[p['level'] for p in puzzles]}")
    
    else:
        print(f"\n❌ No se pudo generar ningún puzzle")

if __name__ == "__main__":
    main() 