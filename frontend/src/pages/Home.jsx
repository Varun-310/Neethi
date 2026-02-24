import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:8000'

const SERVICE_CARDS = [
    {
        icon: '🏛️',
        title: 'eCourts Services',
        desc: 'Look up case status using CNR number, access e-Filing, e-Payment, and more.',
        link: '/ecourts',
        color: '#1a365d'
    },
    {
        icon: '📱',
        title: 'Tele-Law',
        desc: 'Free legal advice through video consultation with panel lawyers at CSCs.',
        link: '/tele-law',
        color: '#065f46'
    },
    {
        icon: '⚖️',
        title: 'NALSA Legal Aid',
        desc: 'Check your eligibility for free legal aid under the Legal Services Authorities Act.',
        link: '/legal-aid',
        color: '#7c2d12'
    },
    {
        icon: '📊',
        title: 'Judicial Data Grid',
        desc: 'National Judicial Data Grid - real-time statistics on pendency across courts.',
        link: '/njdg',
        color: '#4c1d95'
    }
]

const ANNOUNCEMENTS = [
    'eFiling 3.0 now live - File cases online at efiling.ecourts.gov.in',
    'Tele-Law crosses 1 Crore consultations milestone',
    'NALSA launches special legal aid camp for senior citizens',
    'NJDG 3.0 dashboard updated with real-time sync across 18,735 courts',
    'Virtual Courts: Pay traffic challans online across 18 states'
]

export default function Home() {
    const [currentAnnouncement, setCurrentAnnouncement] = useState(0)
    const [stats, setStats] = useState(null)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentAnnouncement(prev => (prev + 1) % ANNOUNCEMENTS.length)
        }, 4000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        fetch(`${API_BASE}/njdg/stats`)
            .then(r => r.json())
            .then(data => setStats(data?.data))
            .catch(() => { })
    }, [])

    return (
        <div className="page-home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <div className="hero-emblem">⚖️</div>
                    <h1>Access to Justice for All</h1>
                    <p className="hero-subtitle">
                        Empowering citizens through technology-driven legal services
                    </p>
                    <div className="hero-actions">
                        <Link to="/neethi" className="hero-btn primary">
                            🤖 Ask Neethi AI
                        </Link>
                        <Link to="/ecourts" className="hero-btn secondary">
                            🏛️ Check Case Status
                        </Link>
                    </div>
                </div>
            </section>

            {/* Announcement Ticker */}
            <div className="ticker-bar">
                <span className="ticker-label">📢 Latest</span>
                <div className="ticker-content">
                    <p className="ticker-text">{ANNOUNCEMENTS[currentAnnouncement]}</p>
                </div>
            </div>

            {/* Key Stats */}
            <section className="home-stats">
                <div className="section-container">
                    <div className="stats-row">
                        <div className="home-stat-card">
                            <div className="home-stat-number">18,735+</div>
                            <div className="home-stat-label">Courts Computerized</div>
                        </div>
                        <div className="home-stat-card">
                            <div className="home-stat-number">{stats ? `${(stats.total_pending_cases / 10000000).toFixed(1)} Cr` : '4.5 Cr+'}</div>
                            <div className="home-stat-label">Cases in NJDG</div>
                        </div>
                        <div className="home-stat-card">
                            <div className="home-stat-number">1 Cr+</div>
                            <div className="home-stat-label">Tele-Law Consultations</div>
                        </div>
                        <div className="home-stat-card">
                            <div className="home-stat-number">36</div>
                            <div className="home-stat-label">States & UTs Covered</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Service Cards */}
            <section className="home-services">
                <div className="section-container">
                    <h2 className="section-heading">Our Key Initiatives</h2>
                    <p className="section-subheading">
                        Leveraging technology to make justice accessible, affordable, and efficient
                    </p>
                    <div className="service-grid">
                        {SERVICE_CARDS.map((card, i) => (
                            <Link to={card.link} key={i} className="service-card" style={{ '--card-color': card.color }}>
                                <div className="service-icon">{card.icon}</div>
                                <h3>{card.title}</h3>
                                <p>{card.desc}</p>
                                <span className="service-arrow">Explore →</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Neethi AI Banner */}
            <section className="neethi-banner">
                <div className="section-container">
                    <div className="banner-content">
                        <div className="banner-text">
                            <h2>Meet Neethi — Your AI Legal Assistant</h2>
                            <p>
                                Get instant answers about eCourts, Tele-Law, legal aid, and more.
                                Powered by AI with verified government sources.
                            </p>
                            <Link to="/neethi" className="banner-btn">
                                Start a Conversation →
                            </Link>
                        </div>
                        <div className="banner-visual">
                            <div className="banner-chat-preview">
                                <div className="preview-msg bot">How can I help you with legal services today?</div>
                                <div className="preview-msg user">How do I check my case status?</div>
                                <div className="preview-msg bot">You can check status using your CNR number on eCourts...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
