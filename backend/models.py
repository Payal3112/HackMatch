from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    skills: List[str] = []

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TeamCreate(BaseModel):
    hackathonLink: str
    teamName: str
    missingRoles: List[str] = []

class AIProfileAnalyzeRequest(BaseModel):
    skills: List[str]
    resumeText: Optional[str] = None

class TeamRequestCreate(BaseModel):
    targetId: str
    targetType: str # "team" or "user"
    type: str # "join" or "invite"
    teamId: Optional[str] = None
