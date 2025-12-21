import os
import requests
import re
from bs4 import BeautifulSoup
from langchain_community.document_loaders import PyPDFLoader, TextLoader, WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_core.documents import Document
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# --- CONFIGURATION ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
HF_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")

if not all([SUPABASE_URL, SUPABASE_KEY, HF_TOKEN]):
    raise ValueError("❌ Missing Environment Variables. Check .env file.")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("🧠 Initializing Embeddings...")
embeddings = HuggingFaceEndpointEmbeddings(
    model="sentence-transformers/all-MiniLM-L6-v2",
    huggingfacehub_api_token=HF_TOKEN
)

# --- 🧹 PHASE 1: DATA CLEANING FUNCTION ---
def clean_text(text):
    """
    HTML ke kachre (Menu, Footer, Scripts) ko saaf karta hai.
    Sirf saaf text return karega.
    """
    # 1. Newlines ko space bana do
    text = text.replace("\n", " ")
    # 2. Extra spaces hatao (e.g. "  Hello   " -> "Hello")
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

# --- DATA SOURCES ---
URLS_TO_SCRAPE = [
    # 1. Charusat Scholarship
    "https://www.charusat.ac.in/scholarship.php",
    # 2. Mudra Loan (Official Page)
    "https://www.mudra.org.in/Offerings", 
    # Aap yahan aur URLs add kar sakte hain
]

HARDCODED_RULES = """
SOURCE: OFFICIAL_HARDCODED
TYPE: SCHEME_SUMMARY

1. Pradhan Mantri MUDRA Yojana (PMMY):
   - **Shishu:** Loans up to Rs. 50,000 (For new businesses).
   - **Kishore:** Loans from Rs. 50,000 to Rs. 5 Lakh (For established businesses).
   - **Tarun:** Loans from Rs. 5 Lakh to Rs. 10 Lakh (For expansion).
   - No collateral (security) required.
   - Processing fee is NIL for Shishu and Kishore.

2. PM Kisan Samman Nidhi:
   - Financial benefit of Rs. 6,000 per year.
   - Paid in 3 equal installments of Rs. 2,000 each.
   - For all landholding farmers families.
"""

def ingest_data():
    print("🚀 Starting Smart Data Ingestion...")
    final_documents = []
    
    # Chunking Strategy: Thoda Overlap rakhenge taaki context na tute
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ".", " ", ""]
    )

    # --- SOURCE 1: Hardcoded Text ---
    print("🔹 Processing Hardcoded Rules...")
    docs = text_splitter.create_documents(
        [HARDCODED_RULES], 
        metadatas=[{"source": "manual_entry", "type": "summary"}]
    )
    final_documents.extend(docs)

    # --- SOURCE 2: Smart Web Scraping ---
    print("🔹 Scraping Websites...")
    headers = {"User-Agent": "Mozilla/5.0"}
    
    for url in URLS_TO_SCRAPE:
        try:
            print(f"   🌐 Fetching: {url}")
            response = requests.get(url, headers=headers, timeout=15)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, "html.parser")
                
                # SIRF Body Content uthao (Nav/Footer ignore karo)
                main_content = soup.find('body')
                raw_text = main_content.get_text() if main_content else soup.get_text()
                
                cleaned_text = clean_text(raw_text)
                
                if len(cleaned_text) > 100: # Agar page khali nahi hai
                    web_docs = text_splitter.create_documents(
                        [cleaned_text],
                        metadatas=[{"source": url, "type": "web_scrape"}]
                    )
                    final_documents.extend(web_docs)
                    print(f"   ✅ Extracted {len(web_docs)} chunks.")
            else:
                print(f"   ❌ Failed to fetch {url} (Status: {response.status_code})")
        except Exception as e:
            print(f"   ⚠️ Error scraping {url}: {e}")

    # --- SOURCE 3: PDFs (From 'data' folder) ---
    pdf_dir = "data" # 'charusat_pdfs' ki jagah simple 'data' folder rakhte hain
    if os.path.exists(pdf_dir):
        print(f"🔹 Checking PDFs in '{pdf_dir}' folder...")
        for filename in os.listdir(pdf_dir):
            if filename.lower().endswith(".pdf"):
                file_path = os.path.join(pdf_dir, filename)
                try:
                    loader = PyPDFLoader(file_path)
                    pdf_pages = loader.load()
                    
                    # Page Content Clean karo
                    for page in pdf_pages:
                        page.page_content = clean_text(page.page_content)
                        page.metadata["source"] = filename
                        page.metadata["type"] = "official_pdf"

                    pdf_chunks = text_splitter.split_documents(pdf_pages)
                    final_documents.extend(pdf_chunks)
                    print(f"   📄 Processed PDF: {filename} ({len(pdf_chunks)} chunks)")
                except Exception as e:
                    print(f"   ❌ Error reading PDF {filename}: {e}")
    else:
        print(f"   ⚠️ '{pdf_dir}' folder not found. Skipping PDFs.")

    # --- UPLOAD TO SUPABASE ---
    if final_documents:
        print(f"\n📦 Uploading {len(final_documents)} total chunks to Supabase...")
        try:
            # Table ko pehle saaf karne ka option (Optional)
            # supabase.table("documents").delete().neq("id", "0000").execute() 
            
            vector_store = SupabaseVectorStore(
                client=supabase,
                embedding=embeddings,
                table_name="documents",
                query_name="match_documents"
            )
            
            batch_size = 50
            for i in range(0, len(final_documents), batch_size):
                batch = final_documents[i:i + batch_size]
                vector_store.add_documents(batch)
                print(f"   🚀 Uploaded batch {i//batch_size + 1}")
                
            print("🎉 Phase 1 Complete: Data Ingested Successfully!")
        except Exception as e:
            print(f"❌ Upload Error: {e}")
    else:
        print("⚠️ No data collected.")

if __name__ == "__main__":
    ingest_data()