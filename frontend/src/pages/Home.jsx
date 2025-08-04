import {
  Container, Row, Col,
  Card,
  Badge,
  Button,
  Tabs, Tab
} from "react-bootstrap";
import { faGear, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { useState, useEffect, useContext } from "react";

import Table from "../components/Table";

import { getReservations } from "../api/model/reservation"
import { getOrders } from "../api/model/order"
import { getServiceTickets } from "../api/model/ticket"

import dayjs from "dayjs";


function Home() {
  const { user } = useContext(UserContext) || {};

  const [user_reservations, setReservations] = useState([]);
  const [user_orders, setOrders] = useState([]);
  const [user_tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        var data = await getReservations({ user: user.id });
        setReservations(data);
        data=undefined;

        data = await getOrders({ user: user.id });
        setOrders(data);
        data=undefined;

        data = await getServiceTickets({ user: user.id });
        setOrders(data);
      } catch (err) {
        console.error("Chyba při načítání:", err);
      }
    };

    if (user?.id) {
      fetchReservations();
    }
  }, [user?.id]);

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
    { accessor: "urgency", title: "Urgence", sortable: true },
    {
      accessor: "description",
      title: "Popis",
      sortable: false,
      render: ({ description }) => description?.slice(0, 50) || "-",
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
      <Text fw={700}>Detail Objedávky</Text>
      <Text>Rezervace: {record.reservation?.name}</Text>
      <Text>Vytvořeno: {record.created_at.format("DD.MM.YYYY HH:mm")}</Text>
      <Text>Částka k zaplacení: {record.price_to_pay}</Text>
      <Text>Zaplaceno v čase: {dayjs(record.payed_at).format("DD.MM.YYYY HH:mm")}</Text>
      <Text>Stav: {record.status}</Text>
      <Text>Poznámka: {record.note}</Text>
      <Group justify="end" mt="sm">
        <Button onClick={close} variant="light">Zavřít</Button>
      </Group>
    </Stack>
  );

  const TicketModalContent = (record, close) => (
    <Stack gap="xs">
      <Text fw={700}>Detail Objedávky</Text>
      <Text>Název: {record.title}</Text>
      <Text>Vytvořeno: {record.created_at.format("DD.MM.YYYY HH:mm")}</Text>
      <Text>Stav: {record.status}</Text>
      <Text>Kategorie: {record.category}</Text>
      <Text>Urgence: {record.urgency}</Text>
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
    </Container>
    
  );
}

export default Home;
