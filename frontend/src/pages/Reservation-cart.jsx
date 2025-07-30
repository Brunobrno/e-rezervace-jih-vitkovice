import {
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Form,
  Button,
} from "react-bootstrap";

import ReservationWizard from "../components/reservation/ReservationWizard"

function ReservationCart() {
  return (
    <Container className="mt-5">
      <h2>Rezervace</h2>
      <ReservationWizard />
    </Container>
  );
}

export default ReservationCart;
