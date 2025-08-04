import { useEffect, useState, useCallback } from "react";
import { Button, FormCheck, Alert, Spinner, Col, Row, Container, Form } from "react-bootstrap";

import DynamicGrid from "../DynamicGrid";

import eventAPI from "../../api/model/event";
import orderAPI from "../../api/model/order";

import { format, isBefore, isAfter } from "date-fns";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { useDebouncedCallback } from "use-debounce"; // npm i use-debounce

import cs from "date-fns/locale/cs";

export default function Step3Map({ data, setData, next, prev, duration, setDuration }) {
  const [slots, setSlots] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [multiSelectEnabled, setMultiSelectEnabled] = useState(false);
  const [price, setPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState(null);
  const [validationError, setValidationError] = useState('');

  const eventStart = data?.event?.start ? new Date(data.event.start) : null;
  const eventEnd = data?.event?.end ? new Date(data.event.end) : null;

  if (eventStart) eventStart.setHours(0, 0, 0, 0);
  if (eventEnd) eventEnd.setHours(23, 59, 59, 999);

  const disabledDays = [
    {
      before: eventStart,
    },
    {
      after: eventEnd,
    },
  ];

  // Vybrané datum - defaultně dnes (můžeš změnit)
  const [selectedDate, setSelectedDate] = useState(null); // <-- default to null

  // Load slots for the selected date
  useEffect(() => {
    if (!data?.event?.id || !selectedDate) return;

    // Fetch event and filter slots by selectedDate
    eventAPI.getEventById(data.event.id).then((eventData) => {
      if (eventData?.market_slots) {
        // Only include slots available for the selected date
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const filteredSlots = eventData.market_slots.filter(slot => {
          // slot.reservedFrom/reservedTo or slot.date should match selectedDate
          // Adjust this logic based on your slot model
          if (slot.date) {
            return slot.date === dateStr;
          }
          if (slot.reservedFrom && slot.reservedTo) {
            const from = format(new Date(slot.reservedFrom), "yyyy-MM-dd");
            const to = format(new Date(slot.reservedTo), "yyyy-MM-dd");
            return dateStr >= from && dateStr <= to;
          }
          return true; // fallback: show if no date info
        }).map((slot) => ({
          ...slot,
          x: slot.x,
          y: slot.y,
          w: slot.width,
          h: slot.height,
          status: slot.status,
        }));
        setSlots(filteredSlots);
        // Reset selection if selected slot is not in filteredSlots
        setData((prevData) => ({
          ...prevData,
          slots: prevData.slots?.filter(selSlot =>
            filteredSlots.some(s => s.id === selSlot.id)
          ) || []
        }));
      }
    });
  }, [data?.event?.id, selectedDate, setData]);

  // Výběr slotu
  // Opravená logika pro multiSelect i single select
  const handleSlotSelect = (clickedIdx) => {
    if (multiSelectEnabled) {
      setSelectedIndices(prev => {
        let indices;
        if (prev.includes(clickedIdx)) {
          indices = prev.filter(i => i !== clickedIdx);
        } else {
          indices = [...prev, clickedIdx];
        }
        setData((prevData) => ({
          ...prevData,
          slots: indices.map(i => slots[i]).filter(Boolean)
        }));
        return indices;
      });
    } else {
      const idx = typeof clickedIdx === 'number' ? clickedIdx : null;
      setSelectedIndices(idx !== null ? [idx] : []);
      setData((prevData) => ({
        ...prevData,
        slots: idx !== null && slots[idx] ? [slots[idx]] : []
      }));
    }
  };

  const calculatePrice = useCallback(async () => {
    if (!data?.event?.id || !(data.slots?.length > 0) || !selectedDate) {
      setPrice(null);
      return;
    }

    setLoadingPrice(true);
    setPriceError(null);

    const reserved_from = new Date(selectedDate);
    reserved_from.setHours(0, 0, 0, 0);

    const reserved_to = new Date(reserved_from);
    reserved_to.setDate(reserved_to.getDate() + 1);

    try {
      console.log("Volám API pro výpočet ceny...");
      // Debug: log reserved_from, reserved_to, and event start/end for troubleshooting
      console.log("DEBUG reserved_from:", reserved_from.toISOString());
      console.log("DEBUG reserved_to:", reserved_to.toISOString());
      if (data.event?.start && data.event?.end) {
        console.log("DEBUG event.start:", data.event.start, "event.end:", data.event.end);
      }
      const res = await orderAPI.calculatePrice({
        event: data.event.id,
        reserved_from: reserved_from.toISOString(),
        reserved_to: reserved_to.toISOString(),
        slots: data.slots.map((s) => ({ slot_id: s.id, used_extension: 0 })),
      });

      setPrice(res.total_price ?? null);
    } catch (error) {
      console.error("Chyba výpočtu ceny:", error);
      setPriceError("Nepodařilo se spočítat cenu.");
      setPrice(null);
    } finally {
      setLoadingPrice(false);
    }
  }, [data.event?.id, data.slots, selectedDate]);

  // Debounce volání calculatePrice - čeká 300 ms po poslední změně
  const debouncedCalculatePrice = useDebouncedCallback(() => {
    calculatePrice();
  }, 300);

  // Zavolání debouncedCalculatePrice když se změní slots nebo datum
  useEffect(() => {
    debouncedCalculatePrice();
  }, [data.slots, selectedDate, debouncedCalculatePrice]);

  // Change selected date and reload slots for that day
  const handleDateClick = (date) => {
    if (!date) return;
    if (eventStart && isBefore(date, eventStart)) return;
    if (eventEnd && isAfter(date, eventEnd)) return;

    setSelectedDate(date);
    setData((prev) => ({ ...prev, date: format(date, "yyyy-MM-dd"), slots: [] }));
    setSelectedIndices([]);
  };

  // V multiSelect módu vždy pole, v single select číslo nebo null
  const dynamicGridSelectedIndex = multiSelectEnabled
    ? selectedIndices
    : selectedIndices.length === 1
      ? selectedIndices[0]
      : null;

  // Remove slot-level validation, only require at least one slot
  const validateSelection = () => {
    if (!data.slots || data.slots.length === 0) {
      setValidationError('Musíte vybrat alespoň jeden časový slot.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleNext = () => {
    if (validateSelection()) {
      next();
    }
  };

  // Get grid config from selected square or fallback to defaults
  const gridConfig = data.square
    ? {
        cols: data.square.grid_cols || 60,
        rows: data.square.grid_rows || 44,
        cellSize: data.square.cellsize || 20,
      }
    : { cols: 60, rows: 44, cellSize: 20 };

  return (
    <div className="d-flex flex-column align-items-center gap-3 w-100">
      <Container className="w-100 mb-5">
        <Row>
          <Col>
            <h5>Vyber datum rezervace:</h5>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateClick}
              disabled={disabledDays}
              modifiersClassNames={{
                selected: "bg-primary text-white rounded",
              }}
              modifiersStyles={{
                disabled: { color: "#ccc", backgroundColor: "#f8f9fa", cursor: "not-allowed" },
              }}
              pagedNavigation
              locale={cs}
            />
          </Col>
          <Col>
            {selectedDate && (
              <>
                <Row className="fs-3">
                  {loadingPrice ? (
                    <Spinner animation="border" />
                  ) : priceError ? (
                    <Alert variant="danger">{priceError}</Alert>
                  ) : price !== null ? (
                    <Alert variant="info">
                      Cena za rezervaci: <strong>{price} Kč</strong>
                    </Alert>
                  ) : null}
                </Row>
                <Row>
                  <FormCheck
                    type="switch"
                    id="multiSelectSwitch"
                    label="Povolit vícenásobný výběr"
                    checked={multiSelectEnabled}
                    onChange={() => setMultiSelectEnabled(!multiSelectEnabled)}
                    className="my-5 fs-2"
                  />
                </Row>
              </>
            )}
          </Col>
        </Row>
      </Container>

      {/* Duration selector moved here */}
      <div style={{ marginBottom: 16 }} className="w-100 text-center">
        <label>Vyberte délku rezervace:&nbsp;</label>
        <select
          value={duration}
          onChange={e => setDuration(Number(e.target.value))}
          style={{ width: 120 }}
        >
          <option value={1}>1 den</option>
          <option value={7}>7 dní</option>
          <option value={30}>30 dní</option>
        </select>
      </div>

      {/* Only show map after date is selected */}
      {selectedDate ? (
        <DynamicGrid
          config={gridConfig}
          reservations={slots}
          onReservationsChange={() => {}}
          selectedIndex={dynamicGridSelectedIndex}
          onSelectedIndexChange={handleSlotSelect}
          static={true}
          multiSelect={multiSelectEnabled}
          clickableStatic={true}
          ref={el => {
            if (el) {
              console.log('[Step3Map] DynamicGrid props:', {
                selectedIndex: dynamicGridSelectedIndex,
                multiSelect: multiSelectEnabled,
                slots,
              });
            }
          }}
        />
      ) : (
        <Alert variant="info" className="mt-4">
          Nejprve vyberte datum v kalendáři. Poté se zobrazí mapa s dostupnými sloty.
        </Alert>
      )}

      {validationError && (
        <div style={{ color: 'red', marginBottom: 8 }}>{validationError}</div>
      )}

      <div className="d-flex justify-content-between w-100 mt-4 px-4">
        <Button variant="secondary" onClick={prev}>
          ⬅️ Zpět
        </Button>
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!selectedDate || data.slots?.length === 0}
        >
          ➡️ Pokračovat
        </Button>
      </div>
    </div>
  );
}
