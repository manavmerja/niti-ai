import os
import requests
import re
import urllib3
from bs4 import BeautifulSoup
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import SupabaseVectorStore
# Local Embeddings (Free & Unlimited)
from langchain_huggingface import HuggingFaceEmbeddings 
from supabase import create_client
from dotenv import load_dotenv

# Warnings chhupane ke liye
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv()

# --- CONFIGURATION ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY]):
    raise ValueError("❌ Missing Environment Variables. Check .env file.")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("💻 Loading Local Embedding Model...")
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
print("✅ Model Loaded Successfully!")

# --- CLEANING FUNCTION ---
def clean_text(text):
    text = text.replace("\n", " ")
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

# --- DATA SOURCES ---
URLS_TO_SCRAPE = [
    # 1. Gujarat Govt Schemes (A to Z)
    "https://mariyojana.gujarat.gov.in/Schemeatoz.aspx",
    
    # 2. India.gov Schemes (National)
    "https://india.gov.in/my-government/schemes",
        
    # 4. Mudra (Already done, but safe to keep check)
    "https://www.mudra.org.in/Offerings",
]

def ingest_data():
    print("🚀 Starting Local Ingestion...")
    final_documents = []
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    print("🔹 Scraping Websites...")
    
    # 👇 STRONGER HEADERS (Browser ki nakal)
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://www.google.com/"
    }
    
    for url in URLS_TO_SCRAPE:
        try:
            print(f"   🌐 Fetching: {url}")
            # verify=False is important for gov websites
            response = requests.get(url, headers=headers, timeout=20, verify=False)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, "html.parser")
                
                main_content = soup.find('body')
                raw_text = main_content.get_text() if main_content else soup.get_text()
                cleaned_text = clean_text(raw_text)
                
                print(f"      ---> Found {len(cleaned_text)} characters")
                
                if len(cleaned_text) > 100:
                    web_docs = text_splitter.create_documents(
                        [cleaned_text],
                        metadatas=[{"source": url, "type": "web_scrape"}]
                    )
                    final_documents.extend(web_docs)
                    print(f"   ✅ Fetched {len(web_docs)} chunks.")
                else:
                    print("   ⚠️ Page seems empty (Javascript rendered?)")
            else:
                print(f"   ❌ Failed Status: {response.status_code}")
                
        except Exception as e:
            print(f"   ⚠️ Error: {e}")

    # --- UPLOAD TO SUPABASE ---
    if final_documents:
        print(f"\n📦 Uploading {len(final_documents)} new chunks to Supabase...")
        
        try:
            vector_store = SupabaseVectorStore(
                client=supabase,
                embedding=embeddings,
                table_name="documents",
                query_name="match_documents"
            )
            
            batch_size = 20
            for i in range(0, len(final_documents), batch_size):
                batch = final_documents[i:i + batch_size]
                vector_store.add_documents(batch)
                print(f"   🚀 Uploaded batch {i//batch_size + 1}")
                
            print("🎉 SUCCESS: All Data Ingested!")
        except Exception as e:
            print(f"❌ Upload Error: {e}")
    else:
        print("⚠️ No valid data found to upload.")

if __name__ == "__main__":
    ingest_data()