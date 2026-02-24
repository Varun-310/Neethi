import { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:8000'

export default function TeleLaw() {
    const [lawyers, setLawyers] = useState(null)
    const [loading, setLoading] = useState(true)
    const [connecting, setConnecting] = useState(null)

    useEffect(() => {
        fetch(`${API_BASE}/tele-law/lawyers`)
            .then(r => r.json())
            .then(data => setLawyers(data))
            .catch(() => setLawyers({ error: true }))
            .finally(() => setLoading(false))
    }, [])

    const connectToLawyer = async (id) => {
        setConnecting(id)
        try {
            const res = await fetch(`${API_BASE}/tele-law/connect/${id}`, { method: 'POST' })
            const data = await res.json()
            alert(data.message)
        } catch {
            alert('Connection failed. Please try again.')
        } finally {
            setConnecting(null)
        }
    }

    return (
        <div className="page-telelaw">
            <section className="page-hero" style={{ '--hero-color': '#065f46' }}>
                <h1>📱 Tele-Law: Connecting Citizens to Lawyers</h1>
                <p>Free legal advice through video consultation at Common Service Centres</p>
            </section>

            <div className="page-content">
                {/* How It Works */}
                <section className="content-card">
                    <h2>How Tele-Law Works</h2>
                    <div className="steps-flow">
                        <div className="step-item">
                            <div className="step-num">1</div>
                            <h4>Visit CSC</h4>
                            <p>Go to your nearest Common Service Centre</p>
                        </div>
                        <div className="step-connector">→</div>
                        <div className="step-item">
                            <div className="step-num">2</div>
                            <h4>Register</h4>
                            <p>Provide basic details and describe your issue</p>
                        </div>
                        <div className="step-connector">→</div>
                        <div className="step-item">
                            <div className="step-num">3</div>
                            <h4>Consult</h4>
                            <p>Connect via video call with a panel lawyer</p>
                        </div>
                        <div className="step-connector">→</div>
                        <div className="step-item">
                            <div className="step-num">4</div>
                            <h4>Get Advice</h4>
                            <p>Receive legal advice and next steps</p>
                        </div>
                    </div>
                </section>

                {/* Lawyer Grid */}
                <section className="content-card main-feature">
                    <h2>Available Panel Lawyers</h2>
                    {lawyers && !lawyers.error && (
                        <p className="feature-desc">
                            {lawyers.available_now} of {lawyers.total} lawyers available now
                        </p>
                    )}

                    {loading && (
                        <div className="loading-state">
                            <span className="page-spinner"></span>
                            <p>Loading available lawyers...</p>
                        </div>
                    )}

                    {lawyers?.error && (
                        <div className="result-error">Unable to load lawyer list. Please try again later.</div>
                    )}

                    {lawyers?.lawyers && (
                        <div className="lawyer-list">
                            {lawyers.lawyers.map(lawyer => (
                                <div key={lawyer.id} className="lawyer-row">
                                    <div className="lawyer-avatar-lg">{lawyer.profile_image}</div>
                                    <div className="lawyer-details">
                                        <h3>{lawyer.name}</h3>
                                        <p className="lawyer-specialization">{lawyer.specialization}</p>
                                        <div className="lawyer-tags">
                                            <span className="tag">⭐ {lawyer.rating}</span>
                                            <span className="tag">📅 {lawyer.experience_years} yrs exp</span>
                                            {lawyer.languages.map(lang => (
                                                <span key={lang} className="tag lang">🗣️ {lang}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="lawyer-action">
                                        <span className={`avail-badge ${lawyer.available ? 'online' : 'offline'}`}>
                                            {lawyer.available ? '● Available' : `Next: ${lawyer.next_available}`}
                                        </span>
                                        <button
                                            className={`connect-button ${lawyer.available ? '' : 'queue'}`}
                                            onClick={() => connectToLawyer(lawyer.id)}
                                            disabled={connecting === lawyer.id}
                                        >
                                            {connecting === lawyer.id ? 'Connecting...' :
                                                lawyer.available ? '📞 Connect Now' : '📋 Join Queue'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="demo-notice-inline">
                        ℹ️ This is a demonstration. For real Tele-Law consultations, visit{' '}
                        <a href="https://www.tele-law.in" target="_blank" rel="noopener noreferrer">tele-law.in</a>
                        {' '}or your nearest CSC.
                    </div>
                </section>
            </div>
        </div>
    )
}
