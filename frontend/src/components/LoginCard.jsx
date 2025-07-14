import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faKey } from '@fortawesome/free-solid-svg-icons'
import ToggleButton from "react-bootstrap/ToggleButton";
import Container from "react-bootstrap/Container";

function LoginCard() {
  return (
    <Card className="align-self-center">
      <Card.Header>
        <h3>Přihlášení</h3>
      </Card.Header>

      <Card.Body>
        <Form>
          <Form.Group
            className="input-group form-group"
            controlId="formBasicEmail"
          >
            <Form.Group className="input-group-prepend">
              <span class="input-group-text">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
            </Form.Group>
            <Form.Label hidden>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder=""
              required
              autoComplete="email"
              autofocus
              name="email"
              id="email"
            />
          </Form.Group>

          <Form.Group
            className="input-group form-group"
            controlId="formBasicPassword"
          >
            <Form.Group className="input-group-prepend">
              <span class="input-group-text">
                <FontAwesomeIcon icon={faKey} />
              </span>
            </Form.Group>
            <Form.Label hidden>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder=""
              required
              autoComplete="current-password"
              autofocus
              name="loginPassword"
              id="loginPassword"
            />
          </Form.Group>

          <Form.Group className="row form-group">
            <Col>
              <div class="custom-control custom-checkbox">
                <input
                  class="custom-control-input"
                  type="checkbox"
                  name="remember"
                  id="remember"
                />

                <label class="custom-control-label" for="remember">
                  Zapamatovat si mě
                </label>
              </div>
            </Col>
          </Form.Group>

          <Form.Group className="form-group">
            <Button type="submit" className="float-right login_btn">
              Přihlášení
            </Button>
          </Form.Group>
        </Form>
      </Card.Body>

      <Card.Footer>
        <Row>
          <Col className="links">
            <Button href="/register"variant="success" className="float-right text-white">
              {" "}
              Vytvořit účet stánkaře
            </Button>

            <div className="pt-1">
              <a href="#">
                Zapomenuté heslo?
              </a>
            </div>
          </Col>
        </Row>
      </Card.Footer>
    </Card>
  );
}

export default LoginCard;
