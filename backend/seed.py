import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def seed_db():
    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient("mongodb://127.0.0.1:27017")
    db = client.hackmatch
    
    print("Clearing old data...")
    await db.workspaces.delete_many({})
    await db.collections.delete_many({})
    await db.notifications.delete_many({})
    
    print("Inserting workspace data...")
    await db.workspaces.insert_one({
        "user_id": "mock-leader",
        "active_teams": [
            {
                "id": "team_1",
                "name": "Project Nova",
                "hackathon": "Global AI Hackathon 2026",
                "status": "Hacking",
                "members": ["user_1", "user_2", "user_3"],
                "capacity": 4,
                "roles_missing": ["UI/UX Designer"]
            }
        ]
    })
    
    print("Inserting collection data...")
    await db.collections.insert_one({
        "user_id": "mock-leader",
        "hackathons": [
            {"id": "hack_1", "name": "HackMIT 2026", "date": "Sep 14, 2026 - Sep 15, 2026"},
            {"id": "hack_2", "name": "Global AI Hackathon", "date": "Oct 1, 2026 - Oct 3, 2026"},
            {"id": "hack_3", "name": "Web3 Buildathon", "date": "Nov 12, 2026 - Nov 14, 2026"},
            {"id": "hack_4", "name": "Devpost Spooky Hack", "date": "Oct 28, 2026 - Oct 31, 2026"}
        ],
        "people": [
            {"id": "user_2", "name": "Sarah Chen", "role": "Frontend Developer"},
            {"id": "user_3", "name": "Marcus Johnson", "role": "UI/UX Designer"},
            {"id": "user_4", "name": "Elena Rodriguez", "role": "Data Scientist"}
        ]
    })
    
    print("Inserting notifications...")
    await db.notifications.insert_many([
        {
            "user_id": "mock-leader",
            "message": "Welcome to HackMatch! Your dashboard is connected to MongoDB.",
            "read": False
        },
        {
            "user_id": "mock-leader",
            "message": "AI Insight found a 98% match for your team.",
            "read": False
        }
    ])
    
    print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_db())
