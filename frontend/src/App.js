import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import CVBuilder from './components/CVBuilder';
import './index.css';  // or './styles/main.css' if that's where you placed it

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cv-builder" element={<CVBuilder />} />
      </Routes>
    </Router>
  );
}

export default App;