# 🏛️ Niti.ai - AI Assistant for Government Schemes

<div align="center">

![Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-Next.js%20|%20Python%20|%20ZYND-blue?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-Groq%20LPU%20|%20Llama3-orange?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-E2E%20Encrypted-purple?style=for-the-badge)

<br />

**Niti.ai** is an Autonomous AI Agent designed to bridge the information gap between Indian citizens and government schemes. Unlike standard chatbots, Niti.ai leverages the **Groq LPU** for ultra-fast inference and the **ZYND Protocol** for verifiable, secure agent communication.

[🔴 **Live Demo Link**](https://niti-ai-rose.vercel.app/) | [📺 **Video Demo**](#)

</div>

---

## 🌟 Key Features

### 1. ⚡ Ultra-Fast AI (Groq LPU)
* **Real-Time Inference:** Powered by **Groq LPU** running **Llama 3**, delivering responses in **<2 seconds**.
* **Hinglish Native:** Fine-tuned to understand and respond in mixed Hindi-English (Hinglish) for better accessibility in rural India.

### 2. 🛡️ ZYND Protocol Integration (The USP)
* **Verifiable Identity:** Niti.ai operates as a registered agent on the ZYND Network (P3AI) with a unique Decentralized Identity (DID).
* **Enterprise Security:** Ensures **End-to-End Encryption** for all user-agent communications via secure MQTT channels.

### 3. 🧠 RAG (Retrieval-Augmented Generation)
* **Zero Hallucinations:** Uses **LangChain** and **Supabase Vector DB** to strictly fetch accurate answers from official government PDFs (India.gov.in).
* **Source Citations:** Provides direct links to the source documents for verification.

### 4. 📱 Mobile-First PWA
* **App-Like Experience:** Built as a Progressive Web App (PWA) using **Next.js 14**.
* **Performance:** Optimized for low-end devices and works efficiently on slow networks (2G/3G).

---

## ⚙️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14, Tailwind CSS | App Router, PWA & Glassmorphism UI |
| **Backend** | Python (Flask) | REST API & Agent Logic |
| **AI Engine** | Groq LPU, Llama 3 | High-speed Inference |
| **Orchestration** | LangChain | RAG Pipeline & Prompt Management |
| **Database** | Supabase (PostgreSQL) | Vector Store (pgvector) & Relational Data |
| **Protocol** | **ZYND Agent (P3AI)** | Decentralized Identity & E2E Encryption |
| **Deployment** | Vercel & Render | Cloud Hosting |

---

## 🛠️ How to Run Locally

### Prerequisites
* Node.js & Python 3.10+
* Supabase Account (URL & Key)
* Groq API Key
* ZYND Identity Credentials

### 1. Clone the Repository
```bash
git clone [https://github.com/manavmerja/niti-ai.git](https://github.com/manavmerja/niti-ai.git)
cd niti-ai
2. Backend Setup (Flask)
Bash

cd server
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file:
# GROQ_API_KEY=...
# SUPABASE_URL=...
# SUPABASE_KEY=...
# ZYND_CREDENTIALS=...

python app.py
# Server starts at http://localhost:5000
3. Frontend Setup (Next.js)
Bash

cd client
npm install

# Create .env.local file:
# NEXT_PUBLIC_API_URL=http://localhost:5000

npm run dev
# App runs at http://localhost:3000
🛣️ Future Roadmap
🎙️ Voice Interface: Full Audio-to-Audio interaction for illiterate users.

📝 Form Auto-Fill: AI Agents that automatically fill complex government application forms.

🌍 Regional Languages: Expanding support to Tamil, Telugu, Gujarati, and Marathi using Bhashini API.

<div align="center">

Developed with ❤️ by Manav Merja (Team Heisenberg)