from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # <-- Ye line permission ke liye hai
from pydantic import BaseModel
from agents import get_scheme_plan
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# --- CORS SETTINGS (Permission Fix) ---
# Ye code frontend ko allow karega
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Sabko allow karo (localhost:3000 included)
    allow_credentials=True,
    allow_methods=["*"], # GET, POST, OPTIONS sab allow karo
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
        # Agents ko call karo
        response = get_scheme_plan(query.text)
        # Response ko string me convert karke bhejo
        return {"response": str(response)} 
    except Exception as e:
        return {"error": str(e)}