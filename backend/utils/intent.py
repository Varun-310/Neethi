import re

# Simple Regex-based Intent Map for Phase 1
# This ensures 100% accuracy for common queries before falling back to AI
REGEX_INTENTS = {
    "case_status": [
        r"case status", r"check case", r"cnr number", r"my case", r"status of case",
        r"case number", r"track case", r"find case", r"case details", r"court case"
    ],
    "tele_law": [
        r"tele-law", r"tele law", r"video lawyer", r"csc lawyer", r"legal advice",
        r"free lawyer", r"lawyer consultation", r"legal help", r"talk to lawyer"
    ],
    "ecourts": [
        r"ecourts", r"e-filing", r"epay", r"traffic challan", r"virtual court",
        r"e-court", r"online filing", r"court fee", r"pay challan", r"traffic fine"
    ],
    "vacancies": [
        r"vacancy", r"judge strength", r"vacant seat", r"judicial vacancy",
        r"pending cases", r"court statistics", r"njdg"
    ],
    "legal_aid": [
        r"legal aid", r"nalsa", r"free legal", r"poor lawyer", r"legal assistance"
    ]
}

def get_intent(query: str) -> str:
    """
    Determine the user's intent based on the query.
    Returns the intent key or 'unknown'.
    """
    query = query.lower().strip()
    
    # 1. Regex Matching
    for intent, patterns in REGEX_INTENTS.items():
        for pattern in patterns:
            if re.search(pattern, query):
                return intent
                
    # 2. Semantic Matching (Stub - to be connected with Vector DB or specialized model)
    # The Chatbot flow in main.py currently handles fallback.
    
    return "unknown"
