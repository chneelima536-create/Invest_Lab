from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from app.services.tutor_service import TutorEngine

router = APIRouter(prefix="/api/tutor", tags=["Tutor"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str
    source: str
    disclaimer: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_tutor(req: ChatRequest):
    try:
        history_dicts = [{"role": m.role, "content": m.content} for m in req.history or []]
        res = TutorEngine.get_response(req.message, history_dicts)
        return ChatResponse(
            reply=res["reply"],
            source=res["source"],
            disclaimer=res["disclaimer"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
