import { useState, useRef, useEffect } from 'react'
import './index.css'

function App() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Welcome! I am Neethi, your legal assistance companion. I can help you with information about eCourts, Tele-Law, legal aid schemes, and other Department of Justice services. How may I assist you today?'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const QUICK_ACTIONS = [
    "Check Case Status",
    "What is Tele-Law?",
    "Pay Traffic Challan",
    "Legal Aid Schemes",
    "eFiling Guide"
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text: messageText }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: data.response,
        sources: data.sources
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: "I apologize, but I'm currently unable to connect to the server. Please try again in a moment."
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  const formatMessage = (text) => {
    // Basic markdown-like formatting
    return text.split('\n').map((line, i) => (
      <p key={i}>{line}</p>
    ));
  }

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">⚖️</div>
          <div>
            <div className="header-title">
              <span>நீதி</span> NEETHI
            </div>
            <div className="header-subtitle">Department of Justice, Government of India</div>
          </div>
        </div>
        <nav className="header-nav">
          <a href="https://doj.gov.in" target="_blank" className="nav-link">DoJ Portal</a>
          <a href="https://services.ecourts.gov.in" target="_blank" className="nav-link">eCourts</a>
          <a href="https://www.tele-law.in" target="_blank" className="nav-link">Tele-Law</a>
          <a href="#" className="nav-link primary">Get Help</a>
        </nav>
      </header>

      {/* Main Container */}
      <div className="main-container">
        {/* Chat Area */}
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                <div className="message-avatar">
                  {msg.sender === 'bot' ? '⚖️' : '👤'}
                </div>
                <div className="message-content">
                  <div className="message-text">
                    {formatMessage(msg.text)}
                  </div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="message-sources">
                      <div className="sources-label">Verified Sources</div>
                      {msg.sources.map((src, i) => (
                        <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="source-link">
                          {src}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message bot">
                <div className="message-avatar">⚖️</div>
                <div className="loading-indicator">
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-container">
            <div className="quick-actions">
              {QUICK_ACTIONS.map((q, i) => (
                <button key={i} className="quick-btn" onClick={() => handleSend(q)}>
                  {q}
                </button>
              ))}
            </div>
            <div className="input-wrapper">
              <input
                type="text"
                className="chat-input"
                placeholder="Type your legal question here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                disabled={isLoading}
              />
              <button
                className="send-btn"
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">Status Overview</div>
            <div className="stats-card">
              <div className="stats-number">4.5 Cr+</div>
              <div className="stats-label">Pending Cases in National Judicial Data Grid</div>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Quick Links</div>
            <ul className="quick-links">
              <li>
                <a href="https://services.ecourts.gov.in" target="_blank" rel="noopener noreferrer">
                  <span className="link-icon">🏛️</span>
                  eCourts Services
                </a>
              </li>
              <li>
                <a href="https://www.tele-law.in" target="_blank" rel="noopener noreferrer">
                  <span className="link-icon">📱</span>
                  Tele-Law Mobile App
                </a>
              </li>
              <li>
                <a href="https://nalsa.gov.in" target="_blank" rel="noopener noreferrer">
                  <span className="link-icon">⚖️</span>
                  NALSA
                </a>
              </li>
              <li>
                <a href="https://njdg.ecourts.gov.in" target="_blank" rel="noopener noreferrer">
                  <span className="link-icon">📊</span>
                  Judicial Data Grid
                </a>
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="help-box">
              <h4>Need Immediate Help?</h4>
              <p>Connect with a lawyer through Tele-Law service at your nearest Common Service Center.</p>
              <button className="help-btn">Find CSC Near You</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default App
