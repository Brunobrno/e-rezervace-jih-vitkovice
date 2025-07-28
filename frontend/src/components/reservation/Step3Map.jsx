import { Card, Button } from 'react-bootstrap';

const Step3Map = ({ data, setData, next, prev }) => {
  const handleSelectSlots = () => {
    const exampleSlots = [
      { id: 1, name: 'Místo A', price: 100 },
      { id: 2, name: 'Místo B', price: 120 },
    ];
    setData((d) => ({ ...d, slots: exampleSlots }));
    next();
  };

  return (
    <Card>
      <Card.Body>
        <h5>3. Mapa – výběr místa</h5>
        <div className="border p-3 text-center">[Mapa míst – výběr kliknutím]</div>
        <div className="mt-3">
          <Button variant="secondary" onClick={prev}>Zpět</Button>{' '}
          <Button onClick={handleSelectSlots}>Pokračovat</Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Step3Map;
