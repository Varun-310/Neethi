"""
Web Scraper for DoJ-related websites
Fetches real-time information from official government sources
"""

import requests
from bs4 import BeautifulSoup
from typing import Dict, Optional, List
from datetime import datetime, timedelta
import re

# Simple in-memory cache
_cache: Dict[str, Dict] = {}
CACHE_DURATION = timedelta(hours=1)

# Target websites for scraping
DOJ_SOURCES = {
    "doj": {
        "url": "https://doj.gov.in",
        "name": "Department of Justice",
        "selectors": {
            "news": ".news-item, .latest-news li",
            "schemes": ".scheme-item, .services-list li"
        }
    },
    "ecourts": {
        "url": "https://ecourts.gov.in",
        "name": "eCourts",
        "info_url": "https://ecourts.gov.in/ecourts_home/"
    },
    "telelaw": {
        "url": "https://www.tele-law.in",
        "name": "Tele-Law Service"
    },
    "nalsa": {
        "url": "https://nalsa.gov.in",
        "name": "NALSA - Legal Aid"
    }
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5"
}

def get_cached(key: str) -> Optional[str]:
    """Get cached data if not expired."""
    if key in _cache:
        entry = _cache[key]
        if datetime.now() - entry["timestamp"] < CACHE_DURATION:
            return entry["data"]
    return None

def set_cache(key: str, data: str):
    """Cache data with timestamp."""
    _cache[key] = {
        "data": data,
        "timestamp": datetime.now()
    }

def clean_text(text: str) -> str:
    """Clean and normalize scraped text."""
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s.,;:!?()-]', '', text)
    return text.strip()

def scrape_doj_news() -> Optional[str]:
    """Scrape latest news from DoJ website."""
    cache_key = "doj_news"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        response = requests.get(
            "https://doj.gov.in",
            headers=HEADERS,
            timeout=10,
            verify=True
        )
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Try to find news/announcements sections
            news_items = []
            
            # Look for common news selectors
            for selector in ['.news-ticker', '.marquee', '.latest-news', '.announcements']:
                elements = soup.select(selector)
                for el in elements:
                    text = clean_text(el.get_text())
                    if len(text) > 20:
                        news_items.append(text)
            
            if news_items:
                result = "Latest from DoJ:\n" + "\n- ".join(news_items[:5])
                set_cache(cache_key, result)
                return result
                
    except Exception as e:
        print(f"Error scraping DoJ: {e}")
    
    return None

def scrape_ecourts_info() -> Optional[str]:
    """Scrape eCourts service information."""
    cache_key = "ecourts_info"
    cached = get_cached(cache_key)
    if cached:
        return cached
    
    try:
        response = requests.get(
            "https://ecourts.gov.in/ecourts_home/",
            headers=HEADERS,
            timeout=10,
            verify=True
        )
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract service information
            info_parts = []
            
            # Look for service descriptions
            for heading in soup.find_all(['h2', 'h3', 'h4']):
                text = clean_text(heading.get_text())
                if any(keyword in text.lower() for keyword in ['service', 'case', 'filing', 'court']):
                    info_parts.append(text)
            
            if info_parts:
                result = "eCourts Services:\n- " + "\n- ".join(info_parts[:5])
                set_cache(cache_key, result)
                return result
                
    except Exception as e:
        print(f"Error scraping eCourts: {e}")
    
    return None

def scrape_for_query(query: str) -> Dict[str, str]:
    """
    Scrape relevant information based on user query.
    
    Returns dict with 'content' and 'sources' keys.
    """
    query_lower = query.lower()
    results = {
        "content": "",
        "sources": []
    }
    
    content_parts = []
    
    # Determine which sources to scrape based on query
    if any(word in query_lower for word in ['news', 'latest', 'update', 'announcement', 'new']):
        doj_news = scrape_doj_news()
        if doj_news:
            content_parts.append(doj_news)
            results["sources"].append("https://doj.gov.in")
    
    if any(word in query_lower for word in ['ecourt', 'case', 'status', 'filing', 'e-court']):
        ecourts_info = scrape_ecourts_info()
        if ecourts_info:
            content_parts.append(ecourts_info)
            results["sources"].append("https://ecourts.gov.in")
    
    # Combine content
    results["content"] = "\n\n".join(content_parts)
    
    return results

def get_source_urls(query: str) -> List[str]:
    """Get relevant source URLs based on query keywords."""
    query_lower = query.lower()
    sources = []
    
    # Map keywords to official sources
    if any(word in query_lower for word in ['case', 'status', 'cnr', 'ecourt']):
        sources.append("https://services.ecourts.gov.in")
    
    if any(word in query_lower for word in ['tele-law', 'telelaw', 'legal advice', 'lawyer', 'csc']):
        sources.append("https://www.tele-law.in")
    
    if any(word in query_lower for word in ['challan', 'traffic', 'fine', 'virtual court']):
        sources.append("https://vcourts.gov.in")
    
    if any(word in query_lower for word in ['legal aid', 'free lawyer', 'nalsa']):
        sources.append("https://nalsa.gov.in")
    
    if any(word in query_lower for word in ['judiciary', 'statistics', 'pending', 'data']):
        sources.append("https://njdg.ecourts.gov.in")
    
    # Always include main DoJ site if no specific match
    if not sources:
        sources.append("https://doj.gov.in")
    
    return sources

if __name__ == "__main__":
    # Test scraping
    print("Testing DoJ scraper...")
    
    test_query = "What are the latest updates from Department of Justice?"
    result = scrape_for_query(test_query)
    print(f"\nQuery: {test_query}")
    print(f"Content: {result['content'][:500] if result['content'] else 'No content'}")
    print(f"Sources: {result['sources']}")
