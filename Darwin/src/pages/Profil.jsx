import React from 'react';
import ThreeScene from '../components/ThreeScene';

const Profil = () => {
    return (
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
};

export default Profil;
