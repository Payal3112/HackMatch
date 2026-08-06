from fastapi import APIRouter, Request, HTTPException, Depends
from models import TeamRequestCreate
from routes.auth import get_current_user
import uuid
from datetime import datetime

router = APIRouter()

def get_db(request: Request):
    return request.app.mongodb

@router.get("/")
async def get_requests(request: Request, current_user: dict = Depends(get_current_user)):
    db = get_db(request)
    
    # Incoming requests:
    # 1. Type "invite" where receiverId == user.id
    # 2. Type "join" where targetId == team.id (where user is the leader of team)
    
    # Get user's teams (where they are leader)
    user_teams = await db.teams.find({"leaderId": current_user["id"]}).to_list(100)
    team_ids = [t["id"] for t in user_teams]
    
    incoming = await db.requests.find({
        "$or": [
            {"targetId": current_user["name"], "targetType": "user", "type": "invite"},
            {"targetId": current_user["id"], "targetType": "user", "type": "invite"},
            {"targetId": {"$in": team_ids}, "targetType": "team", "type": "join"},
            # Also support name-based matching for legacy/mock data
            {"targetId": {"$in": [t.get("name") for t in user_teams if t.get("name")]}, "targetType": "team", "type": "join"}
        ]
    }).to_list(100)
    
    # Outgoing requests:
    # Sent by this user
    outgoing = await db.requests.find({"senderId": current_user["id"]}).to_list(100)
    
    for req in incoming + outgoing:
        req["_id"] = str(req["_id"])
        
    return {
        "incoming": incoming,
        "outgoing": outgoing
    }

@router.post("/send")
async def send_request(req: TeamRequestCreate, request: Request, current_user: dict = Depends(get_current_user)):
    db = get_db(request)
    
    # Check if a pending request already exists
    existing = await db.requests.find_one({
        "senderId": current_user["id"],
        "targetId": req.targetId,
        "type": req.type,
        "status": "pending"
    })
    if existing:
        return {"message": "Request already sent"}
        
    new_req = {
        "id": str(uuid.uuid4()),
        "senderId": current_user["id"],
        "senderName": current_user["name"],
        "targetId": req.targetId,
        "targetType": req.targetType,
        "type": req.type,
        "teamId": req.teamId,
        "status": "pending",
        "createdAt": datetime.utcnow()
    }
    
    await db.requests.insert_one(new_req)
    
    # Also update the team's pendingApplications array so it shows up in "My Teams" immediately
    if req.targetType == "team" and req.type == "join":
        await db.teams.update_one(
            {"name": req.targetId},
            {"$addToSet": {"pendingApplications": current_user["name"]}}
        )
        
    new_req.pop("_id", None)
    return new_req

@router.post("/{request_id}/accept")
async def accept_request(request_id: str, request: Request, current_user: dict = Depends(get_current_user)):
    db = get_db(request)
    req_doc = await db.requests.find_one({"id": request_id})
    if not req_doc:
        raise HTTPException(status_code=404, detail="Request not found")
        
    if req_doc["status"] != "pending":
        raise HTTPException(status_code=400, detail="Request is not pending")
        
    # Verify authorization (is current_user the receiver of invite, or leader of team?)
    if req_doc["type"] == "invite":
        if req_doc["targetId"] != current_user["id"] and req_doc["targetId"] != current_user["name"]:
            raise HTTPException(status_code=403, detail="Not authorized")
            
        team_id = req_doc.get("teamId")
        if not team_id:
            raise HTTPException(status_code=400, detail="Team ID missing in invite request")
            
        team = await db.teams.find_one({"id": team_id})
        if team:
            if len(team.get("members", [])) >= team.get("capacity", 4):
                raise HTTPException(status_code=400, detail="Team is already at max capacity")
                
            await db.teams.update_one(
                {"id": team_id},
                {"$addToSet": {"members": current_user["name"]}}
            )
        else:
            raise HTTPException(status_code=404, detail="Team not found")
            
    elif req_doc["type"] == "join":
        # Target is team. Is current user the leader?
        team = await db.teams.find_one({"$or": [{"id": req_doc["targetId"]}, {"teamName": req_doc["targetId"]}]})
        
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")
            
        if team.get("leaderId") != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to accept requests for this team")
            
        if len(team.get("members", [])) >= team.get("capacity", 4):
            raise HTTPException(status_code=400, detail="Team is already at max capacity")
            
        # Add sender to the team and remove from pending
        await db.teams.update_one(
            {"_id": team["_id"]},
            {
                "$addToSet": {"members": req_doc["senderName"]},
                "$pull": {"pendingApplications": req_doc["senderName"]}
            }
        )
        
    await db.requests.update_one({"id": request_id}, {"$set": {"status": "accepted"}})
    return {"message": "Request accepted"}

@router.post("/{request_id}/decline")
async def decline_request(request_id: str, request: Request, current_user: dict = Depends(get_current_user)):
    db = get_db(request)
    req_doc = await db.requests.find_one({"id": request_id})
    if not req_doc:
        raise HTTPException(status_code=404, detail="Request not found")
        
    result = await db.requests.update_one({"id": request_id}, {"$set": {"status": "declined"}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
        
    # Remove from pendingApplications if it was a team join
    if req_doc.get("targetType") == "team" and req_doc.get("type") == "join":
        await db.teams.update_one(
            {"name": req_doc["targetId"]},
            {"$pull": {"pendingApplications": req_doc["senderName"]}}
        )
        
    return {"message": "Request declined"}
