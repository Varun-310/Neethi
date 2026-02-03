# ⚖️ Neethi - AI-Powered Legal Assistant

**நீதி (Neethi)** - An intelligent legal assistant chatbot for the Department of Justice, Government of India.

![Version](https://img.shields.io/badge/version-2.1.0-blue)
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
- 🏛️ **Interactive Quick Links** - Modal-based service integration (NEW!)

## 🏛️ Supported Services

| Service | Description | Interactive Feature |
|---------|-------------|---------------------|
| **eCourts** | Case status, e-Filing, e-Payment | ✅ CNR Lookup Modal |
| **Tele-Law** | Free legal consultation via video call | ✅ Lawyer Connect Modal |
| **Virtual Courts** | Traffic challan payment | Chat-based |
| **NALSA** | Legal aid schemes and services | ✅ Eligibility Checker |
| **NJDG** | National Judicial Data Grid statistics | ✅ Stats Dashboard |

## 🚀 Quick Links Feature

Interactive modals accessible from the sidebar:

### 🏛️ eCourts Case Status
- Look up case details by CNR number
- Demo CNR: `DLCT010012345672024`
- Falls back to mock data when live scraping unavailable

### 📱 Tele-Law Connect
- Browse available lawyers with ratings and specializations
- Simulate connecting to a lawyer
- Shows availability status

### ⚖️ NALSA Legal Aid Eligibility
- Interactive eligibility checker form
- Based on Legal Services Authorities Act, 1987
- Supports priority categories (Women, SC/ST, Senior Citizens, etc.)

### 📊 NJDG Statistics
- Pending case statistics dashboard
- Age-wise distribution
- State-wise breakdown

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
- **CSS3** - Custom styling with modal system

## 📁 Project Structure

```
Neethi/
├── backend/
│   ├── main.py              # FastAPI application + Quick Links endpoints
│   ├── services.py          # Mock data & eligibility rules (NEW)
│   ├── requirements.txt     # Python dependencies
│   ├── data/
│   │   └── knowledge_base.json
│   └── utils/
│       ├── ai_response.py   # LLM integration
│       ├── intent.py        # Intent detection
│       ├── vector_db.py     # ChromaDB operations
│       └── web_scraper.py   # Live data + case status scrapers
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React component + modals
│   │   └── index.css        # Styles + modal system
│   ├── package.json
│   └── vite.config.js
└── run_app.py               # Application launcher
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- [Ollama](https://ollama.ai/) (optional, for AI features)

### Quick Start

```bash
# Clone and run both servers
python run_app.py
```

This starts both the backend (port 8000) and frontend (port 5173).

### Manual Setup

#### Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
python main.py
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Running with Ollama (Optional)

```bash
# Install Ollama from https://ollama.ai/
ollama pull llama2
ollama serve
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API status and info |
| `/health` | GET | Health check |
| `/chat` | POST | Chat with the assistant |
| `/case-status/{cnr}` | GET | Look up case by CNR number |
| `/tele-law/lawyers` | GET | List available lawyers |
| `/tele-law/connect/{id}` | POST | Connect to a lawyer |
| `/legal-aid/check` | POST | Check NALSA eligibility |
| `/njdg/stats` | GET | Get judicial statistics |

### Chat Request Example

```json
POST /chat
{
  "message": "How can I check my case status?",
  "history": []
}
```

### Legal Aid Check Example

```json
POST /legal-aid/check
{
  "annual_income": 250000,
  "case_type": "civil",
  "state": "Delhi",
  "is_woman": true,
  "is_sc_st": false
}
```

## 🔑 Key Components

### Intent Detection
Classifies user queries into categories like `case_status`, `tele_law`, `ecourts`, etc.

### Vector Database (RAG)
Uses ChromaDB with sentence transformers to semantically search through the knowledge base.

### Web Scraping
Automatically fetches latest information from official DoJ websites when queries contain keywords like "latest", "news", or "update".

### Quick Links Services
Backend services module (`services.py`) providing:
- Mock Tele-Law lawyer data
- NALSA eligibility rules based on LSA Act, 1987
- Mock case data for demonstration
- NJDG statistics

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
