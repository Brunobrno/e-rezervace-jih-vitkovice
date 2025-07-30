import Table from "../../components/Table";
import Sidebar from "../../components/Sidebar";
import { IconEye, IconEdit, IconTrash, IconMap, IconPlus } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  ActionIcon,
  Button,
  Checkbox,
  MultiSelect,
  Stack,
  TextInput,
  Anchor,
  Box,
  Group,
  Text,
  Modal,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";

import apiEvent from "../../api/model/event";

function Events() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("view");
  const [query, setQuery] = useState("");

  const [formState, setFormState] = useState({
    name: "",
    description: "",
    start: "",
    end: "",
    price_per_m2: "",
    image: null,
    square_id: "",
  });

  // Když se vybere event pro editaci, naplníme formState
  useEffect(() => {
    if (modalType === "edit" && selectedEvent) {
      setFormState({
        name: selectedEvent.name || "",
        description: selectedEvent.description || "",
        start: selectedEvent.start ? selectedEvent.start.slice(0, 16) : "", // ISO string YYYY-MM-DDTHH:mm (pro input type=datetime-local)
        end: selectedEvent.end ? selectedEvent.end.slice(0, 16) : "",
        price_per_m2: selectedEvent.price_per_m2 || "",
        image: null, // obrázek nezadáme, pokud chceme změnit, uživatel nahraje nový
        square_id: selectedEvent.square_id || selectedEvent.square?.id || "",
      });
    }
    if (modalType === "edit" && !selectedEvent) {
      // Přidávání nového eventu: vyčistit form
      setFormState({
        name: "",
        description: "",
        start: "",
        end: "",
        price_per_m2: "",
        image: null,
        square_id: "",
      });
    }
  }, [modalType, selectedEvent]);

  // Handler pro změnu inputů
  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormState((old) => ({ ...old, image: files[0] || null }));
    } else {
      setFormState((old) => ({ ...old, [name]: value }));
    }
  };

  // Odeslání formuláře
  const handleSaveEvent = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", formState.name);
      formData.append("description", formState.description);
      formData.append("start", new Date(formState.start).toISOString());
      formData.append("end", new Date(formState.end).toISOString());
      formData.append("price_per_m2", formState.price_per_m2);
      formData.append("square_id", formState.square_id);

      if (formState.image instanceof File) {
        formData.append("image", formState.image);
      }

      if (modalType === "edit" && selectedEvent) {
        await apiEvent.updateEvent(selectedEvent.id, formData);
      } else {
        await apiEvent.createEvent(formData);
      }

      setShowModal(false);
      fetchEvents();
    } catch (err) {
      console.error("Chyba při ukládání akce:", err);
      // Můžeš přidat state pro zobrazení chyby uživateli
    }
  };

  const fetchEvents = async () => {
    setFetching(true);
    try {
      const params = { search: query };
      const data = await apiEvent.getEvents(params);
      setEvents(data);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [query]);

  const handleShowEvent = (event) => {
    setSelectedEvent(event);
    setModalType("view");
    setShowModal(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setModalType("edit");
    setShowModal(true);
  };

  const handleDeleteEvent = async (event) => {
    if (window.confirm(`Opravdu smazat akci: ${event.name}?`)) {
      await apiEvent.deleteEvent(event.id);
      fetchEvents();
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedEvent) {
      await apiEvent.deleteEvent(selectedEvent.id);
      setShowModal(false);
      fetchEvents();
    }
  };

  const handleRedirectToMap = async (event) => {
    navigate(`/manage/events/map/${event.id}`);
  };

  // Upravený renderModalContent s formulářem
  const renderModalContent = () => {
    if (modalType === "view" && selectedEvent) {
      return (
        <Stack>
          <Text><strong>ID:</strong> {selectedEvent.id}</Text>
          <Text><strong>Název:</strong> {selectedEvent.name}</Text>
          <Text><strong>Popis:</strong> {selectedEvent.description || "—"}</Text>
          <Text><strong>Náměstí:</strong> {selectedEvent.square?.name || "Neznámé"}</Text>
          <Text><strong>Město:</strong> {selectedEvent.square?.city || "—"}</Text>
          <Text><strong>Začátek:</strong> {new Date(selectedEvent.start).toLocaleString()}</Text>
          <Text><strong>Konec:</strong> {new Date(selectedEvent.end).toLocaleString()}</Text>
          <Group mt="md">
            <Button variant="outline" onClick={() => setShowModal(false)}>Zavřít</Button>
            <Button onClick={() => handleEditEvent(selectedEvent)}>Upravit</Button>
          </Group>
        </Stack>
      );
    }

    if (modalType === "edit") {
      return (
        <form onSubmit={handleSaveEvent}>
          <Stack spacing="sm">
            <TextInput
              label="Název"
              name="name"
              value={formState.name}
              onChange={handleFormChange}
              required
            />
            <TextInput
              label="Popis"
              name="description"
              value={formState.description}
              onChange={handleFormChange}
            />
            <TextInput
              label="Začátek"
              type="datetime-local"
              name="start"
              value={formState.start}
              onChange={handleFormChange}
              required
            />
            <TextInput
              label="Konec"
              type="datetime-local"
              name="end"
              value={formState.end}
              onChange={handleFormChange}
              required
            />
            <TextInput
              label="Cena za m²"
              name="price_per_m2"
              value={formState.price_per_m2}
              onChange={handleFormChange}
              placeholder="např. 1000"
            />
            <TextInput
              label="ID náměstí"
              name="square_id"
              value={formState.square_id}
              onChange={handleFormChange}
              required
            />
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFormChange}
              style={{ marginTop: 10 }}
            />
            <Group position="right" mt="md">
              <Button variant="outline" onClick={() => setShowModal(false)}>Zrušit</Button>
              <Button type="submit" color="blue">Uložit</Button>
            </Group>
          </Stack>
        </form>
      );
    }

    if (modalType === "delete" && selectedEvent) {
      return (
        <Stack>
          <Text>Opravdu chcete smazat akci "{selectedEvent.name}"?</Text>
          <Group mt="md">
            <Button variant="outline" onClick={() => setShowModal(false)}>Zrušit</Button>
            <Button color="red" onClick={handleConfirmDelete}>Smazat</Button>
          </Group>
        </Stack>
      );
    }

    return <Text>Žádný obsah</Text>;
  };

  // getModalTitle můžeš použít stejný, např:
  const getModalTitle = () => {
    if (!selectedEvent && modalType !== "edit") return "Detail akce";

    switch (modalType) {
      case "view":
        return `Detail: ${selectedEvent?.name}`;
      case "edit":
        return selectedEvent ? `Upravit: ${selectedEvent.name}` : "Přidat akci";
      case "delete":
        return `Smazat akci`;
      default:
        return "Detail akce";
    }
  };

  const columns = [
    { accessor: "id", title: "#", sortable: true },
    { accessor: "name", title: "Název", sortable: true },
    {
      accessor: "description",
      title: "Popis",
      render: (row) =>
        row.description || (
          <Text c="dimmed" fs="italic">
            Bez popisu
          </Text>
        ),
    },
    {
      accessor: "square",
      title: "Náměstí",
      render: (row) =>
        row.square?.name || (
          <Text c="dimmed" fs="italic">
            Neznámé
          </Text>
        ),
    },
    {
      accessor: "start",
      title: "Začátek",
      render: (row) => new Date(row.start).toLocaleString(),
      sortable: true,
    },
    {
      accessor: "end",
      title: "Konec",
      render: (row) => new Date(row.end).toLocaleString(),
      sortable: true,
    },
    {
      accessor: "actions",
      title: "Akce",
      render: (event) => (
        <Group gap={4} wrap="nowrap" className="">
          <Container className="d-flex">
            <Row>
              <Col className="p-0">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="green"
                  onClick={() => handleShowEvent(event)}
                >
                  <IconEye size={16} />
                </ActionIcon>
              </Col>
              <Col className="p-0">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="blue"
                  onClick={() => handleEditEvent(event)}
                >
                  <IconEdit size={16} />
                </ActionIcon>
              </Col>
            </Row>
            <Row>
              <Col className="p-0 pl-3">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  onClick={() => handleDeleteEvent(event)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Col>
              <Col className="p-0 pl-3">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  onClick={() => handleRedirectToMap(event)}
                >
                  <IconMap size={16} />
                </ActionIcon>
              </Col>
            </Row>
          </Container>
        </Group>
      ),
    },
  ];

  return (
    <Container
      fluid
      className="p-0 d-flex flex-column"
      style={{ overflowX: "hidden", height: "100vh" }}
    >
      <Row className="mx-0 flex-grow-1">
        <Col xs={2} className="px-0 bg-light" style={{ minWidth: 0 }}>
          <Sidebar />
        </Col>
        <Col
          xs={10}
          className="px-0 bg-white d-flex flex-column"
          style={{ minWidth: 0 }}
        >
          <Group justify="space-between" align="center" px="md" py="sm">
            <h1>Akce</h1>
            <Button leftSection={<IconPlus size={16} />} onClick={() => {
              setModalType("edit");
              setSelectedEvent(null);
              setShowModal(true);
            }}>
              Přidat akci
            </Button>
          </Group>

          <Table
            data={events}
            columns={columns}
            fetching={fetching}
            withTableBorder
            borderRadius="md"
            highlightOnHover
            verticalAlign="center"
            onQueryChange={setQuery}
          />

          <Modal
            opened={showModal}
            onClose={() => setShowModal(false)}
            title={modalType === "edit" && !selectedEvent ? "Přidat akci" : getModalTitle()}
            size="lg"
            centered
          >
            {renderModalContent()}
          </Modal>
        </Col>
      </Row>
    </Container>
  );
}

export default Events;
