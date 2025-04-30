import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import {Home, LoginForm, Cart, Establishments} from "./pages/index.js";
import API from "./API";


function App() {
    return (
      <BrowserRouter>
        <Main/>
      </BrowserRouter>
    );
  }

/**
 * The actual main app.
 * This is used instead of the default App component because Main can be encapsulated in
 * a BrowserRouter component, giving it the possibility of using the useNavigate hook.
*/


function Main() {
    //states for all the objects:
    //establishments, cart, user...
    const [establishmentsList, setEstablishmentsList] = useState([]);




    //use effects to fetch the data from the server
    useEffect(() => {
        API.getAllEstablishments()
        .then((data) => setEstablishmentsList(data))
        .catch((error) => console.error("Error fetching establishments:", error));
    }, []); //for now they are loaded only once at the beginning





    //Routes definition
    return (
        <Routes>
            <Route path = "/" element = {<Home/>}></Route>
            <Route path = "/login" element = {<LoginForm/>}></Route>
            <Route path = "/cart" element = {<Cart/>}></Route>
            <Route path = "/establishments" element = {<Establishments establishmentsList = {establishmentsList}/>}></Route>
            <Route path = "*" element = {<p>404 Not Found</p>}></Route>
        </Routes>
    )

}


export default App;