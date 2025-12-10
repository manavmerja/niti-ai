import os
from dotenv import load_dotenv

# LangChain Imports
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document 
from supabase import create_client

# Load Env
load_dotenv() 

# --- SETUP DATABASE ---
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase_client = create_client(supabase_url, supabase_key)

print("🧠 Loading AI Brain (Multilingual)...")
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

def get_rag_response(query):
    try:
        # ---------------------------------------------------------
        # 1. DATABASE SEARCH
        # ---------------------------------------------------------
        print(f"🔎 Searching Database for: {query}")
        
        query_embedding = embeddings.embed_query(query)
        
        params = {
            "query_embedding": query_embedding,
            "match_threshold": 0.5, 
            "match_count": 4
        }
        
        rpc_response = supabase_client.rpc("match_documents", params).execute()
        
        matched_docs = []
        if rpc_response.data:
            for item in rpc_response.data:
                content = item.get("content")
                metadata = item.get("metadata", {})
                doc = Document(page_content=content, metadata=metadata)
                matched_docs.append(doc)
                
        context_text = ""
        sources = set()

        if matched_docs:
            for doc in matched_docs:
                context_text += doc.page_content + "\n\n"
                source_name = doc.metadata.get('source', 'Unknown Document')
                sources.add(source_name)
                print(f"🕵️ DEBUG: Found doc from source: {source_name}")
        else:
            context_text = "No specific document found."

        source_list = ", ".join(sources)

        # ---------------------------------------------------------
        # 2. PROMPT
        # ---------------------------------------------------------
        prompt = f"""
        You are Niti.ai, an intelligent assistant for Indian Government Schemes.
        
        ### INSTRUCTIONS:
        1. **Primary Source:** Answer the user's question using the **CONTEXT** provided below.
        2. **Citation:** At the very end of your answer, explicitly mention: "Source: {source_list}"
        3. **Official Link:** Display the Official Link found in the context.
        4. **Format:** Use clear Bullet points.
        
        ### CONTEXT (Official Data):
        {context_text}
        
        ### USER QUESTION:
        {query}
        """

        # ---------------------------------------------------------
        # 3. HYBRID AI EXECUTION
        # ---------------------------------------------------------
        try:
            # PRIORITY 1: GEMINI
            print("🤖 Trying Primary Model: Gemini 2.0 Flash...")
            llm = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash", 
                temperature=0.3,
                api_key=os.getenv("GOOGLE_API_KEY")
            )
            response = llm.invoke(prompt)
            return response.content

        except Exception as gemini_error:
            print(f"⚠️ Gemini Failed (Quota/Error): {gemini_error}")
            print("🔄 Switching to Backup Model: Groq (Llama-3.1)...")
            
            # PRIORITY 2: GROQ (UPDATED MODEL NAME)
            try:
                llm_backup = ChatGroq(
                    # 👇 YAHAN CHANGE KIYA HAI: Naya Model Name
                    model_name="llama-3.1-8b-instant",
                    temperature=0.3,
                    api_key=os.getenv("GROQ_API_KEY")
                )
                response = llm_backup.invoke(prompt)
                return response.content
            except Exception as groq_error:
                print(f"❌ Groq also failed: {groq_error}")
                return "⚠️ Sorry, server is overloaded. Please try again later."
        
    except Exception as e:
        print(f"❌ System Error: {e}")
        return "⚠️ Internal Server Error."