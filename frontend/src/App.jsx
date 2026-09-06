import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import api from './services/api';
import './index.css';

function Home() {
  const [healthStatus, setHealthStatus] = useState('Checking...');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/health')
      .then(response => {
        setHealthStatus(response.data.status === 'UP' ? 'Backend is UP!' : 'Backend returned unexpected status');
      })
      .catch(error => {
        console.error("Health check failed", error);
        setHealthStatus('Backend is DOWN or unreachable');
      });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex items-center space-x-4">
        <span className="text-gray-300">Welcome, <strong>{user?.name || 'User'}</strong> ({user?.role})</span>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition"
        >
          Logout
        </button>
      </div>

      <h1 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
        Hello SettleIn
      </h1>
      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700">
        <h2 className="text-2xl font-semibold mb-4">System Status</h2>
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full ${healthStatus === 'Backend is UP!' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.7)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]'}`}></div>
          <p className="text-lg text-gray-300">{healthStatus}</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
