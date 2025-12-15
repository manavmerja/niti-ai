from flask import Flask, jsonify, request

app = Flask(__name__)

# --- HEAD OFFICE (Registry) ---
print("🏢 ZYND Local Registry Starting on Port 3002...")

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "ZYND Registry is Online 🟢"})

# Ye wo endpoint hai jahan error 415 aa raha tha
@app.route('/agents/update-mqtt', methods=['POST'])
def update_mqtt():
    # FIX: Data kaise bhi format me aaye, hume bas print karna hai
    # 'force=True' ka matlab: Agar 'application/json' header nahi bhi hai, toh bhi try karo
    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            # Agar JSON fail ho jaye, to raw text le lo
            data = request.data.decode('utf-8')
            
        print(f"✅ Agent Connected & Registered! Data: {data}")
        
    except Exception as e:
        print(f"⚠️ Data receive hua par read nahi kar paye: {e}")

    # Agent ko hamesha 'Success' bhejo
    return jsonify({"status": "success", "message": "Agent registered successfully"}), 200

if __name__ == '__main__':
    # Port 3002 fix hai
    app.run(port=3002)