import React, { useEffect, useMemo, useState } from "react";
import Table from "../../components/Table";
import Sidebar from "../../components/Sidebar";
import {
  Container,
  Row,
  Col,
  Button as BootstrapButton,
  Modal,
  Form,
  Alert,
} from "react-bootstrap";
import {
  ActionIcon,
  Group,
  TextInput,
  Text,
  MultiSelect,
  Stack,
  Button
} from "@mantine/core";
import { IconSearch, IconX, IconEye, IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import apiSquares from "../../api/model/square";

function Squares() {
  // Delete handler
  const handleDeleteEvent = async (square) => {
    if (window.confirm(`Opravdu smazat náměstí: ${square.name}?`)) {
      await apiSquares.deleteSquare(square.id);
      const data = await apiSquares.getSquares();
      setSquares(data);
    }
  };

  // Bootstrap Modal state for edit
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditSquare = (square) => {
    setSelectedSquare(square);
    setFormData({
      name: square.name || "",
      description: square.description || "",
      street: square.street || "",
      city: square.city || "",
      psc: square.psc || "",
    });
    setShowEditModal(true);
  };

  const handleEditModalSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("street", formData.street);
      form.append("city", formData.city);
      form.append("psc", Number(formData.psc));
      if (formData.image instanceof File) {
        form.append("image", formData.image);
      }
      await apiSquares.updateSquare(selectedSquare.id, form);
      setShowEditModal(false);
      setFormData({
        name: "",
        description: "",
        street: "",
        city: "",
        psc: "",
      });
      const data = await apiSquares.getSquares();
      setSquares(data);
    } catch (err) {
      const apiErrors = err.response?.data;
      if (typeof apiErrors === "object") {
        const messages = Object.entries(apiErrors)
          .map(([key, value]) => `${key}: ${value.join(", ")}`)
          .join("\n");
        setError("Chyba při ukládání:\n" + messages);
      } else {
        setError("Chyba při ukládání: " + (err.message || "Neznámá chyba"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const [squares, setSquares] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'edit'
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    street: "",
    city: "",
    psc: "",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiSquares.getSquares();
        setSquares(data);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const cityOptions = useMemo(() => {
    const uniqueCities = new Set(squares.map((r) => r.city));
    return [...uniqueCities];
  }, [squares]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((old) => ({ ...old, [name]: value }));
  };

  // Handlers for modal actions
  const handleShowSquare = (square) => {
    setSelectedSquare(square);
    setModalType('view');
    setShowModal(true);
  };

  // (removed duplicate handleEditSquare)


  const columns = [
    { accessor: "id", title: "#", sortable: true },
    { accessor: "street", title: "Ulice", sortable: true },
    {
      accessor: "name",
      title: "Název",
      sortable: true,
      filter: (
        <TextInput
          label="Hledat názvy"
          placeholder="Např. Trh, Koncert..."
          leftSection={<IconSearch size={16} />}
          rightSection={
            <ActionIcon size="sm" variant="transparent" c="dimmed" onClick={() => setQuery("")}>
              <IconX size={14} />
            </ActionIcon>
          }
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />
      ),
      filtering: query !== "",
    },
    {
      accessor: "city",
      title: "Město",
      sortable: true,
      filter: (
        <MultiSelect
          label="Filtrovat města"
          placeholder="Vyber město/města"
          data={cityOptions}
          value={selectedCities}
          onChange={setSelectedCities}
          clearable
          searchable
          leftSection={<IconSearch size={16} />}
          comboboxProps={{ withinPortal: false }}
        />
      ),
      filtering: selectedCities.length > 0,
    },
    {
      accessor: "image",
      title: "Obrázek",
      render: (row) =>
        row.image ? (
          <img src={row.image} alt={row.name} style={{ width: "100px", height: "auto", borderRadius: "8px" }} />
        ) : (
          <Text c="dimmed" fs="italic">
            Žádný obrázek
          </Text>
        ),
    },
    {
      accessor: "events",
      title: "Počet událostí",
      width: "0%",
      textAlign: "center",
      render: (row) => row.events?.length || 0,
      sortable: true,
    },
    {
      accessor: "actions",
      title: "Akce",
      width: "0%",

      render: (square) => (
        <Group gap={4} wrap="nowrap">
          <ActionIcon size="sm" variant="subtle" color="green" onClick={() => handleShowSquare(square)}>
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => handleEditSquare(square)}>
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDeleteEvent(square)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  // Modal content for view/edit
  const renderModalContent = () => {
    // No longer used for view/edit, handled by Bootstrap modals below
    return <Text>Žádný obsah</Text>;
  };

  return (
    <Container fluid className="p-0 d-flex flex-column" style={{ overflowX: "hidden", height: "100vh" }}>
      <Row className="mx-0 flex-grow-1">
        <Col xs={2} className="px-0 bg-light" style={{ minWidth: 0 }}>
          <Sidebar />
        </Col>
        <Col xs={10} className="px-0 bg-white d-flex flex-column" style={{ minWidth: 0 }}>
          <Group justify="space-between" align="center" px="md" py="sm">
            <h1>Náměstí</h1>
            <Button component="a" href="/manage/squares/designer" leftSection={<IconPlus size={16} />}>Přidat náměstí</Button>
          </Group>

          <Table
            data={squares}
            columns={columns}
            fetching={fetching}
            withTableBorder
            borderRadius="md"
            highlightOnHover
            verticalAlign="center"
          />

          {/* Mantine modal for add only */}
          <Modal
            opened={showModal && modalType === 'add'}
            onClose={() => setShowModal(false)}
            title={'Přidat náměstí'}
            size="lg"
            centered
          >
            {renderModalContent()}
          </Modal>

          {/* Bootstrap Modal for view */}
          <Modal show={showModal && modalType === 'view'} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Detail náměstí</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedSquare && (
                <>
                  <p><strong>ID:</strong> {selectedSquare.id}</p>
                  <p><strong>Název:</strong> {selectedSquare.name}</p>
                  <p><strong>Popis:</strong> {selectedSquare.description || "—"}</p>
                  <p><strong>Ulice:</strong> {selectedSquare.street || "—"}</p>
                  <p><strong>Město:</strong> {selectedSquare.city || "—"}</p>
                  <p><strong>PSC:</strong> {selectedSquare.psc || "—"}</p>
                  <p><strong>Rozměry:</strong> {selectedSquare.width} x {selectedSquare.height}</p>
                  <p><strong>Grid:</strong> {selectedSquare.grid_rows} x {selectedSquare.grid_cols}, cellsize: {selectedSquare.cellsize}</p>
                  <p><strong>Počet událostí:</strong> {selectedSquare.events?.length || 0}</p>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <BootstrapButton variant="secondary" onClick={() => setShowModal(false)}>Zavřít</BootstrapButton>
              <BootstrapButton variant="primary" onClick={() => { setShowModal(false); handleEditSquare(selectedSquare); }}>Upravit</BootstrapButton>
            </Modal.Footer>
          </Modal>

          {/* Bootstrap Modal for edit */}
          <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Upravit náměstí</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleEditModalSubmit}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Název</Form.Label>
                  <Form.Control name="name" value={formData.name} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Popis</Form.Label>
                  <Form.Control as="textarea" rows={4} name="description" value={formData.description} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Ulice</Form.Label>
                  <Form.Control name="street" value={formData.street} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Město</Form.Label>
                  <Form.Control name="city" value={formData.city} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>PSC</Form.Label>
                  <Form.Control name="psc" value={formData.psc} onChange={handleChange} />
                </Form.Group>
                {error && <Alert variant="danger">{error}</Alert>}
              </Modal.Body>
              <Modal.Footer>
                <BootstrapButton variant="secondary" onClick={() => setShowEditModal(false)}>Zrušit</BootstrapButton>
                <BootstrapButton type="submit" variant="primary" disabled={submitting}>Uložit změny</BootstrapButton>
              </Modal.Footer>
            </Form>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
}

export default Squares;
