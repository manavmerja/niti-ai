import os
from dotenv import load_dotenv
from supabase import create_client
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

# --- 1. SETUP DATABASE & EMBEDDINGS ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

vector_store = SupabaseVectorStore(
    client=supabase,
    embedding=embeddings,
    table_name="documents",
    query_name="match_documents"
)

def get_rag_response(query_text):
    try:
        # --- DEBUG MODE: Pehle dekhte hain DB se kya aa raha hai ---
        print(f"\n🔍 Searching for: {query_text}")
        docs = vector_store.similarity_search(query_text, k=6) # k=6 documents layenge
        
        # Terminal me print karo ki kya mila
        context_text = ""
        for i, doc in enumerate(docs):
            print(f"📄 Chunk {i+1}: {doc.page_content[:100]}...") # First 100 chars print honge
            context_text += doc.page_content + "\n\n"

        if not context_text:
            print("❌ No matching documents found in DB!")
            return "Sorry, I couldn't find any relevant data in my records."

        # --- 2. SETUP LLM ---
        llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            api_key=os.getenv("GROQ_API_KEY")
        )

        # --- 3. PROMPT ---
        template = """
        You are Niti.ai, an expert assistant for Indian Government Schemes and Charusat University.
        
        Use the following context to answer the user's question.
        
        Context:
        {context}
        
        Question: {question}
        
        Instructions:
        1. Look closely for "Merit Scholarship", "CGPA", "Charusat" in the context.
        2. If found, explain the criteria (CGPA 8.5/9.0) clearly.
        3. If the answer is NOT in the context, say "I don't have that information."
        
        Answer:
        """
        
        prompt = ChatPromptTemplate.from_template(template)

        # --- 4. RUN CHAIN ---
        chain = prompt | llm | StrOutputParser()
        response = chain.invoke({"context": context_text, "question": query_text})
        
        return response

    except Exception as e:
        print(f"RAG Error: {str(e)}")
        return "⚠️ Sorry, I am facing a technical issue fetching the data."