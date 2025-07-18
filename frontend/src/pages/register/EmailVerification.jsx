import {Container, Button, Card, Row, Col} from "react-bootstrap";
import ConfirmEmailBar from "../../components/ConfirmEmailBar";

function Login() {
  return (
    <Container fluid className="flex-grow-1 login-bg py-5">
      <div className="d-flex flex-column justify-content-center h-100">
        <ConfirmEmailBar />
      </div>
      <div className="m-auto ">
        <h2 className="text-center my-5 text-white fw-semibold">eTržnice</h2>
      </div>
    </Container>
  );
}

export default Login;