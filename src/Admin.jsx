import { useState } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import styles from './Admin.module.css';
import Dashboard from './Sections/Dashboard/Dashboard.jsx';
import POS from './Sections/POS/POS.jsx';
import Inventory from './Sections/Inventory/Inventory.jsx';
import Feedback from './Sections/Feedback/Feedback.jsx';
import Analytics from './Sections/Analytics/Analytics.jsx';
import Purchases from './Sections/Purchases/Purchases.jsx';




import dashboardIcon from './assets/dashboard.png';
import posIcon from './assets/menu.png';
import inventoryIcon from './assets/inventory.png';
import feedbackIcon from './assets/feedback.png';
import analyticsIcon from './assets/analytics.png';
import logoutIcon from './assets/logout.png';

const Admin = () => {
    const navigate = useNavigate();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

    const handleLogout = () => {
        setIsLogoutOpen(true);
    };

    const confirmLogout = () => {
        setIsLogoutOpen(false);
        navigate("/login");
    };

    const cancelLogout = () => {
        setIsLogoutOpen(false);
    };

    const navigateToSection = (section) => {
        navigate(`/admin/${section}`);
    };

    return (
        <section className={styles.MainSection}>
            <aside className={styles.aside}>
                <div className={styles.logoContainer}>
                    <h1 className={styles.dinerName}>LoLo's Place</h1>
                    <h2 className={styles.restaurant}>Restaurant</h2>
                </div>
                <button className={styles.sideButton} onClick={() => navigateToSection('dashboard')}>
                    <img src={dashboardIcon} alt="dashboard" className={styles.buttonIcons} /> Dashboard
                </button>
                <button className={styles.sideButton} onClick={() => navigateToSection('pos')}>
                    <img src={posIcon} alt="point of sale" className={styles.buttonIcons} /> Point of Sale
                </button>
                <button className={styles.sideButton} onClick={() => navigateToSection('orders')}>
                    <img src={posIcon} alt="orders" className={styles.buttonIcons} /> Orders
                </button>
                <button className={styles.sideButton} onClick={() => navigateToSection('inventory')}>
                    <img src={inventoryIcon} alt="inventory" className={styles.buttonIcons} /> Inventory
                </button>
                <button className={styles.sideButton} onClick={() => navigateToSection('feedback')}>
                    <img src={feedbackIcon} alt="feedback" className={styles.buttonIcons} /> Feedback
                </button>
                <button className={styles.sideButton} onClick={() => navigateToSection('analytics')}>
                    <img src={analyticsIcon} alt="analytics" className={styles.buttonIcons} /> Analytics
                </button>
                <button className={styles.sideButton} onClick={handleLogout}>
                    <img src={logoutIcon} alt="logout" className={styles.buttonIcons} /> Logout
                </button>

                {isLogoutOpen && (
                    <div className={styles.modalLogout}>
                        <div className={styles.logoutOverlay}>
                            <div className={styles.logout}>
                                <h2>Confirm logout</h2>
                                <p>Are you sure you want to log out?</p>
                                <div className={styles.logoutButtons}>
                                    <button onClick={confirmLogout} className={styles.confirmButton}>Yes</button>
                                    <button onClick={cancelLogout} className={styles.cancelButton}>No</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            <div className={styles.mainContent}>
                <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="pos/*" element={<POS />} />
                    <Route path="orders" element={<Purchases />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="feedback" element={<Feedback />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="*" element={<Navigate to="dashboard" />} />
                </Routes>
            </div>
        </section>
    );
};

export default Admin;
