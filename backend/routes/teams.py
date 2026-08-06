from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel
import uuid
from routes.auth import get_current_user

router = APIRouter()

class TeamCreate(BaseModel):
    name: str
    hackathon: str
    description: str = ""
    needed_skills: list[str] = []
    status: str = "Forming"
    capacity: int = 4

class TeamUpdate(BaseModel):
    name: str | None = None
    hackathon: str | None = None
    description: str | None = None
    needed_skills: list[str] | None = None
    capacity: int | None = None

def get_db(request: Request):
    return request.app.mongodb

@router.get("/")
async def get_teams(request: Request):
    db = get_db(request)
    teams = await db.teams.find().to_list(100)
    for t in teams:
        t["_id"] = str(t["_id"])
    return teams

@router.post("/")
async def create_team(team: TeamCreate, request: Request, current_user: dict = Depends(get_current_user)):
    db = get_db(request)
    new_team = {
        "id": str(uuid.uuid4()),
        "name": team.name,
        "hackathon": team.hackathon,
        "description": team.description,
        "needed_skills": team.needed_skills,
        "status": team.status,
        "capacity": team.capacity,
        "leaderId": current_user["id"], 
        "members": [current_user["name"]],
        "pendingApplications": []
    }
    await db.teams.insert_one(new_team)
    new_team.pop("_id", None)
    return new_team

@router.get("/my-teams")
async def my_teams(request: Request, current_user: dict = Depends(get_current_user)):
    db = get_db(request)
    teams = await db.teams.find({"$or": [{"members": current_user["name"]}, {"leaderId": current_user["id"]}, {"pendingApplications": current_user["name"]}]}).to_list(100)
    for t in teams:
        t["_id"] = str(t["_id"])
    return teams

@router.post("/{team_id}/apply")
async def apply_team(team_id: str, request: Request, current_user: dict = Depends(get_current_user)):
    db = get_db(request)
    team = await db.teams.find_one({"id": team_id})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    if current_user["name"] not in team.get("pendingApplications", []) and current_user["name"] not in team.get("members", []):
        await db.teams.update_one({"id": team_id}, {"$push": {"pendingApplications": current_user["name"]}})
        
    return {"message": "Application sent successfully"}

@router.put("/{team_id}")
async def update_team(team_id: str, team_update: TeamUpdate, request: Request, current_user: dict = Depends(get_current_user)):
    db = get_db(request)
    team = await db.teams.find_one({"id": team_id})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    if team.get("leaderId") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to edit this team")
        
    update_data = {k: v for k, v in team_update.dict().items() if v is not None}
    
    if update_data:
        await db.teams.update_one({"id": team_id}, {"$set": update_data})
        
    updated_team = await db.teams.find_one({"id": team_id})
    updated_team.pop("_id", None)
    return updated_team
