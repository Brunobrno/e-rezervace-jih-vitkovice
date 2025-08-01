import Table from "../../components/Table";
import Sidebar from "../../components/Sidebar";
import { getReservations, deleteReservation, updateReservation } from "../../api/model/reservation";
import { IconEye, IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import {
  ActionIcon,
  Button,
  Stack,
  Text,
  Group,
  Badge
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
    { accessor: "id", title: "ID", sortable: true },
    {
      accessor: "status",
      title: "Stav",
      render: (row) => (
        <Badge color={statusColors[row.status] || "gray"} variant="light">
          {row.status}
        </Badge>
      ),
    },
    {
      accessor: "event",
      title: "Událost",
      render: (row) => row.event.name || "Neznámá událost",
    },
    {
      accessor: "user",
      title: "Uživatel",
      render: (row) => row.user.username || "Neznámý",
    },
    {
      accessor: "reserved_from",
      title: "Rezervováno od",
      render: (row) => dayjs(row.reserved_from).format("DD.MM.YYYY HH:mm"),
      sortable: true,
    },
    {
      accessor: "reserved_to",
      title: "Rezervováno do",
      render: (row) => dayjs(row.reserved_to).format("DD.MM.YYYY HH:mm"),
      sortable: true,
    },
    {
      accessor: "final_price",
      title: "Cena",
      render: (row) => `${row.final_price} Kč`,
    },
    {
      accessor: "actions",
      title: "Akce",
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
            <h1>Rezervace</h1>
            <Button component="a" href="" leftSection={<IconPlus size={16} />}>Přidat rezervaci</Button>
          </Group>
          <Table
            data={reservations}
            columns={columns}
            fetching={fetching}
            withTableBorder
            borderRadius="md"
            highlightOnHover
            verticalAlign="center"
            onQueryChange={setQuery}
          />

          {/* Bootstrap Modal for view/edit */}
          <Form.Group>
            <div
              className="modal fade"
              style={{
                display: showModal && modalType === 'view' ? 'block' : 'none',
                zIndex: 9999,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'auto',
                background: showModal && modalType === 'view' ? 'rgba(0,0,0,0.5)' : 'none',
              }}
              tabIndex="-1"
              role="dialog"
            >
              <div className="modal-dialog modal-dialog-centered" role="document" style={{ zIndex: 10000 }}>
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Detail rezervace</h5>
                    <button type="button" className="close" onClick={() => setShowModal(false)} aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    {selectedReservation && (
                      <>
                        <p><strong>ID:</strong> {selectedReservation.id}</p>
                        <p><strong>Stav:</strong> {selectedReservation.status}</p>
                        <p><strong>Událost:</strong> {selectedReservation.event?.name || "Neznámá událost"}</p>
                        <p><strong>Uživatel:</strong> {selectedReservation.user?.username || "Neznámý"}</p>
                        <p><strong>Od:</strong> {dayjs(selectedReservation.reserved_from).format("DD.MM.YYYY HH:mm")}</p>
                        <p><strong>Do:</strong> {dayjs(selectedReservation.reserved_to).format("DD.MM.YYYY HH:mm")}</p>
                        <p><strong>Poznámka:</strong> {selectedReservation.note || "—"}</p>
                        <p><strong>Cena:</strong> {selectedReservation.final_price} Kč</p>
                      </>
                    )}
                  </div>
                  <div className="modal-footer">
                    <Button variant="outline" onClick={() => setShowModal(false)}>Zavřít</Button>
                    <Button color="blue" onClick={() => { setShowModal(false); handleEditReservationModal(selectedReservation); }}>Upravit</Button>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="modal fade"
              style={{
                display: showModal && modalType === 'edit' ? 'block' : 'none',
                zIndex: 9999,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'auto',
                background: showModal && modalType === 'edit' ? 'rgba(0,0,0,0.5)' : 'none',
              }}
              tabIndex="-1"
              role="dialog"
            >
              <div className="modal-dialog modal-dialog-centered" role="document" style={{ zIndex: 10000 }}>
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Upravit rezervaci</h5>
                    <button type="button" className="close" onClick={() => setShowModal(false)} aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <Form onSubmit={handleEditModalSubmit}>
                    <div className="modal-body">
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
                    </div>
                    <div className="modal-footer">
                      <Button variant="outline" onClick={() => setShowModal(false)}>Zrušit</Button>
                      <Button type="submit" color="blue" disabled={submitting}>Uložit změny</Button>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          </Form.Group>
        </Col>
      </Row>
    </Container>
  );
}

export default Reservations;