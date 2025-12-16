import os
from dotenv import load_dotenv
# --- FIX: Correct Import ---
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_groq import ChatGroq
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

# --- EMBEDDINGS (HuggingFace New Class) ---
embeddings = HuggingFaceEndpointEmbeddings(
    repo_id="sentence-transformers/all-MiniLM-L6-v2",
    huggingfacehub_api_token=os.getenv("HUGGINGFACEHUB_API_TOKEN")
)

PERSIST_DIRECTORY = "./chroma_db"

def get_rag_response(query_text):
    try:
        if not os.path.exists(PERSIST_DIRECTORY):
            return "⚠️ Database not found. Please run 'ingest.py' first."

        vectorstore = Chroma(
            persist_directory=PERSIST_DIRECTORY, 
            embedding_function=embeddings
        )
        
        retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

       # --- 2. LLM (GROQ - New Llama 3.3) ---
        llm = ChatGroq(
            model="llama-3.3-70b-versatile", # <-- NEW & POWERFUL
            temperature=0.3,
            api_key=os.getenv("GROQ_API_KEY")
        )

        template = """
         You are Niti.ai, an expert Indian Government Scheme assistant.
        Use the following context to answer the user's question accurately.

        RULES:
        1. If the context contains a website URL, YOU MUST include it in the answer.
        2. Format links in Markdown like this: [Click Here](https://website.com).
        3. Do not simply say "visit the official website". Provide the clickable link.
        4. If you don't know the answer, say "I don't have that information in my database."
        5. Keep answers concise and point-wise using bullet points.

        Context: {context}
        Question: {question}

        Answer:
        """
        
        custom_rag_prompt = ChatPromptTemplate.from_template(template)

        rag_chain = (
            {"context": retriever, "question": RunnablePassthrough()}
            | custom_rag_prompt
            | llm
            | StrOutputParser()
        )

        response = rag_chain.invoke(query_text)
        return response

    except Exception as e:
        print(f"Error in RAG Service: {str(e)}")
        return f"⚠️ Server Error: {str(e)}"