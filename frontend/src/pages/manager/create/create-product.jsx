import React, { useState } from "react";
import { Container, Row, Col, Form, Alert, Button as BootstrapButton } from "react-bootstrap";
import Sidebar from "../../../components/Sidebar";
import { Group } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import productAPI from "../../../api/model/product";

function CreateProduct() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		price: "",
		is_active: true,
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState(null);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setError(null);
		try {
			await productAPI.createProduct({
				name: formData.name,
				description: formData.description,
				price: formData.price === "" ? null : Number(formData.price),
				is_active: !!formData.is_active,
			});
			navigate("/manager/products");
		} catch (err) {
			const apiErrors = err.response?.data;
			if (typeof apiErrors === "object") {
				const messages = Object.entries(apiErrors)
					.map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
					.join("\n");
				setError(messages);
			} else {
				setError(err.message || "Neznámá chyba");
			}
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Container fluid className="p-0 d-flex flex-column" style={{ overflowX: "hidden", height: "100vh" }}>
			<Row className="mx-0 flex-grow-1">
				<Col xs={2} className="px-0 bg-light" style={{ minWidth: 0 }}>
					<Sidebar />
				</Col>
				<Col xs={10} className="px-0 bg-white d-flex flex-column" style={{ minWidth: 0 }}>
					<div className="p-3">
						<h1>Vytvořit produkt</h1>
						<Form onSubmit={handleSubmit}>
							<Form.Group className="mb-3">
								<Form.Label>Název</Form.Label>
								<Form.Control name="name" value={formData.name} onChange={handleChange} required />
							</Form.Group>
							<Form.Group className="mb-3">
								<Form.Label>Popis</Form.Label>
								<Form.Control as="textarea" rows={4} name="description" value={formData.description} onChange={handleChange} />
							</Form.Group>
							<Form.Group className="mb-3">
								<Form.Label>Cena (Kč)</Form.Label>
								<Form.Control type="number" name="price" min="0" step="0.01" value={formData.price} onChange={handleChange} />
							</Form.Group>
							<Form.Group className="mb-3">
								<Form.Check type="checkbox" name="is_active" label="Aktivní" checked={!!formData.is_active} onChange={handleChange} />
							</Form.Group>
							{error && <Alert variant="danger">{error}</Alert>}
							<Group mt="md" gap="sm">
								<BootstrapButton variant="outline" onClick={() => navigate("/manager/products")}>
									Zpět
								</BootstrapButton>
								<BootstrapButton type="submit" variant="primary" disabled={submitting}>
									Vytvořit
								</BootstrapButton>
							</Group>
						</Form>
					</div>
				</Col>
			</Row>
		</Container>
	);
}

export default CreateProduct;
