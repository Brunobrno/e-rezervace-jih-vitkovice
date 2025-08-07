import React from 'react';
import { Card, Button, Table, Form } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import orderAPI  from '../../api/model/order';

const Step4Summary = ({ formData, onBack, onSubmit, note = '', setNote }) => {
  const { selectedSquare, selectedEvent, selectedSlot } = formData;

  if (!selectedSquare || !selectedEvent || !selectedSlot || selectedSlot.length === 0) {
    return <p>Chybí informace o výběru. Vraťte se zpět a doplňte potřebné údaje.</p>;
  }

  // Spočítat celkovou cenu všech slotů pomocí API (podobně jako ve Step3Map.jsx)

  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    // Volání API pro získání ceny
    async function fetchTotalPrice() {
      if (!selectedSlot || selectedSlot.length === 0) {
        setTotalPrice(0);
        return;
      }
      let total = 0;
      for (const s of selectedSlot) {
        try {
          const data = await orderAPI.calculatePrice({
            slot: s.id,
            reserved_from: selectedEvent.start,
            reserved_to: selectedEvent.end,
            used_extension: s.used_extension || 0,
          });
          total += parseFloat(data.final_price || 0);
        } catch {
          // fallback: ignore error, continue
        }
      }
      setTotalPrice(total);
    }
    fetchTotalPrice();
  }, [selectedEvent.id, selectedSlot]);

  // Helper to calculate reserved days
  function getReservedDays(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  }

  return (
    <Card className="p-4" style={{ background: "rgba(255,255,255,0.7)" }}>
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
      <div className="mb-2 text-muted" style={{ fontSize: "0.95em" }}>
        Tabulka níže zobrazuje vybrané sloty, jejich rozměry, cenu za metr čtvereční, počet dní rezervace a vypočtenou cenu za každý slot.
      </div>
      <Table bordered size="sm" style={{ background: "rgba(255,255,255,0.85)" }}>
        <thead>
          <tr>
            <th>Slot</th>
            <th>Detail</th>
            <th>Hodnota</th>
          </tr>
        </thead>
        <tbody>
          {selectedSlot.map((slot) => {
            const pricePerM2 = parseFloat(slot.price_per_m2 || selectedEvent.price_per_m2);
            const area = slot.width * slot.height;
            const days = getReservedDays(selectedEvent.start, selectedEvent.end);
            // const subtotal = area * pricePerM2 * days;
            return (
              <>
                <tr key={`slot-info-${slot.id}`}>
                  <td rowSpan={3}><strong>{slot.number}</strong></td>
                  <td>Rozměry (šířka × výška)</td>
                  <td>{slot.width} × {slot.height} m = <strong>{area} m²</strong></td>
                </tr>
                <tr key={`slot-days-${slot.id}`}>
                  <td>Počet dní</td>
                  <td>{days}</td>
                </tr>
                <tr key={`slot-price-m2-${slot.id}`}>
                  <td>Cena za m²</td>
                  <td>{pricePerM2.toFixed(2)} Kč</td>
                </tr>
              </>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} className="text-end">
              <strong>Celková cena objednávky:</strong>
            </td>
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

