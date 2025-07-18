import React, { useEffect, useState } from "react";
import { ListGroup, Spinner, Collapse, Button } from "react-bootstrap";
import axios from "axios";
import API_URL from "../api/auth";

const MyReservationsTree = () => {
  // Stav pro data rezervací
  const [reservations, setReservations] = useState([]);
  // Stav pro loading spinner
  const [loading, setLoading] = useState(true);
  // Stav pro rozbalené eventy - objekt, kde klíč = eventId, hodnota = true/false
  const [expandedEvents, setExpandedEvents] = useState({});

  useEffect(() => {
    // Načtení dat z API při startu komponenty
    const fetchReservations = async () => {
      try {
        // Načteme token z localStorage
        const token = localStorage.getItem("user_access_token");

        // Pošleme GET request s autorizačním tokenem
        const response = await axios.get(`${API_URL}/booking/reservation`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Uložíme data do stavu
        setReservations(response.data);
      } catch (error) {
        console.error("Chyba při načítání rezervací:", error);
      } finally {
        setLoading(false); // Skryjeme spinner
      }
    };

    fetchReservations();
  }, []);

  // Přepne stav rozbalení eventu (otevře/zavře)
  const toggleEvent = (eventId) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  // Pokud data ještě nejsou načtena, ukážeme spinner
  if (loading) return <Spinner animation="border" />;

  // Ses skupina rezervací podle eventu (ID eventu jako klíč)
  const grouped = reservations.reduce((groups, reservation) => {
    const eventId = reservation.event;
    if (!groups[eventId]) groups[eventId] = [];
    groups[eventId].push(reservation);
    return groups;
  }, {});

  return (
    <ListGroup variant="flush">
      {Object.entries(grouped).map(([eventId, resList]) => (
        <ListGroup.Item key={eventId}>
          {/* Tlačítko, kterým uživatel rozbalí seznam rezervací u eventu */}
          <Button
            variant="link"
            className="w-100 text-start"
            onClick={() => toggleEvent(eventId)}
          >
            📅 Event ID: {eventId}
          </Button>

          {/* Rozbalený obsah se seznamem rezervací */}
          <Collapse in={expandedEvents[eventId]}>
            <div className="ms-3">
              <ListGroup variant="flush">
                {resList.map((res) => (
                  <ListGroup.Item key={res.id}>
                    <div>
                      <strong>Rezervace #{res.id}</strong>
                    </div>
                    <div>
                      Od: {new Date(res.reserved_from).toLocaleString()}
                    </div>
                    <div>Do: {new Date(res.reserved_to).toLocaleString()}</div>
                    <div>Status: {res.status}</div>
                    <div>Poznámka: {res.note || "-"}</div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </Collapse>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default MyReservationsTree;
// Tento komponent zobrazuje stromovou strukturu rezervací uživatele
