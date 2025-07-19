from fastapi import HTTPException, Depends, Header
from firebase_admin import auth
from typing import Optional

async def verify_firebase_token(authorization: Optional[str] = Header(None)) -> str:
    """
    Verificar token de Firebase y retornar el user_id
    
    Args:
        authorization: Header Authorization con el token Bearer
    
    Returns:
        str: User ID de Firebase
    
    Raises:
        HTTPException: Si el token es inválido
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Token de autorización requerido"
        )
    
    try:
        # Extraer token del header "Bearer <token>"
        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=401,
                detail="Formato de token inválido. Use 'Bearer <token>'"
            )
        
        token = authorization.split("Bearer ")[1]
        
        # Verificar token con Firebase
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token['uid']
        
        return user_id
        
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Token inválido: {str(e)}"
        ) 