import {
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Form,
  Button,
  Row,
  Col,
} from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import EventsTree from "../components/EventsTree";

function Home() {
  return (
    <Container fluid className="p-0" style={{ overflowX: 'hidden' }}>
      <Row className="mx-0">
        <Col xs={2} className="px-0 bg-light w-100" style={{ minWidth: 0 }}>
          <Sidebar />
        </Col>
        <Col xs={10} className="px-0 bg-white w-100" style={{ minWidth: 0 }}>
          <EventsTree />
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
