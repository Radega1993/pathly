#!/usr/bin/env python3
"""
Script de configuración para el generador de producción
"""

import os
import sys
import subprocess

def check_dependencies():
    """Verifica que las dependencias estén instaladas"""
    print("🔍 Verificando dependencias...")
    
    required_packages = [
        'firebase-admin',
        'python-dotenv'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"   ✅ {package}")
        except ImportError:
            print(f"   ❌ {package}")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n❌ Faltan dependencias: {', '.join(missing_packages)}")
        print("   Instalando dependencias...")
        
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install'] + missing_packages)
            print("✅ Dependencias instaladas")
        except subprocess.CalledProcessError:
            print("❌ Error instalando dependencias")
            return False
    
    return True

def check_firebase_config():
    """Verifica la configuración de Firebase"""
    print("\n🔥 Verificando configuración de Firebase...")
    
    if not os.path.exists("service-account-key.json"):
        print("   ❌ No se encontró service-account-key.json")
        print("   📝 Descarga tu archivo de credenciales desde Firebase Console")
        print("   🔗 https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk")
        return False
    
    print("   ✅ service-account-key.json encontrado")
    return True

def test_generator():
    """Prueba el generador"""
    print("\n🧪 Probando generador...")
    
    try:
        from production_generator import ProductionPuzzleGenerator
        
        generator = ProductionPuzzleGenerator()
        puzzle = generator.generate_puzzle(4, 4)
        
        if puzzle:
            print("   ✅ Generador funcionando correctamente")
            print(f"   📊 Puzzle generado: {puzzle['difficulty']} (Nivel {puzzle['level']})")
            return True
        else:
            print("   ❌ Error generando puzzle")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def show_usage():
    """Muestra ejemplos de uso"""
    print("\n📖 Ejemplos de uso:")
    print("   Generar un puzzle: python production_generator.py")
    print("   Generar múltiples: python production_generator.py --count 5")
    print("   Puzzle específico: python production_generator.py --size 6 --numbers 6")
    print("   Sin subir a Firebase: python production_generator.py --no-upload")
    print("   Guardar en archivo: python production_generator.py --output levels.json")

def main():
    """Función principal"""
    print("🎮 Configuración del Generador de Producción para PuzzlePath")
    print("=" * 60)
    
    # Verificar dependencias
    if not check_dependencies():
        return
    
    # Verificar Firebase
    if not check_firebase_config():
        return
    
    # Probar generador
    if not test_generator():
        return
    
    print("\n🎉 ¡Configuración completada exitosamente!")
    show_usage()
    
    print("\n🚀 El generador está listo para usar en producción")

if __name__ == "__main__":
    main() 