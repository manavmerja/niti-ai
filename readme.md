# 🏛️ Niti.ai - Verifiable Government Scheme Assistant

<div align="center">

![Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-Next.js%20|%20Python%20|%20ZYND-blue?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-RAG%20Engine-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br />

**Niti.ai** is an Autonomous AI Agent designed to bridge the gap between Indian citizens and government schemes. Unlike standard chatbots, Niti.ai leverages the **ZYND Protocol** for verifiable agent identity, ensuring accountability and trust in every interaction.

[🔴 Live Demo Link](https://niti-ai-rose.vercel.app/) | [📄 View Documentation](#)

</div>

---

## 🌟 Key Features

### 1. 🆔 ZYND Protocol Integration (The USP)
* **Verifiable Identity:** Niti.ai operates as a registered agent on the ZYND Network with a unique DID.
* **Accountability:** Every query is logged via the ZYND Agent Protocol (`zyndai-agent`), creating a transparent audit trail.
* **Resilience:** Features a "Soft-Connected Mode" ensuring 24/7 uptime even if the registry is offline.

### 2. 🧠 RAG (Retrieval-Augmented Generation)
* **Zero Hallucinations:** Uses **LangChain** and **ChromaDB** to fetch accurate answers from official government PDFs.
* **Context-Aware:** Handles complex queries about eligibility and documents required.

### 3. 💾 Persistent Memory & Auth
* **Smart History:** Integrated with **Supabase** to automatically save and retrieve user chat history.
* **Secure Login:** Authentication powered by **Clerk** (Google/Email login).

### 4. 🎨 Modern "Space-Glass" UI
* Built with **Next.js 14** & **Shadcn UI** featuring a premium **Glassmorphism** design.
* Fully responsive Mobile Sidebar and real-time Typewriter effects.

---

## ⚙️ System Architecture

```mermaid
graph LR
    User[User] -->|Query| Frontend[Next.js UI]
    Frontend -->|API Call| Backend[Flask Server]
    Backend -->|Retrieve| VectorDB[(ChromaDB)]
    Backend -->|Log & Verify| ZYND[ZYND Protocol]
    Backend -->|Store History| DB[(Supabase)]
    VectorDB -->|Context| Backend
    Backend -->|Answer| Frontend

    Tech Stack

    Component	       Technology	                  Description
    Frontend	       Next.js 14, Tailwind CSS	  App Router & Glassmorphism UI
    Auth	           Clerk	                      Secure Authentication
    Backend	          Python (Flask)	              REST API & Agent Logic
    AI Engine	      LangChain, HuggingFace	      RAG Processing
    Database	       Supabase & ChromaDB	       Vector Store & Chat History
    Protocol	       ZYND Agent Library	        Decentralized Identity & Logging
    Deployment	       Render & Vercel	          Cloud Hosting


How to Run Locally

Prerequisites

Node.js & Python 3.12+

Supabase Account & URL/Key

Clerk API Keys

1. Clone the Repo
git clone [https://github.com/manavmerja/niti-ai.git](https://github.com/manavmerja/niti-ai.git)
cd niti-ai

2. Backend Setup
cd backend
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your API keys:
# OPENAI_API_KEY=...
# SUPABASE_URL=...
# SUPABASE_KEY=...

python app.py

3. Frontend Setup
cd frontend
npm install

# Create .env.local file with:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
# CLERK_SECRET_KEY=...

npm run dev


🔮 Future Roadmap
[ ] Campus Mode: Integration with Charusat University database for student-specific scholarships.

[ ] Voice Interface: Audio-to-Audio interaction for rural accessibility.

[ ] Multilingual Support: Regional language support (Hindi, Gujarati) using Bhashini API.

Made with by Merja Manav