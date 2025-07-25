import {
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Form,
  Button,
} from "react-bootstrap";

function Sidebar() {
  return (
    <div className="bg-light h-100 d-flex flex-column pt-3 px-2" style={{ minHeight: 0 }}>
      <Nav defaultActiveKey="/home" className="flex-column flex-grow-1">
        <Nav.Link href="/home">Home</Nav.Link>
        <Nav.Link href="/events" eventKey="link-1">Akce</Nav.Link>
        <Nav.Link href="/reservations" eventKey="link-2">Rezervace</Nav.Link>
        <Nav.Link href="/squares" eventKey="link-3">Náměstí</Nav.Link>
      </Nav>
    </div>
  );
}

export default Sidebar;
