import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import LoginCard from "../components/LoginCard";

function Home() {
  return (
    <Container fluid className="flex-grow-1 login-bg py-5">
      <div class="d-flex flex-column justify-content-center h-100">
        <LoginCard />
      </div>
      <div class="m-auto ">
        <h2 class="text-center my-5 text-white fw-semibold">eTržnice</h2>
      </div>
    </Container>
  );
}

export default Home;
