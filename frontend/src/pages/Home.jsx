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
     <Container fluid className="p-0 d-flex flex-column" style={{ 
      overflowX: 'hidden',
      height: '100vh' // Full viewport height
    }}>
      <Row className="mx-0 flex-grow-1"> {/* Make row grow to fill space */}
        <Col xs={2} className="px-0 bg-light" style={{ minWidth: 0 }}>
          <Sidebar />
        </Col>
        <Col 
          xs={10} 
          className="px-0 bg-white d-flex flex-column" 
          style={{ minWidth: 0 }}
        >
          <EventsTree />
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
