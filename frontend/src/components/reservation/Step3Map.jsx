import { useEffect, useState, useCallback } from "react";
import { Button, Alert, Spinner, Col, Row, Container, Modal } from "react-bootstrap";
import DynamicGrid from "../DynamicGrid";
import eventAPI from "../../api/model/event";
import orderAPI from "../../api/model/order";
import reservationAPI from "../../api/model/reservation";
import { format } from "date-fns";
import DaySelectorCalendar from "./step3/Calendar";
import dayjs from "dayjs";

export default function Step3Map({ data, setData, next, prev }) {
  const [slots, setSlots] = useState([]);
  const [selectedSlotIdx, setSelectedSlotIdx] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [modalSlot, setModalSlot] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const [price, setPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [bookedRanges, setBookedRanges] = useState([]);

  // Load all slots for the selected event on initial load
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
          status: slot.status,
        }));
        setSlots(mappedSlots);
      }
    });
  }, [data?.event?.id]);

  // When user clicks a slot, open date picker modal (with delay)
  const handleSlotSelect = async (idx) => {
    setSelectedSlotIdx(idx);
    setModalSlot(slots[idx]);
    setValidationError('');
    setPrice(null);
    setPriceError(null);
    setSelectedRange(null);

    // Fetch reserved ranges for this slot
    const slotId = slots[idx]?.id;
    if (slotId) {
      try {
        const res = await reservationAPI.getReservedRanges(slotId);
        // Expecting array of { start, end } objects
        setBookedRanges(res ?? []);
      } catch (e) {
        setBookedRanges([]);
      }
    } else {
      setBookedRanges([]);
    }

    setTimeout(() => {
      setShowDateModal(true);
      console.log("data:", data);
    }, 500); // small delay for state propagation
  };

  // When user picks a date range, submit to backend
  const handleDateRangeSubmit = async (rangeObj) => {
    if (!modalSlot?.id || !rangeObj?.start || !rangeObj?.end) return;
    setLoadingPrice(true);
    setPriceError(null);
    setValidationError('');
    
    try {
      // Use date only (YYYY-MM-DD)
      const reserved_from = dayjs(rangeObj.start).format("YYYY-MM-DD");
      const reserved_to = dayjs(rangeObj.end).format("YYYY-MM-DD");

      // Call backend to check reservation and get price
      const res = await orderAPI.calculatePrice({
        slot: modalSlot.id,
        reserved_from,
        reserved_to,
        used_extension: 0,
      });

      // If backend returns error (e.g., slot reserved), show validation error
      if (res?.error) {
        setValidationError(res.error || "Toto místo je již rezervováno pro tento termín.");
        setPrice(null);
      } else {
        setPrice(res.final_price ?? null);
        setSelectedRange(rangeObj);
        setData((prevData) => ({
          ...prevData,
          slots: [{ ...modalSlot }],
          date: {
            start: reserved_from,
            end: reserved_to,
          },
        }));
        setValidationError('');
      }
    } catch (error) {
      setPriceError("Nepodařilo se spočítat cenu rezervace.");
      setPrice(null);
    } finally {
      setLoadingPrice(false);
      setShowDateModal(false);
      console.log("Data:", data);
    }
  };

  // Validate before next
  const validateSelection = () => {
    if (!data.slots || data.slots.length === 0 || !selectedRange) {
      setValidationError('Musíte vybrat místo a termín.');
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
            <h5>Vyberte místo na mapě:</h5>
            <p>Klikněte na volné místo pro výběr termínu rezervace.</p>
          </Col>
          <Col>
            {loadingPrice ? (
              <Spinner animation="border" />
            ) : priceError ? (
              <Alert variant="danger">{priceError}</Alert>
            ) : price !== null ? (
              <Alert variant="info">
                Cena za rezervaci: <strong>{price} Kč</strong>
              </Alert>
            ) : null}
          </Col>
        </Row>
      </Container>

      {/* Always show map with all slots */}
      <DynamicGrid
        config={gridConfig}
        reservations={slots}
        onReservationsChange={() => {}}
        selectedIndex={selectedSlotIdx}
        onSelectedIndexChange={handleSlotSelect}
        static={true}
        multiSelect={false}
        clickableStatic={true}
        backgroundImage={data.square?.image} // <-- use image from API if present
        ref={el => {
          if (el) {
            console.log('[Step3Map] DynamicGrid props:', {
              selectedIndex: selectedSlotIdx,
              slots,
            });
          }
        }}
      />

      {/* Date picker modal for slot selection */}
      <Modal
        show={showDateModal}
        onHide={() => setShowDateModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Vyberte termín pro místo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DaySelectorCalendar
            onSelectDate={handleDateRangeSubmit}
            eventStart={data?.event?.start ? new Date(data.event.start) : null}
            eventEnd={data?.event?.end ? new Date(data.event.end) : null}
            defaultDate={data?.event?.start ? new Date(data.event.start) : null}
            bookedRanges={bookedRanges} // <-- pass reserved ranges here
          />
        </Modal.Body>
      </Modal>

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
          disabled={!data.slots?.length || !selectedRange}
        >
          ➡️ Pokračovat
        </Button>
      </div>
    </div>
  );
}
