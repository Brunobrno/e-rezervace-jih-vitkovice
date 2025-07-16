// Reservation.js
import DynamicGrid from "../components/DynamicGrid";
import React, { useState, useRef } from "react";
import { Container, Row, Col, Card, ListGroup } from "react-bootstrap";

function Reservation() {
  const gridRef = useRef();
  const [reservations, setReservations] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const getReservations = () => {
    if (gridRef.current) {
      const internalReservations = gridRef.current.getInternalReservations();
      console.log("Internal reservations:", internalReservations);

      // Save to file
      const dataStr = JSON.stringify(internalReservations, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reservations.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const clearAll = () => {
    if (gridRef.current) {
      gridRef.current.clearAllReservations();
    }
  };

  return (
    <Container>
      <Row>
        <Col sm={6} md={8} className="d-flex">
          <DynamicGrid
            ref={gridRef}
            reservations={reservations}
            onReservationsChange={setReservations}
            selectedIndex={selectedIndex}
            onSelectedIndexChange={setSelectedIndex}
          />
        </Col>
        {/* Reservation List */}
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
