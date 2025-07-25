import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { fetchEnumFromSchemaJson } from "../../api/get_chocies";
import { apiRequest } from "../../api/auth";

function TicketForm() {
  const { user } = useOutletContext();

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [urgencyOptions, setUrgencyOptions] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    urgency: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadEnums = async () => {
      try {
        const [categories, urgencies] = await Promise.all([
          fetchEnumFromSchemaJson("/api/service-tickets/", "get", "category"),
          fetchEnumFromSchemaJson("/api/service-tickets/", "get", "urgency"),
        ]);
        setCategoryOptions(categories);
        setUrgencyOptions(urgencies);
      } catch (err) {
        console.error("Chyba při načítání enum hodnot:", err);
        setError("Nepodařilo se načíst možnosti formuláře.");
      } finally {
        setLoading(false);
      }
    };

    loadEnums();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        ...formData,
        user: user?.id,
      };

      await apiRequest("post", "/service-tickets/", payload);
      setSuccess(true);
      setFormData({
        title: "",
        description: "",
        category: "",
        urgency: "",
      });
    } catch (err) {
      console.error(err);
      setError("Chyba při odesílání formuláře.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Načítání…</span>
      </Spinner>
    );

  return (
    <Form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-light">
      <h3>Odeslat Ticket</h3>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Ticket byl úspěšně odeslán.</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>Název</Form.Label>
        <Form.Control
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Popis</Form.Label>
        <Form.Control
          as="textarea"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Kategorie</Form.Label>
        <Form.Select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">Vyberte kategorii</option>
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Urgence</Form.Label>
        <Form.Select
          name="urgency"
          value={formData.urgency}
          onChange={handleChange}
          required
        >
          <option value="">Vyberte urgenci</option>
          {urgencyOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Odesílám..." : "Odeslat Ticket"}
      </Button>
    </Form>
  );
}

export default TicketForm;
