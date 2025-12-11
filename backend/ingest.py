import os
import time
from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma

load_dotenv()

DATA_PATH = "./data"
DB_PATH = "./chroma_db"

def create_vector_db():
    if not os.getenv("GOOGLE_API_KEY"):
        print("❌ Error: GOOGLE_API_KEY not found!")
        return

    print("🔄 Loading Documents...")
    try:
        loader = DirectoryLoader(DATA_PATH, glob="**/*.txt", loader_cls=TextLoader)
        documents = loader.load()
    except Exception as e:
        print(f"❌ Error: {e}")
        return

    if not documents:
        print("⚠️ No documents found in 'data' folder.")
        return

    # Chunking
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(documents)
    print(f"✅ Created {len(chunks)} chunks.")

    # --- CHANGE: NEW MODEL & BATCHING ---
    print("🧠 Initializing Google Embeddings (text-embedding-004)...")
    embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")

    print("💾 Creating Database (with delays to avoid rate limits)...")
    
    # Purana DB safai
    if os.path.exists(DB_PATH):
        import shutil
        shutil.rmtree(DB_PATH)

    # Dheere-dheere upload karenge (Batch Processing)
    batch_size = 5
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        print(f"   Processing batch {i//batch_size + 1}...")
        
        # Save Batch
        if i == 0:
            db = Chroma.from_documents(batch, embeddings, persist_directory=DB_PATH)
        else:
            db.add_documents(batch)
        
        # 2 Second ka saans lenge (Rate Limit bypass)
        time.sleep(2)

    print("🎉 Database created successfully!")

if __name__ == "__main__":
    create_vector_db()