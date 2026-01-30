# ⚖️ Neethi - AI-Powered Legal Assistant

**நீதி (Neethi)** - An intelligent legal assistant chatbot for the Department of Justice, Government of India.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Python](https://img.shields.io/badge/Python-3.8+-green)
![React](https://img.shields.io/badge/React-18+-61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688)

## 🌟 Overview

Neethi is an AI-powered conversational assistant designed to help Indian citizens navigate legal services and access information about various Department of Justice initiatives. The chatbot leverages RAG (Retrieval-Augmented Generation) technology and local LLM integration to provide accurate, contextual responses.

## ✨ Features

- 🤖 **AI-Powered Responses** - Uses Ollama for local LLM inference
- 📚 **RAG Integration** - ChromaDB vector database for semantic search
- 🌐 **Live Web Scraping** - Fetches latest information from official sources
- 💬 **Natural Language Understanding** - Intent detection for query classification
- 📱 **Responsive UI** - Modern React frontend with quick actions
- 🔗 **Verified Sources** - Links to official government portals

## 🏛️ Supported Services

| Service | Description |
|---------|-------------|
| **eCourts** | Case status, e-Filing, e-Payment services |
| **Tele-Law** | Free legal consultation via video call |
| **Virtual Courts** | Traffic challan payment |
| **NALSA** | Legal aid schemes and services |
| **NJDG** | National Judicial Data Grid statistics |

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **ChromaDB** - Vector database for RAG
- **Sentence Transformers** - Text embeddings
- **Ollama** - Local LLM inference
- **BeautifulSoup** - Web scraping

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **CSS3** - Custom styling

## 📁 Project Structure

```
Neethi/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── data/
│   │   └── knowledge_base.json
│   └── utils/
│       ├── ai_response.py   # LLM integration
│       ├── intent.py        # Intent detection
│       ├── vector_db.py     # ChromaDB operations
│       └── web_scraper.py   # Live data fetching
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React component
│   │   └── index.css        # Styles
│   ├── package.json
│   └── vite.config.js
└── run_app.py               # Application launcher
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- [Ollama](https://ollama.ai/) (optional, for AI features)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Running with Ollama (Optional)

For full AI capabilities, install and run Ollama:

```bash
# Install Ollama from https://ollama.ai/

# Pull a model (e.g., llama2)
ollama pull llama2

# Start Ollama service
ollama serve
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API status and info |
| `/health` | GET | Health check |
| `/chat` | POST | Chat with the assistant |

### Chat Request Example

```json
POST /chat
{
  "message": "How can I check my case status?",
  "history": []
}
```

### Response Example

```json
{
  "response": "You can check your case status on eCourts...",
  "sources": ["https://services.ecourts.gov.in"],
  "intent": "case_status",
  "ai_generated": true
}
```

## 🔑 Key Components

### Intent Detection
Classifies user queries into categories like `case_status`, `tele_law`, `ecourts`, etc.

### Vector Database (RAG)
Uses ChromaDB with sentence transformers to semantically search through the knowledge base.

### Web Scraping
Automatically fetches latest information from official DoJ websites when queries contain keywords like "latest", "news", or "update".

### Fallback Responses
Pre-defined responses for common queries when AI is unavailable.

## 📜 License

This project is developed for educational purposes.

## 🙏 Acknowledgments

- Department of Justice, Government of India
- eCourts Project
- Tele-Law Initiative
- National Legal Services Authority (NALSA)

---

<p align="center">
  Made with ❤️ for accessible justice
</p>
