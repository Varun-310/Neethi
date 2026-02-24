import { Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'
import Home from './pages/Home'
import ECourts from './pages/ECourts'
import TeleLaw from './pages/TeleLaw'
import LegalAid from './pages/LegalAid'
import NJDG from './pages/NJDG'
import Neethi from './pages/Neethi'
import './doj-theme.css'

function ScrollToTop() {
    const { pathname } = useLocation()
    useEffect(() => { window.scrollTo(0, 0) }, [pathname])
    return null
}

function Layout() {
    const { pathname } = useLocation()
    const isNeethiPage = pathname === '/neethi'

    return (
        <div className="doj-app">
            <ScrollToTop />
            <Header />
            <main className={`doj-main ${isNeethiPage ? 'full-height' : ''}`}>
                <Outlet />
            </main>
            {!isNeethiPage && <Footer />}
            {!isNeethiPage && <ChatWidget />}
        </div>
    )
}

export default function AppV2() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/ecourts" element={<ECourts />} />
                <Route path="/tele-law" element={<TeleLaw />} />
                <Route path="/legal-aid" element={<LegalAid />} />
                <Route path="/njdg" element={<NJDG />} />
                <Route path="/neethi" element={<Neethi />} />
            </Route>
        </Routes>
    )
}
