
import React from 'react';
import { Card, Button, Table, Form } from 'react-bootstrap';

const Step4Summary = ({ formData, onBack, onSubmit, note = '', setNote }) => {
  const { selectedSquare, selectedEvent, selectedSlot } = formData;

  if (!selectedSquare || !selectedEvent || !selectedSlot || selectedSlot.length === 0) {
    return <p>Chybí informace o výběru. Vraťte se zpět a doplňte potřebné údaje.</p>;
  }

  // Spočítat celkovou cenu všech slotů
  const totalPrice = selectedSlot.reduce((acc, slot) => {
    const pricePerM2 = parseFloat(slot.price_per_m2 || selectedEvent.price_per_m2);
    const area = slot.width * slot.height;
    return acc + area * pricePerM2;
  }, 0);

  return (
    <Card className="p-4">
      <h3 className="mb-4">🧾 Shrnutí objednávky</h3>

      <h5>📍 Náměstí:</h5>
      <p><strong>{selectedSquare.name}</strong><br />{selectedSquare.street}, {selectedSquare.city} {selectedSquare.psc}</p>

      <h5>📅 Událost:</h5>
      <p>
        <strong>{selectedEvent.name}</strong><br />
        {selectedEvent.start} – {selectedEvent.end}<br />
        Cena za m²: <strong>{selectedEvent.price_per_m2} Kč</strong>
      </p>

      <h5>📦 Vybrané sloty:</h5>
      <Table bordered size="sm">
        <thead>
          <tr>
            <th>Číslo slotu</th>
            <th>Rozměry (m)</th>
            <th>Cena/m² (Kč)</th>
            <th>Celkem (Kč)</th>
          </tr>
        </thead>
        <tbody>
          {selectedSlot.map((slot) => {
            const pricePerM2 = parseFloat(slot.price_per_m2 || selectedEvent.price_per_m2);
            const area = slot.width * slot.height;
            const price = area * pricePerM2;
            return (
              <tr key={slot.id}>
                <td>{slot.number}</td>
                <td>{slot.width} × {slot.height}</td>
                <td>{pricePerM2.toFixed(2)}</td>
                <td>{price.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="text-end"><strong>Celkem:</strong></td>
            <td><strong>{totalPrice.toFixed(2)} Kč</strong></td>
          </tr>
        </tfoot>
      </Table>

      {/* Note input (optional) using Bootstrap */}
      <Form.Group className="mb-3" controlId="note-field">
        <Form.Label>
          <small className="text-muted">Poznámka (volitelné)</small>
        </Form.Label>
        <Form.Control
          as="textarea"
          value={note}
          onChange={e => setNote && setNote(e.target.value)}
          placeholder="Zde můžete přidat poznámku k objednávce..."
          rows={3}
        />
      </Form.Group>

      <div className="d-flex justify-content-between">
        <Button variant="secondary" onClick={onBack}>
          ⬅️ Zpět
        </Button>
        <Button variant="success" onClick={onSubmit}>
          ✅ Potvrdit a odeslat objednávku
        </Button>
      </div>
    </Card>
  );
};

export default Step4Summary;
