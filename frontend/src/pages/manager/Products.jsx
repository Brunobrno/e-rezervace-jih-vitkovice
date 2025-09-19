import React, { useEffect, useMemo, useState } from "react";
import Table from "../../components/Table";
import Sidebar from "../../components/Sidebar";
import { Container, Row, Col, Modal, Form, Alert, Button as BootstrapButton } from "react-bootstrap";
import {
	ActionIcon,
	Group,
	TextInput,
	MultiSelect,
	Badge,
	Button,
	Text,
} from "@mantine/core";
import { IconEye, IconEdit, IconTrash, IconPlus, IconSearch, IconX, IconPackage } from "@tabler/icons-react";
import dayjs from "dayjs";
import productAPI from "../../api/model/product";

function Products() {
	const [products, setProducts] = useState([]);
	const [fetching, setFetching] = useState(true);

	// Filters
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState([]); // ["active","inactive"]

	// Modals
	const [showView, setShowView] = useState(false);
	const [showEdit, setShowEdit] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [error, setError] = useState(null);
	const [submitting, setSubmitting] = useState(false);

	// Edit form data
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		price: "",
		is_active: true,
	});

	const statusOptions = [
		{ value: "active", label: "Aktivní" },
		{ value: "inactive", label: "Neaktivní" },
	];

	const statusColors = {
		active: "green",
		inactive: "red",
	};

	const fetchData = async () => {
		setFetching(true);
		try {
			// If backend supports search: productAPI.getProducts({ search: query })
			const data = await productAPI.getProducts();
			setProducts(Array.isArray(data?.results) ? data.results : data);
		} finally {
			setFetching(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const filtered = useMemo(() => {
		let data = Array.isArray(products) ? products : [];
		if (query) {
			const q = query.toLowerCase();
			data = data.filter(
				p =>
					p.name?.toLowerCase().includes(q) ||
					p.description?.toLowerCase().includes(q) ||
					String(p.id).includes(q)
			);
		}
		if (statusFilter.length > 0) {
			data = data.filter(p => {
				const state = p.is_active ? "active" : "inactive";
				return statusFilter.includes(state);
			});
		}
		return data;
	}, [products, query, statusFilter]);

	const openView = (product) => {
		setSelectedProduct(product);
		setShowView(true);
	};

	const openEdit = (product) => {
		setSelectedProduct(product);
		setFormData({
			name: product.name || "",
			description: product.description || "",
			price: product.price ?? "",
			is_active: Boolean(product.is_active),
		});
		setShowEdit(true);
	};

	const handleDelete = async (product) => {
		if (!product) return;
		if (window.confirm(`Opravdu smazat produkt: ${product.name || product.id}?`)) {
			await productAPI.deleteProduct(product.id);
			fetchData();
		}
	};

	const handleFieldChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleEditSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setError(null);
		try {
			await productAPI.updateProduct(selectedProduct.id, {
				name: formData.name,
				description: formData.description,
				price: formData.price === "" ? null : Number(formData.price),
				is_active: !!formData.is_active,
			});
			setShowEdit(false);
			setSelectedProduct(null);
			fetchData();
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

	const columns = [
		{ accessor: "id", title: "ID", sortable: true, width: "64px" },
		{
			accessor: "name",
			title: "Název",
			sortable: true,
			width: "2fr",
			render: row => row.name || "—",
			filter: (
				<TextInput
					label="Hledat"
					placeholder="Název, popis, ID"
					leftSection={<IconSearch size={16} />}
					rightSection={
						<ActionIcon size="sm" variant="transparent" c="dimmed" onClick={() => setQuery("")}>
							<IconX size={14} />
						</ActionIcon>
					}
					value={query}
					onChange={e => setQuery(e.currentTarget.value)}
				/>
			),
			filtering: query !== "",
		},
		{
			accessor: "price",
			title: "Cena (Kč)",
			sortable: true,
			width: "1fr",
			render: row => (row.price ?? 0),
		},
		{
			accessor: "is_active",
			title: "Stav",
			sortable: true,
			width: "1fr",
			render: row => {
				const state = row.is_active ? "active" : "inactive";
				const color = statusColors[state] || "gray";
				const label = state === "active" ? "Aktivní" : "Neaktivní";
				return <Badge color={color} variant="light">{label}</Badge>;
			},
			filter: (
				<MultiSelect
					label="Filtrovat stav"
					placeholder="Vyber stav"
					data={statusOptions}
					value={statusFilter}
					onChange={setStatusFilter}
					clearable
					searchable
					leftSection={<IconSearch size={16} />}
					comboboxProps={{ withinPortal: false }}
				/>
			),
			filtering: statusFilter.length > 0,
		},
		{
			accessor: "created_at",
			title: "Vytvořeno",
			sortable: true,
			width: "1.2fr",
			render: row => row.created_at ? dayjs(row.created_at).format("DD.MM.YYYY HH:mm") : "—",
		},
		{
			accessor: "actions",
			title: "Akce",
			width: "96px",
			render: (product) => (
				<Group gap={4} wrap="nowrap">
					<ActionIcon size="sm" variant="subtle" color="green" onClick={() => openView(product)}>
						<IconEye size={16} />
					</ActionIcon>
					<ActionIcon size="sm" variant="subtle" color="blue" onClick={() => openEdit(product)}>
						<IconEdit size={16} />
					</ActionIcon>
					<ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDelete(product)}>
						<IconTrash size={16} />
					</ActionIcon>
				</Group>
			),
		},
	];

	return (
		<Container fluid className="p-0 d-flex flex-column" style={{ overflowX: "hidden", height: "100vh" }}>
			<Row className="mx-0 flex-grow-1">
				<Col xs={2} className="px-0 bg-light" style={{ minWidth: 0 }}>
					<Sidebar />
				</Col>
				<Col xs={10} className="px-0 bg-white d-flex flex-column" style={{ minWidth: 0 }}>
					<Group justify="space-between" align="center" px="md" py="sm">
						<h1>
							<IconPackage size={30} style={{ marginRight: 10, marginTop: -4 }} />
							Produkty
						</h1>
						<Button component="a" href="/manage/products/create" leftSection={<IconPlus size={16} />}>
							Přidat produkt
						</Button>
					</Group>

					<Table
						data={filtered}
						columns={columns}
						fetching={fetching}
						withTableBorder
						borderRadius="md"
						highlightOnHover
						verticalAlign="center"
						titlePadding="4px 8px"
					/>

					{/* View modal */}
					<Modal show={showView} onHide={() => setShowView(false)} centered>
						<Modal.Header closeButton>
							<Modal.Title>Detail produktu</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							{selectedProduct ? (
								<>
									<p><strong>ID:</strong> {selectedProduct.id}</p>
									<p><strong>Název:</strong> {selectedProduct.name || "—"}</p>
									<p><strong>Popis:</strong> {selectedProduct.description || "—"}</p>
									<p><strong>Cena:</strong> {selectedProduct.price ?? 0} Kč</p>
									<p>
										<strong>Stav:</strong>{" "}
										<Badge color={(selectedProduct.is_active ? "green" : "red")} variant="light">
											{selectedProduct.is_active ? "Aktivní" : "Neaktivní"}
										</Badge>
									</p>
									<p><strong>Vytvořeno:</strong> {selectedProduct.created_at ? dayjs(selectedProduct.created_at).format("DD.MM.YYYY HH:mm") : "—"}</p>
								</>
							) : <Text>Produkt nebyl nalezen</Text>}
						</Modal.Body>
						<Modal.Footer>
							<BootstrapButton variant="secondary" onClick={() => setShowView(false)}>Zavřít</BootstrapButton>
							<BootstrapButton variant="primary" onClick={() => { setShowView(false); openEdit(selectedProduct); }}>Upravit</BootstrapButton>
						</Modal.Footer>
					</Modal>

					{/* Edit modal */}
					<Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
						<Modal.Header closeButton>
							<Modal.Title>Upravit produkt</Modal.Title>
						</Modal.Header>
						<Form onSubmit={handleEditSubmit}>
							<Modal.Body>
								<Form.Group className="mb-3">
									<Form.Label>Název</Form.Label>
									<Form.Control name="name" value={formData.name} onChange={handleFieldChange} required />
								</Form.Group>
								<Form.Group className="mb-3">
									<Form.Label>Popis</Form.Label>
									<Form.Control as="textarea" rows={4} name="description" value={formData.description} onChange={handleFieldChange} />
								</Form.Group>
								<Form.Group className="mb-3">
									<Form.Label>Cena (Kč)</Form.Label>
									<Form.Control type="number" name="price" min="0" step="0.01" value={formData.price} onChange={handleFieldChange} />
								</Form.Group>
								<Form.Group className="mb-3">
									<Form.Check type="checkbox" name="is_active" label="Aktivní" checked={!!formData.is_active} onChange={handleFieldChange} />
								</Form.Group>
								{error && <Alert variant="danger" className="mb-0">{error}</Alert>}
							</Modal.Body>
							<Modal.Footer>
								<BootstrapButton variant="secondary" onClick={() => setShowEdit(false)}>Zrušit</BootstrapButton>
								<BootstrapButton type="submit" variant="primary" disabled={submitting}>Uložit změny</BootstrapButton>
							</Modal.Footer>
						</Form>
					</Modal>
				</Col>
			</Row>
		</Container>
	);
}

export default Products;
