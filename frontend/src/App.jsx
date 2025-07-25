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
import CreateReservation from "./pages/CreateReservation";
import SelectReservation from "./pages/SelectReservation";
import Test from "./pages/Test";
import EventsTree from "./components/EventsTree";
import EmailVerificationPage from "./pages/register/EmailVerification";
import Home from "./pages/Home";
import ResetPasswordPage from "./pages/PasswordReset";
import UserSettings from "./pages/Settings";

import RequireRole from "./components/security/RequireRole";
import RequireAuthLayout from "./components/security/RequireAuthLayout";

import Events from "./pages/Events";
import Squares from "./pages/Squares";
import Reservations from "./pages/Reservations";

function App() {
  return (
    <>
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

        <Route path="/home" element={<Home />} />
        <Route
          path="/clerk/create/reservation"
          element={<CreateReservation />}
        />

        <Route path="/seller/reservation" element={<SelectReservation />} />
        <Route path="/components" element={<EventsTree />} />
        <Route path="/test" element={<Test />} />
        {/* Na tyto stránky se dostanou jenom přihlášení uživatele */}
        <Route element={<RequireAuthLayout />}>
          <Route path="/squares" element={<Squares />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<Events />} />

          <Route path="/settings" element={<UserSettings />} />

          {/* Admin - tady si můžeš specifikovat roli která má oprávnění */}
          
          <Route element={<RequireRole roles={["admin"]} />}>
            <Route path="/test" element={<Test />} />
          </Route>
        </Route>
      </Routes>

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

export default App;
