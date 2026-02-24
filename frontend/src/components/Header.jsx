import { NavLink, Link } from 'react-router-dom'
import { useState } from 'react'

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <>
            {/* Tricolor Bar */}
            <div className="tricolor-bar">
                <div className="tricolor-saffron"></div>
                <div className="tricolor-white"></div>
                <div className="tricolor-green"></div>
            </div>

            {/* Top Utility Bar */}
            <div className="utility-bar">
                <div className="utility-content">
                    <span>भारत सरकार | Government of India</span>
                    <div className="utility-links">
                        <a href="https://india.gov.in" target="_blank" rel="noopener noreferrer">india.gov.in</a>
                        <span className="divider">|</span>
                        <a href="https://doj.gov.in" target="_blank" rel="noopener noreferrer">doj.gov.in</a>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header className="doj-header">
                <div className="doj-header-content">
                    <Link to="/" className="doj-brand">
                        <div className="doj-emblem">⚖️</div>
                        <div className="doj-brand-text">
                            <div className="doj-title-en">Department of Justice</div>
                            <div className="doj-title-hi">न्याय विभाग</div>
                            <div className="doj-ministry">Ministry of Law & Justice, Government of India</div>
                        </div>
                    </Link>

                    <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? '✕' : '☰'}
                    </button>

                    <nav className={`doj-nav ${menuOpen ? 'open' : ''}`}>
                        <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
                        <NavLink to="/ecourts" onClick={() => setMenuOpen(false)}>eCourts</NavLink>
                        <NavLink to="/tele-law" onClick={() => setMenuOpen(false)}>Tele-Law</NavLink>
                        <NavLink to="/legal-aid" onClick={() => setMenuOpen(false)}>Legal Aid</NavLink>
                        <NavLink to="/njdg" onClick={() => setMenuOpen(false)}>NJDG</NavLink>
                        <NavLink to="/neethi" className="nav-neethi" onClick={() => setMenuOpen(false)}>
                            🤖 Neethi AI
                        </NavLink>
                    </nav>
                </div>
            </header>
        </>
    )
}
