import React, { useState, useEffect } from "react";
import userAPI from "../../../api/model/user"; // adjust import if needed
import Form from 'react-bootstrap/Form';
import { fetchEnumFromSchemaJson } from "../../../api/get_chocies";

const initialForm = {
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    account_type: "",
    role: "",
    password: "",
    city: "",
    street: "",
    PSC: "",
    bank_account: "",
    RC: "",
    ICO: "",
    GDPR: false,
};

export default function CreateUser() {
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [roleChoices, setRoleChoices] = useState([]);
    const [accountTypeChoices, setAccountTypeChoices] = useState([]);

    useEffect(() => {
        // Fetch choices from OpenAPI schema for role and account_type
        fetchEnumFromSchemaJson("/api/account/users/", "post", "role")
            .then((choices) => setRoleChoices(choices))
            .catch(() => setRoleChoices([
                { value: "admin", label: "Administrátor" },
                { value: "seller", label: "Prodejce" },
                { value: "squareManager", label: "Správce tržiště" },
                { value: "cityClerk", label: "Úředník" },
                { value: "checker", label: "Kontrolor" },
            ]));
        fetchEnumFromSchemaJson("/api/account/users/", "post", "account_type")
            .then((choices) => setAccountTypeChoices(choices))
            .catch(() => setAccountTypeChoices([
                { value: "company", label: "Firma" },
                { value: "individual", label: "Fyzická osoba" },
            ]));
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
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
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <h3 className="mb-0">Registrace nového uživatele</h3>
                        </div>
                        <form className="card-body" onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Jméno</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    className="form-control"
                                    value={form.first_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Příjmení</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    className="form-control"
                                    value={form.last_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Telefonní číslo</label>
                                <input
                                    type="text"
                                    name="phone_number"
                                    className="form-control"
                                    value={form.phone_number}
                                    onChange={handleChange}
                                    required
                                    placeholder="+420123456789"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Typ účtu</label>
                                <Form.Select
                                    aria-label="Typ účtu"
                                    name="account_type"
                                    value={form.account_type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Vyberte typ účtu</option>
                                    {accountTypeChoices.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </Form.Select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Role</label>
                                <Form.Select
                                    aria-label="Role"
                                    name="role"
                                    value={form.role || ""}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Vyberte roli</option>
                                    {roleChoices.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </Form.Select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Heslo</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                    placeholder="Min. 8 znaků, velké/malé písmeno, číslice"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Město</label>
                                <input
                                    type="text"
                                    name="city"
                                    className="form-control"
                                    value={form.city}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Ulice</label>
                                <input
                                    type="text"
                                    name="street"
                                    className="form-control"
                                    value={form.street}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">PSČ</label>
                                <input
                                    type="text"
                                    name="PSC"
                                    className="form-control"
                                    value={form.PSC}
                                    onChange={handleChange}
                                    required
                                    placeholder="12345"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Číslo bankovního účtu</label>
                                <input
                                    type="text"
                                    name="bank_account"
                                    className="form-control"
                                    value={form.bank_account}
                                    onChange={handleChange}
                                    required
                                    placeholder="1234567890/0100"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Rodné číslo</label>
                                <input
                                    type="text"
                                    name="RC"
                                    className="form-control"
                                    value={form.RC}
                                    onChange={handleChange}
                                    required
                                    placeholder="123456/7890"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">IČO</label>
                                <input
                                    type="text"
                                    name="ICO"
                                    className="form-control"
                                    value={form.ICO}
                                    onChange={handleChange}
                                    required
                                    placeholder="12345678"
                                />
                            </div>
                            <div className="form-check mb-3">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="GDPR"
                                    id="gdprCheck"
                                    checked={form.GDPR}
                                    onChange={handleChange}
                                    required
                                />
                                <label className="form-check-label" htmlFor="gdprCheck">
                                    Souhlasím se zpracováním osobních údajů (GDPR)
                                </label>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Ukládám...
                                    </span>
                                ) : (
                                    "Vytvořit uživatele"
                                )}
                            </button>
                            {error && (
                                <div className="alert alert-danger mt-3">{error}</div>
                            )}
                            {success && (
                                <div className="alert alert-success mt-3">
                                    Uživatel byl úspěšně vytvořen.
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}