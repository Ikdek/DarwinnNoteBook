import React, { useState } from 'react';
import ThreeScene from './components/ThreeScene';
import './App.css';

const Parametre = () => <div style={{ padding: '2rem', textAlign: 'center' }}><h2>Paramètres</h2></div>;
const Scan = () => <div style={{ padding: '2rem', textAlign: 'center' }}><h2>Scan</h2></div>;
const Combat = () => <div style={{ padding: '2rem', textAlign: 'center' }}><h2>Combat</h2></div>;

const Profil = () => (
  <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <div style={{ flex: '1', position: 'relative', minHeight: '300px' }}>
      <ThreeScene />
      <div style={{
        position: 'absolute',
        bottom: '10px',
        width: '100%',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.8rem',
        pointerEvents: 'none'
      }}>
        Mon Avatar
      </div>
    </div>
    <div style={{ padding: '1rem' }}>
      <h3>Statistiques</h3>
      <div style={{ background: '#2a2a30', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
        Niveau: 12
      </div>
      <div style={{ background: '#2a2a30', padding: '10px', borderRadius: '8px' }}>
        Expérience: 4500 / 5000
      </div>
    </div>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('profil');

  const renderContent = () => {
    switch (activeTab) {
      case 'profil': return <Profil />;
      case 'collection': return <MockCollection />;
      case 'scan': return <Scan />;
      case 'combat': return <Combat />;
      case 'parametre': return <Parametre />;
      default: return <Profil />;
    }
  };

  return (
    <div className="app-container">
      <div className="phone-frame">
        <div className="content-area">
          {renderContent()}
        </div>

        <div className="bottom-nav">
          <button
            className={`nav-item ${activeTab === 'profil' ? 'active' : ''}`}
            onClick={() => setActiveTab('profil')}
          >
            <span className="nav-icon">👤</span>
            <span>Profil</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'collection' ? 'active' : ''}`}
            onClick={() => setActiveTab('collection')}
          >
            <span className="nav-icon">🎒</span>
            <span>Collection</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'scan' ? 'active' : ''}`}
            onClick={() => setActiveTab('scan')}
          >
            <span className="nav-icon">📷</span>
            <span>Scan</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'combat' ? 'active' : ''}`}
            onClick={() => setActiveTab('combat')}
          >
            <span className="nav-icon">⚔️</span>
            <span>Combat</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'parametre' ? 'active' : ''}`}
            onClick={() => setActiveTab('parametre')}
          >
            <span className="nav-icon">⚙️</span>
            <span>Paramètre</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
