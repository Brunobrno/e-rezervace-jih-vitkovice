import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button
} from "react-bootstrap";
import { faGear, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";

import Table from "../components/Table";

import { getReservations } from "../api/model/reservation"

function Home() {
  const { user } = useOutletContext();

  const [user_reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const data = await getReservations({ user: user.id });
        setReservations(data);
      } catch (err) {
        console.error("Chyba při načítání rezervací:", err);
      }
    };

    if (user?.id) {
      fetchReservations();
    }
  }, [user?.id]);

  const columns = [
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

  const renderModalContent = (record, close) => (
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

  return (
    <Container
      fluid
      className="justify-content-center mt-5"
      style={{ height: "100vh" }}
    >
      <Row >
        <Col>
          <Card className="shadow position-relative mx-auto" style={{ width: 'fit-content' }}>
          
            {/* Badge s rolí v pravém horním rohu */}
            <Badge
              bg="secondary"  // šedé pozadí
              text="white"     // bílý text
              className="fs-4 position-absolute top-0 start-0 m-2"
              style={{ fontSize: "0.8rem", zIndex: 1 , right: "0"}}
            >
              {user.role}
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
          <Container>
            <Row>
              <Link to="/create-reservation?" className="btn btn-success fs-3 mb-3">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                 Vytvořit Rezervaci
              </Link>
            </Row>
            <Row>
              <Link to="/create-reservation?" className="btn btn-danger fs-3">
                nějaká další vypíčena akce
              </Link>
            </Row>
          </Container>
          
        </Col>
      </Row>
      <Row className="my-5 mx-2">
        <Col>
          <h2 className="text-center">Vaše rezervace</h2>
          <br />
          <Table
            data={user_reservations}
            columns={columns}
            defaultSort="id"
            modalTitle="Detail rezervace"
            renderModalContent={renderModalContent}
            withGlobalSearch
          />
        </Col>
      </Row>
      <p>
        TODO: přidej na konec tabulku s rezervacema a taky pro tickety (to dej na if pokud uživatel nebude mít žádne tickety)
      </p>
    </Container>
    
  );
}

export default Home;
