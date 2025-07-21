#!/usr/bin/env python3
"""
Generador de niveles para PuzzlePath usando IA (DeepSeek)
Genera niveles NxN con caminos continuos válidos
"""

import os
import json
import random
import argparse
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
import firebase_admin
from firebase_admin import credentials, firestore
from openai import OpenAI
from dotenv import load_dotenv
import click

# Cargar variables de entorno
load_dotenv()

@dataclass
class LevelConfig:
    """Configuración para generar niveles"""
    difficulty: str
    grid_size: int
    min_numbers: int
    max_numbers: int

# Configuraciones por dificultad
DIFFICULTY_CONFIGS = {
    "easy": LevelConfig("easy", 4, 3, 4),
    "normal": LevelConfig("normal", 5, 4, 5),
    "hard": LevelConfig("hard", 6, 5, 6),
    "expert": LevelConfig("expert", 7, 6, 7)
}

class LevelGenerator:
    """Generador de niveles usando IA"""
    
    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv("DEEPSEEK_API_KEY"),
            base_url="https://api.deepseek.com/v1"
        )
        
        # Inicializar Firebase
        if not firebase_admin._apps:
            cred = credentials.Certificate("service-account-key.json")
            firebase_admin.initialize_app(cred)
        
        self.db = firestore.client()
    
    def generate_level_with_ai(self, config: LevelConfig) -> Dict:
        """Genera un nivel usando IA"""
        
        prompt = f"""
Eres un generador de niveles para un juego de puzzle tipo "Pathly". 
Debes generar un nivel con las siguientes características:

1. Grid de {config.grid_size}x{config.grid_size} celdas
2. Dificultad: {config.difficulty}
3. Debes crear un camino continuo que use TODAS las celdas del grid
4. El camino debe comenzar en el número 1 y terminar en el número {config.max_numbers}
5. Los números deben estar en orden secuencial: 1, 2, 3, ..., {config.max_numbers}
6. El camino debe ser único y válido (sin bifurcaciones)

REGLAS IMPORTANTES:
- El camino debe ser continuo (celdas adyacentes horizontal o verticalmente)
- Debe pasar por TODAS las celdas del grid exactamente una vez
- Los números deben estar en orden: 1 → 2 → 3 → ... → {config.max_numbers}
- El número 1 debe estar en el inicio del camino
- El número {config.max_numbers} debe estar al final del camino
- Las celdas sin números deben tener valor 0
- Las celdas fuera del grid deben ser null

Ejemplo de respuesta válida:
{{
    "difficulty": "{config.difficulty}",
    "gridSize": {config.grid_size},
    "grid": [
        [1, 0, 0, 0],
        [0, 2, 0, 0],
        [0, 0, 3, 0],
        [0, 0, 0, 4]
    ],
    "solution": [
        [0, 0], [0, 1], [0, 2], [0, 3],
        [1, 3], [1, 2], [1, 1], [1, 0],
        [2, 0], [2, 1], [2, 2], [2, 3],
        [3, 3], [3, 2], [3, 1], [3, 0]
    ]
}}

Genera SOLO el JSON, sin explicaciones adicionales.
"""

        try:
            response = self.client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "Eres un experto generador de niveles de puzzle. Responde SOLO con JSON válido."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content.strip()
            
            # Limpiar el contenido si tiene markdown
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            
            level = json.loads(content)
            
            # Validar el nivel generado
            if self.validate_level(level):
                return level
            else:
                print(f"⚠️  Nivel generado no válido, regenerando...")
                return self.generate_level_with_ai(config)
                
        except Exception as e:
            print(f"❌ Error generando nivel con IA: {e}")
            return self.generate_level_fallback(config)
    
    def generate_level_fallback(self, config: LevelConfig) -> Dict:
        """Genera un nivel simple como fallback"""
        grid_size = config.grid_size
        max_num = config.max_numbers
        
        # Crear grid vacío
        grid = [[0 for _ in range(grid_size)] for _ in range(grid_size)]
        
        # Generar camino simple en espiral
        solution = []
        x, y = 0, 0
        dx, dy = 1, 0
        
        for i in range(grid_size * grid_size):
            solution.append([x, y])
            
            # Colocar números en el camino
            if i < max_num:
                grid[y][x] = i + 1
            
            # Mover al siguiente punto
            next_x, next_y = x + dx, y + dy
            
            # Cambiar dirección si es necesario
            if (next_x < 0 or next_x >= grid_size or 
                next_y < 0 or next_y >= grid_size or 
                grid[next_y][next_x] != 0):
                
                # Rotar dirección
                dx, dy = -dy, dx
                next_x, next_y = x + dx, y + dy
            
            x, y = next_x, next_y
        
        return {
            "difficulty": config.difficulty,
            "gridSize": grid_size,
            "grid": grid,
            "solution": solution
        }
    
    def validate_level(self, level: Dict) -> bool:
        """Valida que el nivel sea correcto"""
        try:
            # Verificar estructura básica
            required_keys = ["difficulty", "gridSize", "grid", "solution"]
            if not all(key in level for key in required_keys):
                return False
            
            grid_size = level["gridSize"]
            grid = level["grid"]
            solution = level["solution"]
            
            # Verificar tamaño del grid
            if len(grid) != grid_size or any(len(row) != grid_size for row in grid):
                return False
            
            # Verificar que la solución use todas las celdas
            if len(solution) != grid_size * grid_size:
                return False
            
            # Verificar que el camino sea continuo
            for i in range(len(solution) - 1):
                x1, y1 = solution[i]
                x2, y2 = solution[i + 1]
                
                # Debe ser adyacente (horizontal o vertical)
                if abs(x1 - x2) + abs(y1 - y2) != 1:
                    return False
            
            # Verificar que los números estén en orden
            numbers_in_path = []
            for x, y in solution:
                if grid[y][x] > 0:
                    numbers_in_path.append(grid[y][x])
            
            # Debe empezar en 1 y terminar en el número máximo
            if not numbers_in_path or numbers_in_path[0] != 1:
                return False
            
            max_num = max(numbers_in_path)
            if numbers_in_path[-1] != max_num:
                return False
            
            # Verificar que estén en orden
            expected = list(range(1, max_num + 1))
            if numbers_in_path != expected:
                return False
            
            return True
            
        except Exception as e:
            print(f"Error validando nivel: {e}")
            return False
    
    def upload_to_firestore(self, level: Dict) -> bool:
        """Sube el nivel a Firestore"""
        try:
            # Generar ID único para el nivel
            level_id = f"{level['difficulty']}_{level['gridSize']}_{random.randint(1000, 9999)}"
            
            # Añadir metadatos
            level_data = {
                **level,
                "id": level_id,
                "createdAt": firestore.SERVER_TIMESTAMP,
                "isActive": True
            }
            
            # Subir a Firestore
            doc_ref = self.db.collection('levels').document(level_id)
            doc_ref.set(level_data)
            
            print(f"✅ Nivel subido: {level_id}")
            return True
            
        except Exception as e:
            print(f"❌ Error subiendo nivel: {e}")
            return False

