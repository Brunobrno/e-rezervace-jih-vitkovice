import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";

function Home() {
  return (
    <div class="container-fluid flex-grow login-bg py-5">
      <div class="d-flex flex-column justify-content-center h-100">

        <Card className="align-self-center">

          <Card.Header><h3>Přihlášení</h3></Card.Header>

          <Card.Body>
            <Form>

              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" placeholder="Enter email" />
                <Form.Text className="text-muted">
                  We'll never share your email with anyone else.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicCheckbox">
                <Form.Check type="checkbox" label="Check me out" />
              </Form.Group>

              <Button variant="primary" type="submit">
                Submit
              </Button>

            </Form>
          </Card.Body>

          <Card.Footer>2 days ago</Card.Footer>

        </Card>
      </div>

      <div class="mobile rounded align-self-center row d-flex justify-content-center p-0">
        <div class="m-auto">
          <img
            class="d-none d-sm-block"
            width="100"
            height="100"
            src="https://e-prepazka.ovajih.cz/img/mobile-icon.png"
            alt="Logo"
          />
        </div>
        <div class="m-auto ">
          <h2 class=" mr-2 text-white p-0 m-0">
            Stáhněte si mobilní aplikaci ePřepážka
          </h2>
        </div>
        <div class="m-1 p-1">
          <a href="https://play.google.com/store/apps/details?id=eprepazka.vitsol.com&amp;pcampaignid=web_share">
            <img
              class="d-none d-sm-block"
              width="120"
              height="100"
              src="https://e-prepazka.ovajih.cz/img/google-play.svg"
              alt="Logo"
            />
          </a>
        </div>
        <div class="m-1 p-1">
          <a href="https://apps.apple.com/cz/app/ep%C5%99ep%C3%A1%C5%BEka/id6504604247?l=cs">
            <img
              class="d-none d-sm-block"
              width="120"
              height="100"
              src="https://e-prepazka.ovajih.cz/img/app-store.svg"
              alt="Logo"
            />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;
