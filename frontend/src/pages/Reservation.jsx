// Reservation.jsx
// This page displays a reservation system with a dynamic grid and a list of reservations.

import DynamicGrid, { DEFAULT_CONFIG } from "../components/DynamicGrid";
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, ListGroup } from "react-bootstrap";


// Reservation component
// This component manages the state of reservations and provides functionality to export and clear them.
function Reservation() {
  const gridConfig = DEFAULT_CONFIG;
  const storageKey = `reservationData_${gridConfig.rows}x${gridConfig.cols}`;

  const [reservations, setReservations] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(reservations));
  }, [reservations, storageKey]);

  // Function to export reservations as a JSON file
  // This function creates a JSON file from the reservations state and triggers a download.
  const getReservations = () => {
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

  // Function to clear all reservations
  // This function removes all reservations from the state and local storage.
  const clearAll = () => {
    localStorage.removeItem(storageKey);
    setReservations([]);
    setSelectedIndex(null);
  };

  return (
    <Container>
      <Row>
        <Col sm={6} md={8} className="d-flex">
          <DynamicGrid
            config={gridConfig}
            reservations={reservations}
            onReservationsChange={setReservations}
            selectedIndex={selectedIndex}
            onSelectedIndexChange={setSelectedIndex}
          />
        </Col>
        <Col sm={6} md={4}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Seznam rezervací</h5>
              <span className="badge bg-primary">{reservations.length}</span>
            </Card.Header>
            <ListGroup className="list-group-flush">
              {reservations.map((res, i) => (
                <ListGroup.Item
                  key={i}
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
                    [{res.x},{res.y}] → [{res.x + res.w - 1},{res.y + res.h - 1}
                    ]
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>
      <div className="mt-3">
        <button onClick={getReservations} className="btn btn-primary me-2">
          Export Reservations
        </button>
        <button onClick={clearAll} className="btn btn-danger">
          Clear All
        </button>
      </div>

      <div className="mt-3">
        <pre>{JSON.stringify(reservations, null, 2)}</pre>
      </div>
    </Container>
  );
}

export default Reservation;