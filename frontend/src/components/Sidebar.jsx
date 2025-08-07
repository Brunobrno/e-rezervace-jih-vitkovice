import {
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Form,
  Button,
} from "react-bootstrap";
import {
  IconHome,
  IconCalendarEvent,
  IconClipboardList,
  IconMapPin,
  IconUsers,
  IconReceipt2 ,
} from "@tabler/icons-react";

function Sidebar() {
  return (
    <div className="bg-light h-100 d-flex flex-column pt-3 px-2" style={{ minHeight: 0}}>
      <Nav defaultActiveKey="/home" className="flex-column flex-grow-1">
        <Nav.Link href="/home">
          <IconHome size={20} style={{ marginRight: 8, marginBottom: 2 }} />
          Home
        </Nav.Link>
        <hr />
        <Nav.Link href="/manage/squares" eventKey="link-3">
          <IconMapPin size={20} style={{ marginRight: 8, marginBottom: 2 }} />
          Náměstí
        </Nav.Link>
        <Nav.Link href="/manage/events" eventKey="link-1">
          <IconCalendarEvent size={20} style={{ marginRight: 8, marginBottom: 2 }} />
          Akce
        </Nav.Link>
        <hr />
        <Nav.Link href="/manage/reservations" eventKey="link-2">
          <IconClipboardList size={20} style={{ marginRight: 8, marginBottom: 2 }} />
          Rezervace
        </Nav.Link>
        <Nav.Link href="/manage/orders" eventKey="link-5">
          <IconReceipt2 size={20} style={{ marginRight: 8, marginBottom: 2 }} />
          Objednávky
        </Nav.Link>
        <hr />
        <Nav.Link href="/manage/users" eventKey="link-4">
          <IconUsers size={20} style={{ marginRight: 8, marginBottom: 2 }} />
          Uživatelé
        </Nav.Link>
      </Nav>
    </div>
  );
}

export default Sidebar;
