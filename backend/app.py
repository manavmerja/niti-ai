from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Import from the new Services folder
# Dhyan rahe: 'services' folder aur 'rag_service.py' file honi chahiye
from services.rag_service import get_rag_response

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Niti.ai Backend is Running! 🚀"

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_text = data.get('text')
        
        if not user_text:
            return jsonify({"error": "No text provided"}), 400

        # Call the logic from Service
        ai_response = get_rag_response(user_text)
        
        return jsonify({"response": ai_response})

    except Exception as e:
        print(f"Server Error: {e}")
        return jsonify({"response": "Internal Server Error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)