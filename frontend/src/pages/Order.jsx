import QrPayment from "../components/QRPayment";
import React from "react";

function Order() {
  return (
    <div>
      <h1>Order Page</h1>
      <QrPayment
        amount={322.4}
        accountNumber={"19-2000145399/0800"}
        variableSymbol={"126303"}
        constantSymbol={"126303"}
        specificSymbol={"126303"}
        message={"Payment for order #126303"}
      />
    </div>
  );
}

export default Order;