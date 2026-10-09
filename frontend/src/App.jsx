import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ListingsBrowse from './pages/ListingsBrowse';
import ListingDetail from './pages/ListingDetail';
import PreferencesPage from './pages/PreferencesPage';
import FindFlatmates from './pages/FindFlatmates';
import MyMatches from './pages/MyMatches';
import TiffinServices from './pages/TiffinServices';
import CityChatWidget from './components/CityChatWidget';
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
            <Route path="/find-flatmates" element={<FindFlatmates />} />
            <Route path="/matches" element={<FindFlatmates />} />
            <Route path="/my-matches" element={<MyMatches />} />
            <Route path="/tiffin-services" element={<TiffinServices />} />
          </Route>
        </Routes>
        <CityChatWidget />
      </Router>
    </AuthProvider>
  );
}

export default App;
