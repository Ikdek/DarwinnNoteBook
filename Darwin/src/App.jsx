import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Profil from './pages/Profil';
import Collection from './pages/Collection';
import Scan from './pages/Scan';
import Combat from './pages/Combat';
import Parametres from './pages/Parametres';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute'; // Assuming this exists or I will verify
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Profil />} />
          <Route path="collection" element={<Collection />} />
          <Route path="scan" element={<Scan />} />
          <Route path="combat" element={<Combat />} />
          <Route path="parametres" element={<Parametres />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
