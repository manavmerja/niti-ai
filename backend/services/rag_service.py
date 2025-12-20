import os
from dotenv import load_dotenv
from supabase import create_client
from langchain_community.vectorstores import SupabaseVectorStore
# ✅ FIX: Updated Import Name (New Library Version)
from langchain_huggingface import HuggingFaceEndpointEmbeddings
# LLMs
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
# Prompts & Chains
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

# --- 1. SETUP DATABASE & EMBEDDINGS ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ✅ FIX: Updated Class Name & Parameter
# 'model' parameter use karein (purane me 'model_name' tha)
embeddings = HuggingFaceEndpointEmbeddings(
    model="sentence-transformers/all-MiniLM-L6-v2",
    huggingfacehub_api_token=os.getenv("HUGGINGFACEHUB_API_TOKEN")
)

vector_store = SupabaseVectorStore(
    client=supabase,
    embedding=embeddings,
    table_name="documents",
    query_name="match_documents"
)

def get_rag_response(query_text):
    try:
        print(f"\n🔍 Searching via API for: {query_text}")
        
        # 1. RETRIEVER (Fetch Context)
        retriever = vector_store.as_retriever(search_kwargs={"k": 6})
        
        # 2. PROMPT TEMPLATE
        template = """
        You are Niti.ai, an expert assistant for Indian Government Schemes and Charusat University.
        
        Use the following context to answer the user's question.
        
        Context:
        {context}
        
        Question: {question}
        
        Instructions:
        1. Look specifically for "Charusat", "Merit Scholarship", "MYSY" details.
        2. If found, explain the criteria clearly.
        3. If the answer is NOT in the context, say "I don't have that information."
        
        Answer:
        """
        prompt = ChatPromptTemplate.from_template(template)

        # 3. DEFINE MODELS
        # Primary: Groq (Llama 3.3)
        groq_llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            api_key=os.getenv("GROQ_API_KEY")
        )

        # Backup: Gemini (Flash 1.5)
        gemini_llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            temperature=0.3,
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )

        # 4. EXECUTION LOGIC (The Switch)
        try:
            print("🤖 Trying Primary Model (Groq)...")
            chain = (
                {"context": retriever, "question": RunnablePassthrough()}
                | prompt
                | groq_llm
                | StrOutputParser()
            )
            return chain.invoke(query_text)

        except Exception as groq_error:
            print(f"⚠️ Groq Failed: {groq_error}")
            print("🔄 Switching to Backup Model (Gemini)...")
            
            chain = (
                {"context": retriever, "question": RunnablePassthrough()}
                | prompt
                | gemini_llm 
                | StrOutputParser()
            )
            return chain.invoke(query_text)

    except Exception as e:
        print(f"❌ RAG Critical Error: {str(e)}")
        return "⚠️ Sorry, I am facing a technical issue fetching the data."