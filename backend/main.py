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
    from backend.utils.web_scraper import scrape_for_query, get_source_urls, scrape_case_status, scrape_njdg_stats
    from backend.services import (
        get_available_lawyers, simulate_lawyer_connection,
        check_legal_aid_eligibility, EligibilityRequest,
        get_mock_case_status, get_mock_njdg_stats
    )
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
    def scrape_case_status(cnr): return None
    def scrape_njdg_stats(): return None
    def get_available_lawyers(s=None): return []
    def simulate_lawyer_connection(lid): return {"success": False}
    def check_legal_aid_eligibility(r): return {"eligible": False}
    def get_mock_case_status(cnr): return None
    def get_mock_njdg_stats(): return {}
    class EligibilityRequest: pass
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


# ===============================
# QUICK LINKS ENDPOINTS
# ===============================

@app.get("/case-status/{cnr}")
async def get_case_status(cnr: str):
    """
    Lookup case status by CNR number.
    Attempts live scraping, falls back to mock data.
    """
    # Validate CNR format
    cnr = cnr.strip().upper()
    if len(cnr) < 16:
        raise HTTPException(status_code=400, detail="Invalid CNR format. CNR should be at least 16 characters.")
    
    # Try live scraping first
    case_data = scrape_case_status(cnr)
    
    if case_data:
        return {
            "success": True,
            "source": "live",
            "data": case_data
        }
    
    # Fall back to mock data
    mock_data = get_mock_case_status(cnr)
    if mock_data:
        return {
            "success": True,
            "source": "demo",
            "data": mock_data,
            "note": "This is sample data for demonstration. For real case status, visit services.ecourts.gov.in"
        }
    
    # No data found
    return {
        "success": False,
        "message": f"Case with CNR {cnr} not found. Please verify the CNR number.",
        "help": "You can check your case at services.ecourts.gov.in"
    }


@app.get("/tele-law/lawyers")
async def list_lawyers(specialization: Optional[str] = None):
    """
    Get list of available Tele-Law lawyers.
    """
    lawyers = get_available_lawyers(specialization)
    available_count = sum(1 for l in lawyers if l["available"])
    
    return {
        "success": True,
        "total": len(lawyers),
        "available_now": available_count,
        "lawyers": lawyers,
        "note": "This is a demonstration of Tele-Law service. For real consultations, visit tele-law.in or your nearest CSC."
    }


@app.post("/tele-law/connect/{lawyer_id}")
async def connect_to_lawyer(lawyer_id: str):
    """
    Simulate connecting to a lawyer.
    """
    result = simulate_lawyer_connection(lawyer_id)
    return result


class LegalAidCheckRequest(BaseModel):
    annual_income: int
    case_type: str
    state: str
    is_woman: bool = False
    is_sc_st: bool = False
    is_senior_citizen: bool = False
    is_specially_abled: bool = False
    is_in_custody: bool = False


@app.post("/legal-aid/check")
async def check_legal_aid(request: LegalAidCheckRequest):
    """
    Check eligibility for free legal aid under NALSA.
    """
    eligibility_request = EligibilityRequest(
        annual_income=request.annual_income,
        case_type=request.case_type,
        state=request.state,
        is_woman=request.is_woman,
        is_sc_st=request.is_sc_st,
        is_senior_citizen=request.is_senior_citizen,
        is_specially_abled=request.is_specially_abled,
        is_in_custody=request.is_in_custody
    )
    
    result = check_legal_aid_eligibility(eligibility_request)
    return {
        "success": True,
        **result
    }


@app.get("/njdg/stats")
async def get_njdg_statistics():
    """
    Get National Judicial Data Grid statistics.
    Attempts live scraping, falls back to mock data.
    """
    # Try live scraping first
    live_stats = scrape_njdg_stats()
    
    if live_stats:
        return {
            "success": True,
            "source": "live",
            "data": live_stats
        }
    
    # Fall back to mock data
    mock_stats = get_mock_njdg_stats()
    return {
        "success": True,
        "source": "demo",
        "data": mock_stats,
        "note": "For real-time statistics, visit njdg.ecourts.gov.in"
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
