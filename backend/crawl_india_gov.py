import os
import requests
import re
import time
import urllib3
from bs4 import BeautifulSoup
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_huggingface import HuggingFaceEmbeddings 
from supabase import create_client
from dotenv import load_dotenv
from urllib.parse import urljoin

# --- SECURITY & SETUP ---
# SSL Warnings ko chupana (Govt sites ke liye zaroori hai)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY]):
    raise ValueError("❌ Missing Environment Variables.")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("💻 Loading Local Embedding Model...")
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
print("✅ Model Loaded!")

# --- CONFIGURATION ---
BASE_URL = "https://india.gov.in/my-government/schemes"
MAX_PAGES_TO_CRAWL = 15  # Testing ke liye limit (Bada number mat rakhna abhi)
DELAY_BETWEEN_REQUESTS = 2 # Seconds (Politeness)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

def clean_text(text):
    text = text.replace("\n", " ")
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def get_soup(url):
    try:
        response = requests.get(url, headers=headers, timeout=20, verify=False)
        if response.status_code == 200:
            return BeautifulSoup(response.content, "html.parser")
    except Exception as e:
        print(f"   ⚠️ Error fetching {url}: {e}")
    return None

def start_crawl():
    print(f"🚀 Starting Deep Crawl on {BASE_URL}")
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    final_documents = []
    
    # 1. Main List Page Par Jao
    soup = get_soup(BASE_URL)
    if not soup:
        print("❌ Main page failed to load.")
        return

    # 2. Links Dhundo (India.gov.in structure ke hisab se)
    # Usually links are inside content divs. Hum saare meaningful links uthayenge.
    scheme_links = []
    
    # Ye generic logic hai jo content area me links dhundta hai
    content_div = soup.find('div', class_='region-content') or soup.find('body')
    if content_div:
        for a_tag in content_div.find_all('a', href=True):
            href = a_tag['href']
            full_url = urljoin(BASE_URL, href)
            
            # Filters: Sirf Gov sites, Images/PDFs nahi, aur Home page nahi
            if (("gov.in" in full_url or "nic.in" in full_url) and 
                not full_url.endswith(('.pdf', '.jpg', '.png')) and
                full_url != BASE_URL):
                
                title = a_tag.get_text(strip=True)
                if len(title) > 5: # Chhote links (jaise 'More') ignore karo
                    scheme_links.append((title, full_url))

    # Duplicates hatao
    scheme_links = list(set(scheme_links))
    print(f"🔎 Found {len(scheme_links)} potential schemes. Crawling top {MAX_PAGES_TO_CRAWL}...")

    # 3. Har Link ke andar jao (Deep Dive)
    count = 0
    for title, link in scheme_links:
        if count >= MAX_PAGES_TO_CRAWL:
            break
            
        print(f"\n   Testing ({count+1}/{MAX_PAGES_TO_CRAWL}): {title[:30]}...")
        print(f"   🔗 Visiting: {link}")
        
        page_soup = get_soup(link)
        if page_soup:
            # Body text nikalo
            body = page_soup.find('body')
            raw_text = body.get_text() if body else page_soup.get_text()
            cleaned = clean_text(raw_text)
            
            if len(cleaned) > 500: # Agar page me enough data hai
                print(f"      ✅ Data Found! ({len(cleaned)} chars)")
                
                # Metadata add karo taki AI ko pata chale ye kya hai
                chunks = text_splitter.create_documents(
                    [cleaned],
                    metadatas=[{
                        "source": link, 
                        "title": title,
                        "type": "deep_scrape"
                    }]
                )
                final_documents.extend(chunks)
                count += 1
            else:
                print("      ⚠️ Skipped: Page content too short.")
        
        # Break lo (Server ko pareshan mat karo)
        time.sleep(DELAY_BETWEEN_REQUESTS)

    # 4. Upload to Supabase
    if final_documents:
        print(f"\n📦 Uploading {len(final_documents)} deep-chunks to Supabase...")
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
                
            print("🎉 MISSION COMPLETE: Deep Crawl Finished!")
        except Exception as e:
            print(f"❌ Upload Error: {e}")
    else:
        print("⚠️ No useful data found to upload.")

if __name__ == "__main__":
    start_crawl()