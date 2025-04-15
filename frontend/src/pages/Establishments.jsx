import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  Container, 
  Navbar, 
  Nav, 
  Button, 
  Row, 
  Col, 
  Card, 
  Image 
} from 'react-bootstrap';



export default function Establishments() {
  return (
      <>
        {/* Navigation */}
        <Navbar bg="light" expand="lg" className="mb-0">
          <Container>
            <Navbar.Brand href="#home">SaveBite</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link href="#home">Home</Nav.Link>
                <Nav.Link href="#browse">Browse Food</Nav.Link>
                <Nav.Link href="#about">About Us</Nav.Link>
                <Nav.Link href="#contact">Contact</Nav.Link>
                <Nav.Link href="/cart">Cart</Nav.Link> {/* Aggiunto collegamento al carrello */}
                <Button variant="success" className="ms-2">Sign In</Button>
                <Button variant="outline-success" className="ms-2">Register</Button>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </>

  );


}