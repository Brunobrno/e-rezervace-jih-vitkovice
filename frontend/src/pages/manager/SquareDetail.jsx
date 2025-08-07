import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import squareAPI from "../../../api/model/square";
import { Container, Row, Col, Form, Button, Alert, Modal } from "react-bootstrap";
import DynamicGrid, { DEFAULT_CONFIG } from "../../../components/DynamicGrid";


export default function SquareDesigner() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    street: "",
    city: "",
    psc: "",
    width: 40,
    height: 30,
    cell_area: 4, // m2, default
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [imageAspect, setImageAspect] = useState(4/3); // default aspect ratio
  const [error, setError] = useState(null);
  const fileInputRef = useRef();

  // Calculate grid size from width, height, and cell_area
  const cellArea = Math.max(1, Math.floor(Number(formData.cell_area) || 1));
  // cell is always square in m², so side = sqrt(cellArea)
  const cellSide = Math.sqrt(cellArea);
  const safeWidth = Math.max(1, Number(formData.width) || 1);
  const safeHeight = Math.max(1, Number(formData.height) || 1);
  let grid_cols = Math.max(1, Math.round(safeWidth / cellSide));
  let grid_rows = Math.max(1, Math.round(safeHeight / cellSide));
  // Prevent NaN or Infinity
  if (!isFinite(grid_cols) || grid_cols < 1) grid_cols = 1;
  if (!isFinite(grid_rows) || grid_rows < 1) grid_rows = 1;
  const cellWidth = safeWidth / grid_cols;
  const cellHeight = safeHeight / grid_rows;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((old) => ({ ...old, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      // Get image aspect ratio
      const img = new window.Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        setImageAspect(aspect);
        // Adjust width/height to match aspect
        setFormData((old) => ({
          ...old,
          width: Math.sqrt((old.cell_area || 1) * aspect),
          height: Math.sqrt((old.cell_area || 1) / aspect),
        }));
      };
      img.src = url;
      setStep(2);
    }
  };
  // Only allow width/height to be changed together (scaling)
  const handleScale = (delta) => {
    setFormData((old) => {
      const scale = Math.max(0.1, 1 + delta);
      const newWidth = old.width * scale;
      const newHeight = newWidth / imageAspect;
      return {
        ...old,
        width: newWidth,
        height: newHeight,
        area: newWidth * newHeight,
      };
    });
  };

  // When user sets area, recalc width/height
  const handleAreaChange = (e) => {
    const area = Number(e.target.value) || 1;
    setFormData((old) => ({
      ...old,
      area,
      width: Math.sqrt(area * imageAspect),
      height: Math.sqrt(area / imageAspect),
    }));
  };

  const handleImageRemove = () => {
    setImage(null);
    setImageUrl("");
    setStep(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Container className="py-4">
      <h2>Návrh náměstí / Square Designer</h2>
      {step === 1 && (
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nejprve nahrajte obrázek náměstí (doporučeno z ptačí perspektivy)</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} />
            </Form.Group>
          </Col>
        </Row>
      )}
      {step === 2 && (
        <>
          <Row className="mb-4">
            <Col md={7}>
              <h5>Editor mapy náměstí</h5>
              <div style={{
                position: "relative",
                width: "100%",
                maxWidth: 600,
                aspectRatio: safeWidth / safeHeight || 1,
                backgroundImage: imageUrl ? `url(${imageUrl})` : undefined, // only use uploaded image
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundColor: "#f8f9fa",
                border: "2px solid #007bff",
                borderRadius: 8,
                overflow: "hidden",
                marginBottom: 24
              }}>
                {grid_cols > 0 && grid_rows > 0 && isFinite(grid_cols) && isFinite(grid_rows) && (
                  <DynamicGrid
                    config={{
                      cols: grid_cols,
                      rows: grid_rows,
                      cellSize: 24,
                      gridColor: "#007bff",
                      gridThickness: 2,
                    }}
                    reservations={[]}
                    static={true}
                    backgroundImage={imageUrl} // <-- pass imageUrl here
                  />
                )}
              </div>
              <div className="mt-2 mb-4">
                <div>Každá buňka: <b>{cellWidth.toFixed(2)}m × {cellHeight.toFixed(2)}m</b> ({cellArea} m²)</div>
                <div>Počet řádků: <b>{grid_rows}</b> | Počet sloupců: <b>{grid_cols}</b></div>
              </div>
            </Col>
            <Col md={5}>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Šířka náměstí (m)</Form.Label>
                  <Form.Control type="number" name="width" value={formData.width} onChange={handleChange} min={1} step={1} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Výška náměstí (m)</Form.Label>
                  <Form.Control type="number" name="height" value={formData.height} onChange={handleChange} min={1} step={1} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Velikost jedné buňky (m², pouze celé číslo)</Form.Label>
                  <Form.Control type="number" name="cell_area" value={formData.cell_area} onChange={handleChange} min={1} step={1} />
                </Form.Group>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col md={8} lg={6} xl={5}>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Název náměstí</Form.Label>
                  <Form.Control name="name" value={formData.name} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Popis</Form.Label>
                  <Form.Control as="textarea" name="description" value={formData.description} onChange={handleChange} rows={2} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Ulice</Form.Label>
                  <Form.Control name="street" value={formData.street} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Město</Form.Label>
                  <Form.Control name="city" value={formData.city} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>PSČ</Form.Label>
                  <Form.Control name="psc" value={formData.psc} onChange={handleChange} type="number" min={10000} max={99999} />
                </Form.Group>
                <Button
                  variant="primary"
                  className="mt-2"
                  onClick={async (e) => {
                    e.preventDefault();
                    setError(null);
                    setSuccess(false);
                    setIsSubmitting(true);
                    try {
                      const data = new FormData();
                      data.append("name", formData.name);
                      data.append("description", formData.description);
                      data.append("street", formData.street);
                      data.append("city", formData.city);
                      data.append("psc", formData.psc);
                      data.append("width", formData.width);
                      data.append("height", formData.height);
                      data.append("grid_rows", grid_rows);
                      data.append("grid_cols", grid_cols);
                      data.append("cellsize", cellArea);
                      if (image) data.append("image", image); // <-- send image file
                      await squareAPI.createSquare(data); // <-- send FormData with image
                      setSuccess(true);
                      setShowSuccessModal(true);
                      setTimeout(() => {
                        setShowSuccessModal(false);
                        navigate("/manage/squares");
                        window.location.reload(); // <-- force reload after redirect
                      }, 1400);
                    } catch (err) {
                      setError("Chyba při vytváření náměstí. Zkontrolujte data.");
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting || !formData.name || !formData.city || !formData.psc || !formData.width || !formData.height}
                >
                  {isSubmitting ? "Ukládám..." : "Vytvořit nové náměstí"}
                </Button>
                {success && <Alert variant="success" className="mt-3">Náměstí bylo úspěšně vytvořeno!</Alert>}
                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                <Button variant="outline-danger" onClick={handleImageRemove} className="mt-3 ms-2">Změnit obrázek</Button>
              </Form>
            </Col>
          </Row>
        </>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      <Button variant="secondary" href="/manage/squares">Zpět na seznam náměstí</Button>

      {/* Success Modal with animated checkmark */}
      <Modal show={showSuccessModal} centered backdrop="static" keyboard={false} contentClassName="text-center p-4">
        <div style={{ fontSize: 80, color: '#28a745', marginBottom: 16, animation: 'pop 0.5s cubic-bezier(.68,-0.55,.27,1.55)' }}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="38" fill="#eafaf1" stroke="#28a745" strokeWidth="4" />
            <polyline points="24,44 36,56 56,28" fill="none" stroke="#28a745" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              <animate attributeName="points" dur="0.5s" values="24,44 36,56 36,56;24,44 36,56 56,28" keyTimes="0;1" fill="freeze" />
            </polyline>
          </svg>
        </div>
        <h4 className="mb-0">Náměstí bylo úspěšně vytvořeno!</h4>
      </Modal>

      <style>{`
        @keyframes pop {
          0% { transform: scale(0.7); opacity: 0; }
          80% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </Container>
  );
}