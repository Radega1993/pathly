#!/usr/bin/env python3
"""
Script para verificar niveles en Firebase
"""

import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def check_firebase_levels():
    """Verifica qué niveles hay en Firebase"""
    
    print("🔍 Verificando niveles en Firebase...")
    
    # Inicializar Firebase
    if not firebase_admin._apps:
        cred = credentials.Certificate("service-account-key.json")
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    
    try:
        # Obtener todos los niveles
        levels_ref = db.collection('levels')
        docs = levels_ref.stream()
        
        levels = []
        for doc in docs:
            level_data = doc.to_dict()
            levels.append({
                'id': doc.id,
                'difficulty': level_data.get('difficulty'),
                'gridSize': level_data.get('gridSize'),
                'createdAt': level_data.get('createdAt')
            })
        
        print(f"\n📊 Total de niveles en Firebase: {len(levels)}")
        
        if levels:
            print("\n📋 Niveles encontrados:")
            for level in levels:
                print(f"  - {level['id']} ({level['difficulty']}, {level['gridSize']}x{level['gridSize']})")
        else:
            print("❌ No hay niveles en Firebase")
            
    except Exception as e:
        print(f"❌ Error verificando niveles: {e}")

if __name__ == "__main__":
    check_firebase_levels() 