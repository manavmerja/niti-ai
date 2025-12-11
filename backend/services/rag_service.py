import os
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# Environment Variables Load
load_dotenv()

# --- 1. SETUP GOOGLE EMBEDDINGS (Lightweight & Fast) ---
# HuggingFace (Heavy) ki jagah Google (Cloud) use kar rahe hain
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-004", 
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

# --- 2. VECTOR STORE SETUP ---
# Persist directory wahi rakhenge
PERSIST_DIRECTORY = "./chroma_db"

def get_rag_response(query_text):
    try:
        # Check if DB exists
        if not os.path.exists(PERSIST_DIRECTORY):
            return "⚠️ Database not found. Please run 'ingest.py' first to create the knowledge base."

        # Load Database
        vectorstore = Chroma(
            persist_directory=PERSIST_DIRECTORY, 
            embedding_function=embeddings
        )
        
        # Create Retriever (Search top 3 relevant chunks)
        retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

        # --- 3. DEFINE LLM (Gemini Pro) ---
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",  # Fast model
            temperature=0.3,
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )

        # --- 4. PROMPT TEMPLATE ---
        template = """You are Niti.ai, an expert on Indian Government Schemes.
        Use the following pieces of context to answer the question at the end.
        If the answer is not in the context, just say "I don't have specific info on this in my database" but try to help generally.
        Keep the answer helpful, structured (use bullet points), and professional.

        Context:
        {context}

        Question: {question}

        Answer:"""
        
        custom_rag_prompt = ChatPromptTemplate.from_template(template)

        # --- 5. CHAIN ---
        rag_chain = (
            {"context": retriever, "question": RunnablePassthrough()}
            | custom_rag_prompt
            | llm
            | StrOutputParser()
        )

        # Run Chain
        response = rag_chain.invoke(query_text)
        return response

    except Exception as e:
        print(f"Error in RAG Service: {str(e)}")
        return "⚠️ Sorry, I encountered an error while searching the database."