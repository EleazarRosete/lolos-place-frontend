import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import styles from './Admin.module.css';
import Dashboard from './Sections/Dashboard/Dashboard.jsx';
import POS from './Sections/POS/POS.jsx';
import Inventory from './Sections/Inventory/Inventory.jsx';
import Feedback from './Sections/Feedback/Feedback.jsx';
import AdminSettings from './Sections/Admin Settings/AdminSettings.jsx';
import Purchases from './Sections/Purchases/Purchases.jsx';


import user from './assets/user.svg';
import dashboardIcon from './assets/dashboard.png';
import posIcon from './assets/menu.png';
import inventoryIcon from './assets/inventory.png';
import feedbackIcon from './assets/feedback.png';
import analyticsIcon from './assets/analytics.png';
import logoutIcon from './assets/logout.png';







const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);
  
    useEffect(() => {
      const media = window.matchMedia(query);
      const listener = () => setMatches(media.matches);
      
      media.addEventListener("change", listener);
      
      return () => media.removeEventListener("change", listener);
    }, [query]);
  
    return matches;
  };



const Admin = () => {
    const navigate = useNavigate();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isAsideVisible, setIsAsideVisible] = useState(true);
    const isLargeScreen = useMediaQuery("(min-width: 1221px)");

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

    const toggleAside = () => {
        setIsAsideVisible(prevState => !prevState);
        console.log(isAsideVisible);
    };

    return (
        <section className={styles.MainSection}>
            <aside className={`${styles.aside} ${!isAsideVisible ? styles.hidden : styles.show} `}>
                <div className={styles.logoContainer}>
                    <img src={user} alt="user" className={styles.userIcon} />
                    <h1 className={styles.lolosplaceuser}>LoLo's Place Admin</h1>
                </div>
                <div className={styles.navbuttons}>
                <div className={styles.navgroup1}>

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
                <button className={styles.sideButton} onClick={() => navigateToSection('adminSettings')}>
                    <img src={analyticsIcon} alt="adminSettings" className={styles.buttonIcons} /> Admin
                </button>
                <button className={styles.sideButton} onClick={handleLogout}>
                    <img src={logoutIcon} alt="logout" className={styles.buttonIcons} /> Logout
                </button>
                </div>
                </div>
                

  
            </aside>

            <div className={styles.mainContent}>
                <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="pos/*" element={<POS />} />
                    <Route path="orders/*" element={<Purchases />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="feedback" element={<Feedback />} />
                    <Route path="adminSettings" element={<AdminSettings />} />
                    <Route path="*" element={<Navigate to="dashboard" />} />
                </Routes>
            </div>

            <button className={styles.burgerButton} onClick={toggleAside}>
                ☰
            </button>

            {isLogoutOpen && (
                    <div className={styles.logoutModal}>
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


        </section>
    );
};

export default Admin;
