import Table from "../components/Table";
import Sidebar from "../components/Sidebar";
import { getEvents, deleteEvent } from "../api/model/event";
import { IconEye, IconEdit, IconTrash, IconMap  } from "@tabler/icons-react";
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


function Events() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("view"); // 'view', 'edit', 'delete'
  const [query, setQuery] = useState("");


  const fetchEvents = async () => {
    setFetching(true);
    try {
      const params = { search: query };
      const data = await getEvents(params);
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
    if (window.confirm(`Opravdu smazat událost: ${event.name}?`)) {
      await deleteEvent(event.id);
      fetchEvents();
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedEvent) {
      await deleteEvent(selectedEvent.id);
      setShowModal(false);
      fetchEvents();
    }
  };

  const handleRedirectToMap = async (event) => {
    navigate(`/manage/events/map/${event.id}`);
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

  const renderModalContent = () => {
    if (!selectedEvent) return <Text>Událost nebyla nalezena</Text>;

    switch (modalType) {
      case "view":
        return (
          <Stack>
            <Text>
              <strong>ID:</strong> {selectedEvent.id}
            </Text>
            <Text>
              <strong>Název:</strong> {selectedEvent.name}
            </Text>
            <Text>
              <strong>Popis:</strong> {selectedEvent.description || "—"}
            </Text>
            <Text>
              <strong>Náměstí:</strong>{" "}
              {selectedEvent.square?.name || "Neznámé"}
            </Text>
            <Text>
              <strong>Město:</strong> {selectedEvent.square?.city || "—"}
            </Text>
            <Text>
              <strong>Začátek:</strong>{" "}
              {new Date(selectedEvent.start).toLocaleString()}
            </Text>
            <Text>
              <strong>Konec:</strong>{" "}
              {new Date(selectedEvent.end).toLocaleString()}
            </Text>
            <Group mt="md">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Zavřít
              </Button>
              <Button onClick={() => handleEditEvent(selectedEvent)}>
                Upravit
              </Button>
            </Group>
          </Stack>
        );

      case "edit":
        return (
          <Stack>
            <TextInput
              label="Název"
              defaultValue={selectedEvent.name}
              mb="sm"
            />
            <TextInput
              label="Popis"
              defaultValue={selectedEvent.description}
              mb="sm"
            />
            <TextInput
              label="Začátek"
              defaultValue={new Date(selectedEvent.start).toLocaleString()}
              disabled
              mb="sm"
            />
            <TextInput
              label="Konec"
              defaultValue={new Date(selectedEvent.end).toLocaleString()}
              disabled
              mb="sm"
            />
            <Group mt="md">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Zrušit
              </Button>
              <Button color="blue" onClick={() => setShowModal(false)}>
                Uložit změny
              </Button>
            </Group>
          </Stack>
        );

      case "delete":
        return (
          <Stack>
            <Text>Opravdu chcete smazat událost "{selectedEvent.name}"?</Text>
            <Group mt="md">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Zrušit
              </Button>
              <Button color="red" onClick={handleConfirmDelete}>
                Smazat
              </Button>
            </Group>
          </Stack>
        );

      default:
        return null;
    }
  };

  const getModalTitle = () => {
    if (!selectedEvent) return "Detail události";

    switch (modalType) {
      case "view":
        return `Detail: ${selectedEvent.name}`;
      case "edit":
        return `Upravit: ${selectedEvent.name}`;
      case "delete":
        return `Smazat událost`;
      default:
        return "Detail události";
    }
  };

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

          {/* Custom Modal for Events */}
          <Modal
            opened={showModal}
            onClose={() => setShowModal(false)}
            title={getModalTitle()}
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
