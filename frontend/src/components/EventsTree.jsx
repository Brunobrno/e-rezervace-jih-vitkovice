import {
  Table,
  Nav,
} from "react-bootstrap";
import logo from "../assets/img/logo.png";

function EventsTree() {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Username</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Mark</td>
          <td>Otto</td>
          <td>@mdo</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Jacob</td>
          <td>Thornton</td>
          <td>@fat</td>
        </tr>
        <tr>
          <td>3</td>
          <td colSpan={2}>Larry the Bird</td>
          <td>@twitter</td>
        </tr>
      </tbody>
    </Table>

    // Cena Int, Nazev String, Souřadnice,

    // Uředník, Event => Místo, období => Grid, Formulář
    // uredni square model clos rows rozliseni => Event => MarketSlot (označené pole na gridu)
    // seller => square => event => MarketSlot <= reservation == usera, id marketslotu, konec ,začátek
  );
}

export default EventsTree;
