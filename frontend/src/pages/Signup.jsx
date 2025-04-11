import 'bootstrap/dist/css/bootstrap.min.css';
import React, {useState} from 'react';
import { Container, Card, Form, Button, Navbar, Row, Col } from 'react-bootstrap';

const Signup = () => {
    return (
    <>
    <Navbar className="bg-success">
    <Container className="d-flex justify-content-center">
        <Navbar.Brand href="#home" className="text-white">Surplus Food</Navbar.Brand>
    </Container>
    </Navbar>

     <Container fluid className="d-flex justify-content-center align-items-start" style={{ minHeight: "100vh", paddingTop: '100px' }}>
     <Row className="w-100">
     <Col md={6} lg={4} className="mx-auto">
        <div className="text-center mb-4">
            <h2>SIGN UP</h2>
        </div>
        
        <Form >
            
        <Form.Group controlId="formEmail" className="mb-3">
            <Form.Control
            type="email"
            placeholder="Email"
            name="email"
            required
            />
        </Form.Group>
        <Form.Group controlId="formFirstName" className="mb-3">
            <Form.Control
            type="text"
            placeholder="Assigned name"
            name="firstName"
            required
            />
        </Form.Group>
        <Form.Group controlId="formFamilyName" className="mb-3">
            <Form.Control
            type="text"
            placeholder="Family name"
            name="familyName"
            required
            />
        </Form.Group>
        <Form.Group controlId="formPassword" className="mb-3">
            <Form.Control
            type="password"
            placeholder="Password"
            name="password"
            required
            />
        </Form.Group>
        <Form.Group controlId="formConfirmPassword" className="mb-3">
            <Form.Control
            type="password"
            placeholder="Confirm your password"
            name="confirmPassword"
            required
            />
        </Form.Group>

        {/* Bottone di Sign up */}
             <Button variant="success" type="submit" className="w-100">
              Sign Up
            </Button>

        {/* Link to the login page */}
          <div className="text-center">
                <Button variant="link">Already a member?</Button>
            </div>

        </Form>
        </Col>
        </Row>
    </Container>



    
    </>
    );
};
export default Signup;