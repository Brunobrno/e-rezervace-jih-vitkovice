import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Table, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import eventAPI from "../../../api/model/event";
import squareAPI from "../../../api/model/square";

export default function CreateEvent({ onCreated }) {
  const [form, setForm] = useState({ ...eventAPI.defaultEvent });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorDetail, setErrorDetail] = useState(null);
  const [squares, setSquares] = useState([]);
  const [squaresLoading, setSquaresLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setSquaresLoading(true);
    squareAPI.getSquares()
      .then(data => setSquares(data))
      .catch(() => setSquares([]))
      .finally(() => setSquaresLoading(false));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSquareSelect = square => {
    setForm(f => ({ ...f, square_id: square.id }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setErrorDetail(null);
    // Require square selection
    if (!form.square_id) {
      setError("Vyberte náměstí (plocha) pro událost.");
      setLoading(false);
      return;
    }
    try {
      const response = await eventAPI.createEvent(form);
      setForm({ ...eventAPI.defaultEvent, square: null });
      setConfirmed(true);
      if (onCreated) onCreated();
    } catch (err) {
      // Show error message in UI
      let msg = "Chyba při vytváření události.";
      if (err && err.response && err.response.data) {
        if (typeof err.response.data === "string") {
          msg = `Chyba: ${err.response.data}`;
        } else if (err.response.data.detail) {
          msg = `Chyba: ${err.response.data.detail}`;
        } else {
          // Validation errors: show all fields
          msg = Object.entries(err.response.data)
            .map(([field, val]) => `${field}: ${Array.isArray(val) ? val.join(", ") : val}`)
            .join("\n");
        }
        setErrorDetail(err.response.data);
      } else {
        setErrorDetail(err);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOk = () => {
    setConfirmed(false);
    window.location.href = "/manage/events";
  };

  return (
    <Container className="mt-4">
      {confirmed ? (
        <Alert variant="success">
          Událost byla úspěšně vytvořena.
          <div className="mt-3">
            <Button variant="primary" onClick={handleConfirmOk}>
              OK
            </Button>
          </div>
        </Alert>
      ) : (
        <Form onSubmit={handleSubmit}>
          {/* Row for Název události and Popis */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group controlId="eventName">
                <Form.Label>Název události</Form.Label>
                <Form.Control
                  name="name"
                  value={form.name || ""}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group controlId="eventDescription">
                <Form.Label>Popis</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={form.description || ""}
                  onChange={handleChange}
                  rows={1}
                />
              </Form.Group>
            </Col>
          </Row>
          {/* Row for dates */}
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group controlId="eventStart">
                <Form.Label>Datum začátku</Form.Label>
                <Form.Control
                  type="date"
                  name="start"
                  value={form.start || ""}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group controlId="eventEnd">
                <Form.Label>Datum konce</Form.Label>
                <Form.Control
                  type="date"
                  name="end"
                  value={form.end || ""}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          {/* Row for Výběr náměstí */}
          <Row>
            <Col md={12} className="mb-3">
              <Form.Group controlId="eventSquare">
                <Form.Label>Výběr náměstí</Form.Label>
                <div style={{ maxHeight: 180, overflowY: "auto" }}>
                  <Table size="sm" bordered>
                    <thead>
                      <tr>
                        <th>Náměstí</th>
                        <th>Akce</th>
                      </tr>
                    </thead>
                    <tbody>
                      {squaresLoading ? (
                        <tr>
                          <td colSpan={2}>Načítání...</td>
                        </tr>
                      ) : squares.length === 0 ? (
                        <tr>
                          <td colSpan={2}>Žádné plochy</td>
                        </tr>
                      ) : (
                        squares.map(sq => (
                          <tr key={sq.id}>
                            <td>{sq.name}</td>
                            <td>
                              <Button
                                variant={form.square_id === sq.id ? "success" : "outline-primary"}
                                size="sm"
                                type="button"
                                onClick={() => handleSquareSelect(sq)}
                              >
                                {form.square_id === sq.id ? "Vybráno" : "Vybrat"}
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
                {form.square_id && (
                  <div className="mt-1 text-success">
                    Vybraná plocha ID: {form.square_id}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>
          {/* Row for Cena za m² */}
          <Row>
            <Col md={4} className="mb-3">
              <Form.Group controlId="eventPrice">
                <Form.Label>Cena za m²</Form.Label>
                <Form.Control
                  type="number"
                  name="price_per_m2"
                  value={form.price_per_m2 || ""}
                  onChange={handleChange}
                  required
                  min={0}
                />
              </Form.Group>
            </Col>
          </Row>
          {/* Error and submit */}
          {error && (
            <Alert variant="danger">
              <div>{error}</div>
              {errorDetail && (
                <details style={{ marginTop: 8 }}>
                  <summary>Detail chyby</summary>
                  <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
                    {typeof errorDetail === "object"
                      ? JSON.stringify(errorDetail, null, 2)
                      : String(errorDetail)}
                  </pre>
                </details>
              )}
            </Alert>
          )}
          <Row>
            <Col md={12} className="mb-3">
              <Button
                variant="primary"
                type="submit"
                disabled={loading || !form.square_id}
              >
                {loading ? "Ukládání..." : "Vytvořit událost"}
              </Button>
            </Col>
          </Row>
        </Form>
      )}
    </Container>
  );
}