import React from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import cs from 'date-fns/locale/cs';

const locales = { 'cs': cs };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function DaySelectorCalendar({ selectedDate, onSelectDate }) {
  return (
    <div style={{ height: 300 }}>
      <Calendar
        localizer={localizer}
        date={selectedDate}
        onNavigate={onSelectDate}
        view="day"
        toolbar={false}
        events={[]} // můžeš později přidat obsazené sloty jako "events"
      />
    </div>
  );
}
