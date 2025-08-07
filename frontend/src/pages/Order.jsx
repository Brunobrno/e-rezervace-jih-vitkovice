import QrPayment from "../components/QRPayment";
import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  useContext
} from "react";
import { UserContext } from "../context/UserContext";
import { Container, Card, Row, Col, Table } from "react-bootstrap";

function Order() {

    const { user } = useContext(UserContext) || {};
  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <Card style={{ maxWidth: "800px", width: "100%" }} className="shadow">
        <Card.Body>
          <Card.Title className="text-center mb-4">
            ZAPLAŤTE OBJEDNÁVKU
          </Card.Title>
          <Row>
            {/* LEFT - Order Info */}
            <Col md={6}>
              <Table bordered hover>
                <tbody>
                  <tr>
                    <td>
                      <strong>Platba:</strong>
                    </td>
                    <td>Bankovní převod</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Platce:</strong>
                    </td>
                    <td>
                      {user.first_name} {user.last_name}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Účet:</strong>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Var. symbol:</strong>
                    </td>
                    <td>{user.var_symbol}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Částka:</strong>
                    </td>
                    <td> CZK</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Objednávka:</strong>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Status:</strong>
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </Table>
            </Col>

            {/* RIGHT - QR Code */}
            <Col
              md={6}
              className="d-flex flex-column align-items-center justify-content-center"
            >
              <QrPayment amount={322.4} message={"Payment for order #126303"} />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Order;
