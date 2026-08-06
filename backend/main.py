import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from routes import auth, teams, ai, proof, squad, notifications, workspace, collection, requests

load_dotenv()

app = FastAPI(title="HackMatch Nexus Backend")

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        os.environ.get("FRONTEND_URL", "http://localhost:5173")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
    app.mongodb_client = AsyncIOMotorClient(mongo_uri)
    app.mongodb = app.mongodb_client["hackmatch"]
    print("Connected to MongoDB")

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()
    print("Disconnected from MongoDB")

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(teams.router, prefix="/api/teams", tags=["teams"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(proof.router, prefix="/api/proof", tags=["proof"])
app.include_router(squad.router, prefix="/api/squad", tags=["squad"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(workspace.router, prefix="/api/workspace", tags=["workspace"])
app.include_router(collection.router, prefix="/api/collection", tags=["collection"])
app.include_router(requests.router, prefix="/api/requests", tags=["requests"])

@app.get("/")
async def root():
    return {"message": "Welcome to HackMatch Nexus API"}
