import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Card, ListGroup } from "react-bootstrap";
import DynamicGrid, { DEFAULT_CONFIG } from "../components/DynamicGrid";
import apiEvent from "../api/model/event";

function MapEditor() {
  const { eventId } = useParams();
  const gridConfig = DEFAULT_CONFIG;
  const storageKey = `reservationData_${eventId}_${gridConfig.rows}x${gridConfig.cols}`;

  const [eventObject, setEventObject] = useState(null);
  const [marketSlots, setMarketSlots] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // 🟡 Načtení eventu a slotů z databáze
  useEffect(() => {
    if (!eventId) return;

    async function fetchSlots() {
      try {
        const data = await apiEvent.getEventById(eventId);
        setEventObject(data);
        setMarketSlots(data.market_slots || []);

        // Převedení slotů na "reservations" formát
        const loadedReservations = (data.market_slots || []).map((slot, index) => ({
          id: slot.id,
          name: slot.label || `Slot #${index + 1}`,
          x: slot.x,
          y: slot.y,
          w: slot.width || 1,
          h: slot.height || 1,
          locked: slot.locked || false,
        }));

        setReservations(loadedReservations);
      } catch (error) {
        console.error("Chyba při načítání eventu a slotů:", error);
      }
    }

    fetchSlots();
  }, [eventId]);

  // (Volitelně) Uložení rezervací do localStorage – pokud chceš mít zálohu
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(reservations));
  }, [reservations, storageKey]);

  const exportReservations = () => {
    const dataStr = JSON.stringify(reservations, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reservations.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const clearAll = () => {
    localStorage.removeItem(storageKey);
    setReservations([]);
    setSelectedIndex(null);
  };

  const saveAndSend = () => {
    console.log("Ukládám rezervace:", reservations);
    alert("Rezervace uloženy (demo)");
  };

  return (
    <Container className="mt-4">
      <h3>
        Rezervace pro event:{" "}
        {eventObject?.name || `#${eventId}`}
      </h3>

      {eventObject && (
        <Card className="mb-4">
          <Card.Body>
            <h5 className="mb-2">{eventObject.name}</h5>
            <p className="mb-1 text-muted">{eventObject.description}</p>
            <p className="mb-0">
              Náměstí:{" "}
              <strong>{eventObject.square?.name || "Neznámé náměstí"}</strong>
            </p>
            <p className="mb-0">
              Termín:{" "}
              {new Date(eventObject.start).toLocaleString()} –{" "}
              {new Date(eventObject.end).toLocaleString()}
            </p>
          </Card.Body>
        </Card>
      )}

      <Row>
        <Col sm={6} md={8} className="d-flex">
          <DynamicGrid
            config={gridConfig}
            reservations={reservations}
            onReservationsChange={setReservations}
            selectedIndex={selectedIndex}
            onSelectedIndexChange={setSelectedIndex}
            marketSlots={marketSlots} // volitelné, ale můžeš ho využít dál
          />
        </Col>
        <Col sm={6} md={4}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Seznam rezervací</h5>
              <span className="badge bg-primary">
                {reservations.length}
              </span>
            </Card.Header>
            <ListGroup className="list-group-flush">
              {reservations.map((res, i) => (
                <ListGroup.Item
                  key={res.id || i}
                  action
                  active={i === selectedIndex}
                  onClick={() => setSelectedIndex(i)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{i + 1}.</strong> {res.name}
                    </div>
                    <span className="badge bg-secondary">
                      {res.w}×{res.h}
                    </span>
                  </div>
                  <div className="text-muted mt-1">
                    [{res.x},{res.y}] → [{res.x + res.w - 1},{res.y + res.h - 1}]
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      <div className="mt-3">
        <button onClick={exportReservations} className="btn btn-primary me-2">
          Exportovat
        </button>
        <button onClick={clearAll} className="btn btn-danger me-2">
          Vymazat vše
        </button>
        <button onClick={saveAndSend} className="btn btn-success">
          Uložit a odeslat
        </button>
      </div>
    </Container>
  );
}

export default MapEditor;
