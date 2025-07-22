import React, { useState } from "react";
import {
  Form,
  Button,
  Card,
  Alert,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

import { apiRequest } from "../../api/auth";

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      await apiRequest("post", "/account/reset-password/", { email });
      setStatus("success");
    } catch (err) {
      // Pokud apiRequest vrací error jako objekt, zkus ho správně zachytit
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Nepodařilo se odeslat požadavek. Zkuste to prosím znovu.";

      setError(message);
      setStatus("error");
    }
  };

  return (
    <Card className="align-self-center mt-5" style={{ maxWidth: "420px" }}>
      <Card.Header>
        <h3>Obnovení hesla</h3>
      </Card.Header>

      <Card.Body>
        {status === "success" ? (
          <Alert variant="success">Odeslán email s instrukcemi.</Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="input-group form-group" controlId="formEmail">
              <Form.Group className="input-group-prepend">
                <span className="input-group-text">
                  <FontAwesomeIcon icon={faEnvelope} />
                </span>
              </Form.Group>

              <Form.Label hidden>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Zadejte váš email"
                required
                autoComplete="email"
                autoFocus
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </Form.Group>

            <Form.Group className="form-group d-flex justify-content-center">
              <Button
                type="submit"
                style={{ width: "fit-content" }}
                className="float-right login_btn mt-3 d-inline-flex"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Spinner animation="border" size="sm" /> Odesílání...
                  </>
                ) : (
                  "Obnovit heslo"
                )}
              </Button>
            </Form.Group>

            {status === "error" && (
              <Alert variant="danger" className="mt-3">
                {error}
              </Alert>
            )}
          </Form>
        )}
      </Card.Body>

      <Card.Footer>
        <Row>
          <Col className="text-center">
            <a href="/">Zpět na přihlášení</a>
          </Col>
        </Row>
      </Card.Footer>
    </Card>
  );
};

export default ResetPasswordRequest;