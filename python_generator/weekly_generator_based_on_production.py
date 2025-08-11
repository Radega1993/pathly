#!/usr/bin/env python3
"""
Generador Semanal para PuzzlePath (Basado en Production Generator)
Genera puzzles semanales con las nuevas condiciones:
- Sin dificultad "muy fácil"
- Dificultad aleatoria para la mayoría
- Niveles extremos cada 5 (105, 110, 115...)
- Tamaños de 4x4 a 7x7
- Números de 3 a 25
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

class WeeklyPuzzleGenerator:
    """Generador de puzzles semanales basado en production_generator.py"""
    
    def __init__(self):
        self.directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]  # derecha, abajo, izquierda, arriba
        
        # Inicializar Firebase
        if not firebase_admin._apps:
            cred = credentials.Certificate("service-account-key.json")
            firebase_admin.initialize_app(cred)
        
        self.db = firestore.client()
        
        # Cache de niveles existentes para evitar duplicados
        self.existing_levels = []
        self.existing_configs = set()  # (size, num_numbers, difficulty)
        self.existing_hashes = set()   # hashes de grids
        
        # Estadísticas de operaciones Firebase
        self.firebase_operations = 0
        
        # Configuraciones de dificultad optimizadas para rendimiento
        self.difficulty_configs = {
            Difficulty.FACIL: {
                'size_range': (4, 6),
                'numbers_range': (3, 8),
                'weight': 0.35
            },
            Difficulty.NORMAL: {
                'size_range': (4, 6),
                'numbers_range': (4, 12),
                'weight': 0.30
            },
            Difficulty.DIFICIL: {
                'size_range': (5, 7),
                'numbers_range': (5, 15),
                'weight': 0.25
            },
            Difficulty.EXTREMO: {
                'size_range': (6, 8),
                'numbers_range': (6, 25),
                'weight': 0.10
            }
        }
        
        # Cargar niveles existentes al inicializar
        self.load_existing_levels()
    
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
        """Busca un camino hamiltoniano optimizado con timeout"""
        import time
        
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
        
        def backtrack(current: Tuple[int, int], path: List[Tuple[int, int]], start_time: float, timeout: int) -> bool:
            # Verificar timeout
            if time.time() - start_time > timeout:
                return False
                
            if len(path) == size * size:
                return current == end
            
            # Obtener vecinos y ordenarlos por heurística
            neighbors = get_neighbors(*current)
            
            # Heurística optimizada: preferir vecinos con menos opciones futuras
            def heuristic_score(pos):
                # Si es el final y estamos cerca del final del camino, dar prioridad máxima
                if pos == end and len(path) == size * size - 1:
                    return -10000
                
                # Contar opciones futuras
                future_options = count_accessible_cells(*pos)
                
                # Penalizar esquinas y bordes si no son el final
                if pos != end:
                    if (pos[0] in [0, size-1] and pos[1] in [0, size-1]):
                        future_options += 5  # Penalizar esquinas más
                    elif pos[0] in [0, size-1] or pos[1] in [0, size-1]:
                        future_options += 2  # Penalizar bordes
                
                # Priorizar movimientos hacia el centro para matrices grandes
                if size > 5:
                    center = size // 2
                    dist_to_center = abs(pos[0] - center) + abs(pos[1] - center)
                    future_options += dist_to_center
                
                return future_options
            
            neighbors.sort(key=heuristic_score)
            
            for next_pos in neighbors:
                path.append(next_pos)
                visited.add(next_pos)
                
                if backtrack(next_pos, path, start_time, timeout):
                    return True
                
                path.pop()
                visited.remove(next_pos)
            
            return False
        
        # Configurar timeout basado en el tamaño
        timeout = 5 if size <= 4 else (10 if size <= 5 else (15 if size <= 6 else (20 if size <= 7 else 25)))
        start_time = time.time()
        
        # Intentar múltiples veces con diferentes estrategias
        max_attempts = 10 if size <= 4 else (20 if size <= 5 else (30 if size <= 6 else (40 if size <= 7 else 50)))
        
        for attempt in range(max_attempts):
            visited = {start}
            path = [start]
            
            if backtrack(start, path, start_time, timeout):
                return path
            
            # Si falla, intentar con un orden diferente de direcciones
            random.shuffle(self.directions)
            
            # Para matrices grandes, también probar diferentes puntos de inicio/fin
            if size > 6 and attempt > 5:
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
        elif size <= 7:
            score += 60
        else:
            score += 90
        
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
        
        # Determinar dificultad (sin muy fácil)
        if score <= 40:
            return Difficulty.FACIL
        elif score <= 60:
            return Difficulty.NORMAL
        elif score <= 80:
            return Difficulty.DIFICIL
        else:
            return Difficulty.EXTREMO
    
    def load_existing_levels(self):
        """Carga todos los niveles existentes desde Firebase (una sola operación)"""
        try:
            print("🔍 Cargando niveles existentes desde Firebase...")
            
            levels_ref = self.db.collection('levels')
            docs = levels_ref.stream()
            
            for doc in docs:
                data = doc.to_dict()
                
                if 'level' in data and 'gridSize' in data and 'difficulty' in data:
                    # Contar números en el grid
                    num_numbers = 0
                    if 'grid' in data:
                        grid_data = data['grid']
                        for row_key in grid_data:
                            row = grid_data[row_key]
                            num_numbers += sum(1 for cell in row if cell > 0)
                    
                    # Guardar configuración para evitar duplicados
                    config = (data['gridSize'], num_numbers, data['difficulty'])
                    self.existing_configs.add(config)
                    
                    # Guardar nivel completo
                    self.existing_levels.append({
                        'level': data['level'],
                        'gridSize': data['gridSize'],
                        'difficulty': data['difficulty'],
                        'num_numbers': num_numbers
                    })
            
            self.firebase_operations += 1
            print(f"✅ Cargados {len(self.existing_levels)} niveles existentes")
            print(f"   - Configuraciones únicas: {len(self.existing_configs)}")
            
        except Exception as e:
            print(f"⚠️  Error cargando niveles existentes: {e}")
            print("   Continuando sin verificación de duplicados")
    
    def calculate_grid_hash(self, grid: List[List[int]]) -> str:
        """Calcula un hash único para el grid"""
        import hashlib
        grid_str = json.dumps(grid, sort_keys=True)
        return hashlib.md5(grid_str.encode()).hexdigest()
    
    def is_duplicate_config(self, size: int, num_numbers: int, difficulty: str) -> bool:
        """Verifica si ya existe una configuración similar"""
        return (size, num_numbers, difficulty) in self.existing_configs
    
    def is_duplicate_grid(self, grid: List[List[int]]) -> bool:
        """Verifica si ya existe un grid similar"""
        grid_hash = self.calculate_grid_hash(grid)
        return grid_hash in self.existing_hashes
    
    def get_next_level_number(self) -> int:
        """Obtiene el siguiente número de nivel desde el cache local"""
        try:
            if self.existing_levels:
                max_level = max(level['level'] for level in self.existing_levels)
                return max_level + 1
            else:
                return 101
        except Exception as e:
            print(f"⚠️  Error obteniendo número de nivel: {e}")
            print("   Usando nivel 101 como fallback")
            return 101
    
    def update_level_counter(self, new_level: int):
        """Actualiza el contador de niveles para evitar duplicados"""
        self.existing_levels.append({
            'level': new_level,
            'gridSize': 0,  # Placeholder
            'difficulty': 'placeholder',
            'num_numbers': 0
        })
    
    def get_random_difficulty_config(self) -> Tuple[int, int, Difficulty]:
        """Obtiene una configuración aleatoria de dificultad (evitando duplicados)"""
        max_attempts = 50
        
        for attempt in range(max_attempts):
            difficulties = list(self.difficulty_configs.keys())
            weights = [self.difficulty_configs[d]['weight'] for d in difficulties]
            
            difficulty = random.choices(difficulties, weights=weights)[0]
            config = self.difficulty_configs[difficulty]
            
            size = random.randint(*config['size_range'])
            numbers = random.randint(*config['numbers_range'])
            max_numbers = min(numbers, size * size)
            
            # Verificar si esta configuración ya existe
            if not self.is_duplicate_config(size, max_numbers, difficulty.value):
                return size, max_numbers, difficulty
        
        # Si no se encuentra configuración única, usar configuración aleatoria
        print("⚠️  No se encontró configuración única, usando configuración aleatoria")
        difficulty = random.choice(list(self.difficulty_configs.keys()))
        config = self.difficulty_configs[difficulty]
        size = random.randint(*config['size_range'])
        numbers = random.randint(*config['numbers_range'])
        max_numbers = min(numbers, size * size)
        
        return size, max_numbers, difficulty
    
    def get_extreme_difficulty_config(self) -> Tuple[int, int, Difficulty]:
        """Obtiene configuración para dificultad extrema"""
        config = self.difficulty_configs[Difficulty.EXTREMO]
        size = random.randint(*config['size_range'])
        numbers = random.randint(*config['numbers_range'])
        max_numbers = min(numbers, size * size)
        
        return size, max_numbers, Difficulty.EXTREMO
    
    def generate_puzzle(self, size: int, num_numbers: int, difficulty: Difficulty) -> Optional[Dict]:
        """Genera un puzzle completo (evitando duplicados)"""
        # Validar parámetros
        if size < 4 or size > 8:
            print(f"❌ Tamaño de matriz inválido: {size} (debe ser entre 4 y 8)")
            return None
        
        if num_numbers < 3 or num_numbers > size * size:
            print(f"❌ Número de números inválido: {num_numbers}")
            return None
        
        print(f"🔄 Generando puzzle {size}x{size} con {num_numbers} números ({difficulty.value})...")
        
        # Verificar si la configuración ya existe
        if self.is_duplicate_config(size, num_numbers, difficulty.value):
            print(f"⚠️  Configuración duplicada detectada: {size}x{size} con {num_numbers} números ({difficulty.value})")
            return None
        
        # Intentar generar puzzle hasta encontrar uno único
        max_attempts = 20  # Aumentado para mejorar tasa de acierto
        
        for attempt in range(max_attempts):
            print(f"   Intento {attempt + 1}/{max_attempts}...")
            
            # 1. Crear matriz
            matrix = self.create_matrix(size)
            
            # 2. Seleccionar puntos de inicio y fin
            start_point, end_point = self.select_start_end_points(size)
            print(f"   📍 Inicio: {start_point}, Fin: {end_point}")
            
            # 3. Buscar camino hamiltoniano
            print(f"   🔍 Buscando camino hamiltoniano...")
            path = self.find_hamiltonian_path(size, start_point, end_point)
            if not path:
                print(f"   ❌ No se encontró camino hamiltoniano")
                continue
            
            print(f"   ✅ Camino encontrado: {len(path)} pasos")
            
            # 4. Validar y añadir números
            print(f"   🔢 Añadiendo números secuenciales...")
            puzzle_matrix, is_valid = self.validate_and_add_numbers(path, num_numbers)
            if not is_valid:
                print(f"   ❌ Validación falló")
                continue
            
            # 5. Verificar si el grid es duplicado
            if self.is_duplicate_grid(puzzle_matrix):
                print(f"   ⚠️  Grid duplicado, reintentando...")
                continue
            
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
            
            # 8. Actualizar contador para evitar duplicados de numeración
            self.update_level_counter(level_number)
            
            print(f"✅ Puzzle generado: {difficulty.value} (Nivel {level_number})")
            return result
        
        print(f"❌ No se pudo generar un puzzle único después de {max_attempts} intentos")
        return None
    
    def upload_batch_to_firebase(self, puzzles: List[Dict]) -> bool:
        """Sube un lote de puzzles a Firebase (una sola operación)"""
        try:
            print(f"📤 Subiendo lote de {len(puzzles)} niveles a Firebase...")
            
            batch = self.db.batch()
            
            for puzzle in puzzles:
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
                
                # Añadir a batch
                doc_ref = self.db.collection('levels').document(level_id)
                batch.set(doc_ref, firestore_puzzle)
            
            # Ejecutar batch
            batch.commit()
            
            self.firebase_operations += 1
            print(f"✅ Lote de {len(puzzles)} niveles subido exitosamente")
            return True
            
        except Exception as e:
            print(f"❌ Error subiendo lote: {e}")
            return False
    
    def generate_weekly_levels(self, count: int = 100, start_level: Optional[int] = None) -> List[Dict]:
        """Genera los niveles semanales con las nuevas reglas"""
        if start_level is None:
            start_level = self.get_next_level_number()
        
        print(f"🎮 Generador Semanal para PuzzlePath")
        print(f"📊 Configuración:")
        print(f"   - Niveles a generar: {count}")
        print(f"   - Nivel inicial: {start_level}")
        print(f"   - Tamaños: 4x4 a 7x7")
        print(f"   - Números: 3 a 25")
        print(f"   - Dificultades: Fácil, Normal, Difícil, Extremo")
        print(f"   - Niveles extremos: cada 5 niveles (105, 110, 115...)")
        
        puzzles = []
        
        for i in range(count):
            current_level = start_level + i
            is_extreme_level = current_level % 5 == 0
            
            print(f"\n🔄 Generando nivel {current_level} ({i + 1}/{count})...")
            
            if is_extreme_level:
                print(f"🔥 Nivel {current_level} - DIFICULTAD EXTREMA")
                size, numbers, difficulty = self.get_extreme_difficulty_config()
            else:
                size, numbers, difficulty = self.get_random_difficulty_config()
            
            puzzle = self.generate_puzzle(size, numbers, difficulty)
            
            if puzzle:
                puzzles.append(puzzle)
                print(f"✅ Nivel {current_level} generado exitosamente")
            else:
                print(f"❌ Error generando nivel {current_level}")
        
        return puzzles

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description='Generador Semanal para PuzzlePath')
    
    parser.add_argument('--count', type=int, default=100,
                       help='Número de niveles a generar (default: 100)')
    parser.add_argument('--start-level', type=int, help='Nivel inicial (opcional)')
    parser.add_argument('--output', type=str, help='Archivo de salida (opcional)')
    parser.add_argument('--no-upload', action='store_true', 
                       help='No subir a Firebase (solo generar)')
    parser.add_argument('--seed', type=int, help='Semilla para reproducibilidad')
    
    args = parser.parse_args()
    
    # Configurar semilla si se proporciona
    if args.seed:
        random.seed(args.seed)
        print(f"🌱 Semilla configurada: {args.seed}")
    
    print(f"🎮 Generador Semanal para PuzzlePath")
    print(f"📊 Configuración:")
    print(f"   - Niveles a generar: {args.count}")
    print(f"   - Nivel inicial: {args.start_level or 'automático'}")
    print(f"   - Subir a Firebase: {'No' if args.no_upload else 'Sí'}")
    
    generator = WeeklyPuzzleGenerator()
    
    # Generar niveles semanales
    puzzles = generator.generate_weekly_levels(args.count, args.start_level)
    
    # Subir a Firebase si no se especifica --no-upload
    if not args.no_upload and puzzles:
        if generator.upload_batch_to_firebase(puzzles):
            print(f"✅ Todos los niveles subidos exitosamente")
        else:
            print(f"❌ Error subiendo niveles a Firebase")
    
    # Guardar en archivo si se especifica
    if args.output and puzzles:
        with open(args.output, 'w') as f:
            json.dump(puzzles, f, indent=2)
        print(f"\n💾 Niveles guardados en: {args.output}")
    
    # Mostrar estadísticas
    if puzzles:
        print(f"\n🎉 Proceso completado:")
        print(f"   ✅ Niveles generados: {len(puzzles)}")
        
        difficulties = {}
        sizes = {}
        numbers = {}
        
        for puzzle in puzzles:
            diff = puzzle['difficulty']
            size = puzzle['gridSize']
            nums = sum(1 for row in puzzle['grid'] for cell in row if cell > 0)
            
            difficulties[diff] = difficulties.get(diff, 0) + 1
            sizes[size] = sizes.get(size, 0) + 1
            numbers[nums] = numbers.get(nums, 0) + 1
        
        print(f"   📊 Distribución de dificultades:")
        for diff, count in sorted(difficulties.items()):
            print(f"      {diff}: {count}")
        
        print(f"   📏 Distribución de tamaños:")
        for size, count in sorted(sizes.items()):
            print(f"      {size}x{size}: {count}")
        
        print(f"   🔢 Distribución de números:")
        for nums, count in sorted(numbers.items()):
            print(f"      {nums} números: {count}")
        
        print(f"   🔢 Rango de niveles: {puzzles[0]['level']} - {puzzles[-1]['level']}")
        
        # Verificar niveles extremos
        extreme_levels = [p['level'] for p in puzzles if p['level'] % 5 == 0]
        print(f"   🔥 Niveles extremos: {extreme_levels}")
        
        # Mostrar estadísticas de Firebase
        print(f"   🔥 Operaciones Firebase: {generator.firebase_operations}")
    
    else:
        print(f"\n❌ No se pudo generar ningún nivel")

if __name__ == "__main__":
    main() 