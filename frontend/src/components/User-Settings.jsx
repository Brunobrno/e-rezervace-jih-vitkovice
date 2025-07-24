import React, { useEffect, useState } from "react";
import { Form, Container, Alert } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { apiRequest } from "../api/auth";
import { useNavigate } from "react-router-dom";

// Import FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";

export default function UserSettings() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingFields, setEditingFields] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await apiRequest("get", "/account/user/me/");
        setUser(data);
        setFormData(data);
      } catch {
        setError("Nepodařilo se načíst profil.");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const startEdit = (field) => {
    setEditingFields((prev) => ({ ...prev, [field]: true }));
  };

  const stopEdit = (field) => {
    setEditingFields((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
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
      setFormData(updated);
      setEditingFields({});
      alert("✅ Údaje byly uloženy.");
    } catch {
      setError("❌ Nepodařilo se uložit změny.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = () => {
    navigate("/reset-password");
  };

  if (loading) return <p>⏳ Načítání...</p>;

  const renderField = (label, name, type = "text") => {
    const isEditing = !!editingFields[name];
    const value = formData[name] ?? "";

    return (
      <Form.Group className="mb-3" controlId={`field-${name}`}>
        <Form.Label>{label}</Form.Label>

        {isEditing ? (
          <Form.Control
            type={type}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={() => stopEdit(name)}
            autoFocus
          />
        ) : (
          <div
            style={{
              padding: "8px 12px",
              border: "1px solid #ced4da",
              borderRadius: 4,
              minHeight: "38px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f8f9fa",
            }}
          >
            <span>{value || <i>(neuvedeno)</i>}</span>
            <Button
              variant="link"
              size="sm"
              onClick={() => startEdit(name)}
              style={{ textDecoration: "none" }}
              aria-label={`Upravit ${label}`}
            >
              <FontAwesomeIcon icon={faPen} />
            </Button>
          </div>
        )}
      </Form.Group>
    );
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4">Nastavení uživatele</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSave}>
        {renderField("Jméno", "first_name")}
        {renderField("Příjmení", "last_name")}
        {renderField("RČ", "RC")}
        {renderField("IČ", "ICO")}
        {renderField("Ulice a č.p.", "street")}
        {renderField("Město", "city")}
        {renderField("PSČ", "PSC")}
        {renderField("Číslo účtu", "bank_account")}
        {renderField("Telefon", "phone_number", "tel")}
        {renderField("Email", "email", "email")}

        <div className="d-flex justify-content-between align-items-center mt-4">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "💾 Ukládání..." : "Uložit změny"}
          </Button>

          <Button variant="warning" onClick={handleResetPassword}>
            Resetovat heslo
          </Button>
        </div>
      </Form>
    </Container>
  );
}
