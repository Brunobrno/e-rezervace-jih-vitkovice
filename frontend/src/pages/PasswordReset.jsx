import { useParams } from "react-router-dom";
import { Container, Alert } from "react-bootstrap";
import ResetPasswordRequest from "../components/reset-password/Request";
import CreateNewPassword from "../components/reset-password/Create";

//vytáhne z URL parametry uidb64 a token
/**
 * @typedef {Object} Params
 * @property {string=} uidb64
 * @property {string=} token
 */

function ResetPasswordPage() {
  const { uidb64, token } = useParams();

  const hasBothParams = uidb64 && token;
  const hasOnlyOneParam = (uidb64 && !token) || (!uidb64 && token);

  let content;

  if (hasBothParams) {
    content = <CreateNewPassword />;
  } else if (hasOnlyOneParam) {
    content = (
      <Alert variant="danger" className="text-center">
        Neplatný odkaz pro resetování hesla.
      </Alert>
    );
  } else {
    content = <ResetPasswordRequest />;
  }

  return (
    <Container fluid className="flex-grow-1 login-bg py-5">
      <div className="d-flex flex-column justify-content-center h-100">
        {content}
      </div>
      <div className="m-auto">
        <h2 className="text-center my-5 text-white fw-semibold">eTržnice</h2>
      </div>
    </Container>
  );
}

export default ResetPasswordPage;
