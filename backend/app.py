from flask import Flask, request, jsonify
from flask_cors import CORS  # <-- Import CORS
import os
from dotenv import load_dotenv
from services.rag_service import get_rag_response

load_dotenv()

app = Flask(__name__)

# --- CORS SETTING (Allow All Origins) ---
# Ye line zaruri hai taaki Vercel se request aa sake
CORS(app, resources={r"/*": {"origins": "*"}}) 

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Niti.ai Backend is Live! 🚀"})

@app.route("/chat", methods=["POST", "OPTIONS"]) # OPTIONS add karna zaruri hai
def chat():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    
    try:
        data = request.json
        user_query = data.get("text", "")
        
        if not user_query:
            return jsonify({"error": "No text provided"}), 400
            
        # Get AI Response
        response_text = get_rag_response(user_query)
        
        return jsonify({"response": response_text})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"response": "⚠️ Internal Server Error"}), 500

def _build_cors_preflight_response():
    response = jsonify({})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
    return response

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)