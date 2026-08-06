import os
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, EmailStr
import bcrypt
from jose import jwt, JWTError
from datetime import datetime, timedelta
import uuid

router = APIRouter()

SECRET_KEY = os.environ.get("JWT_SECRET", "supersecret")
ALGORITHM = "HS256"

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    skills: list[str] = []
    github_handle: str = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=1)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_db(request: Request):
    return request.app.mongodb

async def get_current_user(request: Request):
    db = get_db(request)
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/register")
async def register(user: UserRegister, request: Request):
    db = get_db(request)
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    hashed_password = get_password_hash(user.password)
    new_user = {
        "id": str(uuid.uuid4()),
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "skills": user.skills,
        "github_handle": user.github_handle,
        "verified_skills": []
    }
    await db.users.insert_one(new_user)
    return {"message": "User registered successfully"}

@router.post("/login")
async def login(user: UserLogin, request: Request):
    db = get_db(request)
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    token = create_access_token(data={"sub": db_user["id"]})
    return {
        "token": token,
        "user": {
            "id": db_user["id"],
            "name": db_user["name"],
            "email": db_user["email"],
            "skills": db_user["skills"],
            "github_handle": db_user.get("github_handle", ""),
            "discord_handle": db_user.get("discord_handle", ""),
            "avatar_url": db_user.get("avatar_url", ""),
            "verified_skills": db_user.get("verified_skills", []),
            "status": db_user.get("status", "open"),
            "level": db_user.get("level", ""),
            "keywords": db_user.get("keywords", []),
            "bio": db_user.get("bio", "")
        }
    }

@router.get("/me")
async def get_me(request: Request, current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "skills": current_user["skills"],
        "github_handle": current_user.get("github_handle", ""),
        "discord_handle": current_user.get("discord_handle", ""),
        "avatar_url": current_user.get("avatar_url", ""),
        "verified_skills": current_user.get("verified_skills", []),
        "status": current_user.get("status", "open"),
        "level": current_user.get("level", ""),
        "keywords": current_user.get("keywords", []),
        "bio": current_user.get("bio", "")
    }

class PasswordReset(BaseModel):
    email: EmailStr
    old_password: str
    new_password: str

@router.post("/reset-password")
async def reset_password(req: PasswordReset, request: Request):
    db = get_db(request)
    db_user = await db.users.find_one({"email": req.email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not verify_password(req.old_password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid old password")
    
    hashed_password = get_password_hash(req.new_password)
    await db.users.update_one({"email": req.email}, {"$set": {"password": hashed_password}})
    return {"message": "Password updated successfully"}
