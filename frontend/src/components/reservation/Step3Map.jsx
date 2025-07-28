import { useEffect, useState, useCallback } from "react";
import { Button, FormCheck, Alert, Spinner, Col, Row, Container } from "react-bootstrap";

import DynamicGrid from "../DynamicGrid";

import eventAPI from "../../api/model/event";
import orderAPI from "../../api/model/order";

import { format, isBefore, isAfter } from "date-fns";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { useDebouncedCallback } from "use-debounce"; // npm i use-debounce

import cs from "date-fns/locale/cs";

export default function Step3Map({ data, setData, next, prev }) {
  const [slots, setSlots] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [multiSelectEnabled, setMultiSelectEnabled] = useState(false);
  const [price, setPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState(null);

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
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Načti sloty z eventu
  useEffect(() => {
    if (!data?.event?.id) return;

    eventAPI.getEventById(data.event.id).then((eventData) => {
      if (eventData?.market_slots) {
        const mappedSlots = eventData.market_slots.map((slot) => ({
          ...slot,
          x: slot.x,
          y: slot.y,
          w: slot.width,
          h: slot.height,
          status: slot.status === "empty" ? "active" : slot.status,
        }));
        setSlots(mappedSlots);
      }
    });
  }, [data?.event?.id]);

  // Výběr slotu
  const handleSlotSelect = (index) => {
    const selected = slots[index];
    if (!selected?.id) return;

    setSelectedIndices((prev) =>
      multiSelectEnabled
        ? prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
        : [index]
    );

    setData((prev) => {
      const isAlreadySelected = (prev.slots ?? []).some((s) => s.id === selected.id);
      const updatedSlots = isAlreadySelected
        ? prev.slots.filter((s) => s.id !== selected.id)
        : multiSelectEnabled
        ? [...(prev.slots || []), selected]
        : [selected];

      return { ...prev, slots: updatedSlots };
    });
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

  // Změna vybraného data v kalendáři
  const handleDateClick = (date) => {
    if (!date) return;
    if (eventStart && isBefore(date, eventStart)) return;
    if (eventEnd && isAfter(date, eventEnd)) return;

    setSelectedDate(date);
    setData((prev) => ({ ...prev, date: format(date, "yyyy-MM-dd") }));
  };

  const dynamicGridSelectedIndex = multiSelectEnabled
    ? selectedIndices
    : selectedIndices.length === 1
    ? selectedIndices[0]
    : null;

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
          </Col>
        </Row>
        


        
      </Container>
      <DynamicGrid
        config={{ cols: 60, rows: 44, cellSize: 20 }}
        reservations={slots}
        onReservationsChange={() => {}}
        selectedIndex={dynamicGridSelectedIndex}
        onSelectedIndexChange={handleSlotSelect}
        static={true}
        multiSelect={multiSelectEnabled}
      />

      <div className="d-flex justify-content-between w-100 mt-4 px-4">
        <Button variant="secondary" onClick={prev}>
          ⬅️ Zpět
        </Button>
        <Button
          variant="primary"
          onClick={next}
          disabled={data.slots?.length === 0 || !selectedDate}
        >
          ➡️ Pokračovat
        </Button>
      </div>
    </div>
  );
}
