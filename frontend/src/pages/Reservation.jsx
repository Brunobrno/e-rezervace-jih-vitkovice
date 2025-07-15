// Reservation.js
import DynamicGrid from "../components/DynamicGrid";
import React, { useState } from "react";
import { Container, Row, Col, Card, ListGroup } from "react-bootstrap";

function Reservation() {
  const [reservations, setReservations] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  return (
    <Container>
      <Row>
        <Col sm={6} md={8} className="d-flex">
          <DynamicGrid
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
    </Container>
  );
}

export default Reservation;