@click.command()
@click.option('--count', default=1, help='Número de niveles a generar')
@click.option('--difficulty', default='normal', 
              type=click.Choice(['easy', 'normal', 'hard', 'expert']),
              help='Dificultad del nivel')
@click.option('--upload', is_flag=True, help='Subir niveles a Firebase')
@click.option('--output', help='Archivo de salida para guardar niveles')
def main(count: int, difficulty: str, upload: bool, output: str):
    """Generador de niveles para PuzzlePath"""
    
    print(f"🎮 Generando {count} nivel(es) de dificultad '{difficulty}'")
    
    generator = LevelGenerator()
    config = DIFFICULTY_CONFIGS[difficulty]
    
    levels = []
    
    for i in range(count):
        print(f"\n🔄 Generando nivel {i + 1}/{count}...")
        
        level = generator.generate_level_with_ai(config)
        
        if level:
            print(f"✅ Nivel {i + 1} generado exitosamente")
            levels.append(level)
            
            if upload:
                generator.upload_to_firestore(level)
        else:
            print(f"❌ Error generando nivel {i + 1}")
    
    # Guardar en archivo si se especifica
    if output:
        with open(output, 'w') as f:
            json.dump(levels, f, indent=2)
        print(f"\n💾 Niveles guardados en: {output}")
    
    print(f"\n🎉 Proceso completado: {len(levels)} nivel(es) generado(s)")

if __name__ == "__main__":
    main() 