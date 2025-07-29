import React, { useContext } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket, faUser, faTicket } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';

import logo from '/img/logo.png';
import { logout } from '../api/auth';
import { UserContext } from '../context/UserContext';

function NavBar() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <Navbar expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/home">
          <img src={logo} className="d-none d-sm-block" alt="Ostrava-Jih" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto text-uppercase ml-auto">
            {user ? (
              <>
                <Nav.Link as={Link} to="/tickets">
                  <FontAwesomeIcon icon={faTicket} className="mr-2" />
                  Tikety
                </Nav.Link>
                <div className="vr mx-2" style={{ width: '2px', background: '#003a6b' }} />
                <Nav.Link as={Link} to="/home">
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  {user.username}
                </Nav.Link>
                <Nav.Link onClick={handleLogout} style={{ cursor: 'pointer' }}>
                  <FontAwesomeIcon icon={faRightFromBracket} />
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
  );
}

export default NavBar;
