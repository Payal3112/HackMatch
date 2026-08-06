import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Loader from './pages/Loader';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-surface-50 text-surface-900 font-sans">
        <Routes>
          <Route path="/" element={<Loader />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/:tab/*" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
