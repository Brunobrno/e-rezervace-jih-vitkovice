import { Card, Button, Form } from 'react-bootstrap';

const Step1SelectSquare = ({ data, setData, next }) => {
  const handleChange = (e) => {
    setData((prev) => ({ ...prev, square: e.target.value }));
  };

  return (
    <Card>
      <Card.Body>
        <h5>1. Zvolte si náměstí</h5>
        <Form.Select onChange={handleChange} value={data.square}>
          <option value="">-- Vyberte --</option>
          <option value="smp-jih">SMP Ostrava – Jih</option>
          <option value="smp-sever">SMP Ostrava – Sever</option>
        </Form.Select>
        <div className="mt-3">
          <Button onClick={next} disabled={!data.square}>Pokračovat</Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Step1SelectSquare;
