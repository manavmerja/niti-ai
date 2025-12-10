import os
import glob
from dotenv import load_dotenv

# LangChain Tools
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from supabase import create_client

# Load Environment Variables
load_dotenv()

# --- CONFIGURATION ---
DATA_FOLDER = "data"  # Hamara naya data folder
TABLE_NAME = "documents"
QUERY_NAME = "match_documents"

# --- SETUP SUPABASE ---
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase_client = create_client(supabase_url, supabase_key)

# --- SETUP BRAIN (Multilingual) ---
print("📥 Loading AI Brain (Multilingual Model)...")
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

def ingest_all_data():
    print(f"📂 Scanning folder: {DATA_FOLDER}...")
    
    # 1. Get all .txt files
    # Ye line 'data' folder me saari text files dhundegi
    file_paths = glob.glob(os.path.join(DATA_FOLDER, "*.txt"))
    
    if not file_paths:
        print("⚠️ No text files found! Make sure you created 'backend/data/mysy.txt'")
        return

    all_documents = []

    # 2. Load Each File
    for file_path in file_paths:
        try:
            print(f"   📖 Reading: {os.path.basename(file_path)}...")
            loader = TextLoader(file_path, encoding='utf-8')
            docs = loader.load()
            
            # Metadata me filename daal do (Taaki pata chale ye data kahan se aaya)
            for doc in docs:
                doc.metadata = {"source": os.path.basename(file_path)}
                
            all_documents.extend(docs)
        except Exception as e:
            print(f"   ❌ Error reading {file_path}: {e}")

    print(f"✅ Total Documents Loaded: {len(all_documents)}")

    # 3. Split Text (Kaatna)
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = text_splitter.split_documents(all_documents)
    print(f"✂️ Split into {len(chunks)} chunks.")

    # 4. Save to Supabase
    print("💾 Saving to Database...")
    try:
        SupabaseVectorStore.from_documents(
            documents=chunks,
            embedding=embeddings,
            client=supabase_client,
            table_name=TABLE_NAME,
            query_name=QUERY_NAME
        )
        print("🎉 SUCCESS! All schemes are now in the brain.")
    except Exception as e:
        print(f"❌ Database Error: {e}")

if __name__ == "__main__":
    # Optional: Purana data saaf karna ho to SQL editor se 'TRUNCATE table documents;' chala lena
    ingest_all_data()