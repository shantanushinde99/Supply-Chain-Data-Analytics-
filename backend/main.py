from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()
from backend.api import dashboard, metrics, explore, chat, insights

app = FastAPI(title="Amdocs Data Analyst API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["Metrics"])
app.include_router(explore.router, prefix="/api/explore", tags=["Explore"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(insights.router, prefix="/api/insights", tags=["Insights"])

@app.get("/")
def read_root():
    return {"message": "Amdocs Supply Chain Analytics API is running"}
