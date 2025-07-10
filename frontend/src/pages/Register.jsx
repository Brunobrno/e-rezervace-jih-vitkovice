import Col from "react-bootstrap/esm/Col"
import RegisterCard from "../components/RegisterCard"
import Container from "react-bootstrap/esm/Container"
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import ToggleButton from "react-bootstrap/ToggleButton";
import InputGroup from "react-bootstrap/InputGroup";
import Modal from "react-bootstrap/Modal";

function Register(){

    return(
        <div className="registerPortal flex-grow">
            <Container fluid>
                <Row>
                    <Col>
                    <h1>Registrace nájemníků městského obvodu Ostrava-Jih</h1>
<p>
                            Do systému <strong>ePřepážka</strong> se mohou
                            registrovat všichni nájemníci obecních bytů obvodu Ostrava-Jih.
                        </p>
                        <p>
                            Do systému <strong>ePřepážka</strong> se mohou
                            registrovat všichni nájemníci obecních bytů obvodu Ostrava-Jih.
                        </p>
                        <p>
                            K registraci postačí zadat email, telefon, číslo bytu a SIPO. <br />
                            Číslo bytu se zadává ve tvaru: 001 nebo 1 <br />
                            SIPO zjistíte ze složenky k bytu.

                            Po úspěšné registraci Vám na email příjdou přihlašovací údaje.
                        </p>
                        <h3 class="text-white pt-3 pb-2">Neumíte se přihlásit? Kontaktujte nás:</h3>
                        <h3>
                        <ul class="list-unstyled">
                            <li class="pb-2"><i class="fas fa-mobile-alt text-white"> </i>
                                <span class="pr-2"><a href="tel:+420599430331"> 599 430 331</a></span>
                            <div class="d-sm-block d-md-inline"> <i class="fas fa-envelope text-white"></i><a href="mailto:jana.molnari@ovajih.cz"> jana.molnari@ovajih.cz</a></div></li>
                            <li><i class="fas fa-mobile-alt text-white"> </i>
                                <span class="pr-2"><a href="tel:+420702003539"> 702 003 539</a></span>
                                <div class="d-sm-block d-md-inline"><i class="fas fa-envelope text-white"> </i><a href="mailto:tereza.masarovicova@ovajih.cz"> tereza.masarovicova@ovajih.cz</a></div></li>
                        </ul>

                        <p>
                        </p>
                    </h3>

                
                    

                    </Col>
                    <Col>

                    </Col>
                    <Col>

                    </Col>
                    <Col>
                    <RegisterCard />
                    </Col>
                </Row>
                

            </Container>

            
        </div>
        
    )
}

export default Register;