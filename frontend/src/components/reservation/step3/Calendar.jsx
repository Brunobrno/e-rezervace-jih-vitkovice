import '@mantine/core/styles.layer.css'; // základní styly komponent
import '@mantine/dates/styles.css'; // styly pro kalendář

import { useState } from "react";
import { SegmentedControl, Group } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import dayjs from "dayjs";
import { Container, Row, Col } from 'react-bootstrap';

/**
 * Komponenta pro výběr rozsahu rezervace s vizuálním označením rezervovaných dní a omezením na povolený interval.
 */
export default function DaySelectorCalendar({
  onSelectDate,
  bookedRanges = [],
  eventStart,
  eventEnd,
  defaultDate, // <-- add prop
}) {
  const [range, setRange] = useState([null, null]);
  const [mode, setMode] = useState("manual");
  const [quickStart, setQuickStart] = useState(null);
  const [quickType, setQuickType] = useState("day");

  const normalizeMinDate = (d) => dayjs(d).startOf("day").toDate();
  const normalizeMaxDate = (d) => dayjs(d).endOf("day").toDate();

  // Helper to check if a date is reserved
  const isReserved = (date) =>
    bookedRanges.some(({ start, end }) => {
      const d = dayjs(date);
      const s = dayjs(start);
      const e = dayjs(end);
      return (
        (d.isAfter(s, "day") || d.isSame(s, "day")) &&
        (d.isBefore(e, "day") || d.isSame(e, "day"))
      );
    });

  const isOutOfBounds = (date) => {
    if (eventStart && dayjs(date).isBefore(dayjs(eventStart), "day")) return true;
    if (eventEnd && dayjs(date).isAfter(dayjs(eventEnd), "day")) return true;
    return false;
  };

  const getQuickRange = (start, type) => {
    if (!start) return [null, null];
    const d = dayjs(start);
    if (type === "day") return [d.toDate(), d.toDate()];
    if (type === "week") return [d.startOf("week").toDate(), d.endOf("week").toDate()];
    if (type === "month") return [d.startOf("month").toDate(), d.endOf("month").toDate()];
    return [null, null];
  };

  const handleChange = (value) => {
    let normalized = Array.isArray(value) ? [value[0] ?? null, value[1] ?? null] : [null, null];
    setRange(normalized);
    if (normalized[0] && normalized[1]) {
      onSelectDate?.({ start: normalized[0], end: normalized[1] });
    }
  };

  const handleQuickPick = (date) => {
    setQuickStart(date);
    const [start, end] = getQuickRange(date, quickType);
    setRange([start, end]);
    if (start && end) onSelectDate?.({ start, end });
  };

  const handleQuickTypeChange = (type) => {
    setQuickType(type);
    if (quickStart) {
      const [start, end] = getQuickRange(quickStart, type);
      setRange([start, end]);
      if (start && end) onSelectDate?.({ start, end });
    }
  };

  const handleModeChange = (val) => {
    setMode(val);
    setRange([null, null]);
    setQuickStart(null);
  };

  return (
    <div className='bg-white p-4 rounded shadow-sm'>
      <Group mb="sm">
        
        <Container>
          <Row>
            <h5>Režim kalendáře:</h5>
          </Row>
          <Row>
            <Col>
              <SegmentedControl
                value={mode}
                onChange={handleModeChange}
                data={[
                  { label: "Vybrat rozsah", value: "manual" },
                  { label: "Rychlý výběr", value: "quick" },
                ]}
              />
            </Col>
            {mode === "quick" && (
            <Col>
                <SegmentedControl
                  value={quickType}
                  onChange={handleQuickTypeChange}
                  data={[
                    { label: "Den", value: "day" },
                    { label: "Týden", value: "week" },
                    { label: "Měsíc", value: "month" },
                  ]}
                />
            </Col>
            )}
          </Row>
        </Container>
        
        
      </Group>

      <DatePicker
        key={mode} // reset při změně režimu
        presets={[
          { value: dayjs().subtract(1, 'day').format('YYYY-MM-DD'), label: 'Včera' },
          { value: dayjs().format('YYYY-MM-DD'), label: 'Dnes' },
          { value: dayjs().add(1, 'day').format('YYYY-MM-DD'), label: 'Zítra' },
          { value: dayjs().add(1, 'month').format('YYYY-MM-DD'), label: 'Příští měsíc' },
          { value: dayjs().add(1, 'year').format('YYYY-MM-DD'), label: 'Příští rok' },
          { value: dayjs().subtract(1, 'month').format('YYYY-MM-DD'), label: 'Minulý měsíc' },
          { value: dayjs().subtract(1, 'year').format('YYYY-MM-DD'), label: 'Minulý rok' },
        ]}
        allowDeselect
        allowSingleDateInRange 
        type={mode === "manual" ? "range" : "default"}
        value={mode === "manual" ? range : quickStart}
        onChange={mode === "manual" ? handleChange : handleQuickPick}
        minDate={eventStart ? normalizeMinDate(eventStart) : undefined}
        maxDate={eventEnd ? normalizeMaxDate(eventEnd) : undefined}
        defaultDate={defaultDate ? dayjs(defaultDate).toDate() : undefined} // <-- set initial displayed date
        getDayProps={(date) => {
          if (isReserved(date)) {
            return {
              style: {
                backgroundColor: "#f8d7da",
                color: "#721c24",
                borderRadius: 4,
              },
              disabled: true,
            };
          }
          if (isOutOfBounds(date)) {
            return { disabled: true, style: { opacity: 0.5 } };
          }
          if (
            mode === "quick" &&
            quickStart &&
            range[0] &&
            range[1] &&
            (
              (dayjs(date).isAfter(dayjs(range[0]), "day") || dayjs(date).isSame(dayjs(range[0]), "day")) &&
              (dayjs(date).isBefore(dayjs(range[1]), "day") || dayjs(date).isSame(dayjs(range[1]), "day"))
            )
          ) {
            return {
              style: {
                backgroundColor: "#e3f6fc",
                color: "#186fa7",
                borderRadius: 4,
              },
            };
          }
          return {};
        }}
      />

      <div className="mt-3 text-sm text-muted">
        <strong>Legenda:</strong>
        <ul className="list-disc ml-5 mt-1">
          <li>
            <span
              style={{
                color: "#721c24",
                background: "#f8d7da",
                borderRadius: 2,
                padding: "0 4px",
              }}
            >
              Červená
            </span>
            : Rezervováno
          </li>
          <li>
            <span
              style={{
                color: "#186fa7",
                background: "#e3f6fc",
                borderRadius: 2,
                padding: "0 4px",
              }}
            >
              Modrá
            </span>
            : Vybraný rozsah (rychlý výběr)
          </li>
          <li>
            <span className="text-gray-800">Bez barvy</span>: Volno
          </li>
        </ul>
      </div>

      {range[0] && range[1] && (
        <div className="mt-2">
          Vybráno: {dayjs(range[0]).format("D. M. YYYY")} – {dayjs(range[1]).format("D. M. YYYY")}
        </div>
      )}
    </div>
  );
}
