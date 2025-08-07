import {
  Container, Row, Col,
  Card,
  Badge,
  Button,
  Tabs, Tab,
  Modal, Form, Alert
} from "react-bootstrap";
import { faGear, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { useState, useEffect, useContext } from "react";
import dayjs from "dayjs";

import Table from "../components/Table";

import ordersAPI from "../api/model/order";
import reservationsAPI from "../api/model/reservation";
import ticketsAPI from "../api/model/ticket";
import { IconEye, IconEdit, IconTrash, IconCreditCard } from "@tabler/icons-react";
import { Group, ActionIcon, Text, Stack } from "@mantine/core";
import { useNavigate } from "react-router-dom";


function Home() {
  const { user } = useContext(UserContext) || {};

  const [user_reservations, setReservations] = useState([]);
  const [user_orders, setOrders] = useState([]);
  const [user_tickets, setTickets] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        var data = await reservationsAPI.getReservations({ user: user.id });
        setReservations(data);
        data = undefined;

        data = await ordersAPI.getOrders({ user: user.id });
        setOrders(data);
        data = undefined;

        data = await ticketsAPI.getServiceTickets({ user: user.id });
        setTickets(data); // <-- FIX: was setOrders(data)
      } catch (err) {
        console.error("Chyba při načítání:", err);
      }
    };

    if (user?.id) {
      fetchReservations();
    }
  }, [user?.id]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'view', 'edit'
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Reservation actions
  const handleShowReservation = (record) => {
    setSelectedRecord(record);
    setModalType("view-reservation");
    setShowModal(true);
  };
  const handleEditReservation = (record) => {
    setSelectedRecord(record);
    setFormData({
      ...record,
      // Add more fields if needed
    });
    setModalType("edit-reservation");
    setShowModal(true);
    setError(null);
  };
  const handleDeleteReservation = async (record) => {
    if (window.confirm(`Opravdu smazat rezervaci #${record.id}?`)) {
      // Implement delete API call here
      // await reservationAPI.deleteReservation(record.id);
      setReservations((prev) => prev.filter(r => r.id !== record.id));
    }
  };

  // Order actions
  const handleShowOrder = (record) => {
    setSelectedRecord(record);
    setModalType("view-order");
    setShowModal(true);
  };
  const handleEditOrder = (record) => {
    setSelectedRecord(record);
    setFormData({
      ...record,
      // Add more fields if needed
    });
    setModalType("edit-order");
    setShowModal(true);
    setError(null);
  };
  const handleDeleteOrder = async (record) => {
    if (window.confirm(`Opravdu smazat objednávku #${record.id}?`)) {
      // Implement delete API call here
      // await orderAPI.deleteOrder(record.id);
      setOrders((prev) => prev.filter(r => r.id !== record.id));
    }
  };
  const handlePayOrder = (record) => {
    navigate(`/payment/${record.id}`);
  };

  // Ticket actions
  const handleShowTicket = (record) => {
    setSelectedRecord(record);
    setModalType("view-ticket");
    setShowModal(true);
  };
  const handleEditTicket = (record) => {
    setSelectedRecord(record);
    setFormData({
      ...record,
      // Add more fields if needed
    });
    setModalType("edit-ticket");
    setShowModal(true);
    setError(null);
  };
  const handleDeleteTicket = async (record) => {
    if (window.confirm(`Opravdu smazat ticket #${record.id}?`)) {
      // Implement delete API call here
      // await ticketAPI.deleteTicket(record.id);
      setTickets((prev) => prev.filter(r => r.id !== record.id));
    }
  };

  // Edit modal submit handlers (example for reservation)
  const handleEditModalSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // Implement update API call here, e.g.:
      // await reservationAPI.updateReservation(selectedRecord.id, formData);
      setShowModal(false);
      // Refresh data if needed
    } catch (err) {
      setError("Chyba při ukládání: " + (err.message || "Neznámá chyba"));
    } finally {
      setSubmitting(false);
    }
  };

  const reservation_columns = [
    { accessor: "id", title: "ID", sortable: true },
    { accessor: "event.name", title: "Událost", sortable: true },
    { accessor: "marketSlot", title: "Slot", sortable: true },
    { accessor: "used_extension", title: "Prodlouženo", sortable: true },
    {
      accessor: "reserved_from",
      title: "Od",
      sortable: true,
      render: ({ reserved_from }) => dayjs(reserved_from).format("DD.MM.YYYY HH:mm"),
    },
    {
      accessor: "reserved_to",
      title: "Do",
      sortable: true,
      render: ({ reserved_to }) => dayjs(reserved_to).format("DD.MM.YYYY HH:mm"),
    },
    {
      accessor: "final_price",
      title: "Cena",
      sortable: true,
      render: ({ final_price }) => `${Number(final_price).toFixed(2)} Kč`,
    },
    { accessor: "status", title: "Stav", sortable: true },
    {
      accessor: "actions",
      title: "Akce",
      width: "5.5%",
      render: (record) => (
        <Group gap={4} wrap="nowrap">
          <ActionIcon size="sm" variant="subtle" color="green" onClick={() => handleShowReservation(record)}>
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => handleEditReservation(record)}>
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDeleteReservation(record)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  const order_columns = [
    { accessor: "id", title: "ID", sortable: true },
    {
      accessor: "reservation.name",
      title: "Rezervace",
      sortable: true,
    },
    {
      accessor: "created_at",
      title: "Vytvořeno",
      sortable: true,
      render: ({ created_at }) => dayjs(created_at).format("DD.MM.YYYY HH:mm"),
    },
    {
      accessor: "price_to_pay",
      title: "Částka k zaplacení",
      sortable: true,
      render: ({ price_to_pay }) => `${Number(price_to_pay).toFixed(2)} Kč`,
    },
    {
      accessor: "payed_at",
      title: "Zaplaceno v čase",
      sortable: true,
      render: ({ payed_at }) => payed_at ? dayjs(payed_at).format("DD.MM.YYYY HH:mm") : "-",
    },
    {
      accessor: "status",
      title: "Stav",
      sortable: true,
    },
    {
      accessor: "note",
      title: "Poznámka",
      sortable: false,
      render: ({ note }) => note?.slice(0, 50) || "-",
    },
    {
      accessor: "actions",
      title: "Akce",
      width: "7%",
      render: (record) => (
        <Group gap={4} wrap="nowrap">
          <ActionIcon size="sm" variant="subtle" color="green" onClick={() => handleShowOrder(record)}>
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon size="sm" variant="subtle" color="orange" onClick={() => handlePayOrder(record)} title="Zaplatit">
            <IconCreditCard size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];


  const ticket_columns = [
    { accessor: "id", title: "ID", sortable: true },
    { accessor: "title", title: "Název", sortable: true },
    {
      accessor: "created_at",
      title: "Vytvořeno",
      sortable: true,
      render: ({ created_at }) => dayjs(created_at).format("DD.MM.YYYY HH:mm"),
    },
    { accessor: "status", title: "Stav", sortable: true },
    { accessor: "category", title: "Kategorie", sortable: true },
    {
      accessor: "description",
      title: "Popis",
      sortable: false,
      render: ({ description }) => description?.slice(0, 50) || "-",
    },
    {
      accessor: "actions",
      title: "Akce",
      width: "5.5%",
      render: (record) => (
        <Group gap={4} wrap="nowrap">
          <ActionIcon size="sm" variant="subtle" color="green" onClick={() => handleShowTicket(record)}>
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => handleEditTicket(record)}>
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDeleteTicket(record)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];



  const RezervaceModalContent = (record, close) => (
    <Stack gap="xs">
      <Text fw={700}>Detail rezervace</Text>
      <Text>Událost: {record.event?.name}</Text>
      <Text>Slot: {record.marketSlot}</Text>
      <Text>Prodlouženo: {record.used_extension ? "Ano" : "Ne"}</Text>
      <Text>Od: {dayjs(record.reserved_from).format("DD.MM.YYYY HH:mm")}</Text>
      <Text>Do: {dayjs(record.reserved_to).format("DD.MM.YYYY HH:mm")}</Text>
      <Text>Stav: {record.status}</Text>
      <Text>Poznámka: {record.note}</Text>
      <Text>Cena: {Number(record.final_price).toFixed(2)} Kč</Text>
      <Group justify="end" mt="sm">
        <Button onClick={close} variant="light">Zavřít</Button>
      </Group>
    </Stack>
  );

  const OrderModalContent = (record, close) => (
    <Stack gap="xs">
      <Text fw={700}>Detail Objednávky</Text>
      <Text>Rezervace: {record.reservation?.name}</Text>
      <Text>Vytvořeno: {dayjs(record.created_at).format("DD.MM.YYYY HH:mm")}</Text>
      <Text>Částka k zaplacení: {Number(record.price_to_pay).toFixed(2)} Kč</Text>
      <Text>Zaplaceno v čase: {record.payed_at ? dayjs(record.payed_at).format("DD.MM.YYYY HH:mm") : "-"}</Text>
      <Text>Stav: {record.status}</Text>
      <Text>Poznámka: {record.note}</Text>
      <Group justify="end" mt="sm">
        <Button onClick={close} variant="light">Zavřít</Button>
        <Button variant="success" onClick={() => handlePayOrder(record)}>Zaplatit</Button>
      </Group>
    </Stack>
  );

  const TicketModalContent = (record, close) => (
    <Stack gap="xs">
      <Text fw={700}>Detail Objednávky</Text>
      <Text>Název: {record.title}</Text>
      <Text>Vytvořeno: {record.created_at.format("DD.MM.YYYY HH:mm")}</Text>
      <Text>Stav: {record.status}</Text>
      <Text>Kategorie: {record.category}</Text>
      <Text>Popis: {record.description}</Text>
      <Group justify="end" mt="sm">
        <Button onClick={close} variant="light">Zavřít</Button>
      </Group>
    </Stack>
  );


  return (
    <Container
      fluid
      className="justify-content-center mt-5"
      style={{ height: "100vh" }}
    >
      <Row >
        <Col>
          <Card className="shadow position-relative mx-5">
          
            {/* Badge s rolí v pravém horním rohu */}
            <Badge
              bg={
                user.role === "admin"
                  ? "danger"
                  : user.role === "seller"
                  ? "success"
                  : "Info"
              }
              text="white"     // bílý text
              className="fs-4 position-absolute top-0 start-0 m-2"
              style={{ fontSize: "0.8rem", zIndex: 1 , right: "0"}}
            >
              {
                user.role === "admin"
                  ? "Admin"
                  : user.role === "seller"
                  ? "Prodejce"
                  : user.role === "squareManager"
                  ? "Správce tržiště"
                  : user.role === "cityClerk"
                  ? "Úředník"
                  : user.role === "checker"
                  ? "Kontrolor"
                  : "Neznámá role"
              }
            </Badge>
            <br />

            <Card.Body>
              <Card.Title className="mb-3">
              </Card.Title>

              <Container>
                <Row>
                  <Col>Přihlášen jako: <strong>{user.username}</strong></Col>
                  <Col>{user.account_type}</Col>
                </Row>
                <hr />
                <Row className="mb-2">
                  <Col><strong>Jméno:</strong> {user.first_name}</Col>
                  <Col><strong>Příjmení:</strong> {user.last_name}</Col>
                  
                </Row>

                <hr />
                <h4 className="text-secondary">Adresa</h4>
                <Row className="mb-2">
                  
                  <Col><strong>Město:</strong> {user.city}</Col>
                  <Col><strong>Ulice:</strong> {user.street}</Col>
                </Row>
                <Row>
                  <Col><strong>PSČ:</strong> {user.PSC}</Col>

                </Row>
                <hr />
                <h4 className="text-secondary">Kontaktní údaje</h4>

                <Row>
                  <Col><strong>Tel:</strong> {user.phone_number}</Col>
                </Row>
                <Row>
                  <Col><strong>E-mail:</strong> {user.email}</Col>
                </Row>
                <hr />
                <h4 className="text-secondary">Platby</h4>
                <Row>
                  <Col><strong>Účet:</strong> {user.bank_account}</Col>
                </Row>
                <Row>
                  <Col><strong>Variabilní číslo:</strong> {user.var_symbol}</Col>
                </Row>
              </Container>

              <div className="d-flex justify-content-between mt-4">
                <Link to="/settings" className="fs-4 btn btn-outline-secondary border-0">
                  <FontAwesomeIcon icon={faGear} className="me-2" />
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          {/* Buttons */}
          
          <Container>
            <Row>
              <Link to="/create-reservation" className="btn btn-success fs-3 mb-3">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                 Vytvořit Rezervaci
              </Link>
            </Row>
            <Row>
              <Link to="/tickets" className="btn btn-danger fs-3 mb-3">
                Problém?
              </Link>
            </Row>
            {
              user.role === "admin" ? (
                <Row>
                  <Link to="/manage/squares" className="btn btn-danger fs-3">
                    Manager
                  </Link>
                </Row>
              ) : user.role === "seller" ? (
                ""
              ) : user.role === "squareManager" ? (
                <Row>
                  <Link to="/manage/squares" className="btn btn-danger fs-3">
                    Manager
                  </Link>
                </Row>
              ) : user.role === "cityClerk" ? (
                <Row>
                  <Link to="/manage/squares" className="btn btn-danger fs-3">
                    Manager
                  </Link>
                </Row>
              ) : user.role === "checker" ? (
                ""
              ) : (
                "Neznámá role"
              )
            }
          </Container>
          
        </Col>
      </Row>

      {/* TAB TABULKY */}
      <Row className="my-5 mx-5">
        <Tabs defaultActiveKey="reservations" id="user-data-tabs" className="my-4 mx-2 d-flex">
          <Tab id="tabusek" eventKey="reservations" title="Rezervace">
              <Table
                data={user_reservations}
                columns={reservation_columns}
                defaultSort="id"
                modalTitle="Detail rezervace"
                renderModalContent={RezervaceModalContent}
                withGlobalSearch
              />
          </Tab>

          <Tab eventKey="orders" title="Objednávky">
            <Table
              data={user_orders}
              columns={order_columns}
              defaultSort="id"
              modalTitle="Detail objednávky"
              renderModalContent={OrderModalContent}
              withGlobalSearch
            />
          </Tab>

          {user_tickets && (
            <Tab eventKey="tickets" title="Tickety">
              <Table
                data={user_tickets}
                columns={ticket_columns}
                defaultSort="id"
                modalTitle="Detail Ticketu"
                renderModalContent={TicketModalContent}
                withGlobalSearch
              />
            </Tab>
          )}
        </Tabs>
      </Row>

      {/* Bootstrap Modal for view/edit */}
      <Modal show={showModal && modalType === "view-reservation"} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Detail rezervace</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRecord && (
            <>
              <p><strong>ID:</strong> {selectedRecord.id}</p>
              <p><strong>Událost:</strong> {selectedRecord.event?.name}</p>
              <p><strong>Slot:</strong> {selectedRecord.marketSlot}</p>
              <p><strong>Prodlouženo:</strong> {selectedRecord.used_extension ? "Ano" : "Ne"}</p>
              <p><strong>Od:</strong> {dayjs(selectedRecord.reserved_from).format("DD.MM.YYYY HH:mm")}</p>
              <p><strong>Do:</strong> {dayjs(selectedRecord.reserved_to).format("DD.MM.YYYY HH:mm")}</p>
              <p><strong>Stav:</strong> {selectedRecord.status}</p>
              <p><strong>Poznámka:</strong> {selectedRecord.note}</p>
              <p><strong>Cena:</strong> {Number(selectedRecord.final_price).toFixed(2)} Kč</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Zavřít</Button>
          <Button variant="primary" onClick={() => { setShowModal(false); handleEditReservation(selectedRecord); }}>Upravit</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModal && modalType === "edit-reservation"} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upravit rezervaci</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditModalSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Poznámka</Form.Label>
              <Form.Control
                name="note"
                value={formData.note || ""}
                onChange={e => setFormData(f => ({ ...f, note: e.target.value }))}
              />
            </Form.Group>
            {/* Add more editable fields as needed */}
            {error && <Alert variant="danger">{error}</Alert>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Zrušit</Button>
            <Button type="submit" variant="primary" disabled={submitting}>Uložit změny</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showModal && modalType === "view-order"} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Detail objednávky</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRecord && (
            <>
              <p><strong>ID:</strong> {selectedRecord.id}</p>
              <p><strong>Rezervace:</strong> {selectedRecord.reservation?.name}</p>
              <p><strong>Vytvořeno:</strong> {dayjs(selectedRecord.created_at).format("DD.MM.YYYY HH:mm")}</p>
              <p><strong>Částka k zaplacení:</strong> {selectedRecord.price_to_pay}</p>
              <p><strong>Zaplaceno v čase:</strong> {selectedRecord.payed_at ? dayjs(selectedRecord.payed_at).format("DD.MM.YYYY HH:mm") : "-"}</p>
              <p><strong>Stav:</strong> {selectedRecord.status}</p>
              <p><strong>Poznámka:</strong> {selectedRecord.note}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Zavřít</Button>
          <Button variant="success" onClick={() => handlePayOrder(selectedRecord)}>Zaplatit</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModal && modalType === "edit-order"} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upravit objednávku</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditModalSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Poznámka</Form.Label>
              <Form.Control
                name="note"
                value={formData.note || ""}
                onChange={e => setFormData(f => ({ ...f, note: e.target.value }))}
              />
            </Form.Group>
            {/* Add more editable fields as needed */}
            {error && <Alert variant="danger">{error}</Alert>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Zrušit</Button>
            <Button type="submit" variant="primary" disabled={submitting}>Uložit změny</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showModal && modalType === "view-ticket"} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Detail ticketu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRecord && (
            <>
              <p><strong>ID:</strong> {selectedRecord.id}</p>
              <p><strong>Název:</strong> {selectedRecord.title}</p>
              <p><strong>Vytvořeno:</strong> {dayjs(selectedRecord.created_at).format("DD.MM.YYYY HH:mm")}</p>
              <p><strong>Stav:</strong> {selectedRecord.status}</p>
              <p><strong>Kategorie:</strong> {selectedRecord.category}</p>
              <p><strong>Popis:</strong> {selectedRecord.description}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Zavřít</Button>
          <Button variant="primary" onClick={() => { setShowModal(false); handleEditTicket(selectedRecord); }}>Upravit</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModal && modalType === "edit-ticket"} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upravit ticket</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditModalSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Popis</Form.Label>
              <Form.Control
                name="description"
                value={formData.description || ""}
                onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
              />
            </Form.Group>
            {/* Add more editable fields as needed */}
            {error && <Alert variant="danger">{error}</Alert>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Zrušit</Button>
            <Button type="submit" variant="primary" disabled={submitting}>Uložit změny</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
    
  );
}
export default Home;
