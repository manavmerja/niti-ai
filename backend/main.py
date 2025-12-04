from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents import get_scheme_plan
import os
import asyncio
import httpx # <-- New Import (Make sure to install this if needed, but requests works too)
from contextlib import asynccontextmanager

# --- SELF PING MECHANISM (Keep Alive) ---
async def keep_alive():
    """Server ko sone se rokne ke liye har 10 minute me khud ko ping karega"""
    url = "https://niti-backend.onrender.com/" # <-- YAHAN APNA RENDER URL DALO
    while True:
        try:
            print(f"🔄 Pinging myself to stay awake: {url}")
            async with httpx.AsyncClient() as client:
                await client.get(url)
        except Exception as e:
            print(f"⚠️ Ping failed: {e}")
        
        await asyncio.sleep(600) # 10 Minutes wait

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup par background task shuru karo
    asyncio.create_task(keep_alive())
    yield

app = FastAPI(lifespan=lifespan)

# --- CORS SETTINGS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserQuery(BaseModel):
    text: str

@app.get("/")
def home():
    return {"status": "Niti.ai Backend is Online 🟢"}

@app.post("/chat")
def chat(query: UserQuery):
    print(f"📩 Input: {query.text}")
    try:
        response = get_scheme_plan(query.text)
        return {"response": str(response)} 
    except Exception as e:
        return {"error": str(e)}