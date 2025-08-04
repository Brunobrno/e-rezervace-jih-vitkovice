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
  Switch,
  Badge,
  Tooltip,
} from "@mantine/core";
import { IconSearch, IconX, IconEye, IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import userAPI from "../../api/model/user";

function Users() {
  // State
  const [users, setUsers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  // Add more fields to formData for editing
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "",
    account_type: "",
    email_verified: false,
    phone_number: "",
    city: "",
    street: "",
    PSC: "",
    bank_account: "",
    ICO: "",
    RC: "",
    GDPR: false,
    is_active: true,
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch users
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching users...");
        const data = await userAPI.getUsers();
        // Defensive: check if response is array, otherwise log error and set empty array
        if (Array.isArray(data)) {
          console.log("Fetched users:", data);
          setUsers(data);
        } else if (data && Array.isArray(data.results)) {
          // DRF pagination: { count, next, previous, results }
          console.log("Fetched users (paginated):", data.results);
          setUsers(data.results);
        } else {
          console.error("Fetched users is not an array:", data);
          setUsers([]);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setUsers([]);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  // Role/group options
  const roleOptions = useMemo(() => {
    if (!Array.isArray(users)) return [];
    const allRoles = users.map(u => u.role).filter(Boolean);
    return [...new Set(allRoles)];
  }, [users]);

  const accountTypeOptions = useMemo(() => {
    if (!Array.isArray(users)) return [];
    const allTypes = users.map(u => u.account_type).filter(Boolean);
    return [...new Set(allTypes)];
  }, [users]);

  // Filtering
  const filteredUsers = useMemo(() => {
    let data = Array.isArray(users) ? users : [];
    if (query) {
      const q = query.toLowerCase();
      data = data.filter(
        u =>
          u.username?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.first_name?.toLowerCase().includes(q) ||
          u.last_name?.toLowerCase().includes(q) ||
          u.city?.toLowerCase().includes(q) ||
          u.street?.toLowerCase().includes(q)
      );
    }
    if (selectedRoles.length > 0) {
      data = data.filter(u => selectedRoles.includes(u.role));
    }
    return data;
  }, [users, query, selectedRoles]);

  // Handlers
  const handleShowUser = (user) => {
    console.log("Show user:", user);
    setSelectedUser(user);
    setModalType('view');
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    console.log("Edit user:", user);
    setSelectedUser(user);
    setFormData({
      username: user.username || "",
      email: user.email || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      role: user.role || "",
      account_type: user.account_type || "",
      email_verified: user.email_verified || false,
      phone_number: user.phone_number || "",
      city: user.city || "",
      street: user.street || "",
      PSC: user.PSC || "",
      bank_account: user.bank_account || "",
      ICO: user.ICO || "",
      RC: user.RC || "",
      GDPR: user.GDPR || false,
      is_active: user.is_active ?? true,
    });
    setModalType('edit');
    setShowModal(true);
    setError(null);
  };

  const handleDeleteUser = async (user) => {
    console.log("Delete user:", user);
    if (window.confirm(`Opravdu smazat uživatele: ${user.username}?`)) {
      await userAPI.deleteUser(user.id);
      const data = await userAPI.getUsers();
      setUsers(data);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log("Form change:", name, type === "checkbox" ? checked : value);
    setFormData((old) => ({
      ...old,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleGroupsChange = (groups) => {
    console.log("Groups changed:", groups);
    setFormData((old) => ({ ...old, groups }));
  };

  const handleEditModalSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    console.log("Submitting edit:", formData);
    try {
      await userAPI.updateUser(selectedUser.id, formData);
      setShowModal(false);
      const data = await userAPI.getUsers();
      setUsers(data);
    } catch (err) {
      const apiErrors = err.response?.data;
      if (typeof apiErrors === "object") {
        const messages = Object.entries(apiErrors)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
          .join("\n");
        setError("Chyba při ukládání:\n" + messages);
        console.log("API error:", apiErrors);
      } else {
        setError("Chyba při ukládání: " + (err.message || "Neznámá chyba"));
        console.log("Unknown error:", err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Table columns
  const columns = [
    { accessor: "id", title: "#", sortable: true, width: "48px" },
    {
      accessor: "username",
      title: "Uživatelské jméno",
      sortable: true,
      width: "1.5fr",
      filter: (
        <TextInput
          label="Hledat uživatele"
          placeholder="Např. jmeno, email, město..."
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
      accessor: "email",
      title: "Email",
      sortable: true,
      width: "2fr",
    },
    {
      accessor: "first_name",
      title: "Jméno",
      sortable: true,
      width: "1fr",
    },
    {
      accessor: "last_name",
      title: "Příjmení",
      sortable: true,
      width: "1fr",
    },
    {
      accessor: "role",
      title: "Role",
      width: "1fr",
      render: (row) =>
        row.role ? (
          <Badge color="blue" variant="light">{row.role}</Badge>
        ) : (
          <Text c="dimmed" fs="italic">Žádná</Text>
        ),
      filter: (
        <MultiSelect
          label="Filtrovat role"
          placeholder="Vyber roli/role"
          data={roleOptions}
          value={selectedRoles}
          onChange={setSelectedRoles}
          clearable
          searchable
          leftSection={<IconSearch size={16} />}
          comboboxProps={{ withinPortal: false }}
        />
      ),
      filtering: selectedRoles.length > 0,
    },
    {
      accessor: "account_type",
      title: "Typ účtu",
      width: "1fr",
      render: (row) =>
        row.account_type ? (
          <Badge color="gray" variant="light">{row.account_type}</Badge>
        ) : (
          <Text c="dimmed" fs="italic">—</Text>
        ),
      sortable: true,
    },
    {
      accessor: "email_verified",
      title: "E-mail ověřen",
      width: "1fr",
      render: (row) =>
        row.email_verified ? (
          <Badge color="green" variant="light">Ano</Badge>
        ) : (
          <Badge color="red" variant="light">Ne</Badge>
        ),
      sortable: true,
    },
    {
      accessor: "is_active",
      title: "Aktivní",
      width: "0.7fr",
      render: (row) => row.is_active ? "Ano" : "Ne",
      sortable: true,
    },
    {
      accessor: "city",
      title: "Město",
      width: "1fr",
    },
    {
      accessor: "PSC",
      title: "PSČ",
      width: "0.7fr",
    },
    {
      accessor: "actions",
      title: "Akce",
      width: "80px",
      render: (user) => (
        <Group gap={4} wrap="nowrap">
          <ActionIcon size="sm" variant="subtle" color="green" onClick={() => handleShowUser(user)}>
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => handleEditUser(user)}>
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDeleteUser(user)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
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
            <h1>Uživatelé</h1>
            {/* Add user button can be implemented if needed */}
            {/* <Button leftSection={<IconPlus size={16} />}>Přidat uživatele</Button> */}
          </Group>

          <Table
            data={filteredUsers}
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
              <Modal.Title>Detail uživatele</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedUser && (
                <>
                  <p><strong>ID:</strong> {selectedUser.id}</p>
                  <p><strong>Uživatelské jméno:</strong> {selectedUser.username}</p>
                  <p><strong>Email:</strong> {selectedUser.email || "—"}</p>
                  <p><strong>Jméno:</strong> {selectedUser.first_name || "—"}</p>
                  <p><strong>Příjmení:</strong> {selectedUser.last_name || "—"}</p>
                  <p><strong>Role:</strong> {(selectedUser.groups && selectedUser.groups.length > 0) ? selectedUser.groups.join(", ") : "—"}</p>
                  <p><strong>Aktivní:</strong> {selectedUser.is_active ? "Ano" : "Ne"}</p>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <BootstrapButton variant="secondary" onClick={() => setShowModal(false)}>Zavřít</BootstrapButton>
              <BootstrapButton variant="primary" onClick={() => { setShowModal(false); handleEditUser(selectedUser); }}>Upravit</BootstrapButton>
            </Modal.Footer>
          </Modal>

          {/* Bootstrap Modal for edit */}
          <Modal show={showModal && modalType === 'edit'} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Upravit uživatele</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleEditModalSubmit}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Uživatelské jméno</Form.Label>
                  <Form.Control name="username" value={formData.username} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control name="email" value={formData.email} onChange={handleChange} type="email" required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Jméno</Form.Label>
                  <Form.Control name="first_name" value={formData.first_name} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Příjmení</Form.Label>
                  <Form.Control name="last_name" value={formData.last_name} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select name="role" value={formData.role} onChange={handleChange}>
                    <option value="">—</option>
                    {roleOptions.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Typ účtu</Form.Label>
                  <Form.Select name="account_type" value={formData.account_type} onChange={handleChange}>
                    <option value="">—</option>
                    {accountTypeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Telefon</Form.Label>
                  <Form.Control name="phone_number" value={formData.phone_number} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Město</Form.Label>
                  <Form.Control name="city" value={formData.city} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Ulice</Form.Label>
                  <Form.Control name="street" value={formData.street} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>PSČ</Form.Label>
                  <Form.Control name="PSC" value={formData.PSC} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Bankovní účet</Form.Label>
                  <Form.Control name="bank_account" value={formData.bank_account} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>IČO</Form.Label>
                  <Form.Control name="ICO" value={formData.ICO} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Rodné číslo</Form.Label>
                  <Form.Control name="RC" value={formData.RC} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="email_verified"
                    name="email_verified"
                    label="E-mail ověřen"
                    checked={formData.email_verified}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="GDPR"
                    name="GDPR"
                    label="GDPR souhlas"
                    checked={formData.GDPR}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="is_active"
                    name="is_active"
                    label={formData.is_active ? "Aktivní" : "Neaktivní"}
                    checked={formData.is_active}
                    onChange={e => setFormData(old => ({ ...old, is_active: e.target.checked }))}
                  />
                </Form.Group>
                {error && <Alert variant="danger">{error}</Alert>}
              </Modal.Body>
              <Modal.Footer>
                <BootstrapButton variant="secondary" onClick={() => setShowModal(false)}>Zrušit</BootstrapButton>
                <BootstrapButton type="submit" variant="primary" disabled={submitting}>Uložit změny</BootstrapButton>
              </Modal.Footer>
            </Form>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
}

export default Users;
