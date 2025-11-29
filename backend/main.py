from fastapi import FastAPI
from pydantic import BaseModel
from agents import get_scheme_plan
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

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
        return {"response": response}
    except Exception as e:
        return {"error": str(e)}