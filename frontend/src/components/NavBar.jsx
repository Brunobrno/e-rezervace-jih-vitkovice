import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';


function NavBar(){

    return (

        <Navbar expand="lg">
      <Container>
        <Navbar.Brand href="#home">
            <img
              src="./src/assets/img/logo.png"
              className="d-none d-sm-block"
              alt="React Bootstrap logo"
            />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="navbar-nav ml-auto text-uppercase">
            <Nav.Link href="#home">Přihlášení </Nav.Link>
            
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
        
    ) 
}

export default NavBar