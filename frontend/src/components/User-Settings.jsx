import React, { useEffect, useState } from "react";
import { Form, Container, Row, Col, Alert } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { apiRequest } from "../api/auth";

export default function UserSettings() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await apiRequest("get", "/account/user/me/");
        setUser(data);
        setFormData(data);
      } catch (err) {
        setError("Nepodařilo se načíst profil.");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    setError("");

    try {
      const updated = await apiRequest("patch", `/account/users/${user.id}/`, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        RC: formData.RC,
        ICO: formData.ICO,
        street: formData.street,
        city: formData.city,
        PSC: formData.PSC,
        bank_account: formData.bank_account,
        phone_number: formData.phone_number,
        email: formData.email,
      });
      setUser(updated);
      alert("✅ Údaje byly uloženy.");
    } catch (err) {
      console.error(err);
      setError("❌ Nepodařilo se uložit změny.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>⏳ Načítání...</p>;

  return (
    <Container className="mt-5">
      <h2 className="mb-4">Nastavení uživatele</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSave}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Jméno</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                value={formData.first_name || ""}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Příjmení</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                value={formData.last_name || ""}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>RČ</Form.Label>
          <Form.Control
            type="text"
            name="RC"
            value={formData.RC || ""}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>IČ</Form.Label>
          <Form.Control
            type="text"
            name="ICO"
            value={formData.ICO || ""}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Ulice a č.p.</Form.Label>
          <Form.Control
            type="text"
            name="street"
            value={formData.street || ""}
            onChange={handleChange}
          />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Město</Form.Label>
              <Form.Control
                type="text"
                name="city"
                value={formData.city || ""}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>PSČ</Form.Label>
              <Form.Control
                type="text"
                name="PSC"
                value={formData.PSC || ""}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Číslo účtu</Form.Label>
          <Form.Control
            type="text"
            name="bank_account"
            value={formData.bank_account || ""}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Telefon</Form.Label>
          <Form.Control
            type="tel"
            name="phone_number"
            value={formData.phone_number || ""}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
          />
        </Form.Group>

        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? "💾 Ukládání..." : "Uložit změny"}
        </Button>
      </Form>
    </Container>
  );
}
