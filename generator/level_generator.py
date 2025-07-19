import random
import numpy as np
from typing import Dict, List, Tuple
import openai
import os
from dotenv import load_dotenv

load_dotenv()

class LevelGenerator:
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        # Configuración por dificultad
        self.difficulty_config = {
            'easy': {
                'size': 4,
                'max_numbers': 6,
                'complexity': 'simple'
            },
            'normal': {
                'size': 5,
                'max_numbers': 8,
                'complexity': 'medium'
            },
            'hard': {
                'size': 6,
                'max_numbers': 10,
                'complexity': 'complex'
            },
            'extreme': {
                'size': 7,
                'max_numbers': 12,
                'complexity': 'extreme'
            }
        }
    
    def generate_level(self, difficulty: str, size: int = None) -> Dict:
        """
        Generar un nivel del juego Pathly
        
        Args:
            difficulty: Nivel de dificultad ('easy', 'normal', 'hard', 'extreme')
            size: Tamaño del tablero (opcional)
        
        Returns:
            Dict con el tablero, solución y metadatos
        """
        config = self.difficulty_config[difficulty]
        board_size = size or config['size']
        max_numbers = config['max_numbers']
        
        # Intentar generar con IA primero
        try:
            return self._generate_with_ai(difficulty, board_size, max_numbers)
        except Exception as e:
            print(f"Error generando con IA: {e}")
            # Fallback a generación algorítmica
            return self._generate_algorithmic(board_size, max_numbers)
    
    def _generate_with_ai(self, difficulty: str, size: int, max_numbers: int) -> Dict:
        """Generar nivel usando OpenAI"""
        
        prompt = f"""
        Genera un nivel del juego Pathly con las siguientes características:
        
        - Dificultad: {difficulty}
        - Tamaño del tablero: {size}x{size}
        - Números máximos: del 1 al {max_numbers}
        
        Reglas del juego:
        1. El jugador debe conectar los números en orden (1→2→3→...)
        2. Solo hay un camino correcto
        3. Cada celda debe ser usada exactamente una vez
        4. El camino debe usar todas las celdas del tablero
        
        Genera un JSON con esta estructura:
        {{
            "board": [[matriz de {size}x{size} con números del 1 al {max_numbers}]],
            "solution": [[matriz de {size}x{size} con el camino correcto marcado con 1, resto con 0]],
            "max_number": {max_numbers}
        }}
        
        Asegúrate de que:
        - El tablero tenga exactamente {size}x{size} celdas
        - Los números vayan del 1 al {max_numbers}
        - La solución sea válida y única
        - El JSON sea válido
        """
        
        response = self.openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Eres un experto en generar puzzles de lógica. Responde solo con JSON válido."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        # Parsear respuesta
        import json
        try:
            result = json.loads(response.choices[0].message.content)
            return {
                'size': size,
                'board': result['board'],
                'solution': result['solution'],
                'max_number': result['max_number']
            }
        except:
            raise Exception("Error parseando respuesta de IA")
    
    def _generate_algorithmic(self, size: int, max_numbers: int) -> Dict:
        """Generar nivel usando algoritmo determinístico"""
        
        # Crear tablero vacío
        board = [[0 for _ in range(size)] for _ in range(size)]
        
        # Generar camino aleatorio
        path = self._generate_random_path(size)
        
        # Colocar números en el camino
        for i, (row, col) in enumerate(path):
            board[row][col] = i + 1
        
        # Llenar celdas restantes con números aleatorios
        remaining_numbers = list(range(len(path) + 1, max_numbers + 1))
        random.shuffle(remaining_numbers)
        
        for row in range(size):
            for col in range(size):
                if board[row][col] == 0 and remaining_numbers:
                    board[row][col] = remaining_numbers.pop()
        
        # Crear matriz de solución
        solution = [[0 for _ in range(size)] for _ in range(size)]
        for row, col in path:
            solution[row][col] = 1
        
        return {
            'size': size,
            'board': board,
            'solution': solution,
            'max_number': max_numbers
        }
    
    def _generate_random_path(self, size: int) -> List[Tuple[int, int]]:
        """Generar un camino aleatorio válido"""
        path = []
        visited = set()
        
        # Empezar en una celda aleatoria
        start_row = random.randint(0, size - 1)
        start_col = random.randint(0, size - 1)
        path.append((start_row, start_col))
        visited.add((start_row, start_col))
        
        # Generar camino usando DFS
        def dfs(row: int, col: int, depth: int):
            if depth >= size * size:
                return True
            
            # Direcciones: arriba, abajo, izquierda, derecha
            directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
            random.shuffle(directions)
            
            for dr, dc in directions:
                new_row, new_col = row + dr, col + dc
                
                if (0 <= new_row < size and 
                    0 <= new_col < size and 
                    (new_row, new_col) not in visited):
                    
                    visited.add((new_row, new_col))
                    path.append((new_row, new_col))
                    
                    if dfs(new_row, new_col, depth + 1):
                        return True
                    
                    # Backtrack
                    path.pop()
                    visited.remove((new_row, new_col))
            
            return False
        
        dfs(start_row, start_col, 1)
        
        # Si no se pudo generar un camino completo, generar uno simple
        if len(path) < size * size:
            path = []
            for row in range(size):
                for col in range(size):
                    path.append((row, col))
        
        return path
    
    def validate_level(self, board: List[List[int]], solution: List[List[int]]) -> bool:
        """Validar que un nivel sea correcto"""
        size = len(board)
        
        # Verificar que la solución use todas las celdas
        solution_cells = sum(sum(row) for row in solution)
        if solution_cells != size * size:
            return False
        
        # Verificar que el camino sea continuo
        path_positions = []
        for row in range(size):
            for col in range(size):
                if solution[row][col] == 1:
                    path_positions.append((row, col))
        
        # Verificar que los números estén en orden
        path_positions.sort(key=lambda pos: board[pos[0]][pos[1]])
        for i, (row, col) in enumerate(path_positions):
            if board[row][col] != i + 1:
                return False
        
        return True 