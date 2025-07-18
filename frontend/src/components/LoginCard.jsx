import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faKey } from "@fortawesome/free-solid-svg-icons";
import ToggleButton from "react-bootstrap/ToggleButton";
import Container from "react-bootstrap/Container";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api/auth"

import { login } from "../api/auth";

function LoginCard() {
  const [username, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const success = await login(username, password);
    if (success) {
      navigate("/clerk/create/reservation"); // přesměrování po přihlášení
    } else {
      setError("Neplatné přihlašovací údaje");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <Card className="w-100" style={{ maxWidth: "420px" }}>
        <Card.Header>
          <h3 className="mb-0">Přihlášení</h3>
        </Card.Header>

        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {/* Uživatelské jméno */}
            <Form.Group className="input-group mb-3">
              <span className="input-group-text">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <Form.Control
                type="text"
                placeholder="Uživatelské jméno"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>

            {/* Heslo */}
            <Form.Group className="input-group mb-3">
              <span className="input-group-text">
                <FontAwesomeIcon icon={faKey} />
              </span>
              <Form.Control
                type="password"
                placeholder="Heslo"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            {/* Zapamatovat si mě */}
            <Form.Group className="form-group mb-3">
              <Form.Check
                type="checkbox"
                label="Zapamatovat si mě"
                id="remember"
              />
            </Form.Group>

            {/* Chybová hláška */}
            {error && <div className="text-danger mb-3">{error}</div>}

            {/* Tlačítko přihlášení */}
            <Button type="submit" variant="primary" className="w-100">
              Přihlásit se
            </Button>
          </Form>
        </Card.Body>

        <Card.Footer>
          <Row className="justify-content-between">
            <Col xs="auto">
              <a href="#">Zapomenuté heslo?</a>
            </Col>
            <Col xs="auto">
              <Button href="/register" variant="success" size="sm">
                Vytvořit účet stánkaře
              </Button>
            </Col>
          </Row>
        </Card.Footer>
      </Card>
    </Container>
  );
}

export default LoginCard;
