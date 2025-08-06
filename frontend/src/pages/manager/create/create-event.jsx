import React, { useState, useEffect } from "react";
// Adjust the import path if event.js is elsewhere
import eventAPI from "../../../api/model/event";
// Assume getSquares fetches all squares (adjust path as needed)
import squareAPI from "../../../api/model/square";

export default function CreateEvent({ onCreated }) {
  const [form, setForm] = useState({ ...eventAPI.defaultEvent });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Squares state
  const [squares, setSquares] = useState([]);
  const [search, setSearch] = useState("");
  const [squaresLoading, setSquaresLoading] = useState(false);

  useEffect(() => {
    setSquaresLoading(true);
    squareAPI.getSquares()
      .then(data => setSquares(data))
      .catch(() => setSquares([]))
      .finally(() => setSquaresLoading(false));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSquareSelect = square => {
    setForm(f => ({ ...f, square: square.id }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await eventAPI.createEvent(form);
      setForm({ ...eventAPI.defaultEvent });
      if (onCreated) onCreated();
    } catch (err) {
      setError("Chyba při vytváření události.");
    } finally {
      setLoading(false);
    }
  };

  // Filter squares by search
  const filteredSquares = squares.filter(sq =>
    (sq.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Název události</label>
        <input
          className="form-control"
          name="name"
          value={form.name || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Datum</label>
        <input
          className="form-control"
          type="date"
          name="date"
          value={form.date || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Popis</label>
        <textarea
          className="form-control"
          name="description"
          value={form.description || ""}
          onChange={handleChange}
        />
      </div>
      {/* Square selection */}
      <div className="mb-3">
        <label className="form-label">Vyberte plochu</label>
        <input
          className="form-control mb-2"
          placeholder="Hledat plochu..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ maxHeight: 180, overflowY: "auto" }}>
          <table className="table table-sm table-bordered">
            <thead>
              <tr>
                <th>Název</th>
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {squaresLoading ? (
                <tr>
                  <td colSpan={2}>Načítání...</td>
                </tr>
              ) : filteredSquares.length === 0 ? (
                <tr>
                  <td colSpan={2}>Žádné plochy</td>
                </tr>
              ) : (
                filteredSquares.map(sq => (
                  <tr key={sq.id}>
                    <td>{sq.name}</td>
                    <td>
                      <button
                        type="button"
                        className={`btn btn-sm ${form.square === sq.id ? "btn-success" : "btn-outline-primary"}`}
                        onClick={() => handleSquareSelect(sq)}
                      >
                        {form.square === sq.id ? "Vybráno" : "Vybrat"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {form.square && (
          <div className="mt-1 text-success">
            Vybraná plocha ID: {form.square}
          </div>
        )}
      </div>
      {/* ...add more fields as needed based on serializer... */}
      {error && <div className="alert alert-danger">{error}</div>}
      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Ukládání..." : "Vytvořit událost"}
      </button>
    </form>
  );
}
