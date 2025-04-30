import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, Navbar, Nav, Button, Table } from "react-bootstrap";

export default function Cart() {
  const cartItems = [
    { id: 1, name: "Prodotto 1", price: 10.99, quantity: 2 },
    { id: 2, name: "Prodotto 2", price: 5.49, quantity: 1 },
    { id: 3, name: "Prodotto 3", price: 20.0, quantity: 3 },
  ];

  const calculateTotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <>
      {/* Navbar */}
      <Navbar bg="light" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand href="#home">SaveBite</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#browse">Browse Food</Nav.Link>
              <Nav.Link href="#about">About Us</Nav.Link>
              <Nav.Link href="#contact">Contact</Nav.Link>
              <Nav.Link href="/cart">Cart</Nav.Link>
              <Button variant="success" className="ms-2">Sign In</Button>
              <Button variant="outline-success" className="ms-2">Register</Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Cart Content */}
      <Container>
        <h1 className="text-center mb-4">Carrello</h1>
        {cartItems.length === 0 ? (
          <p className="text-center">Il carrello è vuoto.</p>
        ) : (
          <>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Prodotto</th>
                  <th>Prezzo</th>
                  <th>Quantità</th>
                  <th>Totale</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>€{item.price.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>€{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Row className="mt-4">
              <Col className="text-end">
                <h2>Totale: €{calculateTotal().toFixed(2)}</h2>
                <Button variant="success" size="lg" className="mt-3">
                  Procedi al Pagamento
                </Button>
              </Col>
            </Row>
          </>
        )}
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <Container>
          <Row>
            <Col md={4}>
              <h5>SaveBite</h5>
              <p>Fighting food waste, one meal at a time.</p>
            </Col>
            <Col md={2}>
              <h5>Company</h5>
              <ul className="list-unstyled">
                <li><a href="#" className="text-white">About Us</a></li>
                <li><a href="#" className="text-white">Careers</a></li>
                <li><a href="#" className="text-white">Partners</a></li>
              </ul>
            </Col>
            <Col md={2}>
              <h5>Support</h5>
              <ul className="list-unstyled">
                <li><a href="#" className="text-white">Help Center</a></li>
                <li><a href="#" className="text-white">Contact Us</a></li>
                <li><a href="#" className="text-white">FAQ</a></li>
              </ul>
            </Col>
            <Col md={4}>
              <h5>Join Our Newsletter</h5>
              <div className="input-group mb-3">
                <input type="email" className="form-control" placeholder="Your email" />
                <Button variant="success">Subscribe</Button>
              </div>
            </Col>
          </Row>
          <hr />
          <div className="d-flex justify-content-between align-items-center">
            <p className="mb-0">© 2023 SaveBite. All rights reserved.</p>
            <div>
              <a href="#" className="text-white me-3">Terms</a>
              <a href="#" className="text-white me-3">Privacy</a>
              <a href="#" className="text-white">Cookies</a>
            </div>
          </div>
        </Container>
      </footer>
    </>
  );
}