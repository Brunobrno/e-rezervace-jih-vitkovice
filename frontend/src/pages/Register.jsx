
import RegisterCard from "../components/RegisterCard";

import { Modal, Col, Row, Container, Button, Form, Card, ToggleButton, InputGroup } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faMobileAlt } from "@fortawesome/free-solid-svg-icons";

function Register() {
  return (
    <div className="registerPortal flex-grow">
      <Container>
        <Row>
          <Col sm={6} md={5}>
            <h1>Registrace nájemníků městského obvodu Ostrava-Jih</h1>
            <p>
              Mokrý stín tiše stékal po svahu, zatímco{" "}
              <strong>mlžné chvění</strong> vířilo nad klidnou plání pod večerní
              oblohou.
            </p>
            <p>
              Klopýtající zrnka páry mizela v houstnoucí šedi, kde{" "}
              <strong>beztvaré ozvěny</strong>{" "}
              tlumeně tančily pod rytmem vzdálených kapek.
            </p>
            <p>
              Jemné šustění závanu rozléhalo se tichem. <br />
              Drobné úlomky snu klouzaly po <strong>
                struktuře bez cíle
              </strong>. <br />
              Nezřetelný obraz mizel v jemném odlesku nedořečeného rána.
            </p>
            <h3 className="text-white pt-3 pb-2">
              Neumíte se přihlásit? Kontaktujte nás:
            </h3>
            <h3>
              <ul className="list-unstyled">
                <li className="pb-2">
                  <FontAwesomeIcon icon={faMobileAlt} />
                  <span className="pr-2">
                    <a href="tel:+420599430331"> 599 430 331</a>
                  </span>
                  <br />
                  <div className="d-sm-block d-md-inline">
                    {" "}
                    <FontAwesomeIcon icon={faEnvelope} />
                    <a href="mailto:jana.molnari@ovajih.cz">
                      {" "}
                      jana.molnari@ovajih.cz
                    </a>
                  </div>
                </li>

                <li>
                  <FontAwesomeIcon icon={faMobileAlt} />
                  <span className="pr-2">
                    <a href="tel:+420702003539"> 702 003 539</a>
                  </span>
                  <br />
                  <div className="d-sm-block d-md-inline">
                    <FontAwesomeIcon icon={faEnvelope} />
                    <a href="mailto:tereza.masarovicova@ovajih.cz">
                      {" "}
                      tereza.masarovicova@ovajih.cz
                    </a>
                  </div>
                </li>
              </ul>

              <p></p>
            </h3>
          </Col>
          <Col className="d-none d-md-block middle-border" md={1}></Col>
          <Col className="d-none d-md-block" md={1}></Col>
          <Col sm={6} md={5}>
            <RegisterCard />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Register;
