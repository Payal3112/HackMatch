from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
import uuid
from datetime import datetime

router = APIRouter()

class PulseCheck(BaseModel):
    team_id: str
    status: str

def get_db(request: Request):
    return request.app.mongodb

@router.post("/pulse")
async def pulse_check(req: PulseCheck, request: Request):
    db = get_db(request)
    pulse_doc = {
        "id": str(uuid.uuid4()),
        "team_id": req.team_id,
        "status": req.status,
        "timestamp": datetime.utcnow()
    }
    await db.squad_sync.insert_one(pulse_doc)
    return {"message": "Pulse registered successfully."}

@router.get("/radar/{team_id}")
async def squad_radar(team_id: str, request: Request):
    # Dummy implementation for radar
    return {
        "team_health": 85,
        "alerts": []
    }
