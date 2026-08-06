#!/bin/bash

echo "==================================="
echo " Starting HackMatch Backend Server "
echo "==================================="

# 1. Start MongoDB
echo "-> Starting MongoDB Service..."
# In WSL/Ubuntu, MongoDB is usually started with the service command
sudo service mongodb start || sudo service mongod start
# Note: You might be prompted for your WSL password to start the service.

# 2. Start the FastAPI Backend
echo "-> Starting FastAPI Backend..."
cd backend

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Warning: No venv directory found in backend/. Running uvicorn directly."
fi

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
