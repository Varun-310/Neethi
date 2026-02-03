"""
Quick Links Backend Services
Mock data, eligibility rules, and helper functions for interactive features
"""

from typing import Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import random

# ===============================
# TELE-LAW MOCK DATA
# ===============================

MOCK_LAWYERS = [
    {
        "id": "LAW001",
        "name": "Adv. Priya Sharma",
        "specialization": "Family Law",
        "languages": ["Hindi", "English"],
        "experience_years": 12,
        "rating": 4.8,
        "available": True,
        "next_available": None,
        "profile_image": "👩‍⚖️"
    },
    {
        "id": "LAW002",
        "name": "Adv. Rajesh Kumar",
        "specialization": "Criminal Law",
        "languages": ["Hindi", "Punjabi", "English"],
        "experience_years": 18,
        "rating": 4.9,
        "available": True,
        "next_available": None,
        "profile_image": "👨‍⚖️"
    },
    {
        "id": "LAW003",
        "name": "Adv. Sunita Devi",
        "specialization": "Property & Land Disputes",
        "languages": ["Hindi", "Bhojpuri"],
        "experience_years": 8,
        "rating": 4.6,
        "available": False,
        "next_available": "2:30 PM",
        "profile_image": "👩‍⚖️"
    },
    {
        "id": "LAW004",
        "name": "Adv. Mohammed Farid",
        "specialization": "Labour Law",
        "languages": ["Hindi", "Urdu", "English"],
        "experience_years": 15,
        "rating": 4.7,
        "available": True,
        "next_available": None,
        "profile_image": "👨‍⚖️"
    },
    {
        "id": "LAW005",
        "name": "Adv. Lakshmi Iyer",
        "specialization": "Consumer Protection",
        "languages": ["Tamil", "English", "Hindi"],
        "experience_years": 10,
        "rating": 4.5,
        "available": False,
        "next_available": "4:00 PM",
        "profile_image": "👩‍⚖️"
    }
]

def get_available_lawyers(specialization: Optional[str] = None) -> List[Dict]:
    """Get list of lawyers, optionally filtered by specialization."""
    lawyers = MOCK_LAWYERS.copy()
    
    if specialization:
        lawyers = [l for l in lawyers if specialization.lower() in l["specialization"].lower()]
    
    # Randomize availability slightly for realism
    for lawyer in lawyers:
        if not lawyer["available"]:
            lawyer["next_available"] = f"{random.randint(1, 5)}:{random.choice(['00', '15', '30', '45'])} PM"
    
    return lawyers

def simulate_lawyer_connection(lawyer_id: str) -> Dict:
    """Simulate connecting to a lawyer via Tele-Law."""
    lawyer = next((l for l in MOCK_LAWYERS if l["id"] == lawyer_id), None)
    
    if not lawyer:
        return {"success": False, "message": "Lawyer not found"}
    
    if not lawyer["available"]:
        return {
            "success": False,
            "message": f"Lawyer is currently busy. Next available at {lawyer['next_available']}",
            "queue_position": random.randint(1, 5)
        }
    
    return {
        "success": True,
        "message": f"Connecting you with {lawyer['name']}...",
        "session_id": f"TL{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "estimated_wait": "30 seconds"
    }


# ===============================
# NALSA ELIGIBILITY RULES
# ===============================

# Income thresholds (annual in INR)
NALSA_INCOME_LIMITS = {
    "general": 300000,  # 3 Lakh for general category
    "supreme_court": 500000  # 5 Lakh for Supreme Court
}

# Categories eligible regardless of income
PRIORITY_CATEGORIES = [
    "sc_st",           # SC/ST
    "woman",           # Women
    "child",           # Children
    "specially_abled", # Persons with disabilities
    "victim_trafficking", # Victims of trafficking
    "victim_disaster", # Victims of mass disaster/violence
    "industrial_worker", # Industrial workmen
    "custody",         # Persons in custody
    "senior_citizen",  # Senior citizens
    "victim_ethnic"    # Victims of ethnic/caste violence
]

# Case types eligible for legal aid
ELIGIBLE_CASE_TYPES = [
    "criminal",
    "civil",
    "family_matrimonial",
    "labour",
    "consumer",
    "property",
    "constitutional"
]

class EligibilityRequest(BaseModel):
    annual_income: int
    category: Optional[str] = "general"
    case_type: str
    state: str
    is_woman: bool = False
    is_sc_st: bool = False
    is_senior_citizen: bool = False
    is_specially_abled: bool = False
    is_in_custody: bool = False

