import React from "react";
import Container from "react-bootstrap/Container";
import MyReservationsTree from "../components/MyReservationsTree";

const ReservationsPage = () => {
  return (
    <Container className="py-4">
      <h2>Seller: Moje rezervace</h2>
      <MyReservationsTree />
    </Container>
  );
};

export default ReservationsPage;
