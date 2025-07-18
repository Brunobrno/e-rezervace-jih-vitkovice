import {Container, Button, Card, Row, Col} from "react-bootstrap";
import ReportForm from "../components/ReportForm";

function ReportForm() {
  return (
    <Container fluid className="flex-grow-1 login-bg py-5">
      <div className="d-flex flex-column justify-content-center h-100">
        <ReportForm />
      </div>
      <div className="m-auto ">
        <h2 className="text-center my-5 text-white fw-semibold">eTržnice</h2>
      </div>
    </Container>
  );
}

export default ReportForm;