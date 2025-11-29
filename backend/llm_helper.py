import os
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI

def get_llm():
    """
    Niti.ai Brain Selector:
    Priority 1: Groq (Fastest) - UPDATED MODEL
    Priority 2: Google Gemini (Backup)
    """
    
    # --- PLAN A: GROQ (Updated Model Name) ---
    try:
        if "GROQ_API_KEY" in os.environ:
            print("🔵 Niti.ai: Connecting to Groq...")
            llm = ChatGroq(
                temperature=0,
                # YAHAN CHANGE KIYA HAI (Naya Model):
                model_name="llama-3.3-70b-versatile", 
                api_key=os.environ["GROQ_API_KEY"]
            )
            llm.invoke("Hi") # Connection Test
            print("✅ Success: Groq is Active")
            return llm
    except Exception as e:
        print(f"⚠️ Groq Failed: {e}")
        print("🔄 Switching to Backup Brain...")

    # --- PLAN B: GOOGLE GEMINI ---
    try:
        if "GOOGLE_API_KEY" in os.environ:
            print("🟡 Niti.ai: Connecting to Google Gemini...")
            llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=os.environ["GOOGLE_API_KEY"],
                temperature=0
            )
            print("✅ Success: Gemini is Active")
            return llm
    except Exception as e:
        print(f"🔴 Gemini Failed: {e}")

    return None