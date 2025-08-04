import { useState } from 'react';
import { ProgressBar } from 'react-bootstrap';

import Step1SelectSquare from './Step1SelectSquare';
import Step2SelectEvent from './Step2SelectEvent';
import Step3Map from './Step3Map';
import Step4Summary from './Step4Summary';

import orderAPI from '../../api/model/order';
import userAPI from '../../api/model/user';


// TODO: Replace this with real user role detection (e.g., from context or props)
const isAdminOrClerk = true; // Set to true for demonstration

const ReservationWizard = () => {
  const [data, setData] = useState({
    square: null,
    event: null,
    slots: [],
    user: '', // New field for user ID
  });
  const [step, setStep] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
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
      const payload = {
        event: data.event.id,
        slots: data.slots.map((s) => s.id),
      };
      if (isAdminOrClerk && data.user) {
        payload.user = data.user;
      }
      const response = await orderAPI.createOrder(payload);
      alert('Objednávka byla úspěšně odeslána!');
      console.log('📦 Objednáno:', response);
    } catch (error) {
      console.error('❌ Chyba při odesílání objednávky:', error);
      alert('Něco se pokazilo při odesílání objednávky.');
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
        <Step3Map data={data} setData={setData} next={next} prev={prev} />
      )}
      {step === 4 && (
        <Step4Summary
          formData={{
            selectedSquare: data.square,
            selectedEvent: data.event,
            selectedSlot: data.slots,
            selectedUser: data.user || null,
          }}
          onBack={prev}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
};

export default ReservationWizard;
