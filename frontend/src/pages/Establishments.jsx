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
            <Navbar.Brand href="/home">SaveBite</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link href="/home">Home</Nav.Link>
                <Nav.Link href="/establishments" active>Browse Food</Nav.Link>
                <Nav.Link href="#about">About Us</Nav.Link>
                <Nav.Link href="#contact">Contact</Nav.Link>
                <Nav.Link href="/cart">Cart</Nav.Link> {/* Aggiunto collegamento al carrello */}
                <Button variant="success" className="ms-2">Sign In</Button>
                <Button variant="outline-success" className="ms-2">Register</Button>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>


        {/* Hero Section */}
        <div className="bg-success text-white py-5">
          <Container>
            <Row className="align-items-center">
              <Col md={8} className="mb-4 mb-md-0">
                <h1 className="display-4 fw-italic" style={{fontFamily: "Ubuntu", fontWeight: 300}}>🍽️ Top Notch Restaurants and Grocery Stores</h1>
                <h2 className="display-4 fst-italic" style={{fontFamily: "Lobster"}}>at a tap of your fingers</h2>
              </Col>
              <Col md={4} className="position-relative" style={{ height: '400px' }}>
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img 
                  src="/healthy-food.jpg" 
                  alt="Fresh food 0" 
                  className="img-fluid rounded shadow-lg"
                  style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '70%',
                    zIndex: 2,
                    borderRadius: '1rem'
                  }}
                />
                <img 
                  src="/egg.jpg" 
                  alt="Fresh food 1" 
                  className="img-fluid rounded shadow"
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    left: '80%',
                    width: '60%',
                    zIndex: 1,
                    top: '25%',
                    borderRadius: '1rem'
                  }}
                />
                <img 
                  src="/muffin.jpg" 
                  alt="Fresh food 2" 
                  className="img-fluid rounded shadow"
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    left: '10%',
                    width: '60%',
                    zIndex: 1,
                    top: '45%',
                    borderRadius: '1rem'
                  }}
                />
              </div>
            </Col>

            </Row>
          </Container>
        </div>

        


      <Card style={{ width: '18rem' }}>
        <Card.Img variant="top" src="holder.js/100px180" />
        <Card.Body>
          <Card.Title>Card Title</Card.Title>
          <Card.Text>
            Some quick example text to build on the card title and make up the
            bulk of the card's content.
          </Card.Text>
          <Button variant="primary">Go somewhere</Button>
        </Card.Body>
      </Card>

      </>
  );


}