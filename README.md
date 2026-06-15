# Amdocs Supply Chain Analytics Platform

This project is a complete, production-ready full-stack analytics platform built for the Amdocs Data Analyst Assignment. It processes the provided `supply_chain_data.csv` and presents actionable insights, automated AI recommendations, and interactive data exploration.

## Architecture

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Recharts
- **Backend:** FastAPI, Python 3.11, Pandas
- **AI Engine:** LangChain, Pandas DataFrame Agent, Groq LLM (llama3-70b-8192)

## Setup Instructions

### 1. Backend Setup

The backend requires Python 3.11.

```bash
# Activate virtual environment
# Windows
.venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Set Groq API Key
export GROQ_API_KEY="your_api_key_here"

# Run the FastAPI server (from the root directory containing supply_chain_data.csv)
uvicorn backend.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install Node modules
npm install

# Run development server
npm run dev
```

Navigate to `http://localhost:3000` to view the application.

## API Configuration
- Backend runs on `http://localhost:8000`
- The Next.js frontend uses `NEXT_PUBLIC_API_URL` to connect to the backend (defaults to `http://localhost:8000/api`).

## Deployment
- **Frontend:** Deployable instantly on Vercel. Ensure the Next.js `build` command is standard.
- **Backend:** Deployable on Render as a Web Service using the `uvicorn backend.main:app --host 0.0.0.0 --port $PORT` start command.
