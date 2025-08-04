import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Login from "./pages/Login";
import Register from "./pages/register/Register";
import SelectReservation from "./pages/SelectReservation";
import Test from "./pages/Test";
import EmailVerificationPage from "./pages/register/EmailVerification";
import Home from "./pages/Home";
import PaymentPage from "./pages/PaymentPage";
import ResetPasswordPage from "./pages/PasswordReset";
import UserSettings from "./pages/Settings";

import RequireRole from "./components/security/RequireRole";
import RequireAuthLayout from "./components/security/RequireAuthLayout";

import Events from "./pages/manager/Events";
import Squares from "./pages/manager/Squares";
import Reservations from "./pages/manager/Reservations";
import Ticket from "./pages/Ticket";
import MapEditor from "./pages/MapEditor";
import SquareDesigner from "./pages/manager/create/SquareDesigner";

import Users from "./pages/manager/Users";
import ReservationCart from "./pages/Reservation-cart"

import { UserProvider } from './context/UserContext';

function App() {
  return (
    <>
      <UserProvider>

      
        <header>
          <NavBar />
        </header>

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          // after user registers, they will be redirected from email, to the
          email verification page
          <Route path="/email-verification" element={<EmailVerificationPage />} />
          <Route path="/email-verification/:uidb64/:token" element={<EmailVerificationPage />}/>

          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/reset-password/:uidb64/:token" element={<ResetPasswordPage />}/>

          {/*test*/}

          {/*<Route path="/seller/reservation" element={<SelectReservation />} />*/}

          
          {/* AUTHENTICATED */}
          <Route element={<RequireAuthLayout />}>
            <Route path="/tickets" element={<Ticket />} />

            <Route path="/home" element={<Home />} />

            

            <Route path="/settings" element={<UserSettings />} />
            
            <Route path="/payment/:orderId" element={<PaymentPageWrapper />} />

            {/* ADMIN */}
            <Route element={<RequireRole roles={["admin"]} />}>
              <Route path="/test" element={<Test />} />
            </Route>

            {/* SELLER && ADMIN */}
            <Route element={<RequireRole roles={["seller", "admin"]} />}>
              <Route path="/create-reservation" element={<ReservationCart />} />
            </Route>

            {/* CLERK & ADMIN */}
            <Route element={<RequireRole roles={[ "admin"]} />}>

              <Route path="/manage/users" element={<Users />} />
              <Route path="/manage/squares" element={<Squares />} />
              <Route path="/manage/squares/designer" element={<SquareDesigner />} />
              <Route path="/manage/reservations" element={<Reservations />} />
              <Route path="/manage/events" element={<Events />} />
              <Route path="/manage/events/:id" element={<Events />} />

              <Route path="/manage/events/map/:eventId" element={<MapEditor />} />
            </Route>
          </Route>
        </Routes>
      </UserProvider>

      <footer className="mt-auto">
        <p>
          eTržnice ©
          <a href="mailto:helpdesk@vitkovice.com">
            {" "}
            VÍTKOVICE IT SOLUTIONS a.s.{" "}
          </a>
          |<a href="/test"> Nápověda</a>
        </p>
      </footer>
    </>
  );
}
import { useParams } from "react-router-dom";

function PaymentPageWrapper() {
  const { orderId } = useParams();
  return <PaymentPage orderId={orderId} />;
}

export default App;
