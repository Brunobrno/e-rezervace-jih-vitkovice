

function Sidebar() {
  return (
    <div className="bg-light vh-100 pt-3 px-2">
      <Nav defaultActiveKey="/home" className="flex-column">
        <Nav.Link href="/home">Home</Nav.Link>
        <Nav.Link eventKey="link-1">Link 1</Nav.Link>
        <Nav.Link eventKey="link-2">Link 2</Nav.Link>
        <Nav.Link eventKey="disabled" disabled>
          Disabled
        </Nav.Link>
      </Nav>
    </div>
  );
}

export default Sidebar;
