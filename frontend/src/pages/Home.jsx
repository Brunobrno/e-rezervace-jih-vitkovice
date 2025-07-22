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
    <Container fluid className="p-0">
      <Row>
        <Col xs={2} className="px-0 bg-light">
          <Sidebar />
        </Col>
        <Col xs={10} className="px-0 bg-white">
          <EventsTree />
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
