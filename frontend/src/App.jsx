import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ManagerLogin from './ManagerLogin';
import HomePage from './HomePage';
import Header from './Header';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<ManagerLogin />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  )
}

export default App
