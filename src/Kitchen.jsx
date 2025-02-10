import { useState } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import styles from './Admin.module.css';
import KitchenStatus from './Sections/KitchenStatus/KitchenStatus.jsx';

import user from './assets/user.svg';
import posIcon from './assets/menu.png';
import logoutIcon from './assets/logout.png';

const Cashier = () => {
    const navigate = useNavigate();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isAsideVisible, setIsAsideVisible] = useState(true);

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
        navigate(`/kitchen/${section}`);
    };

    const toggleAside = () => {
        setIsAsideVisible(prevState => !prevState);
    };

    return (
      <section className={styles.MainSection}>

            <div className={styles.mainContent}>
                <Routes>
                    <Route path="*" element={<KitchenStatus />} />
                </Routes>
            </div>

        </section>
    );
};

export default Cashier;
