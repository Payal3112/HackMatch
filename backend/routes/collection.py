from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel
import uuid
from datetime import datetime
from routes.auth import get_current_user

router = APIRouter()

def get_db(request: Request):
    return request.app.mongodb

@router.get("/")
async def get_collection(request: Request, current_user: dict = Depends(get_current_user)):
    db = get_db(request)
    collection = await db.collections.find_one({"user_id": current_user["id"]})
    
    if not collection:
        return {"hackathons": [], "people": [], "teams": []}
        
    collection["_id"] = str(collection["_id"])
    return {
        "hackathons": collection.get("hackathons", []),
        "people": collection.get("people", []),
        "teams": collection.get("teams", [])
    }

class CollectionAddRequest(BaseModel):
    type: str # "hackathon", "person", or "team"
    item: dict

@router.post("/add")
async def add_to_collection(req: CollectionAddRequest, request: Request, current_user: dict = Depends(get_current_user)):
    db = get_db(request)
    if req.type == "hackathon":
        field = "hackathons"
    elif req.type == "team":
        field = "teams"
    else:
        field = "people"
    
    await db.collections.update_one(
        {"user_id": current_user["id"]},
        {"$push": {field: req.item}},
        upsert=True
    )
    return {"status": "success"}

class CollectionRemoveRequest(BaseModel):
    type: str
    item_name: str

@router.delete("/remove")
async def remove_from_collection(req: CollectionRemoveRequest, request: Request, current_user: dict = Depends(get_current_user)):
    db = get_db(request)
    if req.type == "hackathon":
        field = "hackathons"
        match_field = "title"
    elif req.type == "team":
        field = "teams"
        match_field = "name"
    else:
        field = "people"
        match_field = "name"
    
    await db.collections.update_one(
        {"user_id": current_user["id"]},
        {"$pull": {field: {match_field: req.item_name}}}
    )
    return {"status": "success"}
