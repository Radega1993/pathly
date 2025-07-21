#!/usr/bin/env python3
"""
Script de prueba para el generador de niveles
"""

import json
import os
from generate_levels import LevelGenerator, DIFFICULTY_CONFIGS

def test_generator():
    """Prueba el generador de niveles"""
    
    print("🧪 Probando generador de niveles...")
    
    # Crear generador
    generator = LevelGenerator()
    
    # Probar cada dificultad
    for difficulty, config in DIFFICULTY_CONFIGS.items():
        print(f"\n📊 Probando dificultad: {difficulty}")
        print(f"   Grid: {config.grid_size}x{config.grid_size}")
        print(f"   Números: {config.min_numbers}-{config.max_numbers}")
        
        # Generar nivel
        level = generator.generate_level_with_ai(config)
        
        if level:
            print(f"   ✅ Nivel generado exitosamente")
            
            # Validar nivel
            if generator.validate_level(level):
                print(f"   ✅ Nivel válido")
                
                # Mostrar información del nivel
                grid = level["grid"]
                solution = level["solution"]
                
                print(f"   📊 Grid generado:")
                for row in grid:
                    print(f"      {row}")
                
                print(f"   🎯 Números en el camino:")
                numbers = []
                for x, y in solution:
                    if grid[y][x] > 0:
                        numbers.append(grid[y][x])
                print(f"      {numbers}")
                
                print(f"   📍 Longitud del camino: {len(solution)}")
                
            else:
                print(f"   ❌ Nivel inválido")
        else:
            print(f"   ❌ Error generando nivel")
    
    print("\n🎉 Pruebas completadas")

def test_fallback():
    """Prueba el generador de fallback"""
    
    print("\n🔄 Probando generador de fallback...")
    
    generator = LevelGenerator()
    config = DIFFICULTY_CONFIGS["normal"]
    
    level = generator.generate_level_fallback(config)
    
    if level and generator.validate_level(level):
        print("✅ Fallback funciona correctamente")
        
        # Guardar nivel de prueba
        with open("test_fallback_level.json", "w") as f:
            json.dump(level, f, indent=2)
        print("💾 Nivel guardado en test_fallback_level.json")
    else:
        print("❌ Error en fallback")

if __name__ == "__main__":
    test_generator()
    test_fallback() 