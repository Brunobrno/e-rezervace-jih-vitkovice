import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket, faUser, faGear } from '@fortawesome/free-solid-svg-icons';

import React, { useState, useEffect } from 'react';
import logo from '/img/logo.png';
import { Link, useNavigate} from 'react-router-dom';

import {getCurrentUser, logout} from '../api/auth';


function NavBar(){

    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
      getCurrentUser()
        .then(data => {
          setUser(data);
        })
        .catch(err => {
          console.error("Failed to get user:", err);
          setUser(null);
        });
    }, []);


    const handleLogout = async () => {
      try {
        await logout();
        setUser(null);          // vymazat stav uživatele v Reactu
        navigate('/login');     // přesměrovat na přihlášení
      } catch (err) {
        console.error("Logout failed", err);
        // případně zobrazit chybu uživateli
      }
    };

    return (

        <Navbar expand="lg">
      <Container>
        <Navbar.Brand href="/">
            <img
              src={logo}
              className="d-none d-sm-block"
              alt="Ostrava-Jih"
            />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="navbar-nav ml-auto text-uppercase">
            {user != undefined && user != false ? (
              <> 
                
                <Nav.Link as={Link} to="/test">
                  TestLink
                </Nav.Link>
                <div className="vr m-2" style={{ width: '2px',background: '#003a6b' }} />
                <Nav.Link disabled as={Link} to="/settings"  className="text-secondary">
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  {user.username}
                </Nav.Link>
                {/*<div className="vr m-2" style={{ width: '2px',background: '#003a6b' }} />*/}
                <Nav.Link onClick={handleLogout}>
                  <FontAwesomeIcon icon={faRightFromBracket} /> 
                </Nav.Link>
                <Nav.Link as={Link} to="/settings"  className="text-secondary">
                  <FontAwesomeIcon icon={faGear} className="me-2" />
                </Nav.Link>
                
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Přihlásit se</Nav.Link>
                <Nav.Link as={Link} to="/register">Registrace</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
        
    ) 
}

export default NavBar