from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv
from level_generator import LevelGenerator
from auth_middleware import verify_firebase_token

# Cargar variables de entorno
load_dotenv()

# Inicializar Firebase Admin
if not firebase_admin._apps:
    cred = credentials.Certificate(os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY'))
    firebase_admin.initialize_app(cred)

db = firestore.client()

app = FastAPI(
    title="Pathly Level Generator",
    description="API para generar niveles del juego Pathly usando IA",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic
class GenerateLevelRequest(BaseModel):
    difficulty: str  # 'easy', 'normal', 'hard', 'extreme'
    size: Optional[int] = None  # Tamaño del tablero (opcional)

class LevelResponse(BaseModel):
    id: str
    difficulty: str
    size: int
    board: List[List[int]]
    solution: List[List[int]]
    max_number: int
    created_at: str

class HealthResponse(BaseModel):
    status: str
    message: str

# Instanciar generador de niveles
level_generator = LevelGenerator()

@app.get("/", response_model=HealthResponse)
async def health_check():
    """Verificar el estado del servicio"""
    return HealthResponse(
        status="healthy",
        message="Pathly Level Generator está funcionando correctamente"
    )

@app.post("/generate", response_model=LevelResponse)
async def generate_level(
    request: GenerateLevelRequest,
    user_id: str = Depends(verify_firebase_token)
):
    """
    Generar un nuevo nivel del juego
    
    - **difficulty**: Nivel de dificultad (easy, normal, hard, extreme)
    - **size**: Tamaño del tablero (opcional, se calcula automáticamente según dificultad)
    """
    try:
        # Validar dificultad
        valid_difficulties = ['easy', 'normal', 'hard', 'extreme']
        if request.difficulty not in valid_difficulties:
            raise HTTPException(
                status_code=400,
                detail=f"Dificultad debe ser una de: {valid_difficulties}"
            )
        
        # Generar nivel
        level = level_generator.generate_level(
            difficulty=request.difficulty,
            size=request.size
        )
        
        # Guardar en Firestore
        level_doc = {
            'difficulty': request.difficulty,
            'size': level['size'],
            'board': level['board'],
            'solution': level['solution'],
            'max_number': level['max_number'],
            'created_at': firestore.SERVER_TIMESTAMP,
            'generated_by': user_id
        }
        
        doc_ref = db.collection('levels').add(level_doc)
        
        return LevelResponse(
            id=doc_ref[1].id,
            difficulty=request.difficulty,
            size=level['size'],
            board=level['board'],
            solution=level['solution'],
            max_number=level['max_number'],
            created_at=str(firestore.SERVER_TIMESTAMP)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/levels/{difficulty}", response_model=List[LevelResponse])
async def get_levels_by_difficulty(
    difficulty: str,
    limit: int = 10,
    user_id: str = Depends(verify_firebase_token)
):
    """
    Obtener niveles por dificultad
    
    - **difficulty**: Nivel de dificultad
    - **limit**: Número máximo de niveles a retornar (máximo 50)
    """
    if limit > 50:
        limit = 50
    
    try:
        levels_ref = db.collection('levels').where('difficulty', '==', difficulty)
        docs = levels_ref.limit(limit).stream()
        
        levels = []
        for doc in docs:
            data = doc.to_dict()
            levels.append(LevelResponse(
                id=doc.id,
                difficulty=data['difficulty'],
                size=data['size'],
                board=data['board'],
                solution=data['solution'],
                max_number=data['max_number'],
                created_at=str(data['created_at'])
            ))
        
        return levels
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 