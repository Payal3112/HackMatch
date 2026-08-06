from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel
import httpx
import logging
from routes.auth import get_current_user

router = APIRouter()

class ProofRequest(BaseModel):
    github_handle: str
    skills: list[str]

class VerifyHandleRequest(BaseModel):
    github_handle: str
    name: str = ""
    skills: list[str] = []
    discord_handle: str = ""
    status: str = "open"
    level: str = ""
    keywords: list[str] = []
    bio: str = ""

def get_db(request: Request):
    return request.app.mongodb

# Mapping of frameworks to their primary GitHub languages
FRAMEWORK_TO_LANGUAGE = {
    "react": ["javascript", "typescript"],
    "reactjs": ["javascript", "typescript"],
    "nextjs": ["javascript", "typescript"],
    "fastapi": ["python"],
    "django": ["python"],
    "flask": ["python"],
    "node": ["javascript", "typescript"],
    "nodejs": ["javascript", "typescript"],
    "express": ["javascript", "typescript"],
    "vue": ["javascript", "vue"],
    "angular": ["typescript"],
    "spring": ["java"],
    "laravel": ["php"],
    "rails": ["ruby"],
    "pandas": ["python", "jupyter notebook"],
    "numpy": ["python", "jupyter notebook"],
    "blender": ["python"],
    "flutter": ["dart"],
    "android": ["java", "kotlin"],
    "ios": ["swift", "objective-c"],
}

@router.post("/verify")
async def verify_skills(req: ProofRequest, request: Request, current_user: dict = Depends(get_current_user)):
    if not req.github_handle or req.github_handle.lower() == "dev":
        # Fallback if no handle provided
        return {
            "message": "Please configure a real GitHub handle in Preferences.",
            "verified_skills": []
        }
        
    raw_input = req.github_handle
    github_handle = raw_input
    if "github.com/" in raw_input:
        github_handle = raw_input.split("github.com/")[1].split("/")[0].strip()
        
    github_url = f"https://api.github.com/users/{github_handle}/repos?per_page=100&sort=updated"
    
    found_languages = set()
    
    try:
        async with httpx.AsyncClient() as client:
            headers = {"Accept": "application/vnd.github.v3+json"}
            response = await client.get(github_url, headers=headers)
            
            if response.status_code == 200:
                repos = response.json()
                for repo in repos:
                    lang = repo.get("language")
                    if lang:
                        found_languages.add(lang.lower())
            elif response.status_code == 403:
                return {
                    "message": "GitHub API rate limit exceeded. Please try again later.",
                    "verified_skills": []
                }
            elif response.status_code == 404:
                return {
                    "message": f"GitHub user '{req.github_handle}' not found.",
                    "verified_skills": []
                }
            else:
                return {
                    "message": f"Failed to fetch GitHub data. Status code: {response.status_code}",
                    "verified_skills": []
                }
    except Exception as e:
        logging.error(f"Error calling GitHub API: {e}")
        return {
            "message": "Internal error while connecting to GitHub.",
            "verified_skills": []
        }
        
    verified_skills = []
    
    for skill in req.skills:
        skill_lower = skill.lower().strip()
        
        # Direct language match (e.g. user claims "Python", and "python" is in found_languages)
        if skill_lower in found_languages:
            verified_skills.append(skill)
            continue
            
        # Framework matching (e.g. user claims "React", we check for "javascript" or "typescript")
        if skill_lower in FRAMEWORK_TO_LANGUAGE:
            required_langs = FRAMEWORK_TO_LANGUAGE[skill_lower]
            if any(lang in found_languages for lang in required_langs):
                verified_skills.append(skill)
                continue
                
    message = "Skill verification completed successfully based on public repository data."
    if not found_languages:
        message = "No public repositories found to verify skills."

    # Update DB with verified skills
    db = get_db(request)
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"verified_skills": verified_skills}}
    )
    
    return {
        "message": message,
        "verified_skills": verified_skills
    }

@router.post("/update-profile")
async def update_profile(req: VerifyHandleRequest, request: Request, current_user: dict = Depends(get_current_user)):
    if not req.github_handle:
        raise HTTPException(status_code=400, detail="Handle is required")
        
    raw_input = req.github_handle
    
    if "github.com/" in raw_input:
        username = raw_input.split("github.com/")[1].split("/")[0].strip()
    else:
        username = raw_input.strip().replace("@", "")
        
    if not username:
        return {"valid": False, "message": "Invalid GitHub handle."}
        
    github_url = f"https://api.github.com/users/{username}"
    
    try:
        async with httpx.AsyncClient() as client:
            headers = {"Accept": "application/vnd.github.v3+json"}
            response = await client.get(github_url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                new_name = req.name or data.get("name") or data.get("login")
                
                # Update DB
                db = get_db(request)
                await db.users.update_one(
                    {"id": current_user["id"]},
                    {"$set": {
                        "github_handle": username,
                        "name": new_name,
                        "avatar_url": data.get("avatar_url"),
                        "skills": req.skills,
                        "discord_handle": req.discord_handle,
                        "status": req.status,
                        "level": req.level,
                        "keywords": req.keywords,
                        "bio": req.bio
                    }}
                )
                
                return {
                    "valid": True,
                    "name": new_name,
                    "avatar_url": data.get("avatar_url"),
                    "skills": req.skills,
                    "discord_handle": req.discord_handle,
                    "status": req.status,
                    "level": req.level,
                    "keywords": req.keywords,
                    "github_handle": username,
                    "message": "Profile updated successfully in backend."
                }
            elif response.status_code == 404:
                return {"valid": False, "message": "GitHub handle not found"}
            else:
                return {"valid": False, "message": f"GitHub API error: {response.status_code}"}
    except Exception as e:
        logging.error(f"Error calling GitHub API: {e}")
        return {"valid": False, "message": "Internal error verifying handle"}
