import { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:8000'

export default function NJDG() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${API_BASE}/njdg/stats`)
            .then(r => r.json())
            .then(data => setStats(data))
            .catch(() => setStats({ error: true }))
            .finally(() => setLoading(false))
    }, [])

    const formatNum = (n, unit = 'Cr') => {
        if (unit === 'Cr') return (n / 10000000).toFixed(1) + ' Cr'
        if (unit === 'L') return (n / 100000).toFixed(1) + ' L'
        return n.toLocaleString('en-IN')
    }

    return (
        <div className="page-njdg">
            <section className="page-hero" style={{ '--hero-color': '#4c1d95' }}>
                <h1>📊 National Judicial Data Grid</h1>
                <p>Real-time data on case pendency and disposal across Indian courts</p>
            </section>

            <div className="page-content">
                {loading && (
                    <div className="loading-state">
                        <span className="page-spinner"></span>
                        <p>Loading judicial statistics...</p>
                    </div>
                )}

                {stats?.error && (
                    <div className="result-error">Unable to load statistics. Please try again later.</div>
                )}

                {stats?.data && (
                    <>
                        {/* Key Headline Stats */}
                        <section className="njdg-headlines">
                            <div className="headline-card primary">
                                <div className="headline-num">{formatNum(stats.data.total_pending_cases)}</div>
                                <div className="headline-label">Total Pending Cases</div>
                            </div>
                            <div className="headline-card">
                                <div className="headline-num">{formatNum(stats.data.district_courts?.pending)}</div>
                                <div className="headline-label">District Courts</div>
                            </div>
                            <div className="headline-card">
                                <div className="headline-num">{formatNum(stats.data.high_courts?.pending, 'L')}</div>
                                <div className="headline-label">High Courts</div>
                            </div>
                            <div className="headline-card green">
                                <div className="headline-num">{stats.data.disposal_rate?.disposal_percentage}%</div>
                                <div className="headline-label">Disposal Rate</div>
                            </div>
                        </section>

                        {/* Daily Filing vs Disposal */}
                        <section className="content-card">
                            <h2>Daily Filing vs Disposal</h2>
                            <div className="comparison-bars">
                                <div className="comp-item">
                                    <div className="comp-label">
                                        <span>📥 Daily Filing</span>
                                        <strong>{stats.data.disposal_rate?.daily_filing?.toLocaleString('en-IN')}</strong>
                                    </div>
                                    <div className="comp-bar">
                                        <div className="comp-fill filing" style={{ width: '90%' }}></div>
                                    </div>
                                </div>
                                <div className="comp-item">
                                    <div className="comp-label">
                                        <span>📤 Daily Disposal</span>
                                        <strong>{stats.data.disposal_rate?.daily_disposal?.toLocaleString('en-IN')}</strong>
                                    </div>
                                    <div className="comp-bar">
                                        <div className="comp-fill disposal" style={{ width: '95%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Top States */}
                        <section className="content-card">
                            <h2>Top 5 States by Pending Cases</h2>
                            <div className="state-bars">
                                {stats.data.top_states?.map((state, i) => {
                                    const max = stats.data.top_states[0].pending
                                    const pct = (state.pending / max) * 100
                                    return (
                                        <div key={i} className="state-bar-item">
                                            <div className="state-bar-label">
                                                <span className="state-rank">#{i + 1}</span>
                                                <span className="state-name">{state.name}</span>
                                                <span className="state-count">{formatNum(state.pending, 'L')} cases</span>
                                            </div>
                                            <div className="state-bar-track">
                                                <div
                                                    className="state-bar-fill"
                                                    style={{ width: `${pct}%`, animationDelay: `${i * 0.1}s` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>

                        {/* Age-wise Distribution */}
                        <section className="content-card">
                            <h2>Age-wise Case Distribution</h2>
                            <div className="age-grid">
                                {[
                                    { label: '< 1 Year', key: 'under_1_year', color: '#22c55e' },
                                    { label: '1-3 Years', key: '1_to_3_years', color: '#eab308' },
                                    { label: '3-5 Years', key: '3_to_5_years', color: '#f97316' },
                                    { label: '5-10 Years', key: '5_to_10_years', color: '#ef4444' },
                                    { label: '> 10 Years', key: 'above_10_years', color: '#dc2626' }
                                ].map(item => (
                                    <div key={item.key} className="age-card" style={{ '--age-color': item.color }}>
                                        <div className="age-value">{formatNum(stats.data.age_wise?.[item.key], 'L')}</div>
                                        <div className="age-label">{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Court Type Breakdown */}
                        <section className="content-card">
                            <h2>Court Type Breakdown</h2>
                            <div className="court-breakdown">
                                <div className="court-type">
                                    <h3>District Courts</h3>
                                    <div className="court-split">
                                        <div className="split-item">
                                            <span className="split-label">Civil</span>
                                            <span className="split-value">{formatNum(stats.data.district_courts?.civil, 'L')}</span>
                                        </div>
                                        <div className="split-item">
                                            <span className="split-label">Criminal</span>
                                            <span className="split-value">{formatNum(stats.data.district_courts?.criminal, 'L')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="court-type">
                                    <h3>High Courts</h3>
                                    <div className="court-split">
                                        <div className="split-item">
                                            <span className="split-label">Civil</span>
                                            <span className="split-value">{formatNum(stats.data.high_courts?.civil, 'L')}</span>
                                        </div>
                                        <div className="split-item">
                                            <span className="split-label">Criminal</span>
                                            <span className="split-value">{formatNum(stats.data.high_courts?.criminal, 'L')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {stats.source === 'demo' && (
                            <div className="demo-notice-inline">
                                ℹ️ {stats.note || 'This data is for demonstration. Visit njdg.ecourts.gov.in for live statistics.'}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
