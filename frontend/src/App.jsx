import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import '/node_modules/react-grid-layout/css/styles.css'
import '/node_modules/react-resizable/css/styles.css'
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateReservation from './pages/CreateReservation';
import SelectReservation from './pages/SelectReservation';
import Test from './pages/Test';

function App() {

  return (
    <>
    <header>
      <NavBar />
    </header>
    
      <Routes>
        <Route path="/" element={<Login />}/>
        <Route path="/register" element={<Register />}/>
        <Route path="/clerk/create/reservation" element={<CreateReservation />}/>
        <Route path="/seller/reservation" element={<SelectReservation />}/>
        <Route path="/test" element={<Test />}/>  
      </Routes>

    <footer className="mt-auto">
      <p> 
        eTržnice © 
        <a href="mailto:helpdesk@vitkovice.com"> VÍTKOVICE IT SOLUTIONS a.s. </a>
             | 
        <a href="/test"> Nápověda</a>
        </p>
    </footer>
    </>
    
  )
}

export default App
