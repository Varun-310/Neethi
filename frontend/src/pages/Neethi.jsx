import { useState, useRef, useEffect } from 'react'

const API_BASE = 'http://localhost:8000'

const QUICK_ACTIONS = [
    "Check Case Status",
    "What is Tele-Law?",
    "Pay Traffic Challan",
    "Legal Aid Schemes",
    "eFiling Guide"
]

export default function Neethi() {
    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            text: 'Welcome! I am Neethi (நீதி), your legal assistance companion. I can help you with information about eCourts, Tele-Law, legal aid schemes, and other Department of Justice services.\n\nHow may I assist you today?'
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async (messageText = input) => {
        if (!messageText.trim()) return
        setMessages(prev => [...prev, { sender: 'user', text: messageText }])
        setInput('')
        setIsLoading(true)

        try {
            const response = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText })
            })
            if (!response.ok) throw new Error('Network error')
            const data = await response.json()
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: data.response,
                sources: data.sources
            }])
        } catch {
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: "I apologize, but I'm currently unable to connect to the server. Please try again in a moment."
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const formatMessage = (text) => {
        return text.split('\n').map((line, i) => (
            <p key={i}>{line || '\u00A0'}</p>
        ))
    }

    return (
        <div className="page-neethi">
            <div className="neethi-layout">
                {/* Sidebar */}
                <aside className="neethi-sidebar">
                    <div className="neethi-sidebar-header">
                        <span className="neethi-logo">⚖️</span>
                        <div>
                            <h3>Neethi AI</h3>
                            <p>Legal Assistant</p>
                        </div>
                    </div>

                    <div className="neethi-sidebar-section">
                        <h4>Quick Actions</h4>
                        <div className="neethi-quick-btns">
                            {QUICK_ACTIONS.map((q, i) => (
                                <button key={i} onClick={() => handleSend(q)}>{q}</button>
                            ))}
                        </div>
                    </div>

                    <div className="neethi-sidebar-section">
                        <h4>About</h4>
                        <p className="neethi-about">
                            Neethi uses AI to help citizens navigate legal services. Responses are based on verified government sources.
                        </p>
                    </div>
                </aside>

                {/* Chat Area */}
                <div className="neethi-chat">
                    <div className="neethi-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`neethi-msg ${msg.sender}`}>
                                <div className="neethi-msg-avatar">
                                    {msg.sender === 'bot' ? '⚖️' : '👤'}
                                </div>
                                <div className="neethi-msg-content">
                                    <div className="neethi-msg-text">
                                        {formatMessage(msg.text)}
                                    </div>
                                    {msg.sources?.length > 0 && (
                                        <div className="neethi-sources">
                                            <span className="sources-title">📎 Sources:</span>
                                            {msg.sources.map((src, i) => (
                                                <a key={i} href={src} target="_blank" rel="noopener noreferrer">{src}</a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="neethi-msg bot">
                                <div className="neethi-msg-avatar">⚖️</div>
                                <div className="neethi-msg-content">
                                    <div className="neethi-typing">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="neethi-input-area">
                        <input
                            type="text"
                            placeholder="Type your legal question here..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !isLoading && handleSend()}
                            disabled={isLoading}
                        />
                        <button onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
