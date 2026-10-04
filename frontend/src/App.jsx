import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ListingsBrowse from './pages/ListingsBrowse';
import ListingDetail from './pages/ListingDetail';
import PreferencesPage from './pages/PreferencesPage';
import RoommateMatches from './pages/RoommateMatches';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<ListingsBrowse />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/preferences" element={<PreferencesPage />} />
            <Route path="/matches" element={<RoommateMatches />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
