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
import { useState } from "react";

import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";


function LoginCard() {

  const navigate = useNavigate();

  // Stavy pro email a heslo
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Zpracování formuláře
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const success = await login(email, password);
      if (success) {
        navigate("/home")
        console.log("Přihlášení bylo úspěšné");
      }
    } catch (error) {
      console.error("Chyba při přihlášení:", error);
      const err = error.response.data.non_field_errors || "Neočekávaná chyba při přihlášení.";
      
      setErrorMessage(err);
    }
  };

  return (
    <Card className="align-self-center">
      <Card.Header>
        <h3>Přihlášení</h3>
      </Card.Header>

      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group
            className="input-group form-group"
            controlId="formBasicEmail"
          >
            <Form.Group className="input-group-prepend">
              <span className="input-group-text">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
            </Form.Group>
            <Form.Label hidden>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder=""
              required
              autoComplete="email"
              autoFocus
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </Form.Group>

          <Form.Group
            className="input-group form-group"
            controlId="formBasicPassword"
          >
            <Form.Group className="input-group-prepend">
              <span className="input-group-text">
                <FontAwesomeIcon icon={faKey} />
              </span>
            </Form.Group>
            <Form.Label hidden>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder=""
              required
              autoComplete="current-password"
              autoFocus
              name="loginPassword"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </Form.Group>

          <Form.Group className="row form-group">
            <Col>
              <div className="custom-control custom-checkbox">
                <input
                  className="custom-control-input"
                  type="checkbox"
                  name="remember"
                  id="remember"
                />

                <label className="custom-control-label" htmlFor="remember">
                  Zapamatovat si mě
                </label>
              </div>
            </Col>
          </Form.Group>

          <Form.Group className="form-group">
            <Button type="submit" className="float-right login_btn">
              Přihlášení
            </Button>

            {/* Zobrazení chyby */}
            {errorMessage && (
              <div className="mt-2 text-danger">
                {errorMessage}
              </div>
            )}
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
              <a href="/reset-password">
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