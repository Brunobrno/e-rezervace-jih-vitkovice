import { useState } from 'react';
import { ProgressBar } from 'react-bootstrap';
import dayjs from 'dayjs';
import { Form } from 'react-bootstrap';

import Step1SelectSquare from './Step1SelectSquare';
import Step2SelectEvent from './Step2SelectEvent';
import Step3Map from './Step3Map';
import Step4Summary from './Step4Summary';

import orderAPI from '../../api/model/order';
import reservationAPI from '../../api/model/reservation';
import userAPI from '../../api/model/user';


// TODO: Replace this with real user role detection (e.g., from context or props)
const isAdminOrClerk = true; // Set to true for demonstration

const ReservationWizard = () => {
  const [data, setData] = useState({
    square: null,
    event: null,
    slots: [],
    user: '', // New field for user ID
    date: null, // Ensure date is present for reservation
    note: '',   // Ensure note is present
  });
  const [step, setStep] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [duration, setDuration] = useState(1); // 1, 7, or 30
  // Debounced user search (replace with useDebouncedCallback if available)
  const handleUserSearch = async (value) => {
    setUserSearch(value);
    if (!value) {
      setUserResults([]);
      return;
    }
    setIsSearching(true);
    try {
      let results = await userAPI.searchUsers({ username: value });
      // If API returns {results: [...]}, extract it
      if (results && typeof results === 'object' && !Array.isArray(results) && Array.isArray(results.results)) {
        results = results.results;
      }
      // Fallback: ensure array
      setUserResults(Array.isArray(results) ? results : []);
    } catch (e) {
      setUserResults([]);
    }
    setIsSearching(false);
  };

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    try {
      const slot = data.slots[0];
      // Ensure slot and date are present
      if (!slot || !data.date || !data.date.start || !data.date.end) {
        alert('Vyberte termín a slot.');
        return;
      }

      // Ensure event is present and valid
      if (!data.event || typeof data.event !== 'object' || !data.event.id) {
        alert('Chybí událost (event). Vyberte prosím událost.');
        return;
      }

      // Use selected date range from Step3Map (date only)
      let reserved_from = data.date.start;
      let reserved_to = data.date.end;

      // Clamp reserved_from and reserved_to to event boundaries
      const eventStart = dayjs(data.event.start, "YYYY-MM-DD");
      const eventEnd = dayjs(data.event.end, "YYYY-MM-DD");
      if (dayjs(reserved_from).isBefore(eventStart)) reserved_from = eventStart.format("YYYY-MM-DD");
      if (dayjs(reserved_to).isAfter(eventEnd)) reserved_to = eventEnd.format("YYYY-MM-DD");

      const reservationData = {
        event: data.event.id,
        market_slot: slot.id,
        reserved_from,
        reserved_to,
        used_extension: slot.used_extension || 0,
        note: data.note || null,
      };
      if (isAdminOrClerk && data.user) {
        reservationData.user = data.user;
      }

      console.log('Odesílaná rezervace:', reservationData);

      // Create reservation and get its ID
      const ResponseReservation = await reservationAPI.createReservation(reservationData);
      console.log('Response:', ResponseReservation);

      const response = await orderAPI.createOrder({
        user_id: data.user || null,
        note: data.note || null,
        reservation_id: ResponseReservation.id, // Use the reservation ID
      });
      alert('Objednávka byla úspěšně odeslána!');
      console.log('📦 Objednáno:', response);
    } catch (error) {
      // Log the error and show backend validation errors if present
      console.error('❌ Chyba při odesílání objednávky:', error);
      if (error.response) {
        console.error('Backend response:', error.response);
        // Log backend error details for debugging
        if (error.response.data) {
          console.error('Backend error details:', error.response.data);
        }
      }
      if (error.response && error.response.data) {
        alert(
          'Chyba při odesílání objednávky:\n' +
          JSON.stringify(error.response.data, null, 2)
        );
      } else {
        alert('Něco se pokazilo při odesílání objednávky.');
      }
    }
  };

  return (
    <>
      <ProgressBar now={(step / 4) * 100} className="mb-4" />

      {/* Admin/Clerk user search bar by username */}
      {isAdminOrClerk && (
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="user-search">Přidat uživatele (uživatelské jméno): </label>
          <input
            id="user-search"
            type="text"
            value={userSearch}
            onChange={e => handleUserSearch(e.target.value)}
            placeholder="Zadejte uživatelské jméno"
            style={{ marginRight: 8 }}
            autoComplete="off"
          />
          {isSearching && <span>Hledám...</span>}
          {userResults.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0', background: '#f8f9fa', border: '1px solid #ccc', maxWidth: 300 }}>
              {userResults.map(user => (
                <li key={user.id} style={{ padding: '4px 8px', cursor: 'pointer' }}
                  onClick={() => {
                    setData(d => ({ ...d, user: user.id }));
                    setUserSearch(user.username);
                    setUserResults([]);
                  }}
                >
                  {user.username} <span style={{ color: '#888' }}>(ID: {user.id})</span>
                </li>
              ))}
            </ul>
          )}
          {data.user && (
            <span style={{ marginLeft: 12, color: 'green' }}>
              Vybraný uživatel ID: <b>{data.user}</b>
            </span>
          )}
        </div>
      )}

      {step === 1 && (
        <Step1SelectSquare data={data} setData={setData} next={next} />
      )}
      {step === 2 && (
        <Step2SelectEvent data={data} setData={setData} next={next} prev={prev} />
      )}
      {step === 3 && (
        <>
          {/* Pass duration and setDuration to Step3Map */}
          <Step3Map
            data={data}
            setData={setData}
            next={next}
            prev={prev}
            duration={duration}
            setDuration={setDuration}
          />
        </>
      )}
      {step === 4 && (
        <Step4Summary
          formData={{
            selectedSquare: data.square,
            selectedEvent: data.event,
            selectedSlot: data.slots,
            selectedUser: data.user || null,
            note: data.note || '',
          }}
          onBack={prev}
          onSubmit={handleSubmit}
          note={data.note || ''}
          setNote={note => setData(d => ({ ...d, note }))}
        />
      )}
    </>
  );
};

export default ReservationWizard;
