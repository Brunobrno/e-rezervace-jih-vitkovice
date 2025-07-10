import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ToggleButton from "react-bootstrap/ToggleButton";
import Container from "react-bootstrap/Container";
import InputGroup from "react-bootstrap/InputGroup";
import Modal from "react-bootstrap/Modal";

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
} from "@fortawesome/free-solid-svg-icons";

import React, { useState } from "react";

function RegisterCard() {
  const [isFirm, setIsFirm] = useState(false); // false = Citizen, true = Firm
  const handleSwitchChange = () => {
    setIsFirm(!isFirm);
  };

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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
          <Form>
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
                  <Form.Label hidden>Firm name</Form.Label>
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
                      aria-label="registerFirmName"
                      name="registerFirmName"
                      id="registerFirmName"
                      required
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
                      aria-label="registerFirstName"
                      name="registerFirstName"
                      id="registerFirstName"
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
                      aria-label="registerLastName"
                      aria-describedby="registerLastName"
                      name="registerLastName"
                      id="registerLastName"
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
                  aria-label="registerEmail"
                  aria-describedby="registerEmail"
                  defaultValue="@"
                  name="registerEmail"
                  id="registerEmail"
                  required
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
                  aria-label="registerPassword"
                  aria-describedby="registerPassword"
                  name="registerPassword"
                  id="registerPassword"
                  pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"
                  required
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="input-group form-group">
              <Form.Label hidden>Phone</Form.Label>
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
                  aria-label="registerPhone"
                  aria-describedby="registerPhone"
                  defaultValue="+420"
                  name="rregisterPhone"
                  id="registerPhone"
                  required
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="input-group form-group">
              <Form.Label hidden>
                {isFirm ? "Main Office" : "Address"}
              </Form.Label>
              <InputGroup>
                <div className="input-group-prepend">
                  <InputGroup.Text className="isize">
                    <FontAwesomeIcon icon={faBuilding} />
                    &nbsp; {isFirm ? "Sídlo" : "Adresa"}
                  </InputGroup.Text>
                </div>

                <Form.Control
                  type="text"
                  placeholder=""
                  aria-label={`register${isFirm ? "MainOffice" : "Address"}`}
                  name={`register${isFirm ? "MainOffice" : "Address"}`}
                  id={`register${isFirm ? "MainOffice" : "Address"}`}
                  required
                />
              </InputGroup>
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
                  aria-label="registerBankAccountNumber"
                  name="registerBankAccountNumber"
                  id="registerBankAccountNumber"
                  required
                  inputMode="numeric"
                  pattern="^[0-9/]*$"
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
                  aria-label="registerRC/IC"
                  name="registerRC/IC"
                  id="registerRC/IC"
                  required
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="10"
                />
              </InputGroup>
            </Form.Group>

            <Form.Group>
              <div className="custom-control custom-checkbox">
                <Form.Control
                  className="custom-control-input"
                  type="checkbox"
                  name="gdpr"
                  id="gdpr"
                  required
                />
                <Form.Label className="custom-control-label" htmlFor="gdpr">
                  Souhlasím se zpracováním osobních údajů
                </Form.Label>
              </div>
            </Form.Group>
            <Form.Group>
              <div>
                <div class="links">
                  <a
                    class="gdpr"
                    data-toggle="modal"
                    data-target="#gdprModal"
                    onClick={handleShow}
                  >
                    Informace o zpracování GDPR{" "}
                  </a>
                </div>
                <Form.Label hidden>Register</Form.Label>
                <Form.Control
                  className="btn btn-success"
                  type="submit"
                  value="Registrovat"
                />
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
