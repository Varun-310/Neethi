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
  const [activeModal, setActiveModal] = useState(null)
  const [modalData, setModalData] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const QUICK_ACTIONS = [
    "Check Case Status",
    "What is Tele-Law?",
    "Pay Traffic Challan",
    "Legal Aid Schemes",
    "eFiling Guide"
  ]

  const API_BASE = 'http://localhost:8000'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text: messageText }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
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
    return text.split('\n').map((line, i) => (
      <p key={i}>{line}</p>
    ));
  }

  // ===============================
  // MODAL HANDLERS
  // ===============================

  const openModal = (modalType) => {
    setActiveModal(modalType);
    setModalData(null);

    // Fetch initial data for some modals
    if (modalType === 'telelaw') {
      fetchLawyers();
    } else if (modalType === 'njdg') {
      fetchNJDGStats();
    }
  }

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  }

  // Case Status Functions
  const [cnrInput, setCnrInput] = useState('');

  const searchCaseStatus = async () => {
    if (!cnrInput.trim() || cnrInput.length < 16) {
      setModalData({ error: 'Please enter a valid CNR number (at least 16 characters)' });
      return;
    }

    setModalLoading(true);
    try {
      const response = await fetch(`${API_BASE}/case-status/${cnrInput}`);
      const data = await response.json();
      setModalData(data);
    } catch (error) {
      setModalData({ error: 'Failed to fetch case status. Please try again.' });
    } finally {
      setModalLoading(false);
    }
  }

  // Tele-Law Functions
  const fetchLawyers = async () => {
    setModalLoading(true);
    try {
      const response = await fetch(`${API_BASE}/tele-law/lawyers`);
      const data = await response.json();
      setModalData(data);
    } catch (error) {
      setModalData({ error: 'Failed to fetch lawyer list. Please try again.' });
    } finally {
      setModalLoading(false);
    }
  }

  const connectToLawyer = async (lawyerId) => {
    setModalLoading(true);
    try {
      const response = await fetch(`${API_BASE}/tele-law/connect/${lawyerId}`, { method: 'POST' });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert('Connection failed. Please try again.');
    } finally {
      setModalLoading(false);
    }
  }

  // Legal Aid Functions
  const [eligibilityForm, setEligibilityForm] = useState({
    annual_income: '',
    case_type: 'civil',
    state: 'Delhi',
    is_woman: false,
    is_sc_st: false,
    is_senior_citizen: false,
    is_specially_abled: false,
    is_in_custody: false
  });

  const checkEligibility = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const response = await fetch(`${API_BASE}/legal-aid/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eligibilityForm,
          annual_income: parseInt(eligibilityForm.annual_income) || 0
        })
      });
      const data = await response.json();
      setModalData(data);
    } catch (error) {
      setModalData({ error: 'Failed to check eligibility. Please try again.' });
    } finally {
      setModalLoading(false);
    }
  }

  // NJDG Functions
  const fetchNJDGStats = async () => {
    setModalLoading(true);
    try {
      const response = await fetch(`${API_BASE}/njdg/stats`);
      const data = await response.json();
      setModalData(data);
    } catch (error) {
      setModalData({ error: 'Failed to fetch statistics. Please try again.' });
    } finally {
      setModalLoading(false);
    }
  }

  // ===============================
  // MODAL COMPONENTS
  // ===============================

  const CaseStatusModal = () => (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏛️ eCourts Case Status</h2>
          <button className="modal-close" onClick={closeModal}>×</button>
        </div>
        <div className="modal-body">
          <div className="cnr-input-group">
            <input
              type="text"
              className="cnr-input"
              placeholder="Enter CNR Number (e.g., DLCT010012345672024)"
              value={cnrInput}
              onChange={(e) => setCnrInput(e.target.value.toUpperCase())}
              maxLength={20}
            />
            <button
              className="search-btn"
              onClick={searchCaseStatus}
              disabled={modalLoading}
            >
              {modalLoading ? <span className="loading-spinner"></span> : 'Search'}
            </button>
          </div>

          {modalData?.error && (
            <div className="error-message">⚠️ {modalData.error}</div>
          )}

          {modalData?.success && modalData.data && (
            <div className={`case-result ${modalData.source === 'demo' ? 'demo-data' : ''}`}>
              <h3>📋 Case Details</h3>
              <div className="case-detail-grid">
                <div className="case-detail">
                  <label>CNR Number</label>
                  <span>{modalData.data.cnr}</span>
                </div>
                <div className="case-detail">
                  <label>Case Type</label>
                  <span>{modalData.data.case_type}</span>
                </div>
                <div className="case-detail">
                  <label>Case Number</label>
                  <span>{modalData.data.case_number}</span>
                </div>
                <div className="case-detail">
                  <label>Status</label>
                  <span className={`case-status-badge ${modalData.data.status?.toLowerCase()}`}>
                    {modalData.data.status}
                  </span>
                </div>
                <div className="case-detail">
                  <label>Petitioner</label>
                  <span>{modalData.data.petitioner}</span>
                </div>
                <div className="case-detail">
                  <label>Respondent</label>
                  <span>{modalData.data.respondent}</span>
                </div>
                <div className="case-detail">
                  <label>Court</label>
                  <span>{modalData.data.court}</span>
                </div>
                <div className="case-detail">
                  <label>Next Hearing</label>
                  <span>{modalData.data.next_hearing}</span>
                </div>
              </div>
              {modalData.source === 'demo' && (
                <div className="demo-notice">
                  ℹ️ This is sample data for demonstration. For real case status, visit services.ecourts.gov.in
                </div>
              )}
            </div>
          )}

          {modalData?.success === false && !modalData.error && (
            <div className="error-message">
              {modalData.message}<br />
              <a href="https://services.ecourts.gov.in" target="_blank" rel="noopener noreferrer">
                Check on eCourts →
              </a>
            </div>
          )}

          <p style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Try demo CNR: <strong>DLCT010012345672024</strong>
          </p>
        </div>
      </div>
    </div>
  );

  const TeleLawModal = () => (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-container wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📱 Tele-Law - Connect with a Lawyer</h2>
          <button className="modal-close" onClick={closeModal}>×</button>
        </div>
        <div className="modal-body">
          {modalLoading && !modalData && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <span className="loading-spinner"></span>
              <p style={{ marginTop: '1rem' }}>Loading available lawyers...</p>
            </div>
          )}

          {modalData?.error && (
            <div className="error-message">⚠️ {modalData.error}</div>
          )}

          {modalData?.lawyers && (
            <>
              <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                {modalData.available_now} of {modalData.total} lawyers available now
              </p>
              <div className="lawyer-grid">
                {modalData.lawyers.map(lawyer => (
                  <div key={lawyer.id} className="lawyer-card">
                    <div className="lawyer-avatar">{lawyer.profile_image}</div>
                    <div className="lawyer-info">
                      <div className="lawyer-name">{lawyer.name}</div>
                      <div className="lawyer-spec">{lawyer.specialization}</div>
                      <div className="lawyer-meta">
                        <span>⭐ {lawyer.rating}</span>
                        <span>📅 {lawyer.experience_years} years exp.</span>
                        <span>🗣️ {lawyer.languages.join(', ')}</span>
                      </div>
                    </div>
                    <div className="lawyer-actions">
                      <span className={`availability-badge ${lawyer.available ? 'available' : 'busy'}`}>
                        {lawyer.available ? '● Available' : `Next: ${lawyer.next_available}`}
                      </span>
                      <button
                        className="connect-btn"
                        onClick={() => connectToLawyer(lawyer.id)}
                        disabled={modalLoading}
                      >
                        {lawyer.available ? 'Connect Now' : 'Join Queue'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="demo-notice" style={{ marginTop: '1rem' }}>
                ℹ️ This is a demonstration. For real Tele-Law consultations, visit tele-law.in or your nearest CSC.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const LegalAidModal = () => (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚖️ NALSA Legal Aid Eligibility</h2>
          <button className="modal-close" onClick={closeModal}>×</button>
        </div>
        <div className="modal-body">
          <form className="eligibility-form" onSubmit={checkEligibility}>
            <div className="form-row">
              <div className="form-group">
                <label>Annual Income (₹)</label>
                <input
                  type="number"
                  placeholder="e.g., 250000"
                  value={eligibilityForm.annual_income}
                  onChange={(e) => setEligibilityForm({ ...eligibilityForm, annual_income: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Case Type</label>
                <select
                  value={eligibilityForm.case_type}
                  onChange={(e) => setEligibilityForm({ ...eligibilityForm, case_type: e.target.value })}
                >
                  <option value="civil">Civil</option>
                  <option value="criminal">Criminal</option>
                  <option value="family_matrimonial">Family/Matrimonial</option>
                  <option value="labour">Labour</option>
                  <option value="consumer">Consumer</option>
                  <option value="property">Property</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>State</label>
              <select
                value={eligibilityForm.state}
                onChange={(e) => setEligibilityForm({ ...eligibilityForm, state: e.target.value })}
              >
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

            <div className="form-group">
              <label>Select if applicable:</label>
              <div className="checkbox-group">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={eligibilityForm.is_woman}
                    onChange={(e) => setEligibilityForm({ ...eligibilityForm, is_woman: e.target.checked })}
                  />
                  Woman
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={eligibilityForm.is_sc_st}
                    onChange={(e) => setEligibilityForm({ ...eligibilityForm, is_sc_st: e.target.checked })}
                  />
                  SC/ST
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={eligibilityForm.is_senior_citizen}
                    onChange={(e) => setEligibilityForm({ ...eligibilityForm, is_senior_citizen: e.target.checked })}
                  />
                  Senior Citizen
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={eligibilityForm.is_specially_abled}
                    onChange={(e) => setEligibilityForm({ ...eligibilityForm, is_specially_abled: e.target.checked })}
                  />
                  Specially Abled
                </label>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={modalLoading}>
              {modalLoading ? <span className="loading-spinner"></span> : 'Check Eligibility'}
            </button>
          </form>

          {modalData?.error && (
            <div className="error-message" style={{ marginTop: '1rem' }}>⚠️ {modalData.error}</div>
          )}

          {modalData?.eligible !== undefined && (
            <div className={`eligibility-result ${modalData.eligible ? 'eligible' : 'not-eligible'}`}>
              <h3>
                {modalData.eligible ? '✅ You are Eligible!' : '❌ Not Eligible for Free Legal Aid'}
              </h3>
              <ul>
                {modalData.reasons?.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
              {modalData.next_steps && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>Next Steps:</strong>
                  <ul>
                    {modalData.next_steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const NJDGModal = () => (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-container wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 National Judicial Data Grid</h2>
          <button className="modal-close" onClick={closeModal}>×</button>
        </div>
        <div className="modal-body">
          {modalLoading && !modalData && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <span className="loading-spinner"></span>
              <p style={{ marginTop: '1rem' }}>Loading statistics...</p>
            </div>
          )}

          {modalData?.error && (
            <div className="error-message">⚠️ {modalData.error}</div>
          )}

          {modalData?.data && (
            <>
              <div className="stats-grid">
                <div className="stat-card highlight">
                  <div className="stat-value">
                    {(modalData.data.total_pending_cases / 10000000).toFixed(1)} Cr+
                  </div>
                  <div className="stat-label">Total Pending Cases</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {(modalData.data.district_courts?.pending / 10000000).toFixed(1)} Cr
                  </div>
                  <div className="stat-label">District Courts</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {(modalData.data.high_courts?.pending / 1000000).toFixed(1)} L
                  </div>
                  <div className="stat-label">High Courts</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value" style={{ color: 'var(--primary-green)' }}>
                    {modalData.data.disposal_rate?.disposal_percentage}%
                  </div>
                  <div className="stat-label">Disposal Rate</div>
                </div>
              </div>

              <div className="stats-section">
                <h4>Top 5 States by Pending Cases</h4>
                <div className="progress-bars">
                  {modalData.data.top_states?.map((state, i) => {
                    const maxPending = modalData.data.top_states[0].pending;
                    const percentage = (state.pending / maxPending) * 100;
                    return (
                      <div key={i} className="progress-item">
                        <div className="progress-label">
                          <span>{state.name}</span>
                          <span>{(state.pending / 1000000).toFixed(1)}L cases</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="stats-section">
                <h4>Age-wise Case Distribution</h4>
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <div className="stat-card">
                    <div className="stat-value" style={{ fontSize: '1.25rem' }}>
                      {(modalData.data.age_wise?.under_1_year / 1000000).toFixed(1)}L
                    </div>
                    <div className="stat-label">&lt; 1 Year</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value" style={{ fontSize: '1.25rem' }}>
                      {(modalData.data.age_wise?.['1_to_3_years'] / 1000000).toFixed(1)}L
                    </div>
                    <div className="stat-label">1-3 Years</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value" style={{ fontSize: '1.25rem', color: '#dc2626' }}>
                      {(modalData.data.age_wise?.above_10_years / 1000000).toFixed(1)}L
                    </div>
                    <div className="stat-label">&gt; 10 Years</div>
                  </div>
                </div>
              </div>

              {modalData.source === 'demo' && (
                <div className="demo-notice">
                  ℹ️ {modalData.note}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

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
                <button onClick={() => openModal('casestatus')}>
                  <span className="link-icon">🏛️</span>
                  eCourts Services
                </button>
              </li>
              <li>
                <button onClick={() => openModal('telelaw')}>
                  <span className="link-icon">📱</span>
                  Tele-Law Connect
                </button>
              </li>
              <li>
                <button onClick={() => openModal('legalaid')}>
                  <span className="link-icon">⚖️</span>
                  NALSA Legal Aid
                </button>
              </li>
              <li>
                <button onClick={() => openModal('njdg')}>
                  <span className="link-icon">📊</span>
                  Judicial Data Grid
                </button>
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="help-box">
              <h4>Need Immediate Help?</h4>
              <p>Connect with a lawyer through Tele-Law service at your nearest Common Service Center.</p>
              <button className="help-btn" onClick={() => openModal('telelaw')}>Find a Lawyer</button>
            </div>
          </div>
        </aside>
      </div>

      {/* Modals */}
      {activeModal === 'casestatus' && <CaseStatusModal />}
      {activeModal === 'telelaw' && <TeleLawModal />}
      {activeModal === 'legalaid' && <LegalAidModal />}
      {activeModal === 'njdg' && <NJDGModal />}
    </div>
  )
}

export default App
