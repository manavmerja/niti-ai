import os
import requests
from bs4 import BeautifulSoup
# ✅ ADDED: TextLoader import kiya
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
from supabase import create_client
from dotenv import load_dotenv

# 1. Load Environment Variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ SUPABASE_URL or SUPABASE_KEY is missing in .env file")

# 2. Setup Supabase Client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# 3. Define Embeddings (Local - same as before)
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# --- DATA SOURCE: HARDCODED RULES ---
CHARUSAT_KNOWLEDGE_BASE = """
SOURCE: CHARUSAT_OFFICIAL_RULES
TYPE: UNIVERSITY_SCHOLARSHIP

1. Charusat Merit Scholarship (For B.Tech / Engineering):
   - Eligibility is based on HSC / JEE Main / GUJCET performance.
   - Renewal Criteria: 
     - If CGPA >= 9.0: 100% Tuition Fee Waiver.
     - If CGPA >= 8.5 and < 9.0: 50% Tuition Fee Waiver.
   - This scholarship is applicable for students of CSPIT and DEPSTAR colleges.

2. MYSY (Mukhymantri Yuva Swavalamban Yojana):
   - Government of Gujarat Scheme available for Charusat students.
   - Benefit: 50% of Tuition Fees or Rs. 50,000 (whichever is less).
   - Eligibility: 80+ Percentile in 12th Standard.
   - Income Limit: Family income must be less than Rs. 6 Lakh/annum.
"""

def ingest_data():
    print("🚀 Starting Data Ingestion (PDFs + Text + Web)...")
    documents = []
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

    # --- PHASE 1: Internal Knowledge Base ---
    print("🔹 Processing Internal Knowledge Base...")
    docs = text_splitter.create_documents(
        [CHARUSAT_KNOWLEDGE_BASE], 
        metadatas=[{"source": "charusat_rules", "type": "hardcoded_rules"}]
    )
    documents.extend(docs)

    # --- PHASE 2: Web Scraping ---
    print("🔹 Scraping Charusat Website...")
    target_url = "https://www.charusat.ac.in/scholarship.php"
    headers = {
        "User-Agent": "Mozilla/5.0",
    }
    try:
        response = requests.get(target_url, headers=headers, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, "html.parser")
            text_content = soup.get_text()
            if text_content.strip():
                web_docs = text_splitter.create_documents(
                    [text_content],
                    metadatas=[{"source": "charusat.ac.in", "type": "web_scrape"}]
                )
                documents.extend(web_docs)
                print(f"   ✅ Scraped {len(web_docs)} chunks from website.")
    except Exception as e:
        print(f"   ⚠️ Scraping skipped: {e}")

    # --- PHASE 3: PDF Ingestion ---
    pdf_dir = "data/charusat_pdfs"
    if os.path.exists(pdf_dir):
        print(f"🔹 Checking for PDFs in {pdf_dir}...")
        for filename in os.listdir(pdf_dir):
            if filename.endswith(".pdf"):
                file_path = os.path.join(pdf_dir, filename)
                print(f"   📄 Processing PDF: {filename}")
                try:
                    loader = PyPDFLoader(file_path)
                    pdf_pages = loader.load()
                    pdf_chunks = text_splitter.split_documents(pdf_pages)
                    for chunk in pdf_chunks:
                        chunk.metadata["source"] = "charusat_pdf"
                        chunk.metadata["filename"] = filename
                    documents.extend(pdf_chunks)
                    print(f"   ✅ Extracted {len(pdf_chunks)} chunks.")
                except Exception as e:
                    print(f"   ❌ Error reading PDF {filename}: {e}")

    # --- PHASE 4: Text File Ingestion (NEW ✅) ---
    # Hum 'data' folder me direct check karenge .txt files ke liye
    txt_dir = "data"
    if os.path.exists(txt_dir):
        print(f"🔹 Checking for Text (.txt) files in {txt_dir}...")
        for filename in os.listdir(txt_dir):
            if filename.endswith(".txt"):
                file_path = os.path.join(txt_dir, filename)
                print(f"   📝 Processing Text File: {filename}")
                try:
                    loader = TextLoader(file_path, encoding='utf-8')
                    txt_docs = loader.load()
                    txt_chunks = text_splitter.split_documents(txt_docs)
                    
                    for chunk in txt_chunks:
                        chunk.metadata["source"] = "text_file"
                        chunk.metadata["filename"] = filename
                        
                    documents.extend(txt_chunks)
                    print(f"   ✅ Extracted {len(txt_chunks)} chunks.")
                except Exception as e:
                    print(f"   ❌ Error reading Text file {filename}: {e}")

    # --- PHASE 5: Upload to Vector DB ---
    if documents:
        print(f"\n📦 Uploading {len(documents)} document chunks to Supabase Vector Store...")
        try:
            vector_store = SupabaseVectorStore(
                client=supabase,
                embedding=embeddings,
                table_name="documents",
                query_name="match_documents"
            )
            vector_store.add_documents(documents)
            print("🎉 SUCCESS: All Data Ingested Successfully!")
        except Exception as e:
            print(f"❌ Upload Failed: {e}")
    else:
        print("⚠️ No data found to ingest.")

if __name__ == "__main__":
    ingest_data()