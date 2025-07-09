import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Register from './pages/Register';

function App() {

  return (
    <>
    <header>
      <NavBar />
    </header>
    
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/register" element={<Register />}/>
        <Route/>
        <Route/>  
      </Routes>

    <footer className="mt-auto">
      <p> 
        eTržnice © 
        <a href="mailto:helpdesk@vitkovice.com"> VÍTKOVICE IT SOLUTIONS a.s. </a>
             | 
        <a href="#"> Nápověda</a>
        </p>
    </footer>
    </>
    
  )
}

export default App
