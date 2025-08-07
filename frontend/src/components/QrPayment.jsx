import { createQrPaymentSvg } from "@tedyno/cz-qr-payment";
import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";

function QrPayment({
  amount,
  bankAccount,
  constantSymbol,
  specificSymbol,
  variableSymbol,
  message = "Payment",
}) {
  const { user } = useContext(UserContext) || {};
  
  // Pokud props nejsou definované, vezmeme z usera
  const resolvedAccountNumber = bankAccount || user?.bank_account;
  const resolvedVariableSymbol = variableSymbol || user?.var_symbol;
bankAccount = resolvedAccountNumber;
  const options = {
    VS: resolvedVariableSymbol?.toString(),
    KS: constantSymbol?.toString(),
    SS: specificSymbol?.toString(),
    message,
  };


  if (!amount || !resolvedAccountNumber || !resolvedVariableSymbol) {
    return <div>Neplatné údaje pro QR platbu.</div>;
  }

  const svgString = createQrPaymentSvg(amount, resolvedAccountNumber, options);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: svgString }}
      style={{ width: "200px" }}
    />
  );
}

export default QrPayment;
