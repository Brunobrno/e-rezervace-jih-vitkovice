import React, { useState } from "react";
import userAPI from "../../../api/model/user"; // adjust import if needed

const initialForm = {
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
};

export default function CreateUser() {
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await userAPI.createUser(form);
            setSuccess(true);
            setForm(initialForm);
        } catch (err) {
            setError(err.message || "Chyba při vytváření uživatele.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-user">
            <h2>Vytvořit uživatele</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Uživatelské jméno</label>
                    <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Heslo</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Jméno</label>
                    <input
                        type="text"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Příjmení</label>
                    <input
                        type="text"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Ukládám..." : "Vytvořit uživatele"}
                </button>
                {error && <div className="error">{error}</div>}
                {success && <div className="success">Uživatel byl vytvořen.</div>}
            </form>
        </div>
    );
}