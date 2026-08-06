# 🚀 HackMatch

HackMatch is an intelligent, AI-powered matchmaking platform designed to help developers build their dream hackathon teams. By seamlessly combining GitHub-based skill verification with a powerful NVIDIA-backed AI recommendation engine, HackMatch ensures you always find the perfect teammates to ship winning projects.

![HackMatch Overview](frontend/public/hackmatch_landing.png)

## ✨ Core Features

*   🧠 **AI Matchmaker Engine:** Leverages NVIDIA's powerful AI models to analyze project descriptions, extract missing technical requirements, and instantly recommend candidates whose skills perfectly bridge the gap.
*   🛡️ **Cryptographic Skill Verification (Proof Room):** Connects directly to GitHub to parse a user's commit history, repositories, and languages, converting self-reported skills into "Verified" status to build trust among teams.
*   🤝 **Seamless Team Assembly:** Create hackathon projects, specify needed roles and capacities, and review incoming requests. Users can browse open teams, evaluate tech stacks, and apply with a single click.
*   🔒 **Secure Authentication & Sessions:** Full JWT-based authentication system with secure encrypted password management and persistent sessions.
*   🎨 **Dynamic, Premium UI/UX:** Built with a highly responsive, glassmorphic design system utilizing React, Tailwind CSS, and subtle micro-animations for a state-of-the-art user experience.

## 🛠️ Technology Stack

**Frontend:**
*   React (Vite)
*   Tailwind CSS
*   Lucide React (Icons)
*   React Router

**Backend:**
*   Python (FastAPI)
*   MongoDB (Motor AsyncIO)
*   NVIDIA AI API (LangChain/LLM Integration)
*   JWT & Bcrypt for Security
*   Uvicorn (ASGI Server)

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python (3.9+)
*   MongoDB Instance (Atlas or Local)
*   NVIDIA API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Payal3112/HackMatch.git
   cd HackMatch
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
   Create a `.env` file in the `/backend` directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   NVIDIA_API_KEY=your_nvidia_api_key
   FRONTEND_URL=http://localhost:5173
   ```
   Run the backend:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```
   Create a `.env` file in the `/frontend` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```
   Run the frontend:
   ```bash
   npm run dev
   ```

## 💡 How It Works
1. **Register & Verify:** Create an account and enter the *Proof Room* to sync your GitHub profile. The system will independently verify your technical stack.
2. **Create or Explore:** Start your own hackathon team by defining the problem statement and the skills you are missing, or explore open teams looking for your specific talents.
3. **Run AI Matchmaker:** If you're a team leader, run the AI Matchmaker against your project description. The AI will cross-reference the verified skills of the entire user base to deliver high-compatibility recommendations.
4. **Connect & Build:** Send and accept requests, lock your team, and start building!

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---
*Built with ❤️ for the hacker community.*
