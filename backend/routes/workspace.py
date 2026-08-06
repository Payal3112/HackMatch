from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
import uuid
from datetime import datetime

router = APIRouter()

def get_db(request: Request):
    return request.app.mongodb

@router.get("/")
async def get_workspace(request: Request):
    db = get_db(request)
    # Fetch all active teams
    teams = await db.teams.find().to_list(100)
    for t in teams:
        t["_id"] = str(t["_id"])
        
    return {
        "active_teams": teams
    }
