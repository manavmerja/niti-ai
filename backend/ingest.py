import os
import time
from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
# --- FIX: Correct Import & Class Name ---
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_community.vectorstores import Chroma

load_dotenv()

DATA_PATH = "./data"
DB_PATH = "./chroma_db"

def create_vector_db():
    if not os.getenv("HUGGINGFACEHUB_API_TOKEN"):
        print("❌ Error: HUGGINGFACEHUB_API_TOKEN not found!")
        return

    print("🔄 Loading Documents...")
    try:
        loader = DirectoryLoader(DATA_PATH, glob="**/*.txt", loader_cls=TextLoader)
        documents = loader.load()
    except Exception as e:
        print(f"❌ Error: {e}")
        return

    if not documents:
        print("⚠️ No documents found.")
        return

    # Chunking
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(documents)
    print(f"✅ Created {len(chunks)} chunks.")

    # --- USING NEW HUGGINGFACE CLASS ---
    print("🧠 Initializing HuggingFace Cloud Embeddings...")
    embeddings = HuggingFaceEndpointEmbeddings(
        repo_id="sentence-transformers/all-MiniLM-L6-v2", # 'model_name' nahi, 'repo_id' use hota hai ab
        huggingfacehub_api_token=os.getenv("HUGGINGFACEHUB_API_TOKEN")
    )

    print("💾 Creating Database...")
    
    if os.path.exists(DB_PATH):
        import shutil
        shutil.rmtree(DB_PATH)

    # Batch Processing
    batch_size = 10
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        print(f"   Processing batch {i//batch_size + 1}...")
        
        if i == 0:
            db = Chroma.from_documents(batch, embeddings, persist_directory=DB_PATH)
        else:
            db.add_documents(batch)
        
        time.sleep(1) 

    print("🎉 Database created successfully!")

if __name__ == "__main__":
    create_vector_db()