import Table from "../components/Table";
import Sidebar from "../components/Sidebar";
import { getReservations, deleteReservation } from "../api/model/reservation";
import { IconEye, IconEdit, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  ActionIcon,
  Button,
  Stack,
  Text,
  Modal,
  Group,
  Badge,
  TextInput,
  Select,
  NumberInput
} from "@mantine/core";
import dayjs from "dayjs";

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("view"); // 'view', 'edit', 'delete'
  const [query, setQuery] = useState("");

  const fetchReservations = async () => {
    setFetching(true);
    try {
      const params = { search: query };
      const data = await getReservations(params);
      setReservations(data.data);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [query]);

  const handleShowReservation = (reservation) => {
    setSelectedReservation(reservation);
    setModalType("view");
    setShowModal(true);
  };

  const handleEditReservation = (reservation) => {
    setSelectedReservation(reservation);
    setModalType("edit");
    setShowModal(true);
  };

  const handleDeleteReservation = async (reservation) => {
    if (window.confirm(`Opravdu smazat rezervaci ID: ${reservation.id}?`)) {
      await deleteReservation(reservation.id);
      fetchReservations();
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedReservation) {
      await deleteReservation(selectedReservation.id);
      setShowModal(false);
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
      render: (row) => `Událost #${row.event}`,
    },
    {
      accessor: "user",
      title: "Uživatel",
      render: (row) => `Uživatel #${row.user}`,
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
          <ActionIcon
            size="sm"
            variant="subtle"
            color="green"
            onClick={() => handleShowReservation(reservation)}
          >
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="blue"
            onClick={() => handleEditReservation(reservation)}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="red"
            onClick={() => handleDeleteReservation(reservation)}
          >
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
              <Button onClick={() => handleEditReservation(selectedReservation)}>
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
            data={reservations}
            columns={columns}
            fetching={fetching}
            withTableBorder
            borderRadius="md"
            highlightOnHover
            verticalAlign="center"
            onQueryChange={setQuery}
          />

          {/* Custom Modal for Reservations */}
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

export default Reservations;