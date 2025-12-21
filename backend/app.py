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
except ImportError:
    zynd_available = False
    print("⚠️ ZYND Library NOT Found")

load_dotenv()

app = Flask(__name__)
CORS(app)



# --- SUPABASE SETUP ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- HELPER: GENERATE TITLE (Improved) ---
def generate_title(text):
    try:
        if not text:
            return "New Chat"
        words = text.split()
        # Pehle 4-5 words lo
        title = " ".join(words[:6])
        if len(words) > 6:
            title += "..."
        return title
    except:
        return "New Chat"

# --- ROUTES ---

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Niti.ai Backend is Live with New Schema! 🚀"})


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_query = data.get("text", "")
        user_id = data.get("session_id", "guest")
        conversation_id = data.get("conversation_id")

        print(f"📩 Query: {user_query} | ID: {conversation_id}") # DEBUG LOG

        if not user_query:
            return jsonify({"error": "No query provided"}), 400

        # 1. AI Response
        ai_response = get_rag_response(user_query)

        # 2. Database Operations
        if user_id: 
            try:
                # A. Create Conversation if it doesn't exist
                if not conversation_id:
                    title = generate_title(user_query)
                    conv_res = supabase.table("conversations").insert({
                        "user_id": user_id,
                        "title": title
                    }).execute()
                    if conv_res.data:
                        conversation_id = conv_res.data[0]['id']

                        # B. Save Messages (If conversation_id is available)
                        if conversation_id:
                            supabase.table("messages").insert([
                                {"conversation_id": conversation_id, "role": "user", "content": user_query, "user_id": user_id},
                        {"conversation_id": conversation_id, "role": "ai", "content": ai_response, "user_id": user_id}
                    ]).execute()
                    print("✅ Messages Saved!")
            except Exception as e:
                print(f"❌ DB Save Failed: {e}")

        return jsonify({
            "response": ai_response,
            "conversation_id": conversation_id
        })

    except Exception as e:
        print(f"Server Error: {e}")
        return jsonify({"response": "⚠️ Server Error"}), 500



# app.py ke 'get_history' function ko isse replace karein:
@app.route("/history", methods=["GET"])
def get_history():
    try:
        user_id = request.args.get("session_id")
        # Supabase Auth me user_id hamesha UUID hoga
        if not user_id:
            return jsonify([])

        response = supabase.table("conversations")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()

        return jsonify(response.data)
    except Exception as e:
        print(f"History Error: {e}")
        return jsonify([])


# ✅ NEW: Get Full Chat Messages (Jab user click kare)
@app.route("/chat/<conversation_id>", methods=["GET"])
def get_chat_messages(conversation_id):
    try:
        # Messages layenge specific chat ke liye
        response = supabase.table("messages")\
            .select("*")\
            .eq("conversation_id", conversation_id)\
            .order("created_at", desc=False)\
            .execute() # Ascending order (Purana pehle)
        
        return jsonify(response.data)
    except Exception as e:
        print(f"Chat Load Error: {e}")
        return jsonify([])

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)