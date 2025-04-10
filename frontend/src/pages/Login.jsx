import 'bootstrap/dist/css/bootstrap.min.css';
import React, {useState} from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';

const Login = () => {
    // Stati per l'email e la password
    /*const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
  
    // Funzione per gestire il submit del form
    const handleSubmit = (e) => {
      e.preventDefault();
      // Logica di autenticazione (ad esempio, invio al server)
      console.log('Email:', email);
      console.log('Password:', password);
    };*/



return (
    //main container (centered vertically and horizontally)
    <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <Card style={{ maxWidth: '400px', width: '100%' }}>
        <Card.Body>
            <Card.Title className="text-center">LOGIN</Card.Title> 
            {/*<form onSubmit={handleSubmit}>*/}
            {/* Campo Email */}
            <Card.Text>
                <label htmlFor="email">Email</label>
                <Form.Control
                type="email"
                id="email"
                placeholder="Enter email"
                //value={email}
                //onChange={(e) => setEmail(e.target.value)}*/}
                required
                />
            </Card.Text>

            {/* Campo Password */}
             <Card.Text>
                <label htmlFor="password">Password</label>
                <Form.Control
                type="password"
                id="password"
                placeholder="Enter password"
                //value={password}
                //onChange={(e) => setPassword(e.target.value)}
                required
                />
            </Card.Text>

            {/* Bottone di Login */}
            <div className="d-grid gap-2">
                <Button variant="primary" size="lg">
                Login
            </Button>
            </div>

            {/* Link per il recupero della password */}
            <div className="text-center">
                <Button variant="link">Forgot your password?</Button>
            </div>
            {/*</form>*/}
        </Card.Body> 
        </Card>
    </Container>
    );
};

export default Login;