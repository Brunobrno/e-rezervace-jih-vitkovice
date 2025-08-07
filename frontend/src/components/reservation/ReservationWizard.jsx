import { useState, useEffect } from 'react';
import { ProgressBar, Form, InputGroup, Table, Spinner, Alert, Card, Container, Row, Col } from 'react-bootstrap';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import Step1SelectSquare from './Step1SelectSquare';
import Step2SelectEvent from './Step2SelectEvent';
import Step3Map from './Step3Map';
import Step4Summary from './Step4Summary';

import orderAPI from '../../api/model/order';
import reservationAPI from '../../api/model/reservation';
import userAPI from '../../api/model/user';
import { fetchEnumFromSchemaJson } from '../../api/get_chocies';

// TODO: Replace this with real user role detection (e.g., from context or props)
const isAdminOrClerk = true; // Set to true for demonstration

// List of available filters (should match backend filters.py)
const USER_FILTERS_BASE = [
  { key: "role", label: "Role", type: "select" },
  { key: "account_type", label: "Typ účtu", type: "select" },
  { key: "email", label: "Email", type: "text" },
  { key: "phone_number", label: "Telefon", type: "text" },
  { key: "city", label: "Město", type: "text" },
  { key: "street", label: "Ulice", type: "text" },
  { key: "PSC", label: "PSČ", type: "text" },
  { key: "ICO", label: "IČO", type: "text" },
  { key: "RC", label: "Rodné číslo", type: "text" },
  { key: "var_symbol", label: "Variabilní symbol", type: "number" },
  { key: "bank_account", label: "Bankovní účet", type: "text" },
  { key: "is_active", label: "Aktivní", type: "checkbox" },
  { key: "email_verified", label: "Email ověřen", type: "checkbox" },
  { key: "create_time_after", label: "Vytvořeno po", type: "date" },
  { key: "create_time_before", label: "Vytvořeno před", type: "date" },
];

