import { useState } from 'react'

const API_BASE = 'http://localhost:8000'

export default function LegalAid() {
    const [form, setForm] = useState({
        annual_income: '',
        case_type: 'civil',
        state: 'Delhi',
        is_woman: false,
        is_sc_st: false,
        is_senior_citizen: false,
        is_specially_abled: false,
        is_in_custody: false
    })
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)

    const checkEligibility = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/legal-aid/check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    annual_income: parseInt(form.annual_income) || 0
                })
            })
            const data = await res.json()
            setResult(data)
        } catch {
            setResult({ error: 'Failed to check eligibility. Please try again.' })
        } finally {
            setLoading(false)
        }
    }

    const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

    return (
        <div className="page-legalaid">
            <section className="page-hero" style={{ '--hero-color': '#7c2d12' }}>
                <h1>⚖️ NALSA Free Legal Aid</h1>
                <p>Check your eligibility under the Legal Services Authorities Act, 1987</p>
            </section>

            <div className="page-content">
                {/* About NALSA */}
                <section className="content-card">
                    <h2>Who is Eligible?</h2>
                    <p className="feature-desc">
                        Under Section 12 of the Legal Services Authorities Act, 1987, the following persons are entitled to free legal services:
                    </p>
                    <div className="eligibility-categories">
                        <div className="cat-item">👩 Women & Children</div>
                        <div className="cat-item">👥 SC/ST Members</div>
                        <div className="cat-item">🧓 Senior Citizens</div>
                        <div className="cat-item">♿ Persons with Disabilities</div>
                        <div className="cat-item">🏭 Industrial Workmen</div>
                        <div className="cat-item">🔒 Persons in Custody</div>
                        <div className="cat-item">🌪️ Disaster Victims</div>
                        <div className="cat-item">💰 Income below ₹3 Lakh/year</div>
                    </div>
                </section>

                {/* Eligibility Checker */}
                <section className="content-card main-feature">
                    <h2>Check Your Eligibility</h2>

                    <form className="aid-form" onSubmit={checkEligibility}>
                        <div className="form-grid">
                            <div className="form-field">
                                <label>Annual Income (₹)</label>
                                <input
                                    type="number"
                                    placeholder="e.g., 250000"
                                    value={form.annual_income}
                                    onChange={e => update('annual_income', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label>Case Type</label>
                                <select value={form.case_type} onChange={e => update('case_type', e.target.value)}>
                                    <option value="civil">Civil</option>
                                    <option value="criminal">Criminal</option>
                                    <option value="family_matrimonial">Family/Matrimonial</option>
                                    <option value="labour">Labour</option>
                                    <option value="consumer">Consumer</option>
                                    <option value="property">Property</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>State</label>
                                <select value={form.state} onChange={e => update('state', e.target.value)}>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="West Bengal">West Bengal</option>
                                    <option value="Gujarat">Gujarat</option>
                                    <option value="Rajasthan">Rajasthan</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Select all that apply:</label>
                            <div className="check-grid">
                                {[
                                    ['is_woman', 'Woman'],
                                    ['is_sc_st', 'SC/ST'],
                                    ['is_senior_citizen', 'Senior Citizen'],
                                    ['is_specially_abled', 'Specially Abled'],
                                    ['is_in_custody', 'In Custody']
                                ].map(([key, label]) => (
                                    <label key={key} className="check-item">
                                        <input
                                            type="checkbox"
                                            checked={form[key]}
                                            onChange={e => update(key, e.target.checked)}
                                        />
                                        <span>{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? 'Checking...' : 'Check Eligibility'}
                        </button>
                    </form>

                    {result?.error && (
                        <div className="result-error" style={{ marginTop: '1.5rem' }}>⚠️ {result.error}</div>
                    )}

                    {result?.eligible !== undefined && (
                        <div className={`eligibility-card ${result.eligible ? 'yes' : 'no'}`}>
                            <h3>{result.eligible ? '✅ You are Eligible for Free Legal Aid!' : '❌ Not Eligible for Free Legal Aid'}</h3>
                            <ul className="reason-list">
                                {result.reasons?.map((r, i) => (
                                    <li key={i}>{r}</li>
                                ))}
                            </ul>
                            {result.next_steps && (
                                <div className="next-steps-box">
                                    <h4>Next Steps:</h4>
                                    <ul>
                                        {result.next_steps.map((s, i) => (
                                            <li key={i}>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <p className="ref-note">Reference: {result.reference}</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
