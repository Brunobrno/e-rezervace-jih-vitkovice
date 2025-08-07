import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Card, ListGroup } from "react-bootstrap";
import DynamicGrid, { DEFAULT_CONFIG } from "../../../components/DynamicGrid";
import apiEvent from "../../../api/model/event";
import apiSquare from "../../../api/model/square";
import apiMarketSlot from "../../../api/model/market_slot";

function MapEditor() {
  const { eventId } = useParams();
  const [gridConfig, setGridConfig] = useState(DEFAULT_CONFIG);

  const [eventObject, setEventObject] = useState(null);
  const [marketSlots, setMarketSlots] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [squareObject, setSquareObject] = useState(null);

  // 🟡 Načtení eventu a slotů z databáze
  useEffect(() => {
    if (!eventId) return;

    async function fetchSlots() {
      try {
        const data = await apiEvent.getEventById(eventId);
        setEventObject(data);
        setMarketSlots((data.market_slots || []).map((slot) => ({
                ...slot,
                status: slot.status || "active", // <- doplní výchozí hodnotu
            }))
        );

        const sqData = await apiSquare.getSquareById(data.square.id)
        setSquareObject(sqData);
        
        const rows = sqData.grid_rows;
        const cols = sqData.grid_cols;

        setGridConfig({
            ...DEFAULT_CONFIG,
            rows,
            cols,
        });

        // Převedení slotů na "reservations" formát
        const loadedReservations = (data.market_slots || []).map((slot, index) => ({
          id: slot.id,
          name: slot.label || `Slot #${index + 1}`,
          x: slot.x,
          y: slot.y,
          w: slot.width || 1,
          h: slot.height || 1,
          locked: slot.locked || false,
          status: slot.status,
          base_size: slot.base_size ?? undefined,
          available_extension: slot.available_extension ?? 0,
        }));

        setReservations(loadedReservations);
      } catch (error) {
        console.error("Chyba při načítání eventu a slotů:", error);
      }
    }

    fetchSlots();
  }, [eventId]);

  /*
  // (Volitelně) Uložení rezervací do localStorage – pokud chceš mít zálohu
  useEffect(() => {
    const storageKey = `reservationData_${eventId}_${gridConfig.rows}x${gridConfig.cols}`;

    localStorage.setItem(storageKey, JSON.stringify(reservations));
  }, [reservations, storageKey]);
  */

  const exportReservations = () => {
    const dataStr = JSON.stringify(reservations, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reservations.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const clearAll = () => {
    localStorage.removeItem(storageKey);
    setReservations([]);
    setSelectedIndex(null);
  };

  {/* UKLÁDANÍ */}
  const saveAndSend = async () => {
    try {
      console.log("Ukládám rezervace:", reservations);

      // Pro každou rezervaci: update pokud je id, create pokud ne
      for (const res of reservations) {
        // Připrav data ve formátu API
        const data = {
          event: eventId,
          status: res.status || "active",
          base_size: res.base_size ?? (res.w || 1) * (res.h || 1),
          available_extension: res.available_extension ?? 0,
          x: res.x,
          y: res.y,
          width: res.w,
          height: res.h,
          price_per_m2: 0, // případně doplnit podle potřeby
        };

        if (res.id) {
          // Update existujícího slotu
          await apiMarketSlot.updateMarketSlot(res.id, data);
        } else {
          // Vytvoření nového slotu
          const created = await apiMarketSlot.createMarketSlot(data);
          // Aktualizuj ID v state, aby bylo aktuální
          res.id = created.id;
        }
      }

      alert("Rezervace byly úspěšně uloženy.");
    } catch (error) {
      console.error("Chyba při ukládání rezervací:", error);
      alert("Chyba při ukládání rezervací, zkontrolujte konzoli.");
    }
  };

  return (
    <Container className="mt-4">
      <h3>
        Rezervace pro event:{" "}
        {eventObject?.name || `#${eventId}`}
      </h3>

      {eventObject && (
        <Card className="mb-4">
          <Card.Body>
            <h5 className="mb-2">{eventObject.name}</h5>
            <p className="mb-1 text-muted">{eventObject.description}</p>
            <p className="mb-0">
              Náměstí:{" "}
              <strong>{eventObject.square?.name || "Neznámé náměstí"}</strong>
            </p>
            <p className="mb-0">
              Termín:{" "}
              {new Date(eventObject.start).toLocaleString()} –{" "}
              {new Date(eventObject.end).toLocaleString()}
            </p>
          </Card.Body>
        </Card>
      )}

      <Row>
        <Col sm={6} md={8} className="d-flex">
          <DynamicGrid
            config={gridConfig}
            reservations={reservations}
            onReservationsChange={setReservations}
            selectedIndex={selectedIndex}
            onSelectedIndexChange={setSelectedIndex}
            marketSlots={marketSlots}
          />
        </Col>
        <Col sm={6} md={4}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Seznam slotu</h5>
              <span className="badge bg-info text-white">
                {reservations.length}
              </span>
            </Card.Header>
            {/* Make the list scrollable */}
            <div style={{ maxHeight: "80vh", overflowY: "auto" }}>
              <ListGroup className="list-group-flush">
                {reservations.map((res, i) => (
                  <ListGroup.Item
                    key={res.id || i}
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
                      [{res.x},{res.y}] → [{res.x + res.w - 1},{res.y + res.h - 1}]
                    </div>
                    {/* Editable fields */}
                    <div className="mt-2">
                      <label className="form-label mb-1" style={{ fontSize: "0.95em" }}>
                        Základní velikost (m²):
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          style={{ width: "100px", display: "inline-block", marginLeft: "8px" }}
                          value={res.base_size ?? ""}
                          min={0}
                          onChange={e => {
                            const value = e.target.value === "" ? undefined : Number(e.target.value);
                            setReservations(prev =>
                              prev.map((r, idx) =>
                                idx === i ? { ...r, base_size: value } : r
                              )
                            );
                          }}
                          placeholder="volitelné"
                        />
                      </label>
                    </div>
                    <div className="mt-2">
                      <label className="form-label mb-1" style={{ fontSize: "0.95em" }}>
                        Možnost rozšíření (m²):
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          style={{ width: "100px", display: "inline-block", marginLeft: "8px" }}
                          value={res.available_extension ?? ""}
                          min={0}
                          required
                          onChange={e => {
                            const value = Number(e.target.value);
                            setReservations(prev =>
                              prev.map((r, idx) =>
                                idx === i ? { ...r, available_extension: value } : r
                              )
                            );
                          }}
                          placeholder="povinné"
                        />
                      </label>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </Card>
        </Col>
      </Row>

      <div className="mt-3">
        <button onClick={exportReservations} className="btn btn-primary me-2">
          Exportovat
        </button>
        <button onClick={clearAll} className="btn btn-danger me-2">
          Vymazat vše
        </button>
        <button onClick={saveAndSend} className="btn btn-success">
          Uložit a odeslat
        </button>
      </div>
    </Container>
  );
}

export default MapEditor;
