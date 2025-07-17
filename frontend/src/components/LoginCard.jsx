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

function LoginCard() {
  const [username, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_URL}/account/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Neplatné přihlašovací údaje");
      }

      const data = await response.json();
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      console.log(localStorage.getItem("access_token"))

      // přesměruj na dashboard nebo domovskou stránku
      navigate("/clerk/create/reservation");
    } catch (err) {
      setError(err.message || "Přihlášení selhalo");
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
              value={username}
              onChange={(e) => setEmail(e.target.value)}
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
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          </Form.Group>
        </Form>
      </Card.Body>

      <Card.Footer>
        <Row>
          <Col className="links">
            <Button
              href="/register"
              variant="success"
              className="float-right text-white"
            >
              {" "}
              Vytvořit účet stánkaře
            </Button>

            <div className="pt-1">
              <a href="#">Zapomenuté heslo?</a>
            </div>
          </Col>
        </Row>
      </Card.Footer>
    </Card>
  );
}

export default LoginCard;
