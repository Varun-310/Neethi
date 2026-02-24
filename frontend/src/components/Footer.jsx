import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="doj-footer">
            <div className="footer-main">
                <div className="footer-grid">
                    <div className="footer-col">
                        <h4>About</h4>
                        <ul>
                            <li><a href="https://doj.gov.in" target="_blank" rel="noopener noreferrer">Department of Justice</a></li>
                            <li><a href="https://lawmin.gov.in" target="_blank" rel="noopener noreferrer">Ministry of Law & Justice</a></li>
                            <li><a href="https://india.gov.in" target="_blank" rel="noopener noreferrer">National Portal of India</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Services</h4>
                        <ul>
                            <li><Link to="/ecourts">eCourts Services</Link></li>
                            <li><Link to="/tele-law">Tele-Law</Link></li>
                            <li><Link to="/legal-aid">NALSA Legal Aid</Link></li>
                            <li><Link to="/njdg">Judicial Data Grid</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Help</h4>
                        <ul>
                            <li><Link to="/neethi">Neethi AI Assistant</Link></li>
                            <li><a href="https://www.tele-law.in" target="_blank" rel="noopener noreferrer">Tele-Law Portal</a></li>
                            <li><a href="https://nalsa.gov.in" target="_blank" rel="noopener noreferrer">NALSA Portal</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Contact</h4>
                        <p className="footer-contact">
                            Department of Justice<br />
                            Jaisalmer House, 26 Man Singh Road<br />
                            New Delhi - 110011<br />
                            <a href="tel:011-23384526">011-23384526</a>
                        </p>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="footer-bottom-content">
                    <p>© {new Date().getFullYear()} Department of Justice, Government of India. All rights reserved.</p>
                    <p className="footer-note">
                        This is a demonstration project. Content designed by NIC and powered by Neethi AI.
                    </p>
                </div>
            </div>
        </footer>
    )
}
