import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button
} from "react-bootstrap";
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useOutletContext } from "react-router-dom";

function Home() {
  const { user } = useOutletContext();

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center p-4"
      style={{ height: "100vh" }}
    >
      <Card className="shadow position-relative" style={{ width: '28rem' }}>
        
        {/* Badge s rolí v pravém horním rohu */}
        <Badge
          bg="secondary"  // šedé pozadí
          text="white"     // bílý text
          className="fs-4 position-absolute top-0 start-0 m-2"
          style={{ fontSize: "0.8rem", zIndex: 1 , right: "0"}}
        >
          {user.role}
        </Badge>
        <br />

        <Card.Body>
          <Card.Title className="mb-3">
          </Card.Title>

          <Container>
            <Row>
              <Col>Přihlášen jako: <strong>{user.username}</strong></Col>
              <Col>{user.account_type}</Col>
            </Row>
            <hr />
            <Row className="mb-2">
              <Col><strong>Jméno:</strong> {user.first_name}</Col>
              <Col><strong>Příjmení:</strong> {user.last_name}</Col>
              
            </Row>

            <hr />
            <h4 className="text-secondary">Adresa</h4>
            <Row className="mb-2">
              
              <Col><strong>Město:</strong> {user.city}</Col>
              <Col><strong>Ulice:</strong> {user.street}</Col>
            </Row>
            <Row>
              <Col><strong>PSČ:</strong> {user.PSC}</Col>

            </Row>
            <hr />
            <h4 className="text-secondary">Kontaktní údaje</h4>

            <Row className="">
              <Col><strong>Tel:</strong> {user.phone_number}</Col>
            </Row>
            <Row>
              <Col><strong>Účet:</strong> {user.bank_account}</Col>

            </Row>
            <Row>
              <Col><strong>E-mail:</strong> {user.email}</Col>

            </Row>
          </Container>

          <div className="d-flex justify-content-between mt-4">
            <Link to="/settings" className="fs-4 btn btn-outline-secondary border-0">
              <FontAwesomeIcon icon={faGear} className="me-2" />
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Home;
