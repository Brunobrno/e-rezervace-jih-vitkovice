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
import { IconSearch, IconX, IconEye, IconEdit, IconTrash, IconPlus, IconReceipt2 } from "@tabler/icons-react";
import orderAPI from "../../api/model/order";
import userAPI from "../../api/model/user";

function Orders() {
  // Delete handler
  const handleDeleteOrder = async (order) => {
    if (window.confirm(`Opravdu smazat objednávku: ${order.order_number}?`)) {
      await orderAPI.deleteOrder(order.id); // use id instead of order_number
      const data = await orderAPI.getOrders();
      setOrders(data);
    }
  };

  // Bootstrap Modal state for edit
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setFormData({
      note: order.note || "",
      status: order.status || "",
      price_to_pay: order.price_to_pay || "",
      payed_at: order.payed_at || "",
    });
    setShowEditModal(true);
  };

  const handleEditModalSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await orderAPI.updateOrder(selectedOrder.id, formData); // use id instead of order_number
      setShowEditModal(false);
      setFormData({
        note: "",
        status: "",
        price_to_pay: "",
        payed_at: "",
      });
      const data = await orderAPI.getOrders();
      setOrders(data);
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

  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [userQuery, setUserQuery] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'edit'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    note: "",
    status: "",
    price_to_pay: "",
    payed_at: "",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await orderAPI.getOrders();
        setOrders(data);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  // Fetch user options for filter
  useEffect(() => {
    async function fetchUsers() {
      try {
        const users = await userAPI.getUsers();
        setUserOptions(
          users.map(u => ({
            value: String(u.id), // Mantine expects string values
            label: `${u.first_name} ${u.last_name} (${u.email})`
          }))
        );
      } catch (e) {
        setUserOptions([]);
      }
    }
    fetchUsers();
  }, []);

  // Status options for filter
  const statusOptions = [
    { value: "pending", label: "Čeká na zaplacení" },
    { value: "payed", label: "Zaplaceno" },
    { value: "cancelled", label: "Stornováno" },
  ];

  // Filtering
  const filteredOrders = useMemo(() => {
    let data = Array.isArray(orders) ? orders : [];
    if (query) {
      const q = query.toLowerCase();
      data = data.filter(
        r =>
          r.order_number?.toLowerCase().includes(q) ||
          r.note?.toLowerCase().includes(q) ||
          r.user?.email?.toLowerCase().includes(q) ||
          r.user?.first_name?.toLowerCase().includes(q) ||
          r.user?.last_name?.toLowerCase().includes(q) ||
          r.reservation?.note?.toLowerCase().includes(q)
      );
    }
    if (userQuery) {
      const uq = userQuery.toLowerCase();
      data = data.filter(r =>
        r.user &&
        (
          r.user.email?.toLowerCase().includes(uq) ||
          r.user.first_name?.toLowerCase().includes(uq) ||
          r.user.last_name?.toLowerCase().includes(uq)
        )
      );
    }
    if (selectedStatus.length > 0) {
      data = data.filter(r => selectedStatus.includes(r.status));
    }
    return data;
  }, [orders, query, selectedStatus, userQuery]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((old) => ({ ...old, [name]: value }));
  };

  // Handlers for modal actions
  const handleShowOrder = (order) => {
    setSelectedOrder(order);
    setModalType('view');
    setShowModal(true);
  };

  const columns = [
    { accessor: "order_number", title: "Číslo objednávky", sortable: true, width: "14%" },
    {
      accessor: "user",
      title: "Uživatel",
      width: "16%",
      filter: (
        <TextInput
          label="Hledat uživatele"
          placeholder="Jméno, příjmení, email"
          leftSection={<IconSearch size={16} />}
          rightSection={
            <ActionIcon size="sm" variant="transparent" c="dimmed" onClick={() => setUserQuery("")}>
              <IconX size={14} />
            </ActionIcon>
          }
          value={userQuery}
          onChange={e => setUserQuery(e.currentTarget.value)}
        />
      ),
      filtering: userQuery !== "",
      render: (row) => row.user ? `${row.user.first_name} ${row.user.last_name} (${row.user.email})` : "—",
    },
    {
      accessor: "reservation",
      title: "Rezervace",
      width: "16%",
      render: (row) => row.reservation ? `ID: ${row.reservation.id}` : "—",
    },
    { accessor: "created_at", title: "Vytvořeno", sortable: true, width: "12%" },
    {
      accessor: "status",
      title: "Stav",
      width: "10%",
      filter: (
        <MultiSelect
          label="Filtrovat stav"
          placeholder="Vyber stav"
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
      render: (row) => {
        const statusObj = statusOptions.find(opt => opt.value === row.status);
        return statusObj ? statusObj.label : row.status;
      },
    },
    { accessor: "price_to_pay", title: "Cena", width: "8%" },
    { accessor: "payed_at", title: "Zaplaceno dne", width: "12%" },
    { accessor: "note", title: "Poznámka", width: "12%" },
    {
      accessor: "actions",
      title: "Akce",
      width: "8%",
      render: (order) => (
        <Group gap={4} wrap="nowrap">
          <ActionIcon size="sm" variant="subtle" color="green" onClick={() => handleShowOrder(order)}>
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => handleEditOrder(order)}>
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDeleteOrder(order)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  // Modal content for view/edit
  const renderModalContent = () => {
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
            <h1>
              <IconReceipt2 size={30} style={{ marginRight: 10, marginTop: -4 }} />
              Objednávky
            </h1>
            {/* You can add a button for creating new orders if needed */}
          </Group>

          <Table
            data={filteredOrders}
            columns={columns}
            fetching={fetching}
            withTableBorder
            borderRadius="md"
            highlightOnHover
            verticalAlign="center"
            titlePadding="4px 8px"
          />

          {/* Mantine modal for add only (not used for orders) */}
          <Modal
            opened={showModal && modalType === 'add'}
            onClose={() => setShowModal(false)}
            title={'Přidat objednávku'}
            size="lg"
            centered
          >
            {renderModalContent()}
          </Modal>

          {/* Bootstrap Modal for view */}
          <Modal show={showModal && modalType === 'view'} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Detail objednávky</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedOrder && (
                <>
                  <p><strong>Číslo objednávky:</strong> {selectedOrder.order_number}</p>
                  <p><strong>Uživatel:</strong> {selectedOrder.user ? `${selectedOrder.user.first_name} ${selectedOrder.user.last_name} (${selectedOrder.user.email})` : "—"}</p>
                  <p><strong>Rezervace:</strong> {selectedOrder.reservation ? `ID: ${selectedOrder.reservation.id}` : "—"}</p>
                  <p><strong>Vytvořeno:</strong> {selectedOrder.created_at}</p>
                  <p><strong>Stav:</strong> {selectedOrder.status}</p>
                  <p><strong>Cena:</strong> {selectedOrder.price_to_pay}</p>
                  <p><strong>Zaplaceno dne:</strong> {selectedOrder.payed_at || "—"}</p>
                  <p><strong>Poznámka:</strong> {selectedOrder.note || "—"}</p>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <BootstrapButton variant="secondary" onClick={() => setShowModal(false)}>Zavřít</BootstrapButton>
              <BootstrapButton variant="primary" onClick={() => { setShowModal(false); handleEditOrder(selectedOrder); }}>Upravit</BootstrapButton>
            </Modal.Footer>
          </Modal>

          {/* Bootstrap Modal for edit */}
          <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Upravit objednávku</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleEditModalSubmit}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Poznámka</Form.Label>
                  <Form.Control name="note" value={formData.note} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Stav</Form.Label>
                  <Form.Select name="status" value={formData.status} onChange={handleChange}>
                    <option value="">Vyberte stav</option>
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Cena</Form.Label>
                  <Form.Control name="price_to_pay" value={formData.price_to_pay} onChange={handleChange} type="number" min="0" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Zaplaceno dne</Form.Label>
                  <Form.Control name="payed_at" value={formData.payed_at} onChange={handleChange} type="datetime-local" />
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

export default Orders;
