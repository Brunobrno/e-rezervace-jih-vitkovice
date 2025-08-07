import QrPayment from "../components/QRPayment";
import { React, useContext } from "react";
import { UserContext } from "../context/UserContext"; 

function Order() {
  return (
    <div>
      <h1>Order Page</h1>
      <QrPayment
        amount={322.4}
        message={"Payment for order #126303"}
      />
    </div>
  );
}

export default Order;