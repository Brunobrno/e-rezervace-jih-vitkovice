import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col, Spinner } from 'react-bootstrap';
import squareAPI from '../../api/model/square';

const Step1SelectSquare = ({ data, setData, next }) => {
  const [squares, setSquares] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log("Data: ", data);

  useEffect(() => {
    squareAPI.getSquares()
      .then(result => {
        setSquares(result);
        setLoading(false);
      })
      .catch(() => {
        setSquares([]);
        setLoading(false);
      });
  }, []);

  const selectSquare = (square) => {
    setData(prev => ({
      ...prev,
      square,
      event: null,
      slots: [],
    }));
  };

  if (loading) return <Spinner animation="border" role="status"><span className="visually-hidden">Načítám...</span></Spinner>;

  return (
    <>
      <h2>Vyber náměstí</h2>
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {squares.map(sq => {
          const selected = data.square?.id === sq.id;
          return (
            <Col key={sq.id}>
              <Card
                onClick={() => selectSquare(sq)}
                border={selected ? 'primary' : undefined}
                className={`h-100 cursor-pointer ${selected ? 'shadow-lg' : ''}`}
                style={{ userSelect: 'none' }}
              >
                {sq.image
                  ? <Card.Img variant="top" src={sq.image} style={{ height: 150, objectFit: 'cover' }} alt={sq.name} />
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
                  <Card.Title>{sq.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {sq.street}, {sq.city} ({sq.psc})
                  </Card.Subtitle>
                  <Card.Text style={{ whiteSpace: 'pre-line', height: 60, overflow: 'hidden' }}>
                    {sq.description}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
      <div className="mt-3 d-flex justify-content-end">
        <Button
          onClick={next}
          disabled={!data.square}
          variant="primary"
        >
          Pokračovat
        </Button>
      </div>
    </>
  );
};

export default Step1SelectSquare;
