from fastapi import APIRouter
from pydantic import BaseModel
import os
import httpx
import json
import logging
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

class MatchRequest(BaseModel):
    project_description: str
    missing_skills: list[str]

class USPRequest(BaseModel):
    skills: list[str]
    experienceLevel: str = "Expert"

import asyncio

@router.post("/matchmaker")
async def ai_matchmaker(req: MatchRequest):
    skills_str = ", ".join(req.missing_skills) if req.missing_skills else "general development"
    api_key = os.getenv("NVIDIA_API_KEY")
    
    # Fallback default matches
    matches = [
        {
            "name": "Rohan Sharma",
            "avatarUrl": "https://i.pravatar.cc/150?u=rohan",
            "matchScore": 98,
            "reason": "Strong frontend overlap. Rohan has heavy React experience and is actively participating in Indian hackathons.",
            "skills": ["React", "TypeScript", "Tailwind"]
        },
        {
            "name": "Ananya Gupta",
            "avatarUrl": "https://i.pravatar.cc/150?u=ananya",
            "matchScore": 92,
            "reason": "Perfect match for your UI/UX needs. Extensive experience designing for Web3 and AI tools in recent national hackathons.",
            "skills": ["UI/UX", "Figma", "React"]
        },
        {
            "name": "Aryan Patel",
            "avatarUrl": "https://i.pravatar.cc/150?u=aryan",
            "matchScore": 85,
            "reason": "Solid backend skills to complement your stack, actively looking for a fast-paced team.",
            "skills": ["Python", "PostgreSQL", "Docker"]
        }
    ]

    if api_key:
        try:
            url = "https://integrate.api.nvidia.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            system_prompt = """You are an elite, world-class technical recruiter and AI matchmaker for a hackathon platform. 
Your task is to analyze a project description and missing skills, and generate exactly 3 highly realistic, specialized candidate profiles that would perfectly complement the team. 
Crucially, do not just regurgitate the missing skills. Invent realistic developer personas with specialized backgrounds, complementary toolsets (e.g., if they need a backend engineer, give them a Node.js/PostgreSQL specialist who also knows Docker), and specific industry experience that aligns with their project.
You MUST output ONLY valid JSON in the exact following format:
{
  "matches": [
    {
      "name": "Candidate Name (e.g. Alex Chen)",
      "avatarUrl": "https://i.pravatar.cc/150?u=random_string",
      "matchScore": 95,
      "reason": "Detailed 2-sentence explanation of exactly how their specific technical background perfectly solves the team's missing skill gaps.",
      "skills": ["Skill1", "Skill2", "Skill3", "Skill4"]
    }
  ]
}
Do not wrap in markdown or add explanations."""
            payload = {
                "model": "meta/llama-3.1-70b-instruct",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Project Description: {req.project_description}\nMissing Skills: {skills_str}"}
                ],
                "max_tokens": 1024,
                "temperature": 0.7
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=payload, timeout=15.0)
                
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"].strip()
                    
                    if content.startswith("```json"):
                        content = content.split("```json")[1].split("```")[0].strip()
                    elif content.startswith("```"):
                        content = content.split("```")[1].split("```")[0].strip()
                        
                    parsed = json.loads(content)
                    if "matches" in parsed and isinstance(parsed["matches"], list):
                        matches = parsed["matches"]
                else:
                    logging.error(f"NVIDIA API Error in Matchmaker: {response.status_code} - {response.text}")
                    
        except Exception as e:
            logging.error(f"Exception calling NVIDIA API in Matchmaker: {e}")

    return {
        "matches": matches
    }

@router.post("/usp")
async def generate_usp(req: USPRequest):
    skills_str = ", ".join(req.skills) if req.skills else "cutting-edge paradigms"
    api_key = os.getenv("NVIDIA_API_KEY")
    
    # Fallback default
    usp_text = f"An elite {req.experienceLevel} architect specializing in {skills_str}. Forged to seamlessly integrate complex technical requirements with stunning user experiences, driving deep engagement and scalable resonance in every deploy."
    keywords = req.skills[:3] if req.skills else ["Resonance", "Synergy", "Architecture"]

    if api_key:
        try:
            url = "https://integrate.api.nvidia.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "meta/llama-3.1-70b-instruct",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an elite Silicon Valley tech recruiter writing a personalized, punchy 2-sentence 'Unique Selling Proposition' (USP) bio for a developer joining a hackathon. The bio MUST highlight their specific combination of skills to show exactly why they are a dangerous, highly effective hacker to have on a team. Be highly realistic, professional, and efficient. Do not use generic buzzwords; highlight true technical synergy. You MUST output ONLY valid JSON in the exact following format: {\"usp\": \"the 2-sentence bio here\", \"keywords\": [\"Keyword1\", \"Keyword2\", \"Keyword3\"]}. Do not wrap in markdown or add explanations."
                    },
                    {
                        "role": "user",
                        "content": f"Experience level: {req.experienceLevel}. Verified Skills: {skills_str}."
                    }
                ],
                "max_tokens": 200,
                "temperature": 0.7
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=payload, timeout=10.0)
                
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"].strip()
                    
                    if content.startswith("```json"):
                        content = content.split("```json")[1].split("```")[0].strip()
                    elif content.startswith("```"):
                        content = content.split("```")[1].split("```")[0].strip()
                        
                    parsed = json.loads(content)
                    if "usp" in parsed and "keywords" in parsed:
                        usp_text = parsed["usp"]
                        keywords = parsed["keywords"][:3]
                else:
                    logging.error(f"NVIDIA API Error: {response.status_code} - {response.text}")
                    
        except Exception as e:
            logging.error(f"Exception calling NVIDIA API: {e}")
    
    return {
        "usp": usp_text,
        "keywords": keywords
    }
