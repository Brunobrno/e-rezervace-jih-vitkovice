import { Button, Form, Card, Row, Col, ToggleButton, Container, InputGroup, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faUniversity,
  faKey,
  faBuilding,
  faPhone,
  faEnvelope,
  faLock,
  faBook,
  faAddressCard,
  faBriefcase,
  faRoad,
  faEnvelopeSquare,
} from "@fortawesome/free-solid-svg-icons";

import React, { use, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api/auth";

function RegisterCard() {
  const [isFirm, setIsFirm] = useState(false); // false = Individual, true = Company
  const handleSwitchChange = (e) => {
    setIsFirm(!isFirm);
    setAccountType(!isFirm ? "Company" : "Individual");
  };
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("@");
  const [password, setPassword] = useState("");
  const [phone_number, setPhoneNumber] = useState("+420");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [PSC, setPSC] = useState("");
  const [bank_account, setBankAccount] = useState("");
  const [ICO, setICO] = useState("");
  const [RC, setRC] = useState("");
  const [GDPR, setGDPR] = useState(true);
  const [account_type, setAccountType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // ⛔ Prevent multiple submits

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/account/registration/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          phone_number,
          street,
          city,
          PSC,
          bank_account,
          RC,
          ICO,
          GDPR,
          account_type,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Neplatné přihlašovací údaje");
      }

      // přesměruj na dashboard nebo domovskou stránku
      navigate("/reservation");
    } catch (err) {
      setIsSubmitting(false);
      navigate("/register");
      setError(err.message || "Přihlášení selhalo");
      console.log(error);
      
    }
  };

  return (
    <>
      <Card>
        <Card.Header className="form-top">
          <div className="form-top-left">
            <h3>Registrační formulář</h3>
            <p>Vyplňte níže požadované údaje</p>
          </div>

          <div className="form-top-right">
            <FontAwesomeIcon icon={faLock} />
          </div>
        </Card.Header>

        <Card.Body className="form-bottom">
          <Form onSubmit={handleSubmit}>
            <Form.Check
              type="switch"
              label={isFirm ? "Firma" : "Občan"}
              onChange={handleSwitchChange}
              checked={isFirm}
              className="mb-2"
            />
            {isFirm ? (
              <>
                <Form.Group className="input-group form-group">
                  <Form.Label hidden>Název</Form.Label>
                  <InputGroup>
                    <div className="input-group-prepend">
                      <InputGroup.Text className="isize">
                        <FontAwesomeIcon icon={faBriefcase} />
                        &nbsp; Název
                      </InputGroup.Text>
                    </div>

                    <Form.Control
                      type="text"
                      placeholder=""
                      aria-label="first_name"
                      name="first_name"
                      required
                      value={first_name}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>
              </>
            ) : (
              <>
                <Form.Group className="input-group form-group">
                  <Form.Label hidden>First Name</Form.Label>
                  <InputGroup>
                    <div className="input-group-prepend">
                      <InputGroup.Text className="isize">
                        <FontAwesomeIcon icon={faUser} />
                        &nbsp; Jméno
                      </InputGroup.Text>
                    </div>

                    <Form.Control
                      type="text"
                      placeholder=""
                      aria-label="first_name"
                      name="first_name"
                      value={first_name}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="input-group form-group">
                  <Form.Label hidden>Last Name</Form.Label>
                  <InputGroup>
                    <div className="input-group-prepend">
                      <InputGroup.Text className="isize">
                        <FontAwesomeIcon icon={faUser} />
                        &nbsp; Příjmení
                      </InputGroup.Text>
                    </div>

                    <Form.Control
                      type="text"
                      placeholder=""
                      aria-label="last_name"
                      name="last_name"
                      value={last_name}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>
              </>
            )}

            <Form.Group className="input-group form-group">
              <Form.Label hidden>Email</Form.Label>
              <InputGroup>
                <div className="input-group-prepend">
                  <InputGroup.Text className="isize">
                    <FontAwesomeIcon icon={faEnvelope} />
                    &nbsp; Email
                  </InputGroup.Text>
                </div>

                <Form.Control
                  type="email"
                  placeholder=""
                  aria-label="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="input-group form-group">
              <Form.Label hidden>Password</Form.Label>
              <InputGroup>
                <div className="input-group-prepend">
                  <InputGroup.Text className="isize">
                    <FontAwesomeIcon icon={faKey} />
                    &nbsp; Heslo
                  </InputGroup.Text>
                </div>

                <Form.Control
                  type="password"
                  placeholder=""
                  aria-label="password"
                  name="password"
                  pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="input-group form-group">
              <Form.Label hidden>Telefon</Form.Label>
              <InputGroup>
                <div className="input-group-prepend">
                  <InputGroup.Text className="isize">
                    <FontAwesomeIcon icon={faPhone} />
                    &nbsp; Telefon
                  </InputGroup.Text>
                </div>

                <Form.Control
                  type="text"
                  placeholder=""
                  aria-label="phone_number"
                  name="phone_number"
                  required
                  value={phone_number}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="input-group form-group">
              <Form.Label hidden>Ulice</Form.Label>
              <InputGroup>
                <div className="input-group-prepend">
                  <InputGroup.Text className="isize">
                    <FontAwesomeIcon icon={faRoad} />
                    &nbsp; Ulice
                  </InputGroup.Text>
                </div>

                <Form.Control
                  type="text"
                  placeholder=""
                  aria-label="street"
                  name="street"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="row">
              <Col xs={12} md={6} className="mb-3">
                <Form.Label hidden>Město</Form.Label>
                <InputGroup className="flex-nowrap">
                  <InputGroup.Text className="isize">
                    <FontAwesomeIcon icon={faBuilding} />
                    &nbsp; Město
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder=""
                    aria-label="city"
                    name="city"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ minWidth: 0 }} // klíčové pro rozbití šířky
                  />
                </InputGroup>
              </Col>

              <Col xs={12} md={6} className="mb-3">
                <Form.Label hidden>PSČ</Form.Label>
                <InputGroup className="flex-nowrap">
                  <InputGroup.Text className="isize">
                    <FontAwesomeIcon icon={faEnvelopeSquare} />
                    &nbsp; PSČ
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder=""
                    aria-label="PSC"
                    name="PSC"
                    required
                    value={PSC}
                    onChange={(e) => setPSC(e.target.value)}
                    style={{ minWidth: 0 }}
                  />
                </InputGroup>
              </Col>
            </Form.Group>

            <Form.Group className="input-group form-group">
              <Form.Label hidden>Bank account number</Form.Label>
              <InputGroup>
                <div className="input-group-prepend">
                  <InputGroup.Text className="isize">
                    <FontAwesomeIcon icon={faUniversity} />
                    &nbsp; Číslo účtu
                  </InputGroup.Text>
                </div>

                <Form.Control
                  type="text"
                  placeholder=""
                  aria-label="bank_account"
                  name="bank_account"
                  required
                  inputMode="numeric"
                  pattern="^(\d{0,6}-)?\d{1,10}/\d{4}$"
                  value={bank_account}
                  onChange={(e) => setBankAccount(e.target.value)}
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="input-group form-group">
              <Form.Label hidden>RČ/IČ</Form.Label>
              <InputGroup>
                <div className="input-group-prepend">
                  <InputGroup.Text className="isize">
                    {isFirm ? (
                      <FontAwesomeIcon icon={faBook} />
                    ) : (
                      <FontAwesomeIcon icon={faAddressCard} />
                    )}
                    &nbsp; {isFirm ? "IČ" : "RČ"}
                  </InputGroup.Text>
                </div>

                <Form.Control
                  type="text"
                  placeholder=""
                  aria-label={isFirm ? "ICO" : "RC"}
                  name={isFirm ? "ICO" : "RC"}
                  required
                  inputMode="numeric"
                  pattern={isFirm ? "^\\d{8}$" : "^\\d{6}/\\d{3,4}$"}
                  maxLength={isFirm ? "8" : "11"}
                  value={isFirm ? ICO : RC}
                  onChange={
                    isFirm
                      ? (e) => setICO(e.target.value)
                      : (e) => setRC(e.target.value)
                  }
                />
              </InputGroup>
            </Form.Group>

            <Form.Group>
              <div className="custom-control custom-checkbox">
                <Form.Control
                  className="custom-control-input"
                  type="checkbox"
                  name="GDPR"
                  id="GDPR"
                  required
                />
                <Form.Label className="custom-control-label" htmlFor="GDPR">
                  Souhlasím se zpracováním osobních údajů
                </Form.Label>
              </div>
            </Form.Group>
            <Form.Group>
              <div>
                <div className="links">
                  <a
                    className="gdpr"
                    data-toggle="modal"
                    data-target="#gdprModal"
                    onClick={handleShow}
                  >
                    Informace o zpracování GDPR{" "}
                  </a>
                </div>
                <Form.Label hidden>Register</Form.Label>
                <Button variant="success" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Odesílání..." : "Registrovat"}
                </Button>
              </div>
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
      <Modal size="lg" id="gdprModal" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Informace o zpracování osobních údajů</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Při použití Elektronické přepážky a při vyřízení požadavků uživatelů
            Elektronické přepážky dochází ke zpracováním osobních údajů
            uživatelů správcem{" "}
            <strong>
              - statutárním městem Ostrava – městským obvodem Ostrava-Jih,
            </strong>
            se sídlem Horní 791/3, 700 30 Ostrava, IČO: 00845451, v rozsahu
            jména a příjmení, tel. kontaktu, e-mailové adresy, č. SIPO, č.
            nájemní smlouvy, pro níže vymezené účely zpracování.
          </p>
          <p>
            <u> Kontaktní údaje správce</u>: statutární město Ostrava – městský
            obvod Ostrava-Jih, adresa: Horní 791/3, 700 30 Ostrava
          </p>
          <p>
            e-mail:<a href="mailto:posta@ovajih.cz"> posta@ovajih.cz</a>
          </p>
          <p>ID datové schránky: 2s3brdz</p>
          <p>
            <u>Kontaktní údaje pověřence</u>: Martin Krupa, e-mail:
            martin.krupa@gdpr-opava.cz, tel. kontakt: +420 724 356 825;
            advokátní kancelář KLIMUS &amp; PARTNERS s.r.o., se sídlem Vídeňská
            188/119d, 619 00 Brno - Dolní Heršpice, zastoupena Mgr. Romanem
            Klimusem, tel. č. +420 602 705 686, e-mail: roman@klimus.cz, ID
            datové schránky: ewann52.
          </p>
          <p>
            Účelem zpracování poskytnutých osobních údajů je vyřízení požadavků
            uživatelů Elektronické přepážky – plnění povinností z uzavřených
            nájemních smluv.
          </p>
          <p>
            Osobní údaje mohou být v nezbytně nutném rozsahu poskytovány
            následujícím příjemcům – externím subjektům zajišťujícím plnění
            povinností správce jakožto pronajímatele na základě požadavků
            uživatelů Elektronické přepážky.
          </p>
          <p>
            Zpracování výše uvedených osobních údajů bude probíhat po dobu
            vyřízení požadavku zaslaného Elektronickou přepážkou a následně
            mohou být osobní údaje uživatele uchovávány v nezbytném rozsahu a po
            nezbytnou dobu za účelem ochrany práv a právem chráněných zájmů
            správce, subjektů údajů nebo jiné dotčené osoby.
          </p>
          <p>
            Zpracování osobních údajů je prováděno na základě právního titulu
            plnění smlouvy, splnění právní povinnosti správce.
          </p>
          <p>
            Bližší informace o právech uživatele Elektronické přepážky jako
            subjektu údajů, jakož i o možnostech jejich uplatnění, jsou uvedeny
            ve Vnitřní směrnici o ochraně osobních údajů.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Zavřít
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default RegisterCard;
