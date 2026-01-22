import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Profil from './pages/Profil';
import Collection from './pages/Collection';
import Scan from './pages/Scan';
import Combat from './pages/Combat';
import Parametres from './pages/Parametres';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Profil />} />
        <Route path="collection" element={<Collection />} />
        <Route path="scan" element={<Scan />} />
        <Route path="combat" element={<Combat />} />
        <Route path="parametres" element={<Parametres />} />
      </Route>
    </Routes>
  );
}

export default App;
