import { useState } from 'react'

const API_BASE = 'http://localhost:8000'

export default function ECourts() {
    const [cnr, setCnr] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)

    const searchCase = async () => {
        if (!cnr.trim() || cnr.length < 16) {
            setResult({ error: 'Please enter a valid 16-character CNR number.' })
            return
        }
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/case-status/${cnr}`)
            const data = await res.json()
            setResult(data)
        } catch {
            setResult({ error: 'Failed to fetch case status. Please try again.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-ecourts">
            {/* Page Hero */}
            <section className="page-hero" style={{ '--hero-color': '#1a365d' }}>
                <h1>🏛️ eCourts Services</h1>
                <p>Access court services digitally — check case status, e-File, and more</p>
            </section>

            <div className="page-content">
                {/* Case Status Lookup */}
                <section className="content-card main-feature">
                    <h2>Case Status Lookup</h2>
                    <p className="feature-desc">
                        Check the status of any case using the Case Number Record (CNR) — a unique 16-digit number assigned to each case filed in courts across India.
                    </p>

                    <div className="lookup-box">
                        <div className="lookup-input-group">
                            <input
                                type="text"
                                className="lookup-input"
                                placeholder="Enter CNR Number (e.g., DLCT010012345672024)"
                                value={cnr}
                                onChange={e => setCnr(e.target.value.toUpperCase())}
                                maxLength={20}
                                onKeyDown={e => e.key === 'Enter' && searchCase()}
                            />
                            <button className="lookup-btn" onClick={searchCase} disabled={loading}>
                                {loading ? 'Searching...' : '🔍 Search'}
                            </button>
                        </div>
                        <p className="lookup-hint">
                            💡 Try demo CNR: <strong onClick={() => setCnr('DLCT010012345672024')} style={{ cursor: 'pointer', color: 'var(--doj-blue)' }}>DLCT010012345672024</strong>
                        </p>
                    </div>

                    {result?.error && (
                        <div className="result-error">⚠️ {result.error}</div>
                    )}

                    {result?.success && result.data && (
                        <div className="case-result-card">
                            {result.source === 'demo' && (
                                <div className="demo-badge">📋 Demo Data</div>
                            )}
                            <h3>Case Details</h3>
                            <div className="case-grid">
                                <div className="case-field">
                                    <label>CNR Number</label>
                                    <span>{result.data.cnr}</span>
                                </div>
                                <div className="case-field">
                                    <label>Case Type</label>
                                    <span>{result.data.case_type}</span>
                                </div>
                                <div className="case-field">
                                    <label>Case Number</label>
                                    <span>{result.data.case_number}</span>
                                </div>
                                <div className="case-field">
                                    <label>Status</label>
                                    <span className={`status-pill ${result.data.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                                        {result.data.status}
                                    </span>
                                </div>
                                <div className="case-field">
                                    <label>Petitioner</label>
                                    <span>{result.data.petitioner}</span>
                                </div>
                                <div className="case-field">
                                    <label>Respondent</label>
                                    <span>{result.data.respondent}</span>
                                </div>
                                <div className="case-field full-width">
                                    <label>Court</label>
                                    <span>{result.data.court}</span>
                                </div>
                                <div className="case-field">
                                    <label>Judge</label>
                                    <span>{result.data.judge}</span>
                                </div>
                                <div className="case-field">
                                    <label>Next Hearing</label>
                                    <span className="highlight-date">{result.data.next_hearing}</span>
                                </div>
                                <div className="case-field">
                                    <label>Filing Date</label>
                                    <span>{result.data.filing_date}</span>
                                </div>
                                <div className="case-field">
                                    <label>Case Stage</label>
                                    <span>{result.data.case_stage}</span>
                                </div>
                            </div>
                            {result.source === 'demo' && (
                                <p className="demo-note">
                                    ℹ️ This is sample data for demonstration. For real case status, visit{' '}
                                    <a href="https://services.ecourts.gov.in" target="_blank" rel="noopener noreferrer">
                                        services.ecourts.gov.in
                                    </a>
                                </p>
                            )}
                        </div>
                    )}
                </section>

                {/* Other eCourts Services */}
                <section className="services-overview">
                    <h2>Other eCourts Services</h2>
                    <div className="mini-cards">
                        <a href="https://efiling.ecourts.gov.in" target="_blank" rel="noopener noreferrer" className="mini-card">
                            <span className="mini-icon">📝</span>
                            <div>
                                <h4>eFiling</h4>
                                <p>File cases online</p>
                            </div>
                        </a>
                        <a href="https://pay.ecourts.gov.in" target="_blank" rel="noopener noreferrer" className="mini-card">
                            <span className="mini-icon">💳</span>
                            <div>
                                <h4>ePayment</h4>
                                <p>Pay court fees online</p>
                            </div>
                        </a>
                        <a href="https://vcourts.gov.in" target="_blank" rel="noopener noreferrer" className="mini-card">
                            <span className="mini-icon">🖥️</span>
                            <div>
                                <h4>Virtual Courts</h4>
                                <p>Traffic challans & more</p>
                            </div>
                        </a>
                    </div>
                </section>
            </div>
        </div>
    )
}
