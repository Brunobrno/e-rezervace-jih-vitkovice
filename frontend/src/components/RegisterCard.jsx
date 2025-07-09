import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ToggleButton from "react-bootstrap/ToggleButton";
import Container from "react-bootstrap/Container";
import InputGroup from "react-bootstrap/InputGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

function RegisterCard() {
  return (
    <Card>
      <Card.Header className="form-top">
        <div className="form-top-left">
          <h3>Registrační formulář</h3>
          <p>Vyplňte níže požadované údaje</p>
        </div>

        <div className="form-top-right">
          <FontAwesomeIcon icon={faLock} />
        </div>
      </Card.Header>

      <Card.Body className="form-bottom">
        <Form>
          <Form.Group className="input-group form-group">
            <Form.Label hidden>Email</Form.Label>
            <InputGroup>

              <div className="input-group-prepend">
                <InputGroup.Text className="isize">
                  <FontAwesomeIcon icon={faEnvelope} />
                  &nbsp; Email
                </InputGroup.Text>
              </div>

              <Form.Control
                type="email"
                placeholder=""
                aria-label="registerEmail"
                aria-describedby="registerEmail"
                value="@"
                name="registerEmail"
                id="registerEmail"
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="input-group form-group">
            <Form.Label hidden>Phone</Form.Label>
            <InputGroup>

              <div className="input-group-prepend">
                <InputGroup.Text className="isize">
                  <FontAwesomeIcon icon={faEnvelope} />
                  &nbsp; Telefon
                </InputGroup.Text>
              </div>

              <Form.Control
                type="text"
                placeholder=""
                aria-label="registerPhone"
                aria-describedby="registerPhone"
                value="+420"
                name="rregisterPhone"
                id="registerPhone"
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="input-group form-group">
            <Form.Label hidden>Flat number</Form.Label>
            <InputGroup>

              <div className="input-group-prepend">
                <InputGroup.Text className="isize">
                  <FontAwesomeIcon icon={faEnvelope} />
                  &nbsp; Číslo bytu
                </InputGroup.Text>
              </div>

              <Form.Control
                type="text"
                placeholder=""
                aria-label="registerFlatNumber"
                aria-describedby="registerFlatNumber"
                value=""
                name="rregisterFlatNumber"
                id="registerFlatNumber"
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="input-group form-group">
            <Form.Label hidden>SIPO</Form.Label>
            <InputGroup>

              <div className="input-group-prepend">
                <InputGroup.Text className="isize">
                  <FontAwesomeIcon icon={faEnvelope} />
                  &nbsp; SIPO
                </InputGroup.Text>
              </div>

              <Form.Control
                type="text"
                placeholder=""
                aria-label="registerSIPO"
                aria-describedby="registerSIPO"
                value=""
                name="rregisterSIPO"
                id="registerSIPO"
              />
            </InputGroup>
          </Form.Group>

          <Form.Group></Form.Group>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default RegisterCard;
