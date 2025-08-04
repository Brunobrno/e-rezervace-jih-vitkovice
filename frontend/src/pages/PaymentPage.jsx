import React, { useEffect, useState } from "react";
import axios from "axios";
import QRCode from "react-qr-code"; // use this instead of qrcode.react for Vite
import { Container, Card, Row, Col, Table } from 'react-bootstrap';

// import apiOrder from "../api/model/order"
import apiOrders from '../api/model/order'; // adjust the path if needed


export default function PaymentPage({ orderId }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchOrder = async () => {
    try {
      const data = await apiOrders.getOrderById(orderId); // use your imported function
      console.log("Order loaded:", data);
      setOrder(data);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Nepodařilo se načíst objednávku.");
    }
  };

  if (orderId) {
    fetchOrder();
  }
}, [orderId]);


  if (error) return <p>{error}</p>;
  if (!order || !order.user || !order.reservation) return <p>Načítání...</p>;


  // Extract relevant data
  const user = order.user;
  const reservation = order.reservation;

  const bankAccount = user.bank_account;
  const varSymbol = user.var_symbol;
  const amount = order.price_to_pay;
  const currency = "CZK"; // adjust if needed

  const statusMap = {
    payed: "Zaplaceno",
    pending: "Čeká na zaplacení",
    cancelled: "Stornováno"
  };

  const qrString = `SPD*1.0*ACC:${bankAccount}*AM:${amount}*CC:${currency}*X-VS:${varSymbol}`;

  return (
  <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
    <Card style={{ maxWidth: '800px', width: '100%' }} className="shadow">
      <Card.Body>
        <Card.Title className="text-center mb-4">ZAPLAŤTE OBJEDNÁVKU</Card.Title>
        <Row>
          {/* LEFT - Order Info */}
          <Col md={6}>
            <Table bordered hover>
              <tbody>
                <tr><td><strong>Platba:</strong></td><td>Bankovní převod</td></tr>
                <tr><td><strong>Platce:</strong></td><td>{user.first_name} {user.last_name}</td></tr>
                <tr><td><strong>Účet:</strong></td><td>{bankAccount}</td></tr>
                <tr><td><strong>Var. symbol:</strong></td><td>{varSymbol}</td></tr>
                <tr><td><strong>Částka:</strong></td><td>{amount} CZK</td></tr>
                <tr><td><strong>Objednávka:</strong></td><td>{order?.order_number}</td></tr>
                <tr><td><strong>Status:</strong></td><td>{statusMap[order?.status] || "Neznámý"}</td></tr>
              </tbody>
            </Table>
          </Col>

          {/* RIGHT - QR Code */}
          <Col md={6} className="d-flex flex-column align-items-center justify-content-center">
            <h5>QR Platba</h5>
            <QRCode value={qrString} size={200} />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  </Container>
);
}
