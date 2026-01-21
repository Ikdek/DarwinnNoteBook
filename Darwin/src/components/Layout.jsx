import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const isActive = (path) => {
        if (path === '/' && currentPath === '/') return true;
        if (path !== '/' && currentPath.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="app-container">
            <div className="phone-frame">
                <div className="content-area">
                    <Outlet />
                </div>

                <div className="bottom-nav">
                    <button
                        className={`nav-item ${isActive('/') ? 'active' : ''}`}
                        onClick={() => navigate('/')}
                    >
                        <span className="nav-icon">👤</span>
                        <span>Profil</span>
                    </button>

                    <button
                        className={`nav-item ${isActive('/collection') ? 'active' : ''}`}
                        onClick={() => navigate('/collection')}
                    >
                        <span className="nav-icon">🎒</span>
                        <span>Collection</span>
                    </button>

                    <button
                        className={`nav-item ${isActive('/scan') ? 'active' : ''}`}
                        onClick={() => navigate('/scan')}
                    >
                        <span className="nav-icon">📷</span>
                        <span>Scan</span>
                    </button>

                    <button
                        className={`nav-item ${isActive('/combat') ? 'active' : ''}`}
                        onClick={() => navigate('/combat')}
                    >
                        <span className="nav-icon">⚔️</span>
                        <span>Combat</span>
                    </button>

                    <button
                        className={`nav-item ${isActive('/parametres') ? 'active' : ''}`}
                        onClick={() => navigate('/parametres')}
                    >
                        <span className="nav-icon">⚙️</span>
                        <span>Paramètre</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Layout;
