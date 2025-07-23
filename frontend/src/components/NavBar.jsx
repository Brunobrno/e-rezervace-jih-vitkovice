import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import logo from '/img/logo.png';


function NavBar(){

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
            <Nav.Link href="/login">Přihlášení </Nav.Link>
            
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
        
    ) 
}

export default NavBar