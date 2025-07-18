import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import '/node_modules/react-grid-layout/css/styles.css'
import '/node_modules/react-resizable/css/styles.css'
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Register from './pages/register/Register';
import CreateReservation from './pages/CreateReservation';
import SelectReservation from './pages/SelectReservation';
import Test from './pages/Test';
import EventsTree from './components/EventsTree';
import EmailVerificationPage from './pages/register/EmailVerification';
import Home from './pages/Home';
import RequestPasswordPage from './pages/reset-password/Request';
import CreatePasswordPage from './pages/reset-password/Create';

function App() {

  return (
    <>
    <header>
      <NavBar />
    </header>
    
      <Routes>
        <Route path="/" element={<Login />}/>
        <Route path="/login" element={<Login />}/>

        <Route path="/register" element={<Register />}/>
        <Route path="/email-verification" element={<EmailVerificationPage />} />

        // FIXME - Po předání tokenu se stále načíta požadavek o email
        <Route path="/reset-password" element={<RequestPasswordPage />} />
        <Route path="/reset-password/:uidb64/:token" element={<CreatePasswordPage />} />


        
        <Route path="/home" element={<Home />}/>
        <Route path="/clerk/create/reservation" element={<CreateReservation />}/>
        <Route path="/seller/reservation" element={<SelectReservation />}/>
        <Route path="/components" element={<EventsTree />}/>
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
