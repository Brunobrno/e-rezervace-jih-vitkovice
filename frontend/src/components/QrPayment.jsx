import { createQrPaymentSvg } from "@tedyno/cz-qr-payment";

function QrPayment({
  amount,
  accountNumber,
  variableSymbol = "126303",
  constantSymbol = "126303",
  specificSymbol = "126303",
  message = "Payment for order #126303",
}) {
  const options = {
    VS: variableSymbol,
    KS: constantSymbol,
    SS: specificSymbol,
    message
  };

  // Vytvoří SVG string
  const svgString = createQrPaymentSvg(amount, accountNumber, options);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: svgString }}
      style={{ width: "200px" }}
    />
  );
}

export default QrPayment;
