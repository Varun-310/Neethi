"""
Ollama AI Response Generator for Nyaya Bandhu
Uses local Ollama instance with llama3:8b model
"""

import requests
import json
from typing import List, Dict, Optional

OLLAMA_BASE_URL = "http://localhost:11434"
MODEL_NAME = "llama3:8b"

SYSTEM_PROMPT = """You are Neethi (நீதி), the official AI assistant for the Department of Justice, Government of India. Your name means "Justice" in Tamil. 

Your responsibilities:
1. Provide accurate information about Indian legal services, schemes, and procedures
2. Guide citizens on how to access eCourts, Tele-Law, and other DoJ services
3. Explain legal concepts in simple, accessible language
4. Direct users to appropriate official resources and portals

Guidelines:
- Be professional, helpful, and empathetic
- Always cite official government sources when possible
- If you don't know something, say so and direct to the official DoJ website
- Keep responses concise but comprehensive
- Use simple language that any citizen can understand
- For case-specific advice, recommend consulting a lawyer through Tele-Law

Key Services to Know:
- eCourts: Online case status, e-filing, e-payment (services.ecourts.gov.in)
- Tele-Law: Free legal advice via video call at CSCs (tele-law.in)
- Virtual Courts: Online traffic challan payment (vcourts.gov.in)
- NALSA: Free legal aid for eligible citizens (nalsa.gov.in)
- NJDG: National Judicial Data Grid for court statistics (njdg.ecourts.gov.in)
"""

def generate_response(
    user_query: str,
    context: List[Dict] = None,
    scraped_data: str = None
) -> str:
    """
    Generate an AI response using local Ollama.
    
    Args:
        user_query: The user's question
        context: Retrieved documents from knowledge base
        scraped_data: Fresh data scraped from web sources
    
    Returns:
        AI-generated response string
    """
    # Build context string
    context_parts = []
    
    if context:
        context_parts.append("Relevant Information from Knowledge Base:")
        for doc in context:
            context_parts.append(f"- {doc.get('content', '')}")
    
    if scraped_data:
        context_parts.append("\nRecent Information from Web Sources:")
        context_parts.append(scraped_data)
    
    context_str = "\n".join(context_parts) if context_parts else ""
    
    # Build the prompt
    prompt = f"""Based on the following context and your knowledge, answer the user's question.

{context_str}

User Question: {user_query}

Provide a helpful, accurate response. If the information is from official sources, mention them."""

    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "system": SYSTEM_PROMPT,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_predict": 500
                }
            },
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get("response", "I apologize, I couldn't generate a response.")
        else:
            print(f"Ollama error: {response.status_code}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("Ollama is not running. Please start Ollama service.")
        return None
    except requests.exceptions.Timeout:
        print("Ollama request timed out.")
        return None
    except Exception as e:
        print(f"Error calling Ollama: {e}")
        return None

def check_ollama_status() -> bool:
    """Check if Ollama is running and the model is available."""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get("models", [])
            model_names = [m.get("name", "") for m in models]
            return any(MODEL_NAME in name for name in model_names)
        return False
    except:
        return False

if __name__ == "__main__":
    # Test the integration
    if check_ollama_status():
        print("✅ Ollama is running with the required model")
        test_response = generate_response("How can I check my case status online?")
        print(f"\nTest Response:\n{test_response}")
    else:
        print("❌ Ollama is not running or model not found")
        print(f"Please run: ollama pull {MODEL_NAME}")