const ReservationWizard = () => {
  const [data, setData] = useState({
    square: null,
    event: null,
    slots: [],
    user: '', // New field for user ID
    date: null, // Ensure date is present for reservation
    note: '',   // Ensure note is present
  });
  const [step, setStep] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [duration, setDuration] = useState(1); // 1, 7, or 30
  const [userFilters, setUserFilters] = useState({});
  const [roleChoices, setRoleChoices] = useState([]);
  const [accountTypeChoices, setAccountTypeChoices] = useState([]);
  const navigate = useNavigate();

  // Fetch choices for select fields on mount (inspired by create-user.jsx)
  useEffect(() => {
    fetchEnumFromSchemaJson("/api/account/users/", "get", "role")
      .then((choices) => setRoleChoices(choices))
      .catch(() => setRoleChoices([
        { value: "admin", label: "Administrátor" },
        { value: "seller", label: "Prodejce" },
        { value: "squareManager", label: "Správce tržiště" },
        { value: "cityClerk", label: "Úředník" },
        { value: "checker", label: "Kontrolor" },
      ]));
    fetchEnumFromSchemaJson("/api/account/users/", "get", "account_type")
      .then((choices) => setAccountTypeChoices(choices))
      .catch(() => setAccountTypeChoices([
        { value: "company", label: "Firma" },
        { value: "individual", label: "Fyzická osoba" },
      ]));
  }, []);

  // Update filter value
  const handleFilterChange = (key, value, type) => {
    setUserFilters(f => ({
      ...f,
      [key]: type === "checkbox" ? value.target.checked : value.target.value
    }));
  };

  // Search users with all filters
  const handleUserSearch = async () => {
    setIsSearching(true);
    // Remove empty values
    const params = Object.fromEntries(
      Object.entries(userFilters).filter(([_, v]) => v !== "" && v !== undefined && v !== null)
    );
    try {
      let results = await userAPI.searchUsers(params);
      if (results && typeof results === 'object' && !Array.isArray(results) && Array.isArray(results.results)) {
        results = results.results;
      }
      setUserResults(Array.isArray(results) ? results : []);
    } catch (e) {
      setUserResults([]);
    }
    setIsSearching(false);
  };

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    try {
      const slot = data.slots[0];
      // Ensure slot and date are present
      if (!slot || !data.date || !data.date.start || !data.date.end) {
        alert('Vyberte termín a slot.');
        return;
      }

      // Ensure event is present and valid
      if (!data.event || typeof data.event !== 'object' || !data.event.id) {
        alert('Chybí událost (event). Vyberte prosím událost.');
        return;
      }

      // Use selected date range from Step3Map (date only)
      let reserved_from = data.date.start;
      let reserved_to = data.date.end;

      // Clamp reserved_from and reserved_to to event boundaries
      const eventStart = dayjs(data.event.start, "YYYY-MM-DD");
      const eventEnd = dayjs(data.event.end, "YYYY-MM-DD");
      if (dayjs(reserved_from).isBefore(eventStart)) reserved_from = eventStart.format("YYYY-MM-DD");
      if (dayjs(reserved_to).isAfter(eventEnd)) reserved_to = eventEnd.format("YYYY-MM-DD");

      const reservationData = {
        event: data.event.id,
        market_slot: slot.id,
        reserved_from,
        reserved_to,
        used_extension: slot.used_extension || 0,
        note: data.note || null,
      };
      if (isAdminOrClerk && data.user) {
        reservationData.user = data.user;
      }

      console.log('Odesílaná rezervace:', reservationData);

      // Create reservation and get its ID
      const ResponseReservation = await reservationAPI.createReservation(reservationData);
      console.log('Response:', ResponseReservation);

      const response = await orderAPI.createOrder({
        user_id: data.user || null,
        note: data.note || null,
        reservation_id: ResponseReservation.id, // Use the reservation ID
      });
      alert('Objednávka byla úspěšně odeslána!');
      console.log('📦 Objednáno:', response);
      // Redirect to payment page after alert confirmation
      navigate(`/payment/${response.id}`);
    } catch (error) {
      // Log the error and show backend validation errors if present
      console.error('❌ Chyba při odesílání objednávky:', error);
      if (error.response) {
        console.error('Backend response:', error.response);
        // Log backend error details for debugging
        if (error.response.data) {
          console.error('Backend error details:', error.response.data);
        }
      }
      if (error.response && error.response.data) {
        alert(
          'Chyba při odesílání objednávky:\n' +
          JSON.stringify(error.response.data, null, 2)
        );
      } else {
        alert('Něco se pokazilo při odesílání objednávky.');
      }
    }
  };

  return (
    <>
      <ProgressBar now={(step / 4) * 100} className="mb-4" />

      {/* Admin/Clerk user filter bar */}
      {isAdminOrClerk && (
        <Card className="mb-4" style={{ border: '1px solid #dee2e6' }}>
          <Card.Body>
            <Alert variant="danger" className="mb-2">
              <b>Výběr uživatele pro objednávku</b><br />
              Vyplňte libovolné pole pro filtrování uživatelů. Pokud pole zůstanou prázdná, objednávka bude vytvořena na vaš momentálně přihlášený účet !!!
            </Alert>
            <Form>
              <div className="row">
                {/* Render non-checkbox fields */}
                {USER_FILTERS_BASE.filter(f => f.type !== "checkbox").map(f => (
                  <div className="col-md-4 mb-2" key={f.key}>
                    <Form.Group controlId={`user-filter-${f.key}`}>
                      <Form.Label>{f.label}</Form.Label>
                      {f.type === "select" && f.key === "role" ? (
                        <Form.Select
                          value={userFilters[f.key] || ""}
                          onChange={e => handleFilterChange(f.key, e, f.type)}
                        >
                          <option value="">-- Vyberte --</option>
                          {roleChoices.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </Form.Select>
                      ) : f.type === "select" && f.key === "account_type" ? (
                        <Form.Select
                          value={userFilters[f.key] || ""}
                          onChange={e => handleFilterChange(f.key, e, f.type)}
                        >
                          <option value="">-- Vyberte --</option>
                          {accountTypeChoices.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </Form.Select>
                      ) : f.type === "select" ? (
                        <Form.Select
                          value={userFilters[f.key] || ""}
                          onChange={e => handleFilterChange(f.key, e, f.type)}
                        >
                          <option value="">-- Vyberte --</option>
                        </Form.Select>
                      ) : (
                        <Form.Control
                          type={f.type}
                          value={userFilters[f.key] || ""}
                          onChange={e => handleFilterChange(f.key, e, f.type)}
                          autoComplete="off"
                        />
                      )}
                    </Form.Group>
                  </div>
                ))}
              </div>
              {/* Render each checkbox and label in a separate row */}
              <Container className="mb-3">
                {USER_FILTERS_BASE.filter(f => f.type === "checkbox").map(f => (
                  <Row key={f.key} className="align-items-center mb-2">
                    <Col xs="auto">
                      <Form.Check
                        type="checkbox"
                        checked={!!userFilters[f.key]}
                        onChange={e => handleFilterChange(f.key, e, f.type)}
                        id={`user-filter-${f.key}`}
                      />
                    </Col>
                    <Col>
                      <Form.Label htmlFor={`user-filter-${f.key}`} className="mb-0">{f.label}</Form.Label>
                    </Col>
                  </Row>
                ))}
              </Container>
              <button
                className="btn btn-primary mt-2"
                type="button"
                onClick={handleUserSearch}
                disabled={isSearching}
              >
                Vyhledat uživatele
                {isSearching && (
                  <Spinner animation="border" size="sm" className="ms-2" />
                )}
              </button>
            </Form>
            {userResults.length > 0 && (
              <Table striped bordered hover size="sm" className="mt-2" style={{ maxWidth: 400 }}>
                <thead>
                  <tr>
                    <th>Uživatelské jméno</th>
                    <th>ID</th>
                    <th>Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {userResults.map(user => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.id}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setData(d => ({ ...d, user: user.id }));
                            setUserFilters({ username: user.username });
                            setUserResults([]);
                          }}
                        >
                          Vybrat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            {data.user && (
              <Alert variant="success" className="mt-2">
                Vybraný uživatel ID: <b>{data.user}</b>
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}

      {step === 1 && (
        <Step1SelectSquare data={data} setData={setData} next={next} />
      )}
      {step === 2 && (
        <Step2SelectEvent data={data} setData={setData} next={next} prev={prev} />
      )}
      {step === 3 && (
        <>
          {/* Pass duration and setDuration to Step3Map */}
          <Step3Map
            data={data}
            setData={setData}
            next={next}
            prev={prev}
            duration={duration}
            setDuration={setDuration}
          />
        </>
      )}
      {step === 4 && (
        <Step4Summary
          formData={{
            selectedSquare: data.square,
            selectedEvent: data.event,
            selectedSlot: data.slots,
            selectedUser: data.user || null,
            note: data.note || '',
          }}
          onBack={prev}
          onSubmit={handleSubmit}
          note={data.note || ''}
          setNote={note => setData(d => ({ ...d, note }))}
        />
      )}
    </>
  );
};

export default ReservationWizard;
