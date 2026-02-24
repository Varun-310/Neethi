import { useState, useRef, useEffect } from 'react'

const API_BASE = 'http://localhost:8000'

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            text: 'Hello! I am Neethi, your legal assistant. How can I help you today?'
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return
        const userMessage = input.trim()
        setMessages(prev => [...prev, { sender: 'user', text: userMessage }])
        setInput('')
        setIsLoading(true)

        try {
            const response = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
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
                text: "I'm having trouble connecting. Please try again or visit the full Neethi page."
            }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={`chat-widget ${isOpen ? 'open' : ''}`}>
            {/* Chat Panel */}
            {isOpen && (
                <div className="widget-panel">
                    <div className="widget-header">
                        <div className="widget-header-info">
                            <span className="widget-avatar">⚖️</span>
                            <div>
                                <div className="widget-name">Neethi AI</div>
                                <div className="widget-status">● Online</div>
                            </div>
                        </div>
                        <button className="widget-minimize" onClick={() => setIsOpen(false)}>−</button>
                    </div>

                    <div className="widget-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`widget-msg ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="widget-msg bot">
                                <span className="widget-typing">
                                    <span></span><span></span><span></span>
                                </span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="widget-input-area">
                        <input
                            type="text"
                            placeholder="Ask a legal question..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading || !input.trim()}>
                            ➤
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                className={`widget-fab ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Chat with Neethi"
            >
                {isOpen ? '✕' : '⚖️'}
            </button>
        </div>
    )
}
