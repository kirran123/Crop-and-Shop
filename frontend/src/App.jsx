import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import FarmerDashboard from './pages/FarmerDashboard';
import CustomerMarketplace from './pages/CustomerMarketplace';
import AdminDashboard from './pages/AdminDashboard';
import ChatbotWidget from './components/ChatbotWidget';
import SessionManager from './components/SessionManager';
import './index.css';

// Wrapper to conditionally hide Chatbot on login page
const AppContent = () => {
  const location = useLocation();
  const showChatbot = location.pathname !== '/login';

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/farmer" element={<FarmerDashboard />} />
        <Route path="/customer" element={<CustomerMarketplace />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      {showChatbot && <ChatbotWidget />}
    </>
  );
};

function App() {
  return (
    <Router>
      <SessionManager>
        <AppContent />
      </SessionManager>
    </Router>
  );
}

export default App;
