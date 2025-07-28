import { Card, Table, Button } from 'react-bootstrap';

const Step4Summary = ({ data, prev }) => {
  const finalPrice = data.slots.reduce((sum, s) => sum + s.price, 0);

  return (
    <Card>
      <Card.Body>
        <h5>4. Souhrn rezervace</h5>
        <p><strong>Náměstí:</strong> {data.square}</p>
        <p><strong>Akce:</strong> {data.event?.name}</p>

        <h6>Zabrané sloty:</h6>
        <Table>
          <thead>
            <tr><th>Název</th><th>Cena</th></tr>
          </thead>
          <tbody>
            {data.slots.map((slot) => (
              <tr key={slot.id}>
                <td>{slot.name}</td>
                <td>{slot.price} Kč</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <p><strong>Finální cena:</strong> {finalPrice} Kč</p>

        <h6>Fakturační údaje</h6>
        <p>(z profilu uživatele – pouze pro čtení)</p>

        <div className="mt-3">
          <Button variant="secondary" onClick={prev}>Zpět</Button>{' '}
          <Button variant="success">Objednat a zaplatit →</Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Step4Summary;
