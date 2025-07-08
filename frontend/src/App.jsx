import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';

function App() {

  return (
    <>
    <header>
      <NavBar />
    </header>
    
    <div className='main'>
      <Routes>
        <Route path="" element={<Home />}/>
        <Route/>
        <Route/>
        <Route/>  
      </Routes>
    </div>
    <footer className="text-center mt-auto">
      <p> 
        ePřepážka © 
        <a href="mailto:helpdesk@vitkovice.com"> VÍTKOVICE IT SOLUTIONS a.s. </a>
             | 
        <a href="https://e-prepazka.ovajih.cz/portal/help"> Nápověda</a>
        </p>
    </footer>
    </>
    
  )
}

export default App
