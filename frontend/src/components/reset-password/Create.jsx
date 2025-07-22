import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
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
import { faKey } from "@fortawesome/free-solid-svg-icons";

const CreateNewPassoword = () => {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [reNewPassword, setReNewPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    if (newPassword !== reNewPassword) {
      setStatus("error");
      setError("Hesla se neshodují.");
      return;
    }

    try {
      const response = await axios.post(
        `/api/account/reset-password/${uidb64}/${token}/`,
        {
          new_password: newPassword,
          re_new_password: reNewPassword,
        }
      );

      if (response.status === 200) {
        setStatus("success");
        setTimeout(() => {
          navigate("/"); // přesměrování na login page
        }, 3000);
      }
    } catch (err) {
      setStatus("error");
      setError(
        err.response?.data?.detail ||
          "Nepodařilo se resetovat heslo. Token může být neplatný nebo expirovaný."
      );
    }
  };

   return (
    <Card className="align-self-center mt-5" style={{ maxWidth: "420px" }}>
      <Card.Header>
        <h3>Reset hesla</h3>
      </Card.Header>

      <Card.Body>
        {status === "success" ? (
          <Alert variant="success">
            Heslo bylo úspěšně změněno. Přesměrování na přihlášení...
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            {/* Nové heslo */}
            <Form.Group className="input-group form-group" controlId="newPassword">
              <Form.Group className="input-group-prepend">
                <span className="input-group-text">
                  <FontAwesomeIcon icon={faKey} />
                </span>
              </Form.Group>
              <Form.Label hidden>Nové heslo</Form.Label>
              <Form.Control
                type="password"
                required
                autoComplete="new-password"
                placeholder="Nové heslo"
                name="newPassword"
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword}
              />
            </Form.Group>

            {/* Potvrzení hesla */}
            <Form.Group className="input-group form-group mt-3" controlId="reNewPassword">
              <Form.Group className="input-group-prepend">
                <span className="input-group-text">
                  <FontAwesomeIcon icon={faKey} />
                </span>
              </Form.Group>
              <Form.Label hidden>Potvrdit heslo</Form.Label>
              <Form.Control
                type="password"
                required
                autoComplete="new-password"
                placeholder="Potvrdit heslo"
                name="reNewPassword"
                onChange={(e) => setReNewPassword(e.target.value)}
                value={reNewPassword}
              />
            </Form.Group>

            {/* Submit */}
            <Form.Group className="form-group">
              <Button
                type="submit"
                className="float-right login_btn mt-3"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Spinner animation="border" size="sm" /> Odesílání...
                  </>
                ) : (
                  "Resetovat heslo"
                )}
              </Button>
            </Form.Group>

            {/* Chyba */}
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

export default CreateNewPassoword;
