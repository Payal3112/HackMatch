from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime
from routes.auth import get_current_user

router = APIRouter()

def get_db(request: Request):
    return request.app.mongodb

@router.get("/")
async def get_notifications(request: Request, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    db = get_db(request)
    notifs = await db.notifications.find({"user_id": user_id, "read": False}).to_list(100)
    for n in notifs:
        n["_id"] = str(n["_id"])
    return notifs

@router.post("/read/{notification_id}")
async def mark_read(notification_id: str, request: Request):
    db = get_db(request)
    from bson.objectid import ObjectId
    try:
        obj_id = ObjectId(notification_id)
    except:
        obj_id = notification_id # fallback if it's not an ObjectId
        
    result = await db.notifications.update_one({"_id": obj_id}, {"$set": {"read": True}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Marked as read"}

