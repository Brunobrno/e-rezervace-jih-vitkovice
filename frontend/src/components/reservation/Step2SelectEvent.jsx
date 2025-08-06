import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import eventAPI from '../../api/model/event';
import dayjs from 'dayjs';

const Step2SelectEvent = ({ data, setData, next, prev }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!data.square?.id) {
      setEvents([]);
      return;
    }

    setLoading(true);
    setError(null);

    eventAPI.getEvents({ square: data.square.id })
      .then(result => {
        setEvents(result);
        setLoading(false);
      })
      .catch(() => {
        setError("Nepodařilo se načíst události");
        setLoading(false);
      });
  }, [data.square]);

  const selectEvent = (event) => {
    setData(prev => ({
      ...prev,
      event,
      slots: [],
    }));
  };

  if (!data.square) {
    return (
      <>
        <Alert variant="warning">
          Nejprve vyberte náměstí v předchozím kroku.
        </Alert>
        <Button onClick={prev}>Zpět</Button>
      </>
    );
  }

  if (loading) return <Spinner animation="border" role="status"><span className="visually-hidden">Načítám...</span></Spinner>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (events.length === 0) return <p>Pro vybrané náměstí nebyly nalezeny žádné události.</p>;

  // Filter events to only show current or future events
  const now = dayjs().startOf('day');
  const filteredEvents = events.filter(event => {
    // event.start and event.end are now date strings (YYYY-MM-DD)
    const end = dayjs(event.end, "YYYY-MM-DD");
    return end.isAfter(now) || end.isSame(now, 'day');
  });

  return (
    <>
      <h2>Vyber událost</h2>
      <Row xs={1} sm={2} md={3} lg={3} className="g-4">
        {filteredEvents.map(ev => {
          const selected = data.event?.id === ev.id;
          return (
            <Col key={ev.id} className='mb-5'>
              <Card
                onClick={() => selectEvent(ev)}
                border={selected ? 'primary' : undefined}
                className={`h-100 cursor-pointer ${selected ? 'shadow-lg' : ''}`}
                style={{ userSelect: 'none' }}
              >
                {ev.image
                  ? <Card.Img variant="top" src={ev.image} alt={ev.name} style={{ height: 150, objectFit: 'cover' }} />
                  : <div style={{
                      height: 150,
                      backgroundColor: '#eee',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999',
                      fontStyle: 'italic',
                      fontSize: 14,
                    }}>
                      Obrázek chybí
                    </div>
                }
                <Card.Body>
                  <Card.Title>{ev.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {ev.start} – {ev.end}
                  </Card.Subtitle>
                  <Card.Text style={{ whiteSpace: 'pre-line', height: 70, overflow: 'hidden' }}>
                    {ev.description}
                  </Card.Text>
                  <Card.Text><strong>Cena za m²:</strong> {ev.price_per_m2} Kč</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
      <div className="mt-3 d-flex justify-content-between">
        <Button onClick={prev} variant="secondary">Zpět</Button>
        <Button
          onClick={next}
          disabled={!data.event}
          variant="primary"
        >
          Pokračovat
        </Button>
      </div>
    </>
  );
};

export default Step2SelectEvent;
