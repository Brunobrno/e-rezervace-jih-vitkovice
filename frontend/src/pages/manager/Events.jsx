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
  Button,
  Badge
} from "@mantine/core";
import { IconSearch, IconX, IconEye, IconEdit, IconTrash, IconPlus, IconMap } from "@tabler/icons-react";
import apiEvents from "../../api/model/event";
import dayjs from "dayjs";
import "dayjs/locale/cs";
import { useNavigate } from "react-router-dom";

function Events() {
  const [events, setEvents] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState([]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("view");
  const [formState, setFormState] = useState({
    name: "",
    description: "",
    start: "",
    end: "",
    price_per_m2: "",
    image: null,
    square_id: "",
  });
  const [squares, setSquares] = useState([]);
  const [squareSearch, setSquareSearch] = useState("");

  const [selectedSquareIds, setSelectedSquareIds] = useState([]);
  const [startDateRange, setStartDateRange] = useState([null, null]);
  const [endDateRange, setEndDateRange] = useState([null, null]);

  const navigate = useNavigate();

  // Status options for filter (adjust as needed)
  const statusOptions = [
    { value: "active", label: "Aktivní" },
    { value: "archived", label: "Archivováno" },
    { value: "draft", label: "Koncept" },
    { value: "cancelled", label: "Zrušeno" },
  ];

  // Fetch squares for dropdown
  useEffect(() => {
    const fetchSquares = async () => {
      try {
        const data = await import("../../api/model/square").then(mod => mod.default.getSquares());
        setSquares(data);
      } catch (err) {
        // ignore
      }
    };
    fetchSquares();
  }, []);

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
        await apiEvents.updateEvent(selectedEvent.id, formData);
      } else {
        await apiEvents.createEvent(formData);
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
      const data = await apiEvents.getEvents(params);
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
    setModalType('view');
    setShowModal(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setFormState({
      name: event.name || "",
      description: event.description || "",
      start: event.start ? event.start.slice(0, 16) : "",
      end: event.end ? event.end.slice(0, 16) : "",
      price_per_m2: event.price_per_m2 || "",
      image: null,
      square_id: event.square_id || event.square?.id || "",
    });
    setModalType('edit');
    setShowModal(true);
    // Optionally clear error state if you add error handling
  };

  const handleDeleteEvent = async (event) => {
    if (window.confirm(`Opravdu smazat akci: ${event.name}?`)) {
      await apiEvents.deleteEvent(event.id);
      fetchEvents();
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedEvent) {
      await apiEvents.deleteEvent(selectedEvent.id);
      setShowModal(false);
      fetchEvents();
    }
  };

  const handleRedirectToMap = (event) => {
    navigate(`/manage/events/map/${event.id}`);
  };

  // Set dayjs locale to Czech
  useEffect(() => {
    dayjs.locale("cs");
  }, []);

  // Upravený renderModalContent s formulářem
  const renderModalContent = () => {
    if (modalType === "view" && selectedEvent) {
      return (
        <Stack>
          <Text><strong>ID:</strong> {selectedEvent.id}</Text>
          <Text><strong>Název:</strong> {selectedEvent.name}</Text>
          <Text><strong>Popis:</strong> {selectedEvent.description || "—"}</Text>
          <Text><strong>Náměstí:</strong> {selectedEvent.square?.name || "Neznámé"}</Text>
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
            {/* Square search and select */}
            <TextInput
              label="Hledat náměstí"
              placeholder="Zadej název nebo město"
              value={squareSearch}
              onChange={e => setSquareSearch(e.target.value)}
            />
            <select
              name="square_id"
              value={formState.square_id}
              onChange={handleFormChange}
              required
              style={{ padding: '8px', borderRadius: '4px' }}
            >
              <option value="">Vyber náměstí</option>
              {squares.filter(sq =>
                sq.name.toLowerCase().includes(squareSearch.toLowerCase()) ||
                sq.city.toLowerCase().includes(squareSearch.toLowerCase())
              ).map(sq => (
                <option key={sq.id} value={sq.id}>{sq.name} ({sq.city})</option>
              ))}
            </select>
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

  // Squares for filter
  const squareOptions = useMemo(() => {
    if (!Array.isArray(squares)) return [];
    return squares.map(sq => ({
      value: String(sq.id),
      label: `${sq.name} (${sq.city})`
    }));
  }, [squares]);

  // Filtering logic update
  const filteredEvents = useMemo(() => {
    let data = Array.isArray(events) ? events : [];
    if (query) {
      const q = query.toLowerCase();
      data = data.filter(
        e =>
          e.name?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q) ||
          String(e.id).includes(q) ||
          e.status?.toLowerCase().includes(q)
      );
    }
    if (selectedStatus.length > 0) {
      data = data.filter(e => selectedStatus.includes(e.status));
    }
    if (selectedSquareIds.length > 0) {
      data = data.filter(e =>
        selectedSquareIds.includes(String(e.square_id || e.square?.id))
      );
    }
    // Začátek (start) date filter: show only events where start date (YYYY-MM-DD) matches the filter
    if (startDateRange[0]) {
      data = data.filter(e =>
        e.start && dayjs(e.start).format("YYYY-MM-DD") === startDateRange[0]
      );
    }
    // Konec (end) date filter: show only events where end date (YYYY-MM-DD) matches the filter
    if (endDateRange[0]) {
      data = data.filter(e =>
        e.end && dayjs(e.end).format("YYYY-MM-DD") === endDateRange[0]
      );
    }
    return data;
  }, [events, query, selectedStatus, selectedSquareIds, startDateRange, endDateRange]);

  // Show all fields in the table, based on EventSerializer in backend/booking/serializers.py
  const columns = [
    { accessor: "id", title: "#", sortable: true, width: "4%" },
    {
      accessor: "name",
      title: "Název",
      sortable: true,
      width: "15%",
      filter: (
        <TextInput
          label="Hledat název"
          placeholder="Např. Trh, Koncert..."
          leftSection={<IconSearch size={16} />}
          rightSection={
            <ActionIcon size="sm" variant="transparent" c="dimmed" onClick={() => setQuery("")}>
              <IconX size={14} />
            </ActionIcon>
          }
          value={query}
          onChange={e => setQuery(e.currentTarget.value)}
        />
      ),
      filtering: query !== "",
    },
    {
      accessor: "description",
      title: "Popis",
      sortable: false,
      width: "10%",
      render: row => row.description || <Text c="dimmed" fs="italic">—</Text>,
    },
    {
      accessor: "start",
      title: "Začátek",
      sortable: true,
      width: "14%",
      render: row => row.start ? dayjs(row.start).format("DD.MM.YYYY HH:mm") : "—",
      filter: (
        <Group gap={4}>
          <TextInput
            type="date"
            label="Datum"
            value={startDateRange[0] || ""}
            onChange={e => setStartDateRange([e.target.value || null, null])}
            style={{ width: 140 }}
          />
          {startDateRange[0] && (
            <ActionIcon size="sm" variant="transparent" c="dimmed" onClick={() => setStartDateRange([null, null])}>
              <IconX size={14} />
            </ActionIcon>
          )}
        </Group>
      ),
      filtering: !!startDateRange[0],
    },
    {
      accessor: "end",
      title: "Konec",
      sortable: true,
      width: "14%",
      render: row => row.end ? dayjs(row.end).format("DD.MM.YYYY HH:mm") : "—",
      filter: (
        <Group gap={4}>
          <TextInput
            type="date"
            label="Datum"
            value={endDateRange[0] || ""}
            onChange={e => setEndDateRange([e.target.value || null, null])}
            style={{ width: 140 }}
          />
          {endDateRange[0] && (
            <ActionIcon size="sm" variant="transparent" c="dimmed" onClick={() => setEndDateRange([null, null])}>
              <IconX size={14} />
            </ActionIcon>
          )}
        </Group>
      ),
      filtering: !!endDateRange[0],
    },
    {
      accessor: "price_per_m2",
      title: "Cena za m²",
      sortable: true,
      width: "9%",
      render: row => row.price_per_m2 ? `${row.price_per_m2} Kč` : "—",
    },
    {
      accessor: "square",
      title: "Náměstí",
      sortable: false,
      width: "16%",
      render: row => row.square?.name ? `${row.square.name}` : <Text c="dimmed" fs="italic">—</Text>,
      filter: (
        <MultiSelect
          label="Filtrovat náměstí"
          placeholder="Vyber náměstí"
          data={squareOptions}
          value={selectedSquareIds}
          onChange={setSelectedSquareIds}
          clearable
          searchable
          leftSection={<IconSearch size={16} />}
          comboboxProps={{ withinPortal: false }}
        />
      ),
      filtering: selectedSquareIds.length > 0,
    },
    {
      accessor: "image",
      title: "Obrázek",
      sortable: false,
      width: "11%",
      render: row =>
        row.image ? (
          <img src={row.image} alt={row.name} style={{ width: "100px", height: "auto", borderRadius: "8px" }} />
        ) : (
          <Text c="dimmed" fs="italic">Žádný obrázek</Text>
        ),
    },
    {
      accessor: "actions",
      title: "Akce",
      width: "5.5%",
      render: (event) => (
        <Container>
          <Row>
            <Col style={{ padding: 0, textAlign: "center", flexGrow: 0 }}>
              <ActionIcon size="sm" variant="subtle" color="green" onClick={() => handleShowEvent(event)}>
                <IconEye size={16} />
              </ActionIcon>
            </Col>
            <Col style={{ padding: 0, textAlign: "center", flexGrow: 0 }}>
              <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => handleEditEvent(event)}>
                <IconEdit size={16} />
              </ActionIcon>
            </Col>
          </Row>
          <Row>
            <Col style={{ padding: 0, textAlign: "center", flexGrow: 0 }}>
              <ActionIcon size="sm" variant="subtle" color="green" onClick={() => handleRedirectToMap(event)} title="Mapa">
                <IconMap size={16} />
              </ActionIcon>
            </Col>
            <Col style={{ padding: 0, textAlign: "center", flexGrow: 0 }}>
              <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDeleteEvent(event)}>
                <IconTrash size={16} />
              </ActionIcon>
            </Col>
          </Row>
        </Container>
          
          
          
          
      ),
    },
  ];

  return (
    <Container fluid className="p-0 d-flex flex-column" style={{ overflowX: "hidden", height: "100vh" }}>
      <Row className="mx-0 flex-grow-1">
        <Col xs={2} className="px-0 bg-light" style={{ minWidth: 0 }}>
          <Sidebar />
        </Col>
        <Col xs={10} className="px-0 bg-white d-flex flex-column" style={{ minWidth: 0 }}>
          <Group justify="space-between" align="center" px="md" py="sm">
            <h1>Akce</h1>
            <Button component="a" href="/manage/events/create" leftSection={<IconPlus size={16} />}>Přidat akci</Button>
          </Group>
          <Table
            data={filteredEvents}
            columns={columns}
            fetching={fetching}
            withTableBorder
            borderRadius="md"
            highlightOnHover
            verticalAlign="center"
            titlePadding="4px 8px"
          />
          <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            title={modalType === "edit" && !selectedEvent ? "Přidat akci" : getModalTitle()}
            size="lg"
            centered
          >
            {modalType === "view" ? (
              <Modal.Body>
                {selectedEvent && (
                  <>
                    <p><strong>ID:</strong> {selectedEvent.id}</p>
                    <p><strong>Název:</strong> {selectedEvent.name}</p>
                    <p><strong>Popis:</strong> {selectedEvent.description || "—"}</p>
                    <p><strong>Náměstí:</strong> {selectedEvent.square?.name || "Neznámé"}</p>
                    <p><strong>Začátek:</strong> {selectedEvent.start ? dayjs(selectedEvent.start).format("DD.MM.YYYY HH:mm") : "—"}</p>
                    <p><strong>Konec:</strong> {selectedEvent.end ? dayjs(selectedEvent.end).format("DD.MM.YYYY HH:mm") : "—"}</p>
                    <p><strong>Cena za m²:</strong> {selectedEvent.price_per_m2 ? `${selectedEvent.price_per_m2} Kč` : "—"}</p>
                    <p><strong>Počet míst:</strong> {Array.isArray(selectedEvent.market_slots) ? selectedEvent.market_slots.length : "—"}</p>
                    <p><strong>Produkty:</strong> {Array.isArray(selectedEvent.event_products) && selectedEvent.event_products.length > 0
                      ? selectedEvent.event_products.map(p => p.name).join(", ")
                      : "—"}</p>
                    <p><strong>Obrázek:</strong> {selectedEvent.image ? <img src={selectedEvent.image} alt={selectedEvent.name} style={{ width: "100px", height: "auto", borderRadius: "8px" }} /> : "Žádný obrázek"}</p>
                  </>
                )}
              </Modal.Body>
            ) : (
              <Modal.Body>
                {renderModalContent()}
              </Modal.Body>
            )}
            <Modal.Footer>
              <BootstrapButton variant="secondary" onClick={() => setShowModal(false)}>Zavřít</BootstrapButton>
              {modalType === "view" && (
                <BootstrapButton variant="primary" onClick={() => { setShowModal(false); handleEditEvent(selectedEvent); }}>Upravit</BootstrapButton>
              )}
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
}

export default Events;
