import { Card, Table, Button } from 'react-bootstrap';

const Step2SelectEvent = ({ data, setData, next, prev }) => {
  const events = [
    { id: 1, name: 'ZOO Market', price: '200 Kč', from: '12.1.', to: '12.20' },
    { id: 2, name: 'Jarmark', price: '150 Kč', from: '10.5.', to: '10.10' },
  ];

  const selectEvent = (event) => {
    setData((d) => ({ ...d, event }));
    next();
  };

  return (
    <Card>
      <Card.Body>
        <h5>2. Vyberte si událost</h5>
        <Table hover>
          <thead>
            <tr>
              <th>Název</th>
              <th>Cena</th>
              <th>Od</th>
              <th>Do</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id}>
                <td>{ev.name}</td>
                <td>{ev.price}</td>
                <td>{ev.from}</td>
                <td>{ev.to}</td>
                <td>
                  <Button size="sm" onClick={() => selectEvent(ev)}>
                    Vybrat
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Button variant="secondary" onClick={prev}>Zpět</Button>
      </Card.Body>
    </Card>
  );
};

export default Step2SelectEvent;
