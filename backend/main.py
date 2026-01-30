from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import json

# Import Utils
try:
    from backend.utils.intent import get_intent
    from backend.utils.vector_db import query_knowledge, initialize_db
    from backend.utils.ai_response import generate_response, check_ollama_status
    from backend.utils.web_scraper import scrape_for_query, get_source_urls
    AI_ENABLED = True
except ImportError as e:
    print(f"Some dependencies missing: {e}")
    print("Core AI features may be limited.")
    def get_intent(q): return "unknown"
    def query_knowledge(q): return []
    def initialize_db(): pass
    def generate_response(q, c=None, s=None): return None
    def check_ollama_status(): return False
    def scrape_for_query(q): return {"content": "", "sources": []}
    def get_source_urls(q): return []
    AI_ENABLED = False

app = FastAPI(
    title="Neethi API",
    description="AI-powered legal assistant for Department of Justice, India",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Event
@app.on_event("startup")
async def startup_event():
    initialize_db()
    if check_ollama_status():
        print("✅ Ollama AI is available")
    else:
        print("⚠️ Ollama not running - using fallback responses")

# Models
class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[str]] = []
    intent: Optional[str] = None
    ai_generated: Optional[bool] = False

# Fallback responses for common queries
FALLBACK_RESPONSES = {
    "case_status": {
        "response": """To check your case status online, you can use the eCourts Services portal:

1. Visit services.ecourts.gov.in
2. Select your state and district
3. Search using:
   - CNR Number (14-digit unique case number)
   - Case Number
   - Party Name
   - Advocate Name
   - Filing Number

You can also download the eCourts Services mobile app for Android or iOS.""",
        "sources": ["https://services.ecourts.gov.in"]
    },
    "tele_law": {
        "response": """Tele-Law is a free legal consultation service that connects you with lawyers via video call:

**How to Access:**
1. Visit your nearest Common Service Center (CSC)
2. The Village Level Entrepreneur (VLE) will connect you with a panel lawyer
3. Consultation is FREE for eligible citizens

**Also Available:**
- Tele-Law Mobile App (Android/iOS)
- Toll-free number: 1800-1800

**Eligibility:** Priority for marginalized sections including SC/ST, women, differently-abled, and those eligible for free legal aid.""",
        "sources": ["https://www.tele-law.in"]
    },
    "ecourts": {
        "response": """eCourts Project offers various digital services:

**Key Services:**
- **Case Status:** Check status of any case in India
- **Cause Lists:** Daily court listings
- **e-Filing:** File cases online
- **e-Payment:** Pay court fees digitally
- **Virtual Courts:** Pay traffic challans online

Visit services.ecourts.gov.in or download the eCourts Services App.""",
        "sources": ["https://services.ecourts.gov.in", "https://vcourts.gov.in"]
    },
    "vacancies": {
        "response": """For information on judicial vacancies and appointments:

- The Department of Justice handles appointments to Supreme Court and High Courts
- Current vacancy data is available on the National Judicial Data Grid (NJDG)
- Visit njdg.ecourts.gov.in for detailed statistics on pending cases and judicial strength

For specific vacancy announcements, check doj.gov.in regularly.""",
        "sources": ["https://njdg.ecourts.gov.in", "https://doj.gov.in"]
    }
}

@app.get("/")
def read_root():
        return {
        "message": "Neethi API is running",
        "version": "2.0.0",
        "ai_status": "enabled" if check_ollama_status() else "fallback"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "ollama": check_ollama_status()
    }

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    user_query = request.message
    
    # 1. Intent Detection
    intent = get_intent(user_query)
    
    # 2. RAG Retrieval from Knowledge Base
    context_docs = query_knowledge(user_query)
    
    # 3. Check if we need web scraping (for fresh/live data queries)
    needs_scraping = any(word in user_query.lower() for word in [
        'latest', 'news', 'update', 'current', 'today', 'recent', 'new'
    ])
    
    scraped_data = None
    scraped_sources = []
    
    if needs_scraping:
        scrape_result = scrape_for_query(user_query)
        scraped_data = scrape_result.get("content")
        scraped_sources = scrape_result.get("sources", [])
    
    # 4. Try AI Response Generation
    response_text = None
    ai_generated = False
    sources = []
    
    if check_ollama_status():
        response_text = generate_response(
            user_query=user_query,
            context=context_docs,
            scraped_data=scraped_data
        )
        if response_text:
            ai_generated = True
            # Add relevant sources
            sources = get_source_urls(user_query)
            if scraped_sources:
                sources.extend(scraped_sources)
            # Deduplicate sources
            sources = list(dict.fromkeys(sources))
    
    # 5. Fallback to rule-based responses if AI fails
    if not response_text:
        if intent in FALLBACK_RESPONSES:
            fallback = FALLBACK_RESPONSES[intent]
            response_text = fallback["response"]
            sources = fallback["sources"]
        elif context_docs:
            # Use best match from Knowledge Base
            best_doc = context_docs[0]
            response_text = best_doc['content']
            if best_doc['metadata'].get('url'):
                sources.append(best_doc['metadata']['url'])
        else:
            response_text = """I apologize, but I couldn't find specific information on that topic. 

I can help you with:
- **Case Status:** Check your case online
- **Tele-Law:** Free legal consultation
- **eCourts Services:** e-Filing, e-Payment
- **Traffic Challans:** Pay fines online
- **Legal Aid:** NALSA free lawyer services

Please try rephrasing your question or visit doj.gov.in for more information."""
            sources = ["https://doj.gov.in"]
    
    return ChatResponse(
        response=response_text,
        sources=sources,
        intent=intent,
        ai_generated=ai_generated
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
