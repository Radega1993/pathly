#!/usr/bin/env python3
"""
Script para limpiar y configurar niveles únicos en Firebase
"""

import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
from generate_levels import LevelGenerator, DIFFICULTY_CONFIGS
import random

# Cargar variables de entorno
load_dotenv()

def clean_and_setup_levels():
    """Limpia niveles existentes y crea nuevos con IDs únicos"""
    
    print("🧹 Limpiando y configurando niveles únicos...")
    
    # Inicializar Firebase
    if not firebase_admin._apps:
        cred = credentials.Certificate("service-account-key.json")
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    generator = LevelGenerator()
    
    # Limpiar niveles existentes
    try:
        print("🗑️  Limpiando niveles existentes...")
        levels_ref = db.collection('levels')
        docs = levels_ref.stream()
        
        for doc in docs:
            doc.reference.delete()
            print(f"  ❌ Eliminado: {doc.id}")
        
        print("✅ Niveles existentes eliminados")
        
    except Exception as e:
        print(f"❌ Error limpiando niveles: {e}")
        return
    
    # Configuración de niveles por dificultad
    level_config = {
        "easy": 4,      # 4 niveles fáciles
        "normal": 4,    # 4 niveles normales
        "hard": 3,      # 3 niveles difíciles
        "expert": 3     # 3 niveles expertos
    }
    
    total_uploaded = 0
    
    for difficulty, count in level_config.items():
        print(f"\n📊 Generando {count} nivel(es) de dificultad '{difficulty}'...")
        
        config = DIFFICULTY_CONFIGS[difficulty]
        
        for i in range(count):
            print(f"  🔄 Generando nivel {i + 1}/{count}...")
            
            # Generar nivel
            level = generator.generate_level_with_ai(config)
            
            if level:
                try:
                    # Convertir grid a formato compatible con Firestore
                    grid = level['grid']
                    if isinstance(grid, list):
                        firestore_grid = {}
                        for j, row in enumerate(grid):
                            firestore_grid[str(j)] = row
                    else:
                        firestore_grid = grid
                    
                    # Convertir solution a formato compatible con Firestore
                    solution = level['solution']
                    if isinstance(solution, list) and len(solution) > 0 and isinstance(solution[0], list):
                        firestore_solution = []
                        for coord in solution:
                            firestore_solution.append({"x": coord[0], "y": coord[1]})
                    else:
                        firestore_solution = solution
                    
                    # Generar ID único con timestamp
                    timestamp = int(random.random() * 10000)
                    level_id = f"{difficulty}_{config.grid_size}_{timestamp}"
                    
                    # Preparar datos para Firestore
                    level_data = {
                        "difficulty": level['difficulty'],
                        "gridSize": level['gridSize'],
                        "grid": firestore_grid,
                        "solution": firestore_solution,
                        "id": level_id,
                        "createdAt": firestore.SERVER_TIMESTAMP,
                        "isActive": True
                    }
                    
                    # Subir a Firestore
                    doc_ref = db.collection('levels').document(level_id)
                    doc_ref.set(level_data)
                    
                    print(f"  ✅ Nivel subido: {level_id}")
                    total_uploaded += 1
                    
                except Exception as e:
                    print(f"  ❌ Error subiendo nivel: {e}")
            else:
                print(f"  ❌ Error generando nivel {i + 1}")
    
    print(f"\n🎉 Configuración completada: {total_uploaded} niveles únicos subidos a Firebase")
    print("📱 La app ahora debería cargar niveles desde Firestore sin errores de claves duplicadas")

if __name__ == "__main__":
    clean_and_setup_levels() 