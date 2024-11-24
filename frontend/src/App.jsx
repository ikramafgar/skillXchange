// eslint-disable-next-line no-unused-vars
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';  // Import Navbar


// Pages
import Home from './pages/Home';  // Home page
import About from './pages/About';  // About page
import Login from './pages/Login';  // Login page
import Signup from './pages/Signup'; // Signup page
import Skills from './pages/Skills';  // Skills page
import Profile from './pages/Profile';  // Profile page
import Dashboard from './pages/Dashboard';  // Dashboard page


function App() {
  return (
    <Router>
      <Navbar />  {/* Navbar is used here */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
