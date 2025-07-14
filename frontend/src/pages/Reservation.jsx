import ReservationEditor from "../components/DynamicGrid";
import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";

function Reservation() {
  const [reservations, setReservations] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  return (
    <div>
      <ReservationEditor
        onReservationsChange={(newReservations) => {
          setReservations(newReservations);
        }}
      />

      {/* Reservation List */}
      <div className="col-md-4">
        <div className="card">
          <div className="card-header bg-light d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Seznam rezervací</h5>
            <span className="badge bg-primary">{reservations.length}</span>
          </div>
          <ul className="list-group list-group-flush">
            {reservations.map((res, i) => (
              <li
                key={i}
                className={`list-group-item list-group-item-action ${
                  i === selectedIndex ? "active" : ""
                }`}
                onClick={() => setSelectedIndex(i)}
                style={{ cursor: "pointer" }}
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
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Reservation;
