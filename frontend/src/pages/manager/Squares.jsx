import React, { useEffect, useMemo, useState } from "react";
import Table from "../../components/Table";
import Sidebar from "../../components/Sidebar";
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Alert,
} from "react-bootstrap";
import {
  ActionIcon,
  Group,
  TextInput,
  Text,
  MultiSelect
} from "@mantine/core";
import { IconSearch, IconX, IconEye, IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import apiSquares from "../../api/model/square";

function Squares() {
  const [squares, setSquares] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    street: "",
    city: "",
    psc: "",
    width: "",
    height: "",
    grid_rows: "",
    grid_cols: "",
    cellsize: "",
    image: "",
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

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const form = new FormData();

      // Přidání běžných polí
      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("street", formData.street);
      form.append("city", formData.city);
      form.append("psc", Number(formData.psc));
      form.append("width", Number(formData.width));
      form.append("height", Number(formData.height));
      form.append("grid_rows", Number(formData.grid_rows));
      form.append("grid_cols", Number(formData.grid_cols));
      form.append("cellsize", Number(formData.cellsize));

      // Jen pokud uživatel vybral obrázek
      if (formData.image instanceof File) {
        form.append("image", formData.image);
      }

      await apiSquares.createSquare(form);

      // Reset
      setShowModal(false);
      setFormData({
        name: "",
        description: "",
        street: "",
        city: "",
        psc: "",
        width: "",
        height: "",
        grid_rows: "",
        grid_cols: "",
        cellsize: "",
        image: "",
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


  // Columns for Table (unchanged, paste your existing columns here)
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
          <ActionIcon size="sm" variant="subtle" color="green" onClick={() => handleShowEvent(square)}>
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => handleEditEvent(square)}>
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDeleteEvent(square)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  // Modal for details - unchanged
  const renderModalContent = (record, closeModal) => (
    <Stack>
      <Text>
        <strong>ID:</strong> {record.id}
      </Text>
      <Text>
        <strong>Name:</strong> {record.name}
      </Text>
      <Text>
        <strong>City:</strong> {record.city}
      </Text>
      <Text>
        <strong>Events:</strong> {record.events?.length || 0}
      </Text>

      <Group mt="md">
        <Button variant="outline" onClick={closeModal}>
          Close
        </Button>
        <Button color="blue">Edit</Button>
      </Group>
    </Stack>
  );

  return (
    <Container fluid className="p-0 d-flex flex-column" style={{ overflowX: "hidden", height: "100vh" }}>
      <Row className="mx-0 flex-grow-1">
        <Col xs={2} className="px-0 bg-light" style={{ minWidth: 0 }}>
          <Sidebar />
        </Col>
        <Col xs={10} className="px-0 bg-white d-flex flex-column" style={{ minWidth: 0 }}>
          <Group justify="space-between" align="center" px="md" py="sm">
            <h1>Náměstí</h1>
            <Button leftSection={<IconPlus size={16} />} href="/manage/squares/designer">
              Přidat náměstí
            </Button>
          </Group>

          <Table
            data={squares}
            columns={columns}
            fetching={fetching}
            modalTitle="Square Details"
            renderModalContent={renderModalContent}
            withTableBorder
            borderRadius="md"
            highlightOnHover
            verticalAlign="center"
          />
        </Col>
      </Row>

      {/* Modal pro přidání */}
      {/* Instead of modal, redirect to designer page */}
      {/* Modal removed, see button below */}
    </Container>
  );
}

export default Squares;
