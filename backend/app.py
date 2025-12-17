from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import os
import json
from dotenv import load_dotenv
from services.rag_service import get_rag_response
from supabase import create_client, Client

# --- ZYND IMPORT (Safe Mode) ---
try:
    from zyndai_agent.agent import ZyndAIAgent, AgentConfig
    zynd_available = True
    print("✅ ZYND Library Loaded Successfully")
except ImportError as e:
    zynd_available = False
    print(f"⚠️ ZYND Library NOT Found: {e}")

load_dotenv()

app = Flask(__name__)

# --- BASIC CORS ---
CORS(app)

# --- SUPABASE SETUP ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase: Client = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase Connected!")
    except Exception as e:
        print(f"⚠️ Supabase Init Failed: {e}")

# --- ZYND SETUP ---
niti_agent = None
if zynd_available:
    try:
        # Dummy credentials for demo
        cred_file = "zynd_credentials.json"
        with open(cred_file, "w") as f:
            json.dump({"id": "did:web:zynd.network:niti-ai"}, f)
            
        config = AgentConfig(
            mqtt_broker_url="mqtt://test.mosquitto.org",
            registry_url="http://localhost:3002",
            secret_seed="0"*64,
            identity_credential_path=cred_file
        )
        niti_agent = ZyndAIAgent(agent_config=config)
    except Exception:
        pass

# --- 🛠️ HELPER: MANUAL CORS HEADERS ---
def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    return response

def _corsify_actual_response(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

# --- ROUTES ---

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Niti.ai Backend is Live! 🚀"})

@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    # ✅ FIX: Manual Preflight Handling
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()

    try:
        data = request.json
        user_query = data.get("text", "")
        session_id = data.get("session_id", "guest_user")
        
        # 1. AI Response
        response_text = get_rag_response(user_query)
        
        # 2. Database & ZYND Logging (Safe Mode)
        if supabase:
            try:
                supabase.table("chat_history").insert([
                    {"role": "user", "content": user_query, "session_id": session_id},
                    {"role": "ai", "content": response_text, "session_id": session_id}
                ]).execute()
            except: pass

        if niti_agent and hasattr(niti_agent, 'log_activity'):
            try: niti_agent.log_activity(user_query=user_query, agent_response=response_text)
            except: pass

        return _corsify_actual_response(jsonify({"response": response_text}))
    
    except Exception as e:
        print(f"Server Error: {e}")
        return _corsify_actual_response(jsonify({"response": "⚠️ Internal Server Error"})), 500

@app.route("/history", methods=["GET", "OPTIONS"])
def get_history():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
        
    try:
        session_id = request.args.get("session_id")
        if not session_id or not supabase:
            return _corsify_actual_response(jsonify([]))

        response = supabase.table("chat_history")\
            .select("*")\
            .eq("session_id", session_id)\
            .eq("role", "user")\
            .order("created_at", desc=True)\
            .limit(10)\
            .execute()
        return _corsify_actual_response(jsonify(response.data))
    except:
        return _corsify_actual_response(jsonify([]))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)


    