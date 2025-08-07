import Table from "../../components/Table";
import Sidebar from "../../components/Sidebar";
import { getReservations, deleteReservation, updateReservation } from "../../api/model/reservation";
import { IconEye, IconEdit, IconTrash, IconPlus, IconSearch, IconX, IconReceipt2 } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Modal, Button as BootstrapButton } from "react-bootstrap";
import {
  ActionIcon,
  Button,
  Stack,
  Text,
  Group,
  Badge,
  MultiSelect,
  TextInput
} from "@mantine/core";
import dayjs from "dayjs";

function Reservations() {
  // Modal state for view/edit
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'edit'
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [formData, setFormData] = useState({
    status: "",
    note: "",
    final_price: "",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Open view modal
  const handleShowReservationModal = (reservation) => {
    setSelectedReservation(reservation);
    setModalType('view');
    setShowModal(true);
  };

  // Open edit modal
  const handleEditReservationModal = (reservation) => {
    setSelectedReservation(reservation);
    setFormData({
      status: reservation.status || "",
      note: reservation.note || "",
      final_price: reservation.final_price || "",
    });
    setModalType('edit');
    setShowModal(true);
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((old) => ({ ...old, [name]: value }));
  };

  // Submit edit modal
  const handleEditModalSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await updateReservation(selectedReservation.id, {
        status: formData.status,
        note: formData.note,
        final_price: formData.final_price,
      });
      setShowModal(false);
      setFormData({ status: "", note: "", final_price: "" });
      fetchReservations();
    } catch (err) {
      const apiErrors = err.response?.data;
      if (typeof apiErrors === "object") {
        const messages = Object.entries(apiErrors)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
          .join("\n");
        setError("Chyba při ukládání:\n" + messages);
      } else {
        setError("Chyba při ukládání: " + (err.message || "Neznámá chyba"));
      }
    } finally {
      setSubmitting(false);
    }
  };
  const [reservations, setReservations] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState([]);

  // Status options for filter
  const statusOptions = [
    { value: "reserved", label: "Rezervováno" },
    { value: "cancelled", label: "Zrušeno" },
    { value: "completed", label: "Dokončeno" },
    { value: "pending", label: "Čekající" },
  ];

  // Filtering (pattern as in Users.jsx)
  const filteredReservations = reservations.filter(r => {
    let match = true;
    if (query) {
      const q = query.toLowerCase();
      match =
        (r.user?.username?.toLowerCase().includes(q) ||
          r.event?.name?.toLowerCase().includes(q) ||
          String(r.id).includes(q) ||
          r.status?.toLowerCase().includes(q) ||
          r.note?.toLowerCase().includes(q));
    }
    if (selectedStatus.length > 0) {
      match = match && selectedStatus.includes(r.status);
    }
    return match;
  });

  const fetchReservations = async () => {
    setFetching(true);
    try {
      const params = { search: query };
      const data = await getReservations(params);
      setReservations(data);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [query]);

  // Remove unused Mantine modal logic
  // Use only Bootstrap modals for view/edit

  const handleDeleteReservation = async (reservation) => {
    if (window.confirm(`Opravdu smazat rezervaci ID: ${reservation.id}?`)) {
      await deleteReservation(reservation.id);
      fetchReservations();
    }
  };

  const statusColors = {
    reserved: "blue",
    cancelled: "red",
    completed: "green",
    pending: "yellow",
  };

  const columns = [
    { accessor: "id", title: "#", sortable: true, width: "48px" },
    {
      accessor: "user",
      title: "Uživatel",
      sortable: true,
      width: "1.5fr",
      render: row => row.user?.username || row.user || "—",
      filter: (
        <TextInput
          label="Hledat uživatele"
          placeholder="Např. jméno, email..."
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
      accessor: "event",
      title: "Událost",
      sortable: true,
      width: "2fr",
      render: row => row.event?.name || "—",
    },
    {
      accessor: "market_slot",
      title: "Prodejní místo",
      sortable: true,
      width: "1.2fr",
      render: row => row.market_slot?.name || row.market_slot?.id || "—",
    },
    {
      accessor: "used_extension",
      title: "Rozšíření (m²)",
      sortable: true,
      width: "1fr",
      render: row => row.used_extension ?? 0,
    },
    {
      accessor: "reserved_from",
      title: "Od",
      sortable: true,
      width: "1.2fr",
      render: row => row.reserved_from ? dayjs(row.reserved_from, "YYYY-MM-DD").format("DD.MM.YYYY") : "—",
    },
    {
      accessor: "reserved_to",
      title: "Do",
      sortable: true,
      width: "1.2fr",
      render: row => row.reserved_to ? dayjs(row.reserved_to, "YYYY-MM-DD").format("DD.MM.YYYY") : "—",
    },
    {
      accessor: "created_at",
      title: "Vytvořeno",
      sortable: true,
      width: "1.2fr",
      render: row => row.created_at ? dayjs(row.created_at).format("DD.MM.YYYY HH:mm") : "—",
    },
    {
      accessor: "status",
      title: "Stav",
      sortable: true,
      width: "1fr",
      render: row => {
        const color = statusColors[row.status] || "gray";
        const label = statusOptions.find(opt => opt.value === row.status)?.label || row.status;
        return <Badge color={color} variant="light">{label}</Badge>;
      },
      filter: (
        <MultiSelect
          label="Filtrovat stav"
          placeholder="Vyber stav(y)"
          data={statusOptions}
          value={selectedStatus}
          onChange={setSelectedStatus}
          clearable
          searchable
          leftSection={<IconSearch size={16} />}
          comboboxProps={{ withinPortal: false }}
        />
      ),
      filtering: selectedStatus.length > 0,
    },
    {
      accessor: "note",
      title: "Poznámka",
      sortable: false,
      width: "2fr",
      render: row => row.note || "—",
    },
    {
      accessor: "final_price",
      title: "Cena (Kč)",
      sortable: true,
      width: "1fr",
      render: row => row.final_price ?? 0,
    },
    {
      accessor: "actions",
      title: "Akce",
      width: "80px",
      render: (reservation) => (
        <Group gap={4} wrap="nowrap">
          <ActionIcon size="sm" variant="subtle" color="green" onClick={() => handleShowReservationModal(reservation)}>
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => handleEditReservationModal(reservation)}>
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDeleteReservation(reservation)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  const renderModalContent = () => {
    if (!selectedReservation) return <Text>Rezervace nebyla nalezena</Text>;

    switch (modalType) {
      case "view":
        return (
          <Stack>
            <Text>
              <strong>ID:</strong> {selectedReservation.id}
            </Text>
            <Text>
              <strong>Stav:</strong>{" "}
              <Badge color={statusColors[selectedReservation.status] || "gray"}>
                {selectedReservation.status}
              </Badge>
            </Text>
            <Text>
              <strong>Událost:</strong> #{selectedReservation.event}
            </Text>
            <Text>
              <strong>Pozice:</strong> #{selectedReservation.marketSlot}
            </Text>
            <Text>
              <strong>Uživatel:</strong> #{selectedReservation.user}
            </Text>
            <Text>
              <strong>Rozšíření:</strong>{" "}
              {selectedReservation.used_extension || "Žádné"}
            </Text>
            <Text>
              <strong>Od:</strong>{" "}
              {dayjs(selectedReservation.reserved_from).format(
                "DD.MM.YYYY HH:mm"
              )}
            </Text>
            <Text>
              <strong>Do:</strong>{" "}
              {dayjs(selectedReservation.reserved_to).format("DD.MM.YYYY HH:mm")}
            </Text>
            <Text>
              <strong>Vytvořeno:</strong>{" "}
              {dayjs(selectedReservation.created_at).format("DD.MM.YYYY HH:mm")}
            </Text>
            <Text>
              <strong>Poznámka:</strong> {selectedReservation.note || "—"}
            </Text>
            <Text>
              <strong>Cena:</strong> {selectedReservation.final_price} Kč
            </Text>
            <Group mt="md">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Zavřít
              </Button>
              <Button onClick={() => { setShowModal(false); handleEditReservationModal(selectedReservation); }}>
                Upravit
              </Button>
            </Group>
          </Stack>
        );

      case "edit":
        return (
          <Stack>
            <Select
              label="Stav rezervace"
              defaultValue={selectedReservation.status}
              data={[
                { value: "reserved", label: "Rezervováno" },
                { value: "cancelled", label: "Zrušeno" },
                { value: "completed", label: "Dokončeno" },
                { value: "pending", label: "Čekající" },
              ]}
              mb="sm"
            />
            
            <TextInput
              label="Událost"
              defaultValue={`#${selectedReservation.event}`}
              disabled
              mb="sm"
            />
            
            <TextInput
              label="Uživatel"
              defaultValue={`#${selectedReservation.user}`}
              disabled
              mb="sm"
            />
            
            <TextInput
              label="Pozice"
              defaultValue={`#${selectedReservation.marketSlot}`}
              disabled
              mb="sm"
            />
            
            <TextInput
              label="Od"
              defaultValue={dayjs(selectedReservation.reserved_from).format(
                "DD.MM.YYYY HH:mm"
              )}
              disabled
              mb="sm"
            />
            
            <TextInput
              label="Do"
              defaultValue={dayjs(selectedReservation.reserved_to).format(
                "DD.MM.YYYY HH:mm"
              )}
              disabled
              mb="sm"
            />
            
            <NumberInput
              label="Cena (Kč)"
              defaultValue={parseFloat(selectedReservation.final_price)}
              min={0}
              precision={2}
              mb="sm"
            />
            
            <TextInput
              label="Poznámka"
              defaultValue={selectedReservation.note}
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
            <Text>
              Opravdu chcete smazat rezervaci ID: {selectedReservation.id}?
            </Text>
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
    if (!selectedReservation) return "Detail rezervace";

    switch (modalType) {
      case "view":
        return `Rezervace #${selectedReservation.id}`;
      case "edit":
        return `Upravit rezervaci #${selectedReservation.id}`;
      case "delete":
        return `Smazat rezervaci`;
      default:
        return "Detail rezervace";
    }
  };

  return (
    <Container fluid className="p-0 d-flex flex-column" style={{ overflowX: "hidden", height: "100vh" }}>
      <Row className="mx-0 flex-grow-1">
        <Col xs={2} className="px-0 bg-light" style={{ minWidth: 0 }}>
          <Sidebar />
        </Col>
        <Col xs={10} className="px-0 bg-white d-flex flex-column" style={{ minWidth: 0 }}>
          <Group justify="space-between" align="center" px="md" py="sm">
            <h1>
              <IconReceipt2 size={30} style={{ marginRight: 10, marginTop: -4 }} />
              Rezervace
            </h1>
            <Button component="a" href="/create-reservation" leftSection={<IconPlus size={16} />}>Přidat rezervaci</Button>
          </Group>
          <Table
            data={filteredReservations}
            columns={columns}
            fetching={fetching}
            withTableBorder
            borderRadius="md"
            highlightOnHover
            verticalAlign="center"
            titlePadding="4px 8px"
          />

          {/* Bootstrap Modal for view */}
          <Modal show={showModal && modalType === 'view'} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Detail rezervace</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedReservation && (
                <>
                  <p><strong>ID:</strong> {selectedReservation.id}</p>
                  <p><strong>Stav:</strong> {selectedReservation.status}</p>
                  <p><strong>Událost:</strong> {selectedReservation.event?.name || "Neznámá událost"}</p>
                  <p><strong>Uživatel:</strong> {selectedReservation.user?.username || "Neznámý"}</p>
                  <p><strong>Od:</strong> {dayjs(selectedReservation.reserved_from, "YYYY-MM-DD").format("DD.MM.YYYY")}</p>
                  <p><strong>Do:</strong> {dayjs(selectedReservation.reserved_to, "YYYY-MM-DD").format("DD.MM.YYYY")}</p>
                  <p><strong>Poznámka:</strong> {selectedReservation.note || "—"}</p>
                  <p><strong>Cena:</strong> {selectedReservation.final_price} Kč</p>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <BootstrapButton variant="outline" onClick={() => setShowModal(false)}>Zavřít</BootstrapButton>
              <BootstrapButton variant="primary" onClick={() => { setShowModal(false); handleEditReservationModal(selectedReservation); }}>Upravit</BootstrapButton>
            </Modal.Footer>
          </Modal>

          {/* Bootstrap Modal for edit */}
          <Modal show={showModal && modalType === 'edit'} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Upravit rezervaci</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleEditModalSubmit}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Stav rezervace</Form.Label>
                  <Form.Control as="select" name="status" value={formData.status} onChange={handleChange} required>
                    <option value="reserved">Rezervováno</option>
                    <option value="cancelled">Zrušeno</option>
                    <option value="completed">Dokončeno</option>
                    <option value="pending">Čekající</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Poznámka</Form.Label>
                  <Form.Control as="textarea" rows={4} name="note" value={formData.note} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Cena (Kč)</Form.Label>
                  <Form.Control type="number" name="final_price" value={formData.final_price} onChange={handleChange} />
                </Form.Group>
                {error && <Text color="red">{error}</Text>}
              </Modal.Body>
              <Modal.Footer>
                <BootstrapButton variant="outline" onClick={() => setShowModal(false)}>Zrušit</BootstrapButton>
                <BootstrapButton type="submit" variant="primary" disabled={submitting}>Uložit změny</BootstrapButton>
              </Modal.Footer>
            </Form>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
}

export default Reservations;