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

export default function Home() {
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

      {/* Hero Section */}
      <div className="bg-success text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-4 mb-md-0">
              <h1 className="display-4 fw-bold">Reduce Food Waste, Save Money</h1>
              <p className="fs-5">Connect with local restaurants and grocery stores to purchase surplus food at discounted prices.</p>
              <Button variant="light" size="lg" className="me-2">Find Food Near Me</Button>
              <Button variant="outline-light" size="lg">Learn More</Button>
            </Col>
            <Col md={6}>
              <img 
                src="https://placehold.co/600x400/orange/white?text=Fresh+Food+Image" 
                alt="Fresh food" 
                className="img-fluid rounded"
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Featured Food Section */}
      <Container className="py-5">
        <h2 className="text-center mb-4">Today's Surplus Deals</h2>
        <p className="text-center mb-5">Check out these fresh deals before they're gone!</p>
        
        <Row>
          {[
            {
              title: "Bakery Bundle",
              image: "https://placehold.co/300x200/brown/white?text=Bakery",
              description: "Assorted bread and pastries from local bakery",
              originalPrice: "$25.00",
              salePrice: "$10.00",
              seller: "Morning Bread Bakery"
            },
            {
              title: "Fresh Produce Box",
              image: "https://placehold.co/300x200/green/white?text=Produce",
              description: "Seasonal vegetables and fruits mix",
              originalPrice: "$30.00",
              salePrice: "$12.50",
              seller: "Green Market"
            },
            {
              title: "Restaurant Surprise",
              image: "https://placehold.co/300x200/red/white?text=Restaurant",
              description: "Chef's selection from today's menu",
              originalPrice: "$22.00",
              salePrice: "$9.00",
              seller: "Local Bistro"
            }
          ].map((item, idx) => (
            <Col md={4} key={idx} className="mb-4">
              <Card>
                <Card.Img variant="top" src={item.image} />
                <Card.Body>
                  <Card.Title>{item.title}</Card.Title>
                  <Card.Text>{item.description}</Card.Text>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-muted text-decoration-line-through me-2">{item.originalPrice}</span>
                      <span className="text-success fw-bold">{item.salePrice}</span>
                    </div>
                    <Button variant="outline-success">Reserve</Button>
                  </div>
                  <small className="text-muted">From: {item.seller}</small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <div className="text-center mt-4">
          <Button variant="success">See All Deals</Button>
        </div>
      </Container>

      {/* How It Works Section */}
      <div className="bg-light py-5">
        <Container>
          <h2 className="text-center mb-5">How SaveBite Works</h2>
          <Row className="text-center">
            <Col md={4} className="mb-4">
              <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto mb-4" style={{width: "100px", height: "100px"}}>
                <h1>1</h1>
              </div>
              <h4>Browse Available Food</h4>
              <p>Find surplus food near you from local restaurants, cafes, and grocery stores.</p>
            </Col>
            <Col md={4} className="mb-4">
              <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto mb-4" style={{width: "100px", height: "100px"}}>
                <h1>2</h1>
              </div>
              <h4>Reserve Your Items</h4>
              <p>Select and reserve the items you want at reduced prices.</p>
            </Col>
            <Col md={4} className="mb-4">
              <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto mb-4" style={{width: "100px", height: "100px"}}>
                <h1>3</h1>
              </div>
              <h4>Pick Up & Enjoy</h4>
              <p>Collect your food during the specified pickup time and enjoy!</p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Impact Section */}
      <Container className="py-5">
        <Row className="align-items-center">
          <Col md={6} className="mb-4 mb-md-0">
            <h2>Make a Difference With Every Meal</h2>
            <p className="lead">When you rescue surplus food, you're helping:</p>
            <ul className="fs-5">
              <li>Reduce food waste</li>
              <li>Support local businesses</li>
              <li>Lower carbon emissions</li>
              <li>Save money on quality food</li>
            </ul>
            <Button variant="success" size="lg">Join Our Community</Button>
          </Col>
          <Col md={6}>
            <img 
              src="https://placehold.co/600x400/green/white?text=Environmental+Impact" 
              alt="Environmental impact" 
              className="img-fluid rounded"
            />
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-white py-4">
        <Container>
          <Row>
            <Col md={4} className="mb-4 mb-md-0">
              <h5>SaveBite</h5>
              <p>Fighting food waste, one meal at a time.</p>
            </Col>
            <Col md={2} className="mb-4 mb-md-0">
              <h5>Company</h5>
              <ul className="list-unstyled">
                <li><a href="#" className="text-white">About Us</a></li>
                <li><a href="#" className="text-white">Careers</a></li>
                <li><a href="#" className="text-white">Partners</a></li>
              </ul>
            </Col>
            <Col md={2} className="mb-4 mb-md-0">
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