import React from 'react';
import ThreeScene from './components/ThreeScene';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="hero-section" style={{ height: '60vh', width: '100%', position: 'relative' }}>
        <ThreeScene />
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '0.9rem',
          pointerEvents: 'none'
        }}>
          Scroll to explore
        </div>
      </header>
    </div>
  );
}

export default App;
