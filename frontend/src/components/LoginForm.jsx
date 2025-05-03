import 'bootstrap/dist/css/bootstrap.min.css';
import React, {useState} from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import validator from 'validator';

/**
 * Login Form
 * @param {*} props.loginCbk: callback function to be called to perform the actual login
 * @returns 
 */
export default function LoginForm(props) {
    
    //states for email and password set from the form
    const [email, setEmail] = useState("mail@address.com");
    const [password, setPassword] = useState("password");
    //state for notifying invalid password
    const [invalidPassword, setInvalidPassword] = useState("");
    //state for email error
    const [emailError, setEmailError] = useState("");

    const handleSubmit = (event) => {

        event.preventDefault();

        //reset errors
        setEmailError("");
        setInvalidPassword("");


        // validation functions

        //email validation
        const trimmedEmail = email.trim();
        const emailErrorCheck = validator.isEmpty(trimmedEmail) ? "Email is required" : (
            !validator.isEmail(trimmedEmail) ? "Invalid email address" : ""
        )

        console.log(validator.isEmail("ciao"));

        //password validation
        let invalidPasswordCheck = validator.isEmpty(password) ? "Password is required" : (
            password.length < 6 ? "Password must be at least 6 characters" : "");
        if (invalidPasswordCheck === ""){
            //check special characters: at least 1 special character (only the supported ones)
            const specialChars = /.*[\[\]!@#$%^&*(),.?":\-_^\*\+{}|<>]+.*/; //characters (>=1) then special characters (>=1) then characters (>=1)
            if (!specialChars.test(password)) {
                invalidPasswordCheck = "Password must contain at least one special character";
            } 
        }

        if (emailErrorCheck === "" && invalidPasswordCheck === "") {
            //call the login callback function passed as prop
            props.loginCbk(email, password);
        } else {
            //set the error messages in the state
            if (emailErrorCheck !== "") {
                setEmailError("Error: " + emailErrorCheck);
            }
            if (invalidPasswordCheck !== "") {
                setInvalidPassword("Error: " + invalidPasswordCheck);
            }
        }
    };

    return (
        //main container (centered vertically and horizontally)
        <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
            <Card style={{ maxWidth: '400px', width: '100%' }}>
            <Card.Body>
                <Card.Title className="text-center">Login</Card.Title> 
                <Form noValidate onSubmit={handleSubmit}>

                    {/* Campo Email */}
                    <Form.Label>Email</Form.Label>
                    <Form.Control   isInvalid={!!emailError}
                                    type="email"
                                    id="email"
                                    placeholder="mail@address.com"
                                    value={email}
                                    onChange={(event) => {setEmail(event.target.value); setEmailError("");}}
                                    required
                                    autoFocus
                    />

                    <Form.Control.Feedback type="invalid">{emailError}</Form.Control.Feedback>

                    {/* Campo Password */}
                    <Form.Label>Password</Form.Label>
                    <Form.Control   isInvalid={!!invalidPassword}
                                    type="password"
                                    id="password"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(event) => {setPassword(event.target.value); setInvalidPassword("");}}
                                    required
                    />

                    <Form.Control.Feedback type="invalid">{invalidPassword}</Form.Control.Feedback>

                    <Form.Text className="text-muted">
                        We'll never share your email with anyone else.
                    </Form.Text>

                    

                    {/* Bottone di Login */}
                    <div className="d-grid gap-2 mt-3">
                        <Button type="submit" variant="primary" size="lg">
                        Login
                    </Button>
                    </div>

                    {/* Link per il recupero della password */}
                    <div className="text-center">
                        <Button variant="link">Forgot your password?</Button>
                    </div>
                </Form>
            </Card.Body> 
            </Card>
        </Container>
        );
};