def check_legal_aid_eligibility(request: EligibilityRequest) -> Dict:
    """Check if a person is eligible for free legal aid under NALSA."""
    
    eligible = False
    reasons = []
    next_steps = []
    
    # Check priority categories (eligible regardless of income)
    if request.is_woman:
        eligible = True
        reasons.append("Women are entitled to free legal aid under Section 12(c) of LSA Act")
    
    if request.is_sc_st:
        eligible = True
        reasons.append("SC/ST members are entitled to free legal aid under Section 12(a) of LSA Act")
    
    if request.is_senior_citizen:
        eligible = True
        reasons.append("Senior citizens are entitled to free legal aid")
    
    if request.is_specially_abled:
        eligible = True
        reasons.append("Persons with disabilities are entitled to free legal aid under Section 12(h)")
    
    if request.is_in_custody:
        eligible = True
        reasons.append("Persons in custody are entitled to free legal aid under Section 12(g)")
    
    # Check income eligibility if not already eligible
    if not eligible:
        if request.annual_income <= NALSA_INCOME_LIMITS["general"]:
            eligible = True
            reasons.append(f"Annual income (₹{request.annual_income:,}) is within the eligibility limit (₹{NALSA_INCOME_LIMITS['general']:,})")
        else:
            reasons.append(f"Annual income (₹{request.annual_income:,}) exceeds the eligibility limit (₹{NALSA_INCOME_LIMITS['general']:,})")
    
    # Check case type
    if request.case_type.lower().replace(" ", "_") not in ELIGIBLE_CASE_TYPES:
        next_steps.append(f"Note: '{request.case_type}' may have limited legal aid coverage. Consult SLSA for details.")
    
    # Build next steps
    if eligible:
        next_steps = [
            "Visit your nearest District Legal Services Authority (DLSA)",
            "Bring income certificate and ID proof",
            "You can also apply online at nalsa.gov.in",
            f"Contact {request.state} State Legal Services Authority (SLSA) for assistance"
        ]
    else:
        next_steps = [
            "You may still consult Tele-Law for free legal advice",
            "Consider approaching Lok Adalat for dispute resolution",
            "Check if your case qualifies under special schemes"
        ]
    
    return {
        "eligible": eligible,
        "reasons": reasons,
        "next_steps": next_steps,
        "reference": "Legal Services Authorities Act, 1987"
    }


# ===============================
# MOCK CASE DATA (FALLBACK)
# ===============================

MOCK_CASE_DATA = {
    "DLCT010012345672024": {
        "cnr": "DLCT010012345672024",
        "case_type": "Civil Suit",
        "case_number": "CS/123/2024",
        "petitioner": "Ram Kumar",
        "respondent": "State of Delhi",
        "court": "District Court, Tis Hazari, Delhi",
        "judge": "Hon'ble Sh. Justice A.K. Sharma",
        "status": "Pending",
        "filing_date": "2024-01-15",
        "next_hearing": "2024-02-20",
        "case_stage": "Arguments",
        "acts": ["Indian Contract Act, 1872"]
    },
    "MHAU030098765432023": {
        "cnr": "MHAU030098765432023",
        "case_type": "Motor Accident Claim",
        "case_number": "MAC/456/2023",
        "petitioner": "Sunita Patil",
        "respondent": "XYZ Insurance Co.",
        "court": "MACT Court, Aurangabad, Maharashtra",
        "judge": "Hon'ble Sh. Justice B.K. Deshmukh",
        "status": "Listed for Orders",
        "filing_date": "2023-06-10",
        "next_hearing": "2024-02-15",
        "case_stage": "Final Arguments Completed",
        "acts": ["Motor Vehicles Act, 1988"]
    }
}

def get_mock_case_status(cnr: str) -> Optional[Dict]:
    """Get mock case data by CNR number."""
    return MOCK_CASE_DATA.get(cnr.upper())


# ===============================
# NJDG MOCK STATISTICS
# ===============================

def get_mock_njdg_stats() -> Dict:
    """Get mock NJDG statistics."""
    return {
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "total_pending_cases": 45234567,
        "district_courts": {
            "pending": 41234567,
            "civil": 15234567,
            "criminal": 26000000
        },
        "high_courts": {
            "pending": 4000000,
            "civil": 2500000,
            "criminal": 1500000
        },
        "disposal_rate": {
            "daily_filing": 78000,
            "daily_disposal": 82000,
            "disposal_percentage": 105.1
        },
        "age_wise": {
            "under_1_year": 18000000,
            "1_to_3_years": 15000000,
            "3_to_5_years": 7000000,
            "5_to_10_years": 4000000,
            "above_10_years": 1234567
        },
        "top_states": [
            {"name": "Uttar Pradesh", "pending": 10234567},
            {"name": "Maharashtra", "pending": 5234567},
            {"name": "West Bengal", "pending": 4234567},
            {"name": "Bihar", "pending": 3234567},
            {"name": "Gujarat", "pending": 2234567}
        ]
    }